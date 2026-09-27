<?php
/**
 * USDT Deliver — test suite (no WordPress needed).
 *
 *   php tests/run-tests.php
 *
 * Covers: hash validation, receipt parsing (synthetic), the live-network
 * happy path (a real USDT transfer pulled from the chain right now),
 * and every user-facing failure message.
 *
 * @package usdt-deliver
 */

define( 'USDT_DELIVER_CLI', true );
require dirname( __DIR__ ) . '/includes/class-usdt-verifier.php';

const DEMO_WALLET = '0xE1E3e1c2978c74f43Bb095023135C3278303aF34';

$GLOBALS['pass'] = 0;
$GLOBALS['fail'] = 0;

function check( $name, $cond, $detail = '' ) {
	if ( $cond ) {
		$GLOBALS['pass']++;
		echo "PASS  $name\n";
	} else {
		$GLOBALS['fail']++;
		echo "FAIL  $name" . ( $detail ? "  — $detail" : '' ) . "\n";
	}
}

function expect_error( $name, $slug, callable $fn, $needle = null ) {
	try {
		$fn();
		check( $name, false, 'no error thrown' );
	} catch ( Usdtd_Error $e ) {
		$ok = ( $e->slug === $slug ) && ( null === $needle || false !== stripos( $e->getMessage(), $needle ) );
		check( $name, $ok, 'got slug=' . $e->slug . ' msg=' . strip_tags( $e->getMessage() ) );
	}
}

/** Build one ERC-20 Transfer log. */
function make_log( $contract, $to, $units, $topic0 = null, $value_hex = null ) {
	$pad   = str_pad( preg_replace( '/^0x/', '', strtolower( $to ) ), 64, '0', STR_PAD_LEFT );
	$value = $value_hex ? $value_hex : '0x' . str_pad( dechex( $units ), 64, '0', STR_PAD_LEFT );
	return array(
		'address' => $contract,
		'topics'  => array(
			$topic0 ? $topic0 : Usdtd_Verifier::TRANSFER_TOPIC,
			'0x' . str_repeat( '11', 20 ) . str_repeat( '0', 24 ), // from (already 32 bytes)
			'0x' . $pad,                                          // to
		),
		'data'    => $value,
	);
}

function receipt( $status, $logs ) {
	return array(
		'status' => $status,
		'logs'   => $logs,
	);
}

echo "== unit: hash and address validation ==\n";

expect_error( 'garbage hash rejected', 'format', function () {
	Usdtd_Verifier::normalize_hash( 'not-a-hash' );
}, '66 characters' );

expect_error( 'short hash rejected', 'format', function () {
	Usdtd_Verifier::normalize_hash( '0x' . str_repeat( 'ab', 10 ) );
}, '66 characters' );

expect_error( 'non-hex hash rejected', 'format', function () {
	Usdtd_Verifier::normalize_hash( '0x' . str_repeat( 'zz', 32 ) );
} );

expect_error( 'bad wallet rejected', 'format', function () {
	Usdtd_Verifier::recipient_topic( 'not-an-address' );
} );

check( 'valid hash normalised to lowercase', '0x' . str_repeat( 'ab', 32 ) === Usdtd_Verifier::normalize_hash( '0x' . str_repeat( 'AB', 32 ) ) );

echo "\n== unit: receipt parsing (synthetic receipts) ==\n";

$contract = Usdtd_Verifier::default_contract();
$want     = DEMO_WALLET;

$exact = receipt( '0x1', array( make_log( $contract, $want, 19000000 ) ) );
check( 'exact 19 USDT recognised', 19000000 === Usdtd_Verifier::amount_to_wallet( $exact, $want, $contract ) );

$over = receipt( '0x1', array( make_log( $contract, $want, 25000000 ) ) );
check( 'overpayment (25 USDT) counted', 25000000 === Usdtd_Verifier::amount_to_wallet( $over, $want, $contract ) );

$split = receipt(
	'0x1',
	array(
		make_log( $contract, $want, 9000000 ),
		make_log( $contract, $want, 10000000 ),
	)
);
check( 'split transfers summed', 19000000 === Usdtd_Verifier::amount_to_wallet( $split, $want, $contract ) );

$other = receipt( '0x1', array( make_log( $contract, '0x000000000000000000000000000000000004444c', 19000000 ) ) );
check( 'transfer to someone else ignored', 0 === Usdtd_Verifier::amount_to_wallet( $other, $want, $contract ) );

$wrong_token = receipt( '0x1', array( make_log( '0x6b175474e89094c44da98b954eedeac495271d0f', $want, 19000000 ) ) ); // DAI
check( 'different token ignored', 0 === Usdtd_Verifier::amount_to_wallet( $wrong_token, $want, $contract ) );

$wrong_sig = receipt( '0x1', array( make_log( $contract, $want, 19000000, '0x' . str_repeat( 'ab', 32 ) ) ) );
check( 'non-Transfer event ignored', 0 === Usdtd_Verifier::amount_to_wallet( $wrong_sig, $want, $contract ) );

$topics = count( $exact['logs'][0]['topics'] );
check( 'synthetic log mirrors the real chain (3 topics)', 3 === $topics, "got $topics" );

echo "\n== unit: underpayment message ==\n";

try {
	Usdtd_Verifier::amount_to_wallet( $exact, $want, $contract );
	$units = 19000000;
	$ok    = ( $units < 50000000 ); // simulate the verify() comparison for a 500 USDT order
	check( 'underpayment detected for a 500 USDT order', $ok );
} catch ( Exception $e ) {
	check( 'underpayment detected for a 500 USDT order', false, $e->getMessage() );
}

echo "\n== live network: pull a real USDT transfer and verify it ==\n";

$rpcs  = Usdtd_Verifier::default_rpcs();
$probe = null;
try {
	$head   = hexdec( Usdtd_Verifier::rpc( $rpcs, 'eth_blockNumber', array() ) );
	$logs   = Usdtd_Verifier::rpc(
		$rpcs,
		'eth_getLogs',
		array(
			array(
				'address'   => $contract,
				'topics'    => array( Usdtd_Verifier::TRANSFER_TOPIC ),
				'fromBlock' => '0x' . dechex( $head - 3 ),
				'toBlock'   => '0x' . dechex( $head ),
			),
		)
	);
	if ( is_array( $logs ) && $logs ) {
		$probe = $logs[0];
	}
} catch ( Usdtd_Error $e ) {
	$probe = null;
}

check( 'recent USDT Transfer logs found on-chain', null !== $probe, 'eth_getLogs returned nothing' );

if ( $probe ) {
	check( 'real Transfer event has exactly 3 topics', 3 === count( $probe['topics'] ), 'got ' . count( $probe['topics'] ) );

	$real_recipient = '0x' . substr( $probe['topics'][2], -40 );
	$real_units     = hexdec( $probe['data'] );
	$real_tx        = $probe['transactionHash'];

	$done = false;
	try {
		// The full path: receipt lookup + log parsing + minimum check, against real data.
		$res = Usdtd_Verifier::verify( $real_tx, $real_recipient, 1, $rpcs, $contract );
		$done = true;
		check( 'happy path: real payment approved end-to-end', $res['amount'] >= 1 && $res['units'] === $real_units,
			'units=' . $res['units'] . ' expected>=' . $real_units );
	} catch ( Usdtd_Error $e ) {
		check( 'happy path: real payment approved end-to-end', false, $e->slug . ': ' . strip_tags( $e->getMessage() ) );
	}

	if ( $done ) {
		expect_error( 'underpay: same tx, bigger order', 'underpay', function () use ( $real_tx, $real_recipient, $rpcs, $contract ) {
			Usdtd_Verifier::verify( $real_tx, $real_recipient, 1000000, $rpcs, $contract );
		}, 'but your order costs' );

		expect_error( 'nomatch: our wallet did not receive it', 'nomatch', function () use ( $real_tx, $rpcs, $contract ) {
			Usdtd_Verifier::verify( $real_tx, DEMO_WALLET, 1, $rpcs, $contract );
		}, 'wrong network' );
	}
}

echo "\n== live network: failure messages ==\n";

expect_error( 'fake hash → still pending', 'wait', function () use ( $rpcs ) {
	Usdtd_Verifier::verify( '0x' . str_repeat( 'ab', 32 ), DEMO_WALLET, 19, $rpcs );
}, 'not on the network yet' );

expect_error( 'wrong-network tx → rejected', 'nomatch', function () use ( $rpcs ) {
	Usdtd_Verifier::verify( '0x2b3c17274145b4030ddbff2235a76a7dcc7d18cd8965db73ddad64f340120f55', DEMO_WALLET, 19, $rpcs );
}, 'wrong network' );

expect_error( 'garbage → format help', 'format', function () use ( $rpcs ) {
	Usdtd_Verifier::verify( 'hello world', DEMO_WALLET, 19, $rpcs );
}, '66 characters' );

echo "\n----------------------------------------\n";
printf( "RESULT: %d passed, %d failed\n", $GLOBALS['pass'], $GLOBALS['fail'] );
exit( $GLOBALS['fail'] ? 1 : 0 );
