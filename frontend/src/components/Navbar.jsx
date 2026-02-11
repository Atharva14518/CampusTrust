import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Wallet, LogOut, Sparkles, Trophy, MessageSquare, QrCode, Award, LayoutDashboard, FileText } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import WalletSelector from './WalletSelector';

const Navbar = () => {
    const { account, connectWallet, disconnectWallet, walletType } = useWallet();
    const location = useLocation();
    const [showWalletSelector, setShowWalletSelector] = useState(false);

    const isActive = (path) => location.pathname === path;

    const navLinks = [
        { path: '/student', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/attendance', label: 'Attendance', icon: QrCode },
        { path: '/certificates', label: 'Certificates', icon: Award },
        { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
        { path: '/reports', label: 'Reports', icon: FileText },
        { path: '/feedback', label: 'Feedback', icon: MessageSquare },
    ];

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

    const getWalletBadge = () => {
        if (walletType === 'pera') return '🥥 Pera';
        if (walletType === 'lute') return '🦎 Lute';
        return '';
    };

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50" style={{ background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/20 group-hover:scale-105 transition-transform">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-lg font-bold text-white hidden sm:block">
                                TrustCampus
                            </span>
                        </Link>

                        {/* Nav Links - Desktop */}
                        <div className="hidden lg:flex items-center gap-1 bg-white/5 rounded-xl p-1">
                            {navLinks.map(({ path, label, icon: Icon }) => (
                                <Link
                                    key={path}
                                    to={path}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(path)
                                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                                        }`}
                                >
                                    <Icon size={16} />
                                    <span>{label}</span>
                                </Link>
                            ))}
                        </div>

                        {/* Wallet Section */}
                        <div className="flex items-center gap-3">
                            {account ? (
                                <>
                                    <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                        <span className="text-xs text-gray-400">{getWalletBadge()}</span>
                                        <span className="font-mono text-sm text-gray-300">
                                            {account.slice(0, 6)}...{account.slice(-4)}
                                        </span>
                                    </div>
                                    <button
                                        onClick={disconnectWallet}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/30 transition-all text-sm font-medium"
                                    >
                                        <LogOut size={16} />
                                        <span className="hidden sm:inline">Disconnect</span>
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={handleConnectClick}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold text-sm transition-all hover:scale-105 shadow-lg shadow-pink-500/20"
                                >
                                    <Wallet size={18} />
                                    <span>Connect</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Nav */}
                <div className="lg:hidden border-t border-white/5 px-4 py-2 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    <div className="flex gap-1 min-w-max">
                        {navLinks.map(({ path, label, icon: Icon }) => (
                            <Link
                                key={path}
                                to={path}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${isActive(path)
                                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                                    : 'text-gray-400 hover:text-white bg-white/5'
                                    }`}
                            >
                                <Icon size={14} />
                                <span>{label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Wallet Selector Modal */}
            <WalletSelector
                isOpen={showWalletSelector}
                onClose={() => setShowWalletSelector(false)}
                onSelectWallet={handleWalletSelect}
            />
        </>
    );
};

export default Navbar;
