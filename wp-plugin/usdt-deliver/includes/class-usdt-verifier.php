<?php
/**
 * USDT Deliver — on-chain verifier.
 *
 * Framework-free on purpose: the same class powers the settings "test" button,
 * the REST endpoint and the CLI test suite. No API keys, no third-party services —
 * it reads the Ethereum network itself through public JSON-RPC endpoints.
 *
 * @package usdt-deliver
 */

if ( ! defined( 'ABSPATH' ) && ! defined( 'USDT_DELIVER_CLI' ) ) {
	exit;
}

/**
 * Verification failure with a user-facing message.
 */
class Usdtd_Error extends Exception {
	/** @var string machine code: format|wait|reverted|nomatch|underpay|net|used */
	public $slug = 'net';

	public function __construct( $slug, $message ) {
		parent::__construct( $message );
		$this->slug = $slug;
	}
}

class Usdtd_Verifier {

	const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

	/** Public, keyless endpoints — tried in order until one answers. */
	public static function default_rpcs() {
		return array(
			'https://ethereum-rpc.publicnode.com',
			'https://eth.drpc.org',
			'https://1rpc.io/eth',
			'https://eth-mainnet.public.blastapi.io',
			'https://ethereum.public.blockpi.network/v1/rpc/public',
			'https://cloudflare-eth.com',
		);
	}

	public static function default_contract() {
		return '0xdAC17F958D2ee523a2206206994597C13D831ec7'; // USDT (ERC-20)
	}

	/**
	 * Validate a transaction hash. Returns the normalised (lowercase) hash.
	 *
	 * @throws Usdtd_Error
	 */
	public static function normalize_hash( $tx ) {
		$tx = trim( (string) $tx );
		if ( ! preg_match( '/^0x[0-9a-fA-F]{64}$/', $tx ) ) {
			throw new Usdtd_Error(
				'format',
				'That does not look like a transaction hash. It should start with <b>0x</b> and be 66 characters long.'
			);
		}
		return strtolower( $tx );
	}

	/** Topic3 of a Transfer log: the recipient address, left-padded to 32 bytes. */
	public static function recipient_topic( $wallet ) {
		$wallet = strtolower( trim( (string) $wallet ) );
		if ( ! preg_match( '/^0x[0-9a-f]{40}$/', $wallet ) ) {
			throw new Usdtd_Error( 'format', 'The wallet address in the settings is not a valid Ethereum address.' );
		}
		return '0x000000000000000000000000' . substr( $wallet, 2 );
	}

	/**
	 * One JSON-RPC call against a list of public endpoints.
	 *
	 * @throws Usdtd_Error when every endpoint fails.
	 */
	public static function rpc( array $rpcs, $method, array $params ) {
		$body = wp_json_encode_fallback(
			array(
				'jsonrpc' => '2.0',
				'id'      => 1,
				'method'  => $method,
				'params'  => $params,
			)
		);

		foreach ( $rpcs as $url ) {
			$url = trim( (string) $url );
			if ( '' === $url ) {
				continue;
			}
			$json = self::post_json( $url, $body );
			if ( null === $json ) {
				continue;
			}
			$data = json_decode( $json, true );
			if ( is_array( $data ) && array_key_exists( 'result', $data ) ) {
				return $data['result'];
			}
		}

		throw new Usdtd_Error( 'net', 'Could not reach the Ethereum network. Please try again in a moment.' );
	}

	/**
	 * POST one JSON body; returns the raw response body or null on failure.
	 */
	protected static function post_json( $url, $body ) {
		$headers = array( 'Content-Type' => 'application/json' );

		if ( function_exists( 'wp_remote_post' ) ) {
			$res = wp_remote_post(
				$url,
				array(
					'timeout' => 9,
					'headers' => $headers,
					'body'    => $body,
				)
			);
			if ( ! is_wp_error( $res ) && 200 === (int) wp_remote_retrieve_response_code( $res ) ) {
				return wp_remote_retrieve_body( $res );
			}
			return null;
		}

		// Without WordPress (CLI tests, standalone): try curl, then plain streams.
		// A curl that cannot verify its CA bundle must not sink the whole endpoint.
		if ( extension_loaded( 'curl' ) ) {
			$ch = curl_init( $url );
			curl_setopt_array(
				$ch,
				array(
					CURLOPT_POST           => true,
					CURLOPT_POSTFIELDS     => $body,
					CURLOPT_HTTPHEADER     => $headers,
					CURLOPT_RETURNTRANSFER => true,
					CURLOPT_TIMEOUT        => 9,
					CURLOPT_CONNECTTIMEOUT => 6,
				)
			);
			$out = curl_exec( $ch );
			$err = curl_error( $ch );
			curl_close( $ch );
			if ( false !== $out && '' === $err ) {
				return $out;
			}
		}

		$ctx = stream_context_create(
			array(
				'http' => array(
					'method'  => 'POST',
					'header'  => implode( "\r\n", $headers ),
					'content' => $body,
					'timeout' => 9,
				),
			)
		);
		$out = @file_get_contents( $url, false, $ctx );
		return ( false === $out ) ? null : $out;
	}

	/**
	 * Sum every USDT transfer to our wallet inside a transaction receipt.
	 *
	 * @param array $receipt Receipt as returned by eth_getTransactionReceipt.
	 * @return int Transfer amount in token units (1 USDT = 1 000 000).
	 */
	public static function amount_to_wallet( array $receipt, $wallet, $contract ) {
		$want_topic = self::recipient_topic( $wallet );
		$contract   = strtolower( trim( (string) $contract ) );
		$amount     = 0;

		$logs = isset( $receipt['logs'] ) && is_array( $receipt['logs'] ) ? $receipt['logs'] : array();
		foreach ( $logs as $log ) {
			$address = isset( $log['address'] ) ? strtolower( $log['address'] ) : '';
			if ( $address !== $contract ) {
				continue;
			}
			$topics = isset( $log['topics'] ) && is_array( $log['topics'] ) ? $log['topics'] : array();
			if ( count( $topics ) < 3 ) {
				continue;
			}
			if ( strtolower( $topics[0] ) !== self::TRANSFER_TOPIC ) {
				continue;
			}
			// ERC-20 Transfer carries 3 topics: [signature, from, to] — the recipient is topics[2].
			if ( strtolower( $topics[2] ) !== $want_topic ) {
				continue;
			}
			$amount += self::hex_to_int( isset( $log['data'] ) ? $log['data'] : '0x0' );
		}

		return $amount;
	}

	/** Hex quantity -> int (token amounts fit comfortably in a 64-bit int). */
	protected static function hex_to_int( $hex ) {
		$hex = strtolower( trim( (string) $hex ) );
		if ( '0x' === substr( $hex, 0, 2 ) ) {
			$hex = substr( $hex, 2 );
		}
		if ( '' === $hex || ! ctype_xdigit( $hex ) ) {
			return 0;
		}
		$dec = hexdec( $hex );
		return is_int( $dec ) ? $dec : (int) $dec;
	}

	/**
	 * Verify a payment.
	 *
	 * @param string   $tx       Transaction hash (0x…66).
	 * @param string   $wallet   Receiving wallet.
	 * @param int|float $min     Minimum amount in USDT.
	 * @param string   $contract USDT contract address.
	 * @param array    $rpcs     Public RPC endpoints.
	 * @return array { amount: float, units: int, tx: string }
	 * @throws Usdtd_Error on every failure path, with the user-facing message.
	 */
	public static function verify( $tx, $wallet, $min, array $rpcs = null, $contract = null ) {
		$tx       = self::normalize_hash( $tx );
		$contract = $contract ? $contract : self::default_contract();
		$rpcs     = ( null === $rpcs || array() === $rpcs ) ? self::default_rpcs() : $rpcs;
		$min      = (float) $min;
		$min_unit = (int) round( $min * 1000000 );

		$receipt = self::rpc( $rpcs, 'eth_getTransactionReceipt', array( $tx ) );

		if ( null === $receipt || ! is_array( $receipt ) ) {
			throw new Usdtd_Error( 'wait', 'The transaction is not on the network yet. Wait ~60 seconds and try again.' );
		}
		if ( ! isset( $receipt['status'] ) || '0x1' !== strtolower( (string) $receipt['status'] ) ) {
			throw new Usdtd_Error( 'reverted', 'The transaction exists but failed (reverted). Check the hash.' );
		}

		$units = self::amount_to_wallet( $receipt, $wallet, $contract );
		if ( $units <= 0 ) {
			throw new Usdtd_Error( 'nomatch', 'This transaction does not contain a USDT transfer to our wallet. Most likely the wrong network was used.' );
		}
		if ( $units < $min_unit ) {
			$got     = $units / 1000000;
			$got_str = rtrim( rtrim( sprintf( '%.6f', $got ), '0' ), '.' );
			throw new Usdtd_Error(
				'underpay',
				'Amount received: ' . $got_str . ' USDT — but your order costs ' . $min . ' USDT.'
			);
		}

		return array(
			'tx'     => $tx,
			'units'  => $units,
			'amount' => $units / 1000000,
		);
	}
}

/**
 * wp_json_encode() without loading WordPress.
 */
if ( ! function_exists( 'wp_json_encode_fallback' ) ) {
	function wp_json_encode_fallback( $data ) {
		if ( function_exists( 'wp_json_encode' ) ) {
			return wp_json_encode( $data );
		}
		return json_encode( $data );
	}
}
