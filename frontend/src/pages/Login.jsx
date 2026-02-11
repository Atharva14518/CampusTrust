import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import WalletSelector from '../components/WalletSelector';

const Login = () => {
    const navigate = useNavigate();
    const { connectWallet, account } = useWallet();
    const [showWalletSelector, setShowWalletSelector] = useState(false);

    const handleConnectClick = () => {
        setShowWalletSelector(true);
    };

    const handleWalletSelect = async (type) => {
        try {
            await connectWallet(type);
        } catch (error) {
            console.error('Wallet connection error:', error);
        }
    };

    // Redirect if connected
    React.useEffect(() => {
        if (account) {
            navigate('/student');
        }
    }, [account, navigate]);

    return (
        <>
            <div className="min-h-screen bg-[#0f172a] pt-24 flex items-center justify-center p-4">
                <div className="bg-white/5 border border-white/10 p-8 rounded-2xl max-w-md w-full text-center hover:border-purple-500/50 transition-colors shadow-2xl">
                    <div className="mx-auto bg-purple-600/20 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                        <Wallet className="w-8 h-8 text-purple-400" />
                    </div>
                    <h2 className="text-3xl font-bold mb-2">Connect Wallet</h2>
                    <p className="text-gray-400 mb-8">Link your Lute or Pera wallet to access your student ID and certificates.</p>

                    <button
                        onClick={handleConnectClick}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 py-3 rounded-xl font-bold text-lg transition-all transform hover:scale-105"
                    >
                        Connect Wallet
                    </button>

                    <p className="mt-4 text-sm text-gray-500">
                        By connecting, you agree to sign a transaction to verify your identity.
                    </p>
                </div>
            </div>

            <WalletSelector
                isOpen={showWalletSelector}
                onClose={() => setShowWalletSelector(false)}
                onSelectWallet={handleWalletSelect}
            />
        </>
    );
};

export default Login;
