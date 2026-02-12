import React, { useEffect, useState } from 'react';
import { User, QrCode, Award, Clock, ExternalLink, Flame, Star, Zap, ArrowUpRight } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { API_URL } from '../config';
import algosdk from 'algosdk';

const StudentDashboard = () => {
    const { account } = useWallet();
    const [stats, setStats] = useState({ attendance: 0, certificates: 0, balance: 0 });
    const [recentActivity, setActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (account) {
            fetchData();
        }
    }, [account]);

    const fetchData = async () => {
        setLoading(true);
        try {
            console.log('Fetching student dashboard data for:', account);

            // Fetch attendance
            const attendanceRes = await fetch(`${API_URL}/api/attendance/my?address=${account}`);
            const attendanceData = await attendanceRes.json();
            console.log('Attendance response:', attendanceData);
            const attendanceCount = attendanceData.success ? attendanceData.attendance?.length || 0 : 0;

            // Fetch certificates
            const certRes = await fetch(`${API_URL}/api/certificate/my?address=${account}`);
            const certData = await certRes.json();
            console.log('Certificate response:', certData);
            const certCount = certData.success ? certData.certificates?.length || 0 : 0;

            // Fetch wallet balance
            let balance = 0;
            try {
                const algodClient = new algosdk.Algodv2('', 'https://testnet-api.4160.nodely.dev', '');
                const accountInfo = await algodClient.accountInformation(account).do();
                balance = (accountInfo.amount / 1000000).toFixed(2);
            } catch (balanceError) {
                console.error('Balance fetch failed:', balanceError);
                balance = '0.00';
            }

            setStats({
                attendance: attendanceCount,
                certificates: certCount,
                balance: balance
            });

            // Build activity list
            const activities = [];
            if (attendanceData.success && attendanceData.attendance?.length > 0) {
                attendanceData.attendance.slice(0, 3).forEach(record => {
                    activities.push({
                        id: `att-${record.id}`,
                        action: `Attendance: ${record.class_id}`,
                        date: new Date(record.timestamp).toLocaleString(),
                        icon: <QrCode size={16} />,
                        link: `https://testnet.algoexplorer.io/tx/${record.tx_id}`,
                        type: 'attendance'
                    });
                });
            }

            if (certData.success && certData.certificates?.length > 0) {
                certData.certificates.slice(0, 3).forEach(cert => {
                    activities.push({
                        id: `cert-${cert.id}`,
                        action: `Certificate: ${cert.title}`,
                        date: new Date(cert.created_at).toLocaleString(),
                        icon: <Award size={16} />,
                        link: cert.asset_id ? `https://testnet.algoexplorer.io/asset/${cert.asset_id}` : null,
                        type: 'certificate'
                    });
                });
            }

            activities.sort((a, b) => new Date(b.date) - new Date(a.date));
            setActivity(activities.slice(0, 5));

            console.log('Dashboard data loaded successfully');

        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            // Set default stats even on error
            setStats({ attendance: 0, certificates: 0, balance: '0.00' });
        } finally {
            setLoading(false);
        }
    };

    if (!account) {
        return (
            <div className="min-h-screen pt-24 px-4 flex items-center justify-center">
                <div className="glass-card p-12 text-center max-w-md">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                        <User className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">Connect Your Wallet</h2>
                    <p className="text-gray-400">Connect your Lute wallet to view your dashboard</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 px-4 pb-20">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <header className="mb-10">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold gradient-text">Student Dashboard</h1>
                            <p className="text-gray-500 font-mono text-sm">
                                {account.slice(0, 10)}...{account.slice(-6)}
                            </p>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                    {/* Stats Cards */}
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Attendance */}
                        <div className="glass-card p-6 card-hover group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Clock className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-xs text-gray-500 bg-pink-500/10 px-2 py-1 rounded-full">+10 pts/class</span>
                            </div>
                            <h3 className="text-4xl font-bold text-white mb-1 stat-number">
                                {loading ? '...' : stats.attendance}
                            </h3>
                            <p className="text-gray-400 text-sm">Classes Attended</p>
                        </div>

                        {/* Certificates */}
                        <div className="glass-card p-6 card-hover group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Award className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-xs text-gray-500 bg-purple-500/10 px-2 py-1 rounded-full">NFT</span>
                            </div>
                            <h3 className="text-4xl font-bold text-white mb-1 stat-number">
                                {loading ? '...' : stats.certificates}
                            </h3>
                            <p className="text-gray-400 text-sm">Certificates Earned</p>
                        </div>

                        {/* Balance */}
                        <div className="glass-card p-6 card-hover group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Star className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-xs text-gray-500 bg-cyan-500/10 px-2 py-1 rounded-full">ALGO</span>
                            </div>
                            <h3 className="text-4xl font-bold text-white mb-1 stat-number">
                                {loading ? '...' : stats.balance}
                            </h3>
                            <p className="text-gray-400 text-sm">Wallet Balance</p>
                        </div>
                    </div>

                    {/* Digital ID Card */}
                    <div className="relative rounded-3xl overflow-hidden card-hover">
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-600 via-purple-600 to-cyan-500 opacity-90" />
                        <div className="absolute inset-0 bg-black/10" />

                        <div className="relative p-6">
                            <div className="flex justify-between items-start mb-8">
                                <span className="text-xs text-white/60 font-medium tracking-wider">DIGITAL ID</span>
                                <span className="bg-green-400 text-green-900 px-2 py-0.5 rounded-full text-xs font-bold">VERIFIED</span>
                            </div>

                            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center">
                                <User className="w-10 h-10 text-white" />
                            </div>

                            <h3 className="text-xl font-bold text-center text-white mb-1">Student</h3>
                            <p className="text-center text-white/70 text-sm mb-4">ID: {account.slice(0, 8)}</p>

                            <div className="bg-black/20 backdrop-blur-sm rounded-xl p-3 font-mono text-xs text-white/80 break-all border border-white/10">
                                {account}
                            </div>

                            <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/20">
                                <span className="text-white/80 text-sm">Batch 2025</span>
                                <a
                                    href={`https://testnet.algoexplorer.io/address/${account}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1 text-white text-sm hover:text-cyan-200 transition-colors"
                                >
                                    View <ExternalLink size={12} />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="glass-card p-6 mb-10">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Flame className="w-5 h-5 text-orange-400" />
                        Recent Activity
                    </h2>

                    {loading ? (
                        <div className="py-12 text-center text-gray-400">Loading...</div>
                    ) : recentActivity.length === 0 ? (
                        <div className="py-12 text-center text-gray-400">
                            No activity yet. Start by marking attendance or minting a certificate!
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentActivity.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl ${item.type === 'attendance'
                                            ? 'bg-pink-500/20 text-pink-400'
                                            : 'bg-purple-500/20 text-purple-400'
                                            }`}>
                                            {item.icon}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-white">{item.action}</h4>
                                            <p className="text-xs text-gray-500">{item.date}</p>
                                        </div>
                                    </div>
                                    {item.link && (
                                        <a
                                            href={item.link}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            View <ArrowUpRight size={14} />
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <a
                        href="/scan"
                        className="group glass-card p-6 flex items-center gap-4 card-hover"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <QrCode className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white mb-1">Mark Attendance</h3>
                            <p className="text-sm text-gray-400">Scan teacher's QR code</p>
                        </div>
                        <ArrowUpRight className="ml-auto text-gray-600 group-hover:text-white transition-colors" />
                    </a>

                    <a
                        href="/certificates"
                        className="group glass-card p-6 flex items-center gap-4 card-hover"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Award className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white mb-1">My Certificates</h3>
                            <p className="text-sm text-gray-400">View and mint NFT certificates</p>
                        </div>
                        <ArrowUpRight className="ml-auto text-gray-600 group-hover:text-white transition-colors" />
                    </a>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
