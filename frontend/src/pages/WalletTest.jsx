import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import LuteConnect from 'lute-connect';

const WalletTest = () => {
    const [results, setResults] = useState([]);
    const [testing, setTesting] = useState(false);

    const addResult = (test, status, message) => {
        setResults(prev => [...prev, { test, status, message, time: new Date().toLocaleTimeString() }]);
    };

    const runTests = async () => {
        setResults([]);
        setTesting(true);

        // Test 1: Check if Lute is available
        addResult('Lute Import', 'info', 'Checking if lute-connect is available...');
        try {
            if (LuteConnect) {
                addResult('Lute Import', 'success', '✓ lute-connect imported successfully');
            }
        } catch (e) {
            addResult('Lute Import', 'error', '✗ Failed to import lute-connect: ' + e.message);
            setTesting(false);
            return;
        }

        // Test 2: Initialize Lute
        addResult('Lute Init', 'info', 'Initializing Lute...');
        let lute;
        try {
            lute = new LuteConnect('TrustCampus', {
                network: 'TestNet',
                siteName: 'TrustCampus Test'
            });
            addResult('Lute Init', 'success', '✓ Lute initialized with TestNet');
        } catch (e) {
            addResult('Lute Init', 'error', '✗ Failed to initialize: ' + e.message);
            setTesting(false);
            return;
        }

        // Test 3: Check browser extension
        addResult('Extension Check', 'info', 'Checking for Lute extension...');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (window.lute || window.algorand) {
            addResult('Extension Check', 'success', '✓ Lute extension detected');
        } else {
            addResult('Extension Check', 'warning', '⚠ Extension not detected (may still work)');
        }

        // Test 4: Try to connect
        addResult('Connection', 'info', 'Attempting to connect...');
        try {
            const addresses = await lute.connect();
            
            if (addresses && addresses.length > 0) {
                addResult('Connection', 'success', `✓ Connected! Address: ${addresses[0]}`);
                
                // Test 5: Validate address
                if (addresses[0].length === 58) {
                    addResult('Address Validation', 'success', '✓ Valid Algorand address format');
                } else {
                    addResult('Address Validation', 'error', '✗ Invalid address length');
                }
            } else {
                addResult('Connection', 'error', '✗ No addresses returned');
            }
        } catch (e) {
            addResult('Connection', 'error', '✗ Connection failed: ' + e.message);
        }

        setTesting(false);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'success': return <CheckCircle className="text-green-400" size={20} />;
            case 'error': return <XCircle className="text-red-400" size={20} />;
            case 'warning': return <AlertCircle className="text-yellow-400" size={20} />;
            default: return <AlertCircle className="text-blue-400" size={20} />;
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] pt-24 px-4 pb-20">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                    <h1 className="text-3xl font-bold mb-2">Lute Wallet Connection Test</h1>
                    <p className="text-gray-400 mb-6">Diagnose wallet connection issues</p>

                    <button
                        onClick={runTests}
                        disabled={testing}
                        className="w-full bg-purple-600 hover:bg-purple-700 py-3 rounded-lg font-bold mb-6 disabled:opacity-50"
                    >
                        {testing ? 'Testing...' : 'Run Connection Tests'}
                    </button>

                    {results.length > 0 && (
                        <div className="space-y-3">
                            <h2 className="text-xl font-bold mb-4">Test Results:</h2>
                            {results.map((result, idx) => (
                                <div
                                    key={idx}
                                    className={`p-4 rounded-lg border ${
                                        result.status === 'success' ? 'bg-green-500/10 border-green-500/30' :
                                        result.status === 'error' ? 'bg-red-500/10 border-red-500/30' :
                                        result.status === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30' :
                                        'bg-blue-500/10 border-blue-500/30'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        {getStatusIcon(result.status)}
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="font-bold">{result.test}</h3>
                                                <span className="text-xs text-gray-500">{result.time}</span>
                                            </div>
                                            <p className="text-sm text-gray-300">{result.message}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <h3 className="font-bold mb-2">Troubleshooting Tips:</h3>
                        <ul className="text-sm text-gray-300 space-y-1">
                            <li>• Ensure Lute extension is installed from https://lute.app</li>
                            <li>• Check that wallet is unlocked</li>
                            <li>• Verify network is set to TestNet in Lute settings</li>
                            <li>• Make sure you have at least one account created</li>
                            <li>• Try refreshing the page and running tests again</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WalletTest;
