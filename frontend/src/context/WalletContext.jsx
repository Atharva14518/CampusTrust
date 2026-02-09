import React, { createContext, useState, useContext, useEffect } from 'react';
import LuteConnect from 'lute-connect';
import algosdk from 'algosdk';

const WalletContext = createContext();

// Algorand TestNet configuration
const ALGOD_SERVER = 'https://testnet-api.4160.nodely.dev';
const ALGOD_PORT = '';
const ALGOD_TOKEN = '';

export const WalletProvider = ({ children }) => {
    const [account, setAccount] = useState(null);
    const [lute, setLute] = useState(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [genesisID, setGenesisID] = useState(null);
    const [algodClient, setAlgodClient] = useState(null);

    // Initialize Algorand client and fetch genesis ID on mount
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

        initAlgorand();
    }, []);

    const connectWallet = async () => {
        if (isConnecting) return;

        setIsConnecting(true);
        try {
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

            // Connect with genesis ID (required by lute-connect)
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

            console.log('✓ Connected:', address.substring(0, 8) + '...');
            setAccount(address);
            localStorage.setItem('walletAddress', address);

        } catch (error) {
            console.error('Connection failed:', error);

            let errorMsg = error.message || 'Unknown error occurred';

            if (errorMsg.includes('rejected') || errorMsg.includes('denied') || errorMsg.includes('cancelled')) {
                errorMsg = 'Connection was rejected. Please approve the connection in your Lute wallet.';
            } else if (errorMsg.includes('Invalid Network')) {
                errorMsg = 'Network mismatch.\n\nPlease ensure your Lute wallet is set to TestNet:\n' +
                    '1. Open Lute extension\n' +
                    '2. Go to Settings\n' +
                    '3. Select "TestNet"\n' +
                    '4. Refresh this page';
            } else if (errorMsg.includes('not detected')) {
                errorMsg = 'Lute wallet not detected.\n\nPlease install from: https://lute.app';
            }

            alert('Connection Failed:\n\n' + errorMsg);
        } finally {
            setIsConnecting(false);
        }
    };

    const disconnectWallet = () => {
        setAccount(null);
        setLute(null);
        localStorage.removeItem('walletAddress');
        console.log('✓ Disconnected');
    };

    // Verify wallet connection is ready for signing
    const verifyConnection = async () => {
        if (!account) {
            throw new Error('No wallet account connected. Please connect your wallet first.');
        }
        if (!lute) {
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

    // Restore session on mount
    useEffect(() => {
        const saved = localStorage.getItem('walletAddress');
        if (saved && saved.length === 58) {
            console.log('Restoring session:', saved.substring(0, 8) + '...');
            setAccount(saved);

            // Re-create lute instance for signing
            const luteInstance = new LuteConnect('TrustCampus');
            setLute(luteInstance);
        }
    }, []);

    return (
        <WalletContext.Provider value={{
            account,
            lute,
            connectWallet,
            disconnectWallet,
            isConnecting,
            verifyConnection,
            getAlgodClient,
            genesisID
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
