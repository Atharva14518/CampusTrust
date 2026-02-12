import React, { createContext, useState, useContext, useEffect } from 'react';
import LuteConnect from 'lute-connect';
import { PeraWalletConnect } from '@perawallet/connect';
import { DeflyWalletConnect } from '@blockshake/defly-connect';
import algosdk from 'algosdk';

const WalletContext = createContext();

// Algorand TestNet configuration
const ALGOD_SERVER = 'https://testnet-api.4160.nodely.dev';
const ALGOD_PORT = '';
const ALGOD_TOKEN = '';

export const WalletProvider = ({ children }) => {
    const [account, setAccount] = useState(null);
    const [lute, setLute] = useState(null);
    const [peraWallet, setPeraWallet] = useState(null);
    const [deflyWallet, setDeflyWallet] = useState(null);
    const [walletType, setWalletType] = useState(null); // 'lute', 'pera', or 'defly'
    const [isConnecting, setIsConnecting] = useState(false);
    const [genesisID, setGenesisID] = useState(null);
    const [algodClient, setAlgodClient] = useState(null);

    // Initialize Algorand client, Pera Wallet, and Defly Wallet on mount
    useEffect(() => {
        const initAlgorand = async () => {
            try {
                const client = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT);
                setAlgodClient(client);

                // Fetch genesis ID from network
                const params = await client.getTransactionParams().do();
                console.log('✓ Connected to Algorand TestNet');
                console.log('  Genesis ID:', params.genesisID);
                console.log('  Genesis Hash:', params.genesisHash);
                setGenesisID(params.genesisID);
            } catch (error) {
                console.error('Failed to connect to Algorand node:', error);
                // Fallback to known TestNet genesis ID
                setGenesisID('testnet-v1.0');
            }
        };

        // Initialize Pera Wallet with WalletConnect options for mobile
        const pera = new PeraWalletConnect({
            chainId: 416002, // Algorand TestNet chain ID (416001 for MainNet)
            shouldShowSignTxnToast: true,
        });
        setPeraWallet(pera);

        // Initialize Defly Wallet with WalletConnect options
        const defly = new DeflyWalletConnect({
            chainId: 416002,
            shouldShowSignTxnToast: true,
        });
        setDeflyWallet(defly);

        initAlgorand();
    }, []);

    const connectLuteWallet = async () => {
        // Wait for extension to be available
        let attempts = 0;
        while (!window.lute && attempts < 20) {
            await new Promise(resolve => setTimeout(resolve, 200));
            attempts++;
        }

        if (!window.lute) {
            throw new Error(
                'Lute extension not detected.\n\n' +
                'Please:\n' +
                '1. Install Lute wallet from https://lute.app\n' +
                '2. Refresh this page\n' +
                '3. Unlock your wallet'
            );
        }

        console.log('Lute extension detected');
        console.log('Using Genesis ID:', genesisID || 'testnet-v1.0');

        // Create LuteConnect instance
        const luteInstance = new LuteConnect('TrustCampus');
        setLute(luteInstance);

        // Connect with genesis ID
        const networkGenesisID = genesisID || 'testnet-v1.0';
        console.log('Connecting with genesisID:', networkGenesisID);

        const addresses = await luteInstance.connect(networkGenesisID);
        console.log('Received addresses:', addresses);

        if (!addresses || addresses.length === 0) {
            throw new Error('No accounts returned. Please unlock your wallet and ensure you have an account.');
        }

        const address = addresses[0];

        if (!address || address.length !== 58) {
            throw new Error('Invalid address format received from wallet.');
        }

        console.log('✓ Connected via Lute:', address.substring(0, 8) + '...');
        setAccount(address);
        setWalletType('lute');
        localStorage.setItem('walletAddress', address);
        localStorage.setItem('walletType', 'lute');
    };

    const connectPeraWallet = async () => {
        if (!peraWallet) {
            throw new Error('Pera Wallet not initialized');
        }

        try {
            // Disconnect any existing session first to avoid "account cannot be connected" error
            try {
                await peraWallet.disconnect();
            } catch (e) {
                // Ignore disconnect errors
            }

            const accounts = await peraWallet.connect();

            if (!accounts || accounts.length === 0) {
                throw new Error('No accounts returned from Pera Wallet');
            }

            const address = accounts[0];
            console.log('✓ Connected via Pera:', address.substring(0, 8) + '...');
            setAccount(address);
            setWalletType('pera');
            localStorage.setItem('walletAddress', address);
            localStorage.setItem('walletType', 'pera');

            // Set up disconnect listener
            peraWallet.connector?.on('disconnect', () => {
                console.log('Pera Wallet disconnected');
                disconnectWallet();
            });
        } catch (error) {
            console.error('Pera connection error:', error);
            // Provide more helpful error messages
            if (error.message?.includes('User rejected')) {
                throw new Error('Connection rejected in Pera Wallet app');
            } else if (error.message?.includes('session')) {
                throw new Error('WalletConnect session failed.\n\nTry:\n1. Close Pera app completely\n2. Reconnect and scan QR again');
            } else if (error.message?.includes('account')) {
                throw new Error('Account connection failed.\n\nTry:\n1. Disconnect Pera Wallet\n2. Close the app\n3. Reconnect again');
            }
            throw error;
        }
    };

    const connectDeflyWallet = async () => {
        if (!deflyWallet) {
            throw new Error('Defly Wallet not initialized');
        }

        try {
            // Disconnect any existing session first
            try {
                await deflyWallet.disconnect();
            } catch (e) {
                // Ignore disconnect errors
            }

            const accounts = await deflyWallet.connect();

            if (!accounts || accounts.length === 0) {
                throw new Error('No accounts returned from Defly Wallet');
            }

            const address = accounts[0];
            console.log('✓ Connected via Defly:', address.substring(0, 8) + '...');
            setAccount(address);
            setWalletType('defly');
            localStorage.setItem('walletAddress', address);
            localStorage.setItem('walletType', 'defly');

            // Set up disconnect listener
            deflyWallet.connector?.on('disconnect', () => {
                console.log('Defly Wallet disconnected');
                disconnectWallet();
            });
        } catch (error) {
            console.error('Defly connection error:', error);
            if (error.message?.includes('User rejected')) {
                throw new Error('Connection rejected in Defly Wallet app');
            }
            throw error;
        }
    };

    const connectWallet = async (type = 'lute') => {
        if (isConnecting) return;

        setIsConnecting(true);
        try {
            if (type === 'pera') {
                await connectPeraWallet();
            } else if (type === 'defly') {
                await connectDeflyWallet();
            } else {
                await connectLuteWallet();
            }
        } catch (error) {
            console.error('Connection failed:', error);

            let errorMsg = error.message || 'Unknown error occurred';

            if (errorMsg.includes('rejected') || errorMsg.includes('denied') || errorMsg.includes('cancelled')) {
                errorMsg = 'Connection was rejected. Please approve the connection in your wallet.';
            } else if (errorMsg.includes('Invalid Network')) {
                errorMsg = 'Network mismatch.\n\nPlease ensure your wallet is set to TestNet';
            } else if (errorMsg.includes('not detected') && type === 'lute') {
                errorMsg = 'Lute wallet not detected.\n\nPlease install from: https://lute.app';
            }

            alert('Connection Failed:\n\n' + errorMsg);
            throw error;
        } finally {
            setIsConnecting(false);
        }
    };

    const disconnectWallet = async () => {
        if (walletType === 'pera' && peraWallet) {
            await peraWallet.disconnect();
        } else if (walletType === 'defly' && deflyWallet) {
            await deflyWallet.disconnect();
        }

        setAccount(null);
        setLute(null);
        setWalletType(null);
        localStorage.removeItem('walletAddress');
        localStorage.removeItem('walletType');
        console.log('✓ Disconnected');
    };

    // Sign transactions based on wallet type
    const signTransactions = async (txns) => {
        if (!account) {
            throw new Error('No wallet connected');
        }

        const txnArray = Array.isArray(txns) ? txns : [txns];
        const base64Array = txnArray.map(t => {
            // Extract base64 from Lute format {txn: base64}
            return t.txn || t;
        });

        if (walletType === 'pera') {
            if (!peraWallet) throw new Error('Pera Wallet not initialized');
            // Pera expects base64 arrays in groups: [[base64_1, base64_2, ...]]
            return await peraWallet.signTransaction([base64Array]);
        } else if (walletType === 'defly') {
            if (!deflyWallet) throw new Error('Defly Wallet not initialized');
            // Defly expects same format as Pera
            return await deflyWallet.signTransaction([base64Array]);
        } else if (walletType === 'lute') {
            if (!lute) throw new Error('Lute wallet not initialized');
            // Lute expects array of {txn: base64} objects
            return await lute.signTxns(txns);
        } else {
            throw new Error('Unknown wallet type');
        }
    };

    // Verify wallet connection is ready for signing
    const verifyConnection = async () => {
        if (!account) {
            throw new Error('No wallet account connected. Please connect your wallet first.');
        }
        if (walletType === 'lute' && !lute) {
            const luteInstance = new LuteConnect('TrustCampus');
            setLute(luteInstance);
        }
        return true;
    };

    // Get algod client for transaction building
    const getAlgodClient = () => {
        if (!algodClient) {
            return new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT);
        }
        return algodClient;
    };

    // Restore wallet session on page load
    useEffect(() => {
        const saved = localStorage.getItem('walletAddress');
        const savedType = localStorage.getItem('walletType');

        if (saved && saved.length === 58 && savedType) {
            console.log('Restoring', savedType, 'session:', saved.substring(0, 8) + '...');
            setAccount(saved);
            setWalletType(savedType);

            if (savedType === 'lute') {
                const luteInstance = new LuteConnect('TrustCampus');
                setLute(luteInstance);
            } else if (savedType === 'pera' && peraWallet) {
                peraWallet.reconnectSession().then((accounts) => {
                    if (accounts && accounts.length > 0) {
                        setAccount(accounts[0]);
                    } else {
                        disconnectWallet();
                    }
                }).catch(() => disconnectWallet());
            } else if (savedType === 'defly' && deflyWallet) {
                deflyWallet.reconnectSession().then((accounts) => {
                    if (accounts && accounts.length > 0) {
                        setAccount(accounts[0]);
                    } else {
                        disconnectWallet();
                    }
                }).catch(() => disconnectWallet());
            }
        }
    }, [peraWallet, deflyWallet]);

    // Listen for Defly disconnect
    useEffect(() => {
        if (deflyWallet) {
            deflyWallet.connector?.on('disconnect', () => {
                console.log('Defly Wallet disconnected');
                disconnectWallet();
            });
        }
    }, [deflyWallet]);

    return (
        <WalletContext.Provider value={{
            account,
            lute,
            peraWallet,
            deflyWallet,
            walletType,
            connectWallet,
            disconnectWallet,
            isConnecting,
            verifyConnection,
            getAlgodClient,
            genesisID,
            signTransactions
        }}>
            {children}
        </WalletContext.Provider>
    );
};

export const useWallet = () => {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWallet must be used within WalletProvider');
    }
    return context;
};
