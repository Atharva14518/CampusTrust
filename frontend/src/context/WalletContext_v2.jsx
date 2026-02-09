import React, { createContext, useState, useContext, useEffect } from 'react';
import LuteConnect from 'lute-connect';

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
    const [account, setAccount] = useState(null);
    const [lute, setLute] = useState(null);
    const [isConnecting, setIsConnecting] = useState(false);

    useEffect(() => {
        // Initialize Lute - try different initialization methods
        try {
            // Method 1: With network object
            let luteInstance;
            try {
                luteInstance = new LuteConnect('TrustCampus', {
                    network: 'TestNet'
                });
            } catch (e) {
                // Method 2: Simple initialization
                console.log('Trying simple initialization...');
                luteInstance = new LuteConnect('TrustCampus');
            }
            
            setLute(luteInstance);
            console.log('Lute initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Lute:', error);
            console.log('Please install Lute wallet extension from https://lute.app');
        }
    }, []);

    const connectWallet = async () => {
        if (!lute) {
            const message = 'Lute wallet not initialized.\n\nPlease:\n1. Install Lute extension from https://lute.app\n2. Refresh this page\n3. Try connecting again';
            alert(message);
            return;
        }

        if (isConnecting) return;

        setIsConnecting(true);
        try {
            console.log('Connecting to Lute wallet...');
            
            // Connect and get addresses
            const addresses = await lute.connect();
            console.log('Received addresses:', addresses);
            
            if (addresses && addresses.length > 0) {
                const address = addresses[0];
                
                // Validate address format (Algorand addresses are 58 characters)
                if (address && address.length === 58) {
                    console.log('✓ Connected to wallet:', address);
                    setAccount(address);
                    localStorage.setItem('walletAddress', address);
                } else {
                    throw new Error('Invalid address format received');
                }
            } else {
                throw new Error('No addresses returned from wallet');
            }
        } catch (error) {
            console.error('Connection error:', error);
            
            let message = 'Failed to connect wallet.\n\n';
            
            if (error.message.includes('User rejected')) {
                message += 'You rejected the connection request.';
            } else if (error.message.includes('Network')) {
                message += 'Network error. Please ensure Lute is set to Algorand TestNet.';
            } else if (error.message.includes('not installed')) {
                message += 'Lute wallet not detected.\n\nInstall from: https://lute.app';
            } else {
                message += error.message + '\n\nPlease ensure:\n• Lute extension is installed\n• Wallet is unlocked\n• You have at least one account';
            }
            
            alert(message);
        } finally {
            setIsConnecting(false);
        }
    };

    const disconnectWallet = () => {
        setAccount(null);
        localStorage.removeItem('walletAddress');
        console.log('✓ Wallet disconnected');
    };

    // Restore session
    useEffect(() => {
        const restoreSession = () => {
            const saved = localStorage.getItem('walletAddress');
            
            // Validate saved address
            if (saved && saved.length === 58 && !saved.includes('MOCK')) {
                console.log('✓ Restored session:', saved.substring(0, 8) + '...');
                setAccount(saved);
            } else if (saved) {
                console.log('✗ Clearing invalid saved address');
                localStorage.removeItem('walletAddress');
            }
        };
        
        restoreSession();
    }, []);

    return (
        <WalletContext.Provider value={{ 
            account, 
            lute, 
            connectWallet, 
            disconnectWallet,
            isConnecting 
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
