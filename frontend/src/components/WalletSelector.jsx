import React, { useState } from 'react';
import { Wallet, X } from 'lucide-react';

export default function WalletSelector({ isOpen, onClose, onSelectWallet }) {
    if (!isOpen) return null;

    const handleWalletSelect = (type) => {
        onSelectWallet(type);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-2xl max-w-md w-full p-8 relative">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
                >
                    <X size={24} />
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Wallet size={32} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Connect Wallet</h2>
                    <p className="text-gray-400">Choose your preferred wallet to continue</p>
                </div>

                {/* Wallet Options */}
                <div className="space-y-4">
                    {/* Lute Wallet */}
                    <button
                        onClick={() => handleWalletSelect('lute')}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white p-4 rounded-xl transition flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                                <span className="text-2xl">🦎</span>
                            </div>
                            <div className="text-left">
                                <div className="font-bold text-lg">Lute Wallet</div>
                                <div className="text-sm text-purple-200">Browser Extension</div>
                            </div>
                        </div>
                        <div className="text-white/50 group-hover:text-white transition">→</div>
                    </button>

                    {/* Pera Wallet */}
                    <button
                        onClick={() => handleWalletSelect('pera')}
                        className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white p-4 rounded-xl transition flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                                <span className="text-2xl">🥥</span>
                            </div>
                            <div className="text-left">
                                <div className="font-bold text-lg">Pera Wallet</div>
                                <div className="text-sm text-cyan-200">Mobile & Desktop</div>
                            </div>
                        </div>
                        <div className="text-white/50 group-hover:text-white transition">→</div>
                    </button>
                </div>

                {/* Footer */}
                <div className="mt-6 text-center text-sm text-gray-500">
                    <p>By connecting, you agree to our Terms of Service</p>
                </div>
            </div>
        </div>
    );
}
