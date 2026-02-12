import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { QrCode, ClipboardList, PenTool, Users, BarChart2, Vote, MessageSquare, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';

const TeacherDashboard = () => {
    const { account } = useWallet();
    const [students, setStudents] = useState([]);
    const [stats, setStats] = useState({ totalStudents: 0, totalAttendance: 0, totalFeedback: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (account) fetchData();
    }, [account]);

    const fetchData = async () => {
        try {
            // Fetch all students from attendance records
            const studentsRes = await fetch(`${API_URL}/api/students/all`);
            const studentsData = await studentsRes.json();
            if (studentsData.success) {
                setStudents(studentsData.students);
                setStats(prev => ({
                    ...prev,
                    totalStudents: studentsData.students.length,
                    totalAttendance: studentsData.students.reduce((sum, s) => sum + (s.total_attendance || 0), 0)
                }));
            }
        } catch (e) {
            console.error('Failed to fetch data:', e);
        } finally {
            setLoading(false);
        }
    };

    if (!account) {
        return (
            <div className="min-h-screen pt-24 px-4 flex items-center justify-center">
                <div className="bg-white/5 border border-white/10 p-12 rounded-2xl text-center max-w-md">
                    <Shield className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-3">Teacher Access Required</h2>
                    <p className="text-gray-400 mb-6">Connect your wallet to access the Teacher Dashboard</p>
                    <Link to="/login" className="bg-purple-600 hover:bg-purple-700 px-8 py-3 rounded-xl font-bold transition-colors inline-block">
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f172a] pt-24 px-4 pb-20 text-white">
            <div className="max-w-7xl mx-auto">
                <header className="mb-10 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                            Teacher Dashboard
                        </h1>
                        <p className="text-gray-400">Manage attendance, certificates, and proposals</p>
                    </div>
                    <div className="bg-purple-900/30 px-4 py-2 rounded-lg border border-purple-500/30">
                        <span className="text-sm text-purple-200">🎓 Teacher | {account.substring(0, 8)}...</span>
                    </div>
                </header>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex items-center gap-4">
                        <div className="bg-blue-500/20 p-3 rounded-lg text-blue-400"><Users size={24} /></div>
                        <div>
                            <p className="text-gray-400 text-sm">Total Students</p>
                            <h3 className="text-2xl font-bold">{loading ? '...' : stats.totalStudents}</h3>
                        </div>
                    </div>
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex items-center gap-4">
                        <div className="bg-green-500/20 p-3 rounded-lg text-green-400"><QrCode size={24} /></div>
                        <div>
                            <p className="text-gray-400 text-sm">Total Attendance Records</p>
                            <h3 className="text-2xl font-bold">{loading ? '...' : stats.totalAttendance}</h3>
                        </div>
                    </div>
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex items-center gap-4">
                        <div className="bg-purple-500/20 p-3 rounded-lg text-purple-400"><Shield size={24} /></div>
                        <div>
                            <p className="text-gray-400 text-sm">IP Protection</p>
                            <h3 className="text-2xl font-bold text-green-400">Active</h3>
                        </div>
                    </div>
                </div>

                {/* Quick Actions Grid */}
                <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <Link to="/attendance" className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 hover:border-blue-500/50 transition-all group">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <QrCode className="text-blue-400" size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-1">Take Attendance</h3>
                        <p className="text-sm text-gray-400">Generate QR codes with time limit</p>
                    </Link>

                    <Link to="/certificates" className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 hover:border-green-500/50 transition-all group">
                        <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <PenTool className="text-green-400" size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-1">Issue Certificates</h3>
                        <p className="text-sm text-gray-400">Mint NFTs for students</p>
                    </Link>

                    <Link to="/voting" className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 hover:border-purple-500/50 transition-all group">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Vote className="text-purple-400" size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-1">Proposals & Voting</h3>
                        <p className="text-sm text-gray-400">Create proposals for students</p>
                    </Link>

                    <Link to="/reports" className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 hover:border-yellow-500/50 transition-all group">
                        <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <ClipboardList className="text-yellow-400" size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-1">AI Reports</h3>
                        <p className="text-sm text-gray-400">Generate analytics reports</p>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    <Link to="/leaderboard" className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 hover:border-amber-500/50 transition-all group">
                        <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <BarChart2 className="text-amber-400" size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-1">Leaderboard</h3>
                        <p className="text-sm text-gray-400">View performance rankings</p>
                    </Link>

                    <Link to="/feedback" className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 hover:border-pink-500/50 transition-all group">
                        <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <MessageSquare className="text-pink-400" size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-1">Feedback Ratings</h3>
                        <p className="text-sm text-gray-400">View student feedback & sentiment</p>
                    </Link>
                </div>

                {/* Students Table */}
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Users className="text-pink-400" />
                    All Students
                </h2>
                <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-black/20">
                            <tr>
                                <th className="p-4 text-gray-400 font-medium">#</th>
                                <th className="p-4 text-gray-400 font-medium">Name</th>
                                <th className="p-4 text-gray-400 font-medium">Wallet Address</th>
                                <th className="p-4 text-gray-400 font-medium">Attendance Count</th>
                                <th className="p-4 text-gray-400 font-medium">Last Seen</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="p-8 text-center text-gray-500">Loading students...</td></tr>
                            ) : students.length === 0 ? (
                                <tr><td colSpan="5" className="p-8 text-center text-gray-500">No student records yet. Generate a QR and have students mark attendance.</td></tr>
                            ) : (
                                students.map((student, idx) => (
                                    <tr key={idx} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="p-4 text-gray-500">{idx + 1}</td>
                                        <td className="p-4 font-bold">{student.name || 'Anonymous'}</td>
                                        <td className="p-4 font-mono text-xs text-gray-400">
                                            {student.address?.substring(0, 10)}...{student.address?.substring(student.address.length - 6)}
                                        </td>
                                        <td className="p-4">
                                            <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-bold">
                                                {student.total_attendance}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-400">
                                            {student.last_seen ? new Date(student.last_seen).toLocaleDateString() : '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
