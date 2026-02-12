import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, User, GraduationCap, Briefcase } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import WalletSelector from '../components/WalletSelector';

const Login = () => {
    const navigate = useNavigate();
    const { connectWallet, account } = useWallet();
    const [showWalletSelector, setShowWalletSelector] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);

    // Redirect if connected
    React.useEffect(() => {
        if (account) {
            const role = localStorage.getItem('userRole') || selectedRole || 'STUDENT';
            if (role === 'TEACHER') {
                navigate('/teacher');
            } else if (role === 'HOD') {
                navigate('/hod');
            } else {
                navigate('/student');
            }
        }
    }, [account, navigate, selectedRole]);

    const handleRoleLogin = (role) => {
        setSelectedRole(role);
        localStorage.setItem('userRole', role);
        setShowWalletSelector(true);
    };

    const handleWalletSelect = async (type) => {
        try {
            await connectWallet(type);
        } catch (error) {
            console.error('Wallet connection error:', error);
        }
    };

    return (
        <>
            <div className="min-h-screen bg-[#0f172a] pt-24 px-4 pb-12 flex flex-col items-center justify-center">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-4">
                        Welcome to TrustCampus
                    </h1>
                    <p className="text-gray-400 text-lg">Select your role to continue</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
                    {/* Student Card */}
                    <div className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:border-blue-500/50 transition-all hover:-translate-y-2 group cursor-pointer" onClick={() => handleRoleLogin('STUDENT')}>
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <User className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Student</h2>
                        <p className="text-gray-400 mb-6">Login to mark attendance, view certificates, and track progress.</p>
                        <button className="w-full bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white py-3 rounded-xl font-bold transition-all border border-blue-500/30">
                            Student Login
                        </button>
                    </div>

                    {/* Teacher Card */}
                    <div className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:border-purple-500/50 transition-all hover:-translate-y-2 group cursor-pointer" onClick={() => handleRoleLogin('TEACHER')}>
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <GraduationCap className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Teacher</h2>
                        <p className="text-gray-400 mb-6">Manage classes, generate QR codes, and view student reports.</p>
                        <button className="w-full bg-purple-600/20 hover:bg-purple-600 text-purple-400 hover:text-white py-3 rounded-xl font-bold transition-all border border-purple-500/30">
                            Teacher Login
                        </button>
                    </div>

                    {/* HOD Card */}
                    <div className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:border-amber-500/50 transition-all hover:-translate-y-2 group cursor-pointer" onClick={() => handleRoleLogin('HOD')}>
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Briefcase className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">HOD</h2>
                        <p className="text-gray-400 mb-6">Access department analytics, teacher data, and proposals.</p>
                        <button className="w-full bg-amber-600/20 hover:bg-amber-600 text-amber-400 hover:text-white py-3 rounded-xl font-bold transition-all border border-amber-500/30">
                            HOD Login
                        </button>
                    </div>
                </div>

                <div className="mt-12 text-center text-sm text-gray-500 max-w-md">
                    By connecting your wallet, you agree to sign a transaction to verify your identity.
                    <br />
                    Secure Blockchain Authentication
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
