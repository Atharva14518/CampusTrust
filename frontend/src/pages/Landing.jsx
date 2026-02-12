import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Shield, Zap, Trophy, QrCode, Award, ArrowRight, CheckCircle, Star } from 'lucide-react';
import { useWallet } from '../context/WalletContext';

const Landing = () => {
    const { account } = useWallet();

    const features = [
        {
            icon: <Shield className="w-8 h-8" />,
            title: 'Blockchain Verified',
            description: 'Every attendance record is immutably stored on Algorand blockchain',
            color: 'from-pink-500 to-rose-500'
        },
        {
            icon: <QrCode className="w-8 h-8" />,
            title: 'Geo-Fenced QR',
            description: 'Location-verified attendance with 100m radius check',
            color: 'from-purple-500 to-violet-500'
        },
        {
            icon: <Award className="w-8 h-8" />,
            title: 'NFT Certificates',
            description: 'Mint achievement certificates as tradeable NFTs',
            color: 'from-cyan-500 to-blue-500'
        },
        {
            icon: <Trophy className="w-8 h-8" />,
            title: 'Gamified Learning',
            description: 'Earn points, badges, and climb the leaderboard',
            color: 'from-amber-500 to-orange-500'
        }
    ];

    const stats = [
        { value: '100%', label: 'Tamper-Proof' },
        { value: '< 5s', label: 'Verification' },
        { value: '∞', label: 'Records Stored' },
        { value: '24/7', label: 'Access' }
    ];

    return (
        <div className="min-h-screen pt-20">
            {/* Hero Section */}
            <section className="relative px-4 py-20 overflow-hidden">
                {/* Animated Background Orbs */}
                <div className="absolute top-20 left-10 w-72 h-72 bg-pink-500/30 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />

                <div className="max-w-6xl mx-auto text-center relative z-10">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 mb-8">
                        <Sparkles className="w-4 h-4 text-pink-400" />
                        <span className="text-sm text-pink-300 font-medium">Powered by Algorand Blockchain</span>
                    </div>

                    {/* Main Heading */}
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                        <span className="text-white">The Future of</span>
                        <br />
                        <span className="gradient-text">Campus Trust</span>
                    </h1>

                    <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Revolutionary blockchain-based attendance & certificate system.
                        <span className="text-white"> Tamper-proof. Transparent. Trusted.</span>
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link
                            to="/login"
                            className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-lg transition-all hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/30 pulse-glow"
                        >
                            <Sparkles className="w-5 h-5" />
                            {account ? 'Go to Dashboard' : 'Get Started'}
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            to="/leaderboard"
                            className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-semibold border border-white/10 hover:border-white/20 transition-all"
                        >
                            <Trophy className="w-5 h-5 text-amber-400" />
                            View Leaderboard
                        </Link>
                    </div>

                    {/* Trust Indicators */}
                    <div className="flex flex-wrap justify-center items-center gap-6 mt-12 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span>Verified on TestNet</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-amber-400" />
                            <span>Open Source</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-cyan-400" />
                            <span>AI Powered</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="px-4 py-16">
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {stats.map((stat, idx) => (
                            <div key={idx} className="glass-card p-6 text-center card-hover">
                                <div className="text-4xl font-bold gradient-text mb-2">{stat.value}</div>
                                <div className="text-sm text-gray-400">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="px-4 py-20">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-white mb-4">Why TrustCampus?</h2>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            Built for the next generation of education with cutting-edge technology
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {features.map((feature, idx) => (
                            <div
                                key={idx}
                                className="group glass-card p-8 card-hover"
                            >
                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="px-4 py-20">
                <div className="max-w-4xl mx-auto">
                    <div className="relative rounded-3xl overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20" />
                        <div className="absolute inset-0 backdrop-blur-xl" />
                        <div className="relative p-12 text-center">
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                Ready to Transform Your Campus?
                            </h2>
                            <p className="text-gray-300 mb-8 text-lg">
                                Join the blockchain revolution in education
                            </p>
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl bg-white text-gray-900 font-bold text-lg hover:bg-gray-100 transition-all hover:scale-105"
                            >
                                Get Started Now
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/5 px-4 py-8">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-pink-400" />
                        <span className="font-bold text-white">TrustCampus</span>
                    </div>
                    <p className="text-sm text-gray-500">
                        Built with ❤️ for the future of education
                    </p>
                    <div className="flex gap-4 text-sm text-gray-400">
                        <a href="#" className="hover:text-white transition-colors">GitHub</a>
                        <a href="#" className="hover:text-white transition-colors">Docs</a>
                        <a href="#" className="hover:text-white transition-colors">Support</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
