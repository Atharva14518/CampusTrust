import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { useWallet } from '../context/WalletContext';
import { Trophy, Flame, Star, Award, Medal, Crown, TrendingUp, Zap, Sparkles } from 'lucide-react';

const badges = [
    { id: 'perfect_week', name: 'Perfect Week', icon: '🏆', description: '7 day streak', color: 'from-amber-500 to-orange-500' },
    { id: 'early_bird', name: 'Early Bird', icon: '🐦', description: 'First to check in 5x', color: 'from-cyan-500 to-blue-500' },
    { id: 'streak_master', name: 'Streak Master', icon: '🔥', description: '10+ day streak', color: 'from-pink-500 to-rose-500' },
    { id: 'consistent', name: 'Consistent', icon: '⭐', description: '90%+ attendance', color: 'from-purple-500 to-violet-500' },
    { id: 'pioneer', name: 'Pioneer', icon: '🚀', description: 'First 10 users', color: 'from-green-500 to-emerald-500' },
];

const Leaderboard = () => {
    const { account } = useWallet();
    const [leaderboard, setLeaderboard] = useState([]);
    const [myStats, setMyStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();
    }, [account]);

    const fetchLeaderboard = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/api/attendance/report`);
            const data = await res.json();

            if (data.success && data.records) {
                const studentStats = {};

                data.records.forEach(record => {
                    const addr = record.wallet_address;
                    if (!studentStats[addr]) {
                        studentStats[addr] = {
                            address: addr,
                            name: record.student_name || 'Anonymous',
                            count: 0,
                            streak: 0,
                            points: 0,
                            lastDate: null,
                            badges: [],
                            classes: new Set()
                        };
                    }
                    studentStats[addr].count++;
                    studentStats[addr].points += 10;
                    studentStats[addr].classes.add(record.class_id);

                    const recordDate = new Date(record.timestamp).toDateString();
                    if (studentStats[addr].lastDate) {
                        const lastDate = new Date(studentStats[addr].lastDate);
                        const currentDate = new Date(record.timestamp);
                        const diffDays = Math.floor((lastDate - currentDate) / (1000 * 60 * 60 * 24));
                        if (diffDays === 1) {
                            studentStats[addr].streak++;
                        }
                    }
                    studentStats[addr].lastDate = recordDate;
                });

                const leaderboardData = Object.values(studentStats)
                    .map(student => ({
                        ...student,
                        classes: student.classes.size,
                        badges: calculateBadges(student)
                    }))
                    .sort((a, b) => b.points - a.points)
                    .slice(0, 20);

                setLeaderboard(leaderboardData);

                if (account) {
                    const myData = studentStats[account];
                    if (myData) {
                        setMyStats({
                            ...myData,
                            classes: myData.classes.size,
                            badges: calculateBadges(myData),
                            rank: leaderboardData.findIndex(s => s.address === account) + 1
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Failed to fetch leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateBadges = (student) => {
        const earnedBadges = [];
        if (student.streak >= 7) earnedBadges.push('perfect_week');
        if (student.streak >= 10) earnedBadges.push('streak_master');
        if (student.count >= 5) earnedBadges.push('early_bird');
        if (student.points >= 100) earnedBadges.push('consistent');
        return earnedBadges;
    };

    const getRankDisplay = (rank) => {
        if (rank === 1) return { icon: <Crown className="w-6 h-6 text-amber-400" />, bg: 'from-amber-500/20 to-orange-500/20', border: 'border-amber-500/30' };
        if (rank === 2) return { icon: <Medal className="w-6 h-6 text-gray-300" />, bg: 'from-gray-400/20 to-gray-500/20', border: 'border-gray-400/30' };
        if (rank === 3) return { icon: <Medal className="w-6 h-6 text-orange-400" />, bg: 'from-orange-600/20 to-amber-600/20', border: 'border-orange-500/30' };
        return { icon: <span className="text-gray-400 font-bold text-lg">{rank}</span>, bg: 'from-white/5 to-white/5', border: 'border-white/10' };
    };

    return (
        <div className="min-h-screen pt-24 px-4 pb-20">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <header className="text-center mb-10">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                            <Trophy className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold gradient-text">Leaderboard</h1>
                    </div>
                    <p className="text-gray-400">Compete for the top spot 🔥</p>
                </header>

                {/* My Stats */}
                {myStats && (
                    <div className="glass-card p-6 mb-8 card-hover">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white">
                                    #{myStats.rank || '?'}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{myStats.name}</h3>
                                    <p className="text-purple-400 font-mono text-sm">{myStats.address?.slice(0, 10)}...</p>
                                </div>
                            </div>
                            <div className="flex gap-8">
                                <div className="text-center">
                                    <div className="flex items-center gap-1 text-amber-400 mb-1">
                                        <Star className="w-5 h-5" />
                                        <span className="text-2xl font-bold">{myStats.points}</span>
                                    </div>
                                    <p className="text-xs text-gray-500">Points</p>
                                </div>
                                <div className="text-center">
                                    <div className="flex items-center gap-1 text-pink-400 mb-1">
                                        <Flame className="w-5 h-5" />
                                        <span className="text-2xl font-bold">{myStats.streak}</span>
                                    </div>
                                    <p className="text-xs text-gray-500">Streak</p>
                                </div>
                                <div className="text-center">
                                    <div className="flex items-center gap-1 text-cyan-400 mb-1">
                                        <TrendingUp className="w-5 h-5" />
                                        <span className="text-2xl font-bold">{myStats.count}</span>
                                    </div>
                                    <p className="text-xs text-gray-500">Classes</p>
                                </div>
                            </div>
                        </div>
                        {myStats.badges.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/10">
                                {myStats.badges.map(badgeId => {
                                    const badge = badges.find(b => b.id === badgeId);
                                    return badge ? (
                                        <span key={badgeId} className={`px-3 py-1 rounded-full text-sm bg-gradient-to-r ${badge.color} text-white font-medium`}>
                                            {badge.icon} {badge.name}
                                        </span>
                                    ) : null;
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Badges */}
                <div className="mb-8">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-400" /> Earn Badges
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {badges.map(badge => (
                            <div key={badge.id} className="glass-card p-4 text-center card-hover">
                                <div className="text-3xl mb-2">{badge.icon}</div>
                                <p className="text-sm font-bold text-white">{badge.name}</p>
                                <p className="text-xs text-gray-500">{badge.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Leaderboard */}
                <div className="glass-card overflow-hidden">
                    <div className="p-6 border-b border-white/10">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-green-400" /> Top Students
                        </h3>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-gray-400">Loading...</p>
                        </div>
                    ) : leaderboard.length === 0 ? (
                        <div className="p-12 text-center">
                            <Trophy className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                            <p className="text-gray-400">No records yet. Be the first!</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {leaderboard.map((student, idx) => {
                                const rankInfo = getRankDisplay(idx + 1);
                                return (
                                    <div
                                        key={student.address}
                                        className={`p-4 flex items-center justify-between hover:bg-white/5 transition-all ${student.address === account ? 'bg-purple-500/10' : ''
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${rankInfo.bg} border ${rankInfo.border} flex items-center justify-center`}>
                                                {rankInfo.icon}
                                            </div>
                                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-lg font-bold text-white`}>
                                                {student.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-white flex items-center gap-2">
                                                    {student.name}
                                                    {student.streak >= 3 && (
                                                        <span className="text-pink-400 text-sm flex items-center gap-0.5">
                                                            <Flame size={14} /> {student.streak}
                                                        </span>
                                                    )}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-xs text-gray-500 font-mono">{student.address.slice(0, 8)}...</p>
                                                    {student.badges.slice(0, 2).map(badgeId => {
                                                        const badge = badges.find(b => b.id === badgeId);
                                                        return badge ? <span key={badgeId} title={badge.name}>{badge.icon}</span> : null;
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <p className="text-xl font-bold text-amber-400">{student.points}</p>
                                                <p className="text-xs text-gray-500">points</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Points System */}
                <div className="glass-card p-6 mt-8">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-amber-400" /> How Points Work
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { points: '+10', label: 'Per attendance', color: 'text-green-400' },
                            { points: '+5', label: 'Early bird', color: 'text-cyan-400' },
                            { points: '+15', label: 'Streak bonus', color: 'text-purple-400' },
                            { points: '+50', label: 'Badge earned', color: 'text-pink-400' }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white/5 rounded-xl p-4 text-center">
                                <p className={`text-2xl font-bold ${item.color}`}>{item.points}</p>
                                <p className="text-sm text-gray-400">{item.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;
