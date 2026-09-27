<?php
/**
 * Plugin Name:       USDT Deliver
 * Plugin URI:        https://fyosamu.github.io/fashion-store/
 * Description:       Verify USDT payments on-chain and unlock the download automatically. No API keys, no accounts, no cron.
 * Version:           1.0.0
 * Requires at least: 5.8
 * Requires PHP:      7.4
 * Author:            Fyosamu
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       usdt-deliver
 *
 * @package usdt-deliver
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'USDT_DELIVER_VERSION', '1.0.0' );
define( 'USDT_DELIVER_DIR', plugin_dir_path( __FILE__ ) );
define( 'USDT_DELIVER_URL', plugin_dir_url( __FILE__ ) );

require_once USDT_DELIVER_DIR . 'includes/class-usdt-verifier.php';

class USDT_Deliver {

	const OPT   = 'usdt_deliver_settings';
	const TXS   = 'usdt_deliver_txs';
	const LOG   = 'usdt_deliver_log';
	const NONCE = 'usdt_deliver_nonce';

	/** @var USDT_Deliver */
	protected static $instance = null;

	public static function instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	protected function __construct() {
		add_action( 'admin_menu', array( $this, 'admin_menu' ) );
		add_action( 'admin_init', array( $this, 'admin_init' ) );
		add_action( 'rest_api_init', array( $this, 'rest_routes' ) );
		add_action( 'init', array( $this, 'shortcodes' ) );
		add_action( 'template_redirect', array( $this, 'serve_download' ), 1 );
		add_action( 'wp_enqueue_scripts', array( $this, 'assets' ) );
	}

	/* ----------------------------------------------------------
	   Settings
	---------------------------------------------------------- */

	public static function defaults() {
		return array(
			'wallet'   => '',
			'contract' => Usdtd_Verifier::default_contract(),
			'rpcs'     => implode( "\n", Usdtd_Verifier::default_rpcs() ),
			'downloads' => 0,
		);
	}

	public static function settings() {
		$s = get_option( self::OPT, array() );
		return wp_parse_args( is_array( $s ) ? $s : array(), self::defaults() );
	}

	public static function set_setting( $key, $value ) {
		$s       = self::settings();
		$s[ $key ] = $value;
		update_option( self::OPT, $s );
	}

	public static function rpc_list() {
		$s    = self::settings();
		$raw  = is_array( $s['rpcs'] ) ? implode( "\n", $s['rpcs'] ) : (string) $s['rpcs'];
		$urls = preg_split( '/[\r\n]+/', $raw );
		$urls = array_values( array_filter( array_map( 'trim', $urls ) ) );
		return $urls ? $urls : Usdtd_Verifier::default_rpcs();
	}

	public function admin_menu() {
		add_options_page(
			__( 'USDT Deliver', 'usdt-deliver' ),
			__( 'USDT Deliver', 'usdt-deliver' ),
			'manage_options',
			'usdt-deliver',
			array( $this, 'settings_page' )
		);
	}

	public function admin_init() {
		register_setting(
			'usdt_deliver_group',
			self::OPT,
			array(
				'type'              => 'array',
				'sanitize_callback' => array( $this, 'sanitize' ),
			)
		);

		add_settings_section(
			'usdt_deliver_main',
			__( 'Payment settings', 'usdt-deliver' ),
			function () {
				echo '<p>' . esc_html__( 'The shortcode reads the Ethereum network itself through the public endpoints below — no API keys, no accounts, nothing sent to third parties.', 'usdt-deliver' ) . '</p>';
			},
			'usdt-deliver'
		);

		$fields = array(
			'wallet'   => __( 'Your USDT wallet (ERC-20)', 'usdt-deliver' ),
			'contract' => __( 'USDT contract address', 'usdt-deliver' ),
			'rpcs'     => __( 'Public RPC endpoints (one per line)', 'usdt-deliver' ),
		);
		foreach ( $fields as $key => $label ) {
			add_settings_field(
				'usdt_deliver_' . $key,
				$label,
				array( $this, 'render_field' ),
				'usdt-deliver',
				'usdt_deliver_main',
				array( 'key' => $key )
			);
		}
	}

	public function sanitize( $input ) {
		$out = self::defaults();
		if ( ! is_array( $input ) ) {
			return $out;
		}
		$out['wallet']   = isset( $input['wallet'] ) ? trim( wp_unslash( $input['wallet'] ) ) : '';
		$out['contract'] = isset( $input['contract'] ) && '' !== trim( $input['contract'] )
			? trim( wp_unslash( $input['contract'] ) )
			: Usdtd_Verifier::default_contract();
		$out['rpcs'] = isset( $input['rpcs'] )
			? trim( preg_replace( '/[\r\n]+/', "\n", wp_unslash( $input['rpcs'] ) ) )
			: implode( "\n", Usdtd_Verifier::default_rpcs() );
		return $out;
	}

	public function render_field( $args ) {
		$s   = self::settings();
		$key = $args['key'];
		$val = isset( $s[ $key ] ) ? $s[ $key ] : '';
		if ( 'rpcs' === $key ) {
			printf(
				'<textarea name="%s[%s]" rows="7" class="large-text code" placeholder="https://…">%s</textarea>',
				esc_attr( self::OPT ),
				esc_attr( $key ),
				esc_textarea( $val )
			);
			return;
		}
		printf(
			'<input type="text" name="%s[%s]" value="%s" class="regular-text code" placeholder="%s" autocomplete="off">',
			esc_attr( self::OPT ),
			esc_attr( $key ),
			esc_attr( $val ),
			'wallet' === $key ? '0x…' : '0xdAC17F958D2ee523a2206206994597C13D831ec7'
		);
	}

	public function settings_page() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}
		$s   = self::settings();
		$log = get_option( self::LOG, array() );
		?>
		<div class="wrap">
			<h1>USDT Deliver</h1>
			<?php if ( empty( $s['wallet'] ) ) : ?>
				<div class="notice notice-warning"><p><strong>Set your wallet</strong> below — the shortcode cannot verify payments without it.</p></div>
			<?php endif; ?>

			<form method="post" action="options.php">
				<?php settings_fields( 'usdt_deliver_group' ); ?>
				<?php do_settings_sections( 'usdt-deliver' ); ?>
				<?php submit_button(); ?>
			</form>

			<h2>How to sell a file</h2>
			<p>Put this shortcode on any page or post — the price is in USDT:</p>
			<p><code>[usdt_deliver price="19" product="My Digital File" file="123"]</code></p>
			<ul style="list-style:disc;padding-left:20px;line-height:1.7;">
				<li><code>price</code> — amount the buyer must send (USDT).</li>
				<li><code>product</code> — the item name shown to the buyer (also names the download).</li>
				<li><code>file</code> — attachment ID from the Media Library, or a path inside <code>wp-content/uploads</code>.</li>
			</ul>
			<p>One transaction unlocks <strong>its own product only</strong>; the same hash cannot pay for a second item.</p>

			<h2>Recent verifications</h2>
			<?php if ( empty( $log ) ) : ?>
				<p>Nothing yet.</p>
			<?php else : ?>
				<table class="widefat striped" style="max-width:900px">
					<thead><tr><th>When</th><th>Product</th><th>Amount</th><th>Transaction</th></tr></thead>
					<tbody>
					<?php foreach ( array_slice( array_reverse( $log ), 0, 20 ) as $row ) : ?>
						<tr>
							<td><?php echo esc_html( gmdate( 'Y-m-d H:i', (int) $row['t'] ) . ' UTC' ); ?></td>
							<td><?php echo esc_html( $row['p'] ); ?></td>
							<td><?php echo esc_html( $row['a'] ); ?> USDT</td>
							<td><code><?php echo esc_html( mb_substr( $row['tx'], 0, 18 ) . '…' ); ?></code></td>
						</tr>
					<?php endforeach; ?>
					</tbody>
				</table>
			<?php endif; ?>
		</div>
		<?php
	}

	/* ----------------------------------------------------------
	   Frontend
	---------------------------------------------------------- */

	public function assets() {
		wp_enqueue_style( 'usdt-deliver', USDT_DELIVER_URL . 'assets/usdt-deliver.css', array(), USDT_DELIVER_VERSION );
		wp_enqueue_script( 'usdt-deliver', USDT_DELIVER_URL . 'assets/usdt-deliver.js', array(), USDT_DELIVER_VERSION, true );
		wp_localize_script(
			'usdt-deliver',
			'UsdtDeliver',
			array(
				'rest' => esc_url_raw( rest_url( 'usdt-deliver/v1/verify' ) ),
				'i18n' => array(
					'work'   => 'Checking the chain…',
					'copy'   => 'Copy',
					'copied' => 'Copied ✓',
				),
			)
		);
	}

	public function shortcodes() {
		add_shortcode( 'usdt_deliver', array( $this, 'shortcode' ) );
	}

	/**
	 * [usdt_deliver price="19" product="Name" file="123"]
	 */
	public function shortcode( $atts ) {
		$atts = shortcode_atts(
			array(
				'price'   => 0,
				'product' => __( 'Digital file', 'usdt-deliver' ),
				'file'    => '',
			),
			$atts,
			'usdt_deliver'
		);

		$s = self::settings();
		if ( empty( $s['wallet'] ) ) {
			return '<p class="usdt-deliver__error">USDT Deliver is not configured yet — set your wallet in Settings → USDT Deliver.</p>';
		}
		if ( '' === (string) $atts['file'] ) {
			return '<p class="usdt-deliver__error">This offer is missing its <code>file</code> attribute.</p>';
		}
		if ( ! $this->resolve_file( $atts['file'] ) ) {
			return '<p class="usdt-deliver__error">The file for this offer could not be found.</p>';
		}

		$price   = (float) $atts['price'];
		$product = (string) $atts['product'];
		$token   = $this->sign( $product . '|' . $price . '|' . $atts['file'] );

		$amount = rtrim( rtrim( sprintf( '%.6f', $price ), '0' ), '.' );
		$price_label = ( 0 === (float) $price ) ? 'Free' : ( '$' . $amount . ' = ' . $amount . ' USDT' );

		ob_start();
		?>
		<div class="usdt-deliver"
			data-token="<?php echo esc_attr( $token ); ?>"
			data-product="<?php echo esc_attr( $product ); ?>"
			data-price="<?php echo esc_attr( $price ); ?>"
			data-file="<?php echo esc_attr( $atts['file'] ); ?>">
			<div class="usdt-deliver__head">
				<b><?php esc_html_e( 'Pay with USDT', 'usdt-deliver' ); ?></b>
				<span><?php echo esc_html( $price_label ); ?></span>
			</div>
			<div class="usdt-deliver__addr">
				<code><?php echo esc_html( $s['wallet'] ); ?></code>
				<button type="button" class="usdt-deliver__copy"><?php esc_html_e( 'Copy', 'usdt-deliver' ); ?></button>
			</div>
			<p class="usdt-deliver__hint"><?php esc_html_e( 'Ethereum network (ERC-20) · send from Trust Wallet or any wallet — one payment unlocks this file.', 'usdt-deliver' ); ?></p>
			<form class="usdt-deliver__form" novalidate>
				<input type="text" class="usdt-deliver__tx" placeholder="Transaction hash 0x…" autocomplete="off" spellcheck="false" />
				<button type="submit" class="usdt-deliver__go"><?php esc_html_e( 'Verify on-chain &amp; unlock', 'usdt-deliver' ); ?></button>
			</form>
			<div class="usdt-deliver__status" aria-live="polite"></div>
		</div>
		<?php
		return ob_get_clean();
	}

	/* ----------------------------------------------------------
	   REST: verify a payment
	---------------------------------------------------------- */

	public function rest_routes() {
		register_rest_route(
			'usdt-deliver/v1',
			'/verify',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'rest_verify' ),
				'permission_callback' => '__return_true',
			)
		);
	}

	public function rest_verify( WP_REST_Request $request ) {
		// Light rate limit: 20 attempts per IP per minute.
		$ip = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : 'anon';
		$key = 'usdt_dl_' . md5( $ip );
		$hits = (int) get_transient( $key );
		if ( $hits >= 20 ) {
			return new WP_REST_Response( array( 'ok' => false, 'slug' => 'net', 'msg' => 'Too many attempts from this address. Wait a minute and try again.' ), 429 );
		}
		set_transient( $key, $hits + 1, MINUTE_IN_SECONDS );

		$s = self::settings();
		if ( empty( $s['wallet'] ) ) {
			return new WP_REST_Response( array( 'ok' => false, 'slug' => 'net', 'msg' => 'USDT Deliver is not configured yet.' ), 500 );
		}

		$tx       = (string) $request->get_param( 'tx' );
		$product  = (string) $request->get_param( 'product' );
		$price    = (float) $request->get_param( 'price' );
		$file     = (string) $request->get_param( 'file' );
		$token    = (string) $request->get_param( 'token' );

		// The shortcode signs price and file — never trust them from the client.
		if ( ! hash_equals( $this->sign( $product . '|' . $price . '|' . $file ), $token ) ) {
			return new WP_REST_Response( array( 'ok' => false, 'slug' => 'net', 'msg' => 'This offer could not be validated. Reload the page and try again.' ), 403 );
		}
		if ( ! $this->resolve_file( $file ) ) {
			return new WP_REST_Response( array( 'ok' => false, 'slug' => 'net', 'msg' => 'The file for this offer could not be found.' ), 404 );
		}

		try {
			$result = Usdtd_Verifier::verify( $tx, $s['wallet'], $price, $this->rpc_list(), $s['contract'] );
		} catch ( Usdtd_Error $e ) {
			return new WP_REST_Response( array( 'ok' => false, 'slug' => $e->slug, 'msg' => $e->getMessage() ), 200 );
		}

		// Replay guard: one transaction pays for exactly one product.
		$txs = get_option( self::TXS, array() );
		if ( ! is_array( $txs ) ) {
			$txs = array();
		}
		$hash = $result['tx'];
		if ( isset( $txs[ $hash ] ) && $txs[ $hash ]['p'] !== $product ) {
			return new WP_REST_Response(
				array( 'ok' => false, 'slug' => 'used', 'msg' => 'This transaction has already been used to pay for another product.' ),
				200
			);
		}

		$first_time = ! isset( $txs[ $hash ] );
		$txs[ $hash ] = array(
			't' => time(),
			'p' => $product,
			'f' => $file,
			'a' => $result['amount'],
		);
		update_option( self::TXS, $txs, false );

		if ( $first_time ) {
			$log = get_option( self::LOG, array() );
			if ( ! is_array( $log ) ) {
				$log = array();
			}
			$log[] = array(
				't'  => time(),
				'p'  => $product,
				'a'  => $result['amount'],
				'tx' => $result['tx'],
			);
			update_option( self::LOG, array_slice( $log, -100 ), false );
		}

		return new WP_REST_Response(
			array(
				'ok'     => true,
				'amount' => $result['amount'],
				'url'    => $this->download_url( $result['tx'], $product ),
				'msg'    => sprintf(
					/* translators: %s: amount in USDT */
					__( '✓ Payment confirmed — %s USDT received. Your file is ready.', 'usdt-deliver' ),
					rtrim( rtrim( sprintf( '%.6f', $result['amount'] ), '0' ), '.' )
				),
			),
			200
		);
	}

	/* ----------------------------------------------------------
	   Downloads
	---------------------------------------------------------- */

	protected function sign( $payload ) {
		return hash_hmac( 'sha256', $payload, wp_salt( 'auth' ) );
	}

	protected function download_url( $tx, $product ) {
		$payload = base64_encode( $tx . '|' . $product ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation
		return add_query_arg(
			array(
				'usdt_dl' => $payload,
				'h'       => substr( $this->sign( $payload ), 0, 32 ),
			),
			home_url( '/' )
		);
	}

	/**
	 * Map a shortcode `file` value to a real path inside the uploads dir.
	 * Attachment IDs are resolved by WordPress; strings must stay in uploads.
	 *
	 * @return string|false
	 */
	protected function resolve_file( $file ) {
		$file = trim( (string) $file );
		if ( '' === $file ) {
			return false;
		}

		if ( is_numeric( $file ) ) {
			$path = get_attached_file( (int) $file );
			return ( $path && file_exists( $path ) ) ? $path : false;
		}

		$uploads = wp_upload_dir();
		if ( empty( $uploads['basedir'] ) ) {
			return false;
		}
		$base = realpath( $uploads['basedir'] );
		$full = realpath( $uploads['basedir'] . '/' . ltrim( $file, '/\\' ) );
		if ( ! $base || ! $full || 0 !== strpos( $full, $base ) || ! is_file( $full ) ) {
			return false;
		}
		return $full;
	}

	public function serve_download() {
		if ( ! isset( $_GET['usdt_dl'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			return;
		}
		$payload = isset( $_GET['usdt_dl'] ) ? (string) wp_unslash( $_GET['usdt_dl'] ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$h       = isset( $_GET['h'] ) ? (string) wp_unslash( $_GET['h'] ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended

		$ok = preg_match( '/^[A-Za-z0-9+\/=]+$/', $payload ) && strlen( $h ) === 32
			&& hash_equals( substr( $this->sign( $payload ), 0, 32 ), $h );
		$parts = $ok ? explode( '|', base64_decode( $payload, true ) ) : false;
		if ( ! is_array( $parts ) || count( $parts ) !== 2 ) {
			wp_die( esc_html__( 'This download link is not valid.', 'usdt-deliver' ), '', array( 'response' => 403 ) );
		}
		list( $tx, $product ) = $parts;

		$txs = get_option( self::TXS, array() );
		if ( ! is_array( $txs ) || ! isset( $txs[ $tx ] ) || $txs[ $tx ]['p'] !== $product ) {
			wp_die( esc_html__( 'This download link is not valid.', 'usdt-deliver' ), '', array( 'response' => 403 ) );
		}

		$path = $this->resolve_file( $txs[ $tx ]['f'] );
		if ( ! $path ) {
			wp_die( esc_html__( 'The purchased file is missing on the server.', 'usdt-deliver' ), '', array( 'response' => 404 ) );
		}

		nocache_headers();
		header( 'Content-Type: application/octet-stream' );
		header( 'Content-Disposition: attachment; filename="' . rawurlencode( $product ) . '"' );
		header( 'Content-Length: ' . filesize( $path ) );
		header( 'X-Robots-Tag: noindex, nofollow' );
		readfile( $path ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_read_readfile
		exit;
	}
}

USDT_Deliver::instance();
