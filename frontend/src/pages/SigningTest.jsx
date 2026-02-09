import React, { useState } from 'react';
import { CheckCircle, XCircle, Shield, Key } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import algosdk from 'algosdk';

const SigningTest = () => {
    const { account, lute, connectWallet } = useWallet();
    const [testResult, setTestResult] = useState(null);
    const [testing, setTesting] = useState(false);

    const testSigning = async () => {
        if (!account || !lute) {
            alert('Please connect your wallet first');
            return;
        }

        setTesting(true);
        setTestResult(null);

        try {
            console.log('═══════════════════════════════════════');
            console.log('TESTING TRANSACTION SIGNING CAPABILITY');
            console.log('═══════════════════════════════════════');

            // Create a simple payment transaction (0 ALGO to self)
            const algodClient = new algosdk.Algodv2('', 'https://testnet-api.4160.nodely.dev', '');
            const params = await algodClient.getTransactionParams().do();

            const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
                from: account,
                to: account,
                amount: 0, // 0 ALGO - just testing signing
                note: new Uint8Array(Buffer.from('TrustCampus Signing Test')),
                suggestedParams: params
            });

            console.log('✓ Test transaction created');
            console.log('Type: Payment (0 ALGO to self)');
            console.log('From:', account);
            console.log('To:', account);
            console.log('Requesting signature...');

            // Try to sign
            const txnB64 = Buffer.from(algosdk.encodeUnsignedTransaction(txn)).toString('base64');
            const signedTxns = await lute.signTxns([{ txn: txnB64 }]);

            if (signedTxns && signedTxns[0]) {
                console.log('✓ SIGNING SUCCESSFUL!');
                console.log('✓ Wallet is in FULL SIGNING MODE');
                console.log('✓ NOT read-only');
                console.log('═══════════════════════════════════════');

                setTestResult({
                    success: true,
                    message: 'Signing test passed! Your wallet has FULL signing permissions.',
                    details: [
                        '✓ Can sign transactions',
                        '✓ Can interact with smart contracts',
                        '✓ Can mint NFTs',
                        '✓ Can mark attendance',
                        '✓ NOT in read-only mode'
                    ]
                });
            } else {
                throw new Error('No signed transaction returned');
            }

        } catch (error) {
            console.error('✗ SIGNING FAILED:', error);
            console.log('═══════════════════════════════════════');

            let message = 'Signing test failed: ';
            let details = [];

            if (error.message.includes('rejected') || error.message.includes('denied')) {
                message += 'You rejected the signing request.';
                details = [
                    '⚠ You need to approve transactions in Lute wallet',
                    '⚠ Try again and click "Approve" in the popup'
                ];
            } else if (error.message.includes('read-only')) {
                message += 'Wallet is in READ-ONLY mode!';
                details = [
                    '✗ Cannot sign transactions',
                    '✗ Reconnect wallet with signing permissions',
                    '✗ Check Lute settings'
                ];
            } else {
                message += error.message;
                details = [
                    '⚠ Check console for details',
                    '⚠ Ensure Lute is unlocked',
                    '⚠ Try reconnecting wallet'
                ];
            }

            setTestResult({
                success: false,
                message,
                details
            });
        } finally {
            setTesting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] pt-24 px-4 pb-20">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Shield className="w-10 h-10 text-purple-400" />
                        <div>
                            <h1 className="text-3xl font-bold">Transaction Signing Test</h1>
                            <p className="text-gray-400">Verify your wallet has full signing permissions</p>
                        </div>
                    </div>

                    {!account ? (
                        <div className="text-center py-12">
                            <Key className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400 mb-6">Connect your wallet to test signing capability</p>
                            <button
                                onClick={connectWallet}
                                className="bg-purple-600 hover:bg-purple-700 px-8 py-3 rounded-lg font-bold"
                            >
                                Connect Wallet
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
                                <p className="text-sm text-gray-300">
                                    <strong>Connected:</strong> {account.substring(0, 8)}...{account.substring(account.length - 6)}
                                </p>
                            </div>

                            <button
                                onClick={testSigning}
                                disabled={testing}
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-4 rounded-lg font-bold text-lg mb-6 disabled:opacity-50"
                            >
                                {testing ? 'Testing Signing Capability...' : 'Test Transaction Signing'}
                            </button>

                            {testResult && (
                                <div className={`p-6 rounded-lg border ${
                                    testResult.success 
                                        ? 'bg-green-500/10 border-green-500/30' 
                                        : 'bg-red-500/10 border-red-500/30'
                                }`}>
                                    <div className="flex items-start gap-3 mb-4">
                                        {testResult.success ? (
                                            <CheckCircle className="w-8 h-8 text-green-400 flex-shrink-0" />
                                        ) : (
                                            <XCircle className="w-8 h-8 text-red-400 flex-shrink-0" />
                                        )}
                                        <div>
                                            <h3 className="text-xl font-bold mb-2">
                                                {testResult.success ? 'Success!' : 'Failed'}
                                            </h3>
                                            <p className="text-gray-300 mb-4">{testResult.message}</p>
                                            <ul className="space-y-2">
                                                {testResult.details.map((detail, idx) => (
                                                    <li key={idx} className="text-sm text-gray-300">
                                                        {detail}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="mt-8 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                                <h3 className="font-bold mb-2">What This Test Does:</h3>
                                <ul className="text-sm text-gray-300 space-y-1">
                                    <li>• Creates a test transaction (0 ALGO payment to yourself)</li>
                                    <li>• Requests your signature via Lute wallet</li>
                                    <li>• Verifies you can sign transactions (not read-only)</li>
                                    <li>• Does NOT submit the transaction (no fees charged)</li>
                                </ul>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SigningTest;
