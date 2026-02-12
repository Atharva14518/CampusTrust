import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { useWallet } from '../context/WalletContext';
import { BarChart3, TrendingUp, Users, AlertTriangle, RefreshCw, Brain, Clock, Award, CheckCircle } from 'lucide-react';

const AIReports = () => {
    const { account } = useWallet();
    const role = localStorage.getItem('userRole') || 'STUDENT';
    const [insights, setInsights] = useState(null);
    const [stats, setStats] = useState(null);
    const [studentData, setStudentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedClass, setSelectedClass] = useState('');
    const [classReport, setClassReport] = useState(null);
    const [classLoading, setClassLoading] = useState(false);

    useEffect(() => {
        if (role === 'STUDENT') {
            fetchStudentReport();
        } else {
            fetchStats();
        }
    }, [account, role]);

    // STUDENT: Fetch only their own data
    const fetchStudentReport = async () => {
        if (!account) return;
        try {
            setLoading(true);
            // Fetch student's attendance
            const attRes = await fetch(`${API_URL}/api/attendance/my?address=${account}`);
            const attData = await attRes.json();

            // Fetch student's certificates
            const certRes = await fetch(`${API_URL}/api/certificate/my?address=${account}`);
            const certData = await certRes.json();

            const attendance = attData.success ? attData.attendance || [] : [];
            const certificates = certData.success ? certData.certificates || [] : [];

            // Compute individual stats
            const classesAttended = new Set(attendance.map(a => a.class_id)).size;
            const totalRecords = attendance.length;

            // Group by class
            const classCounts = {};
            attendance.forEach(a => {
                classCounts[a.class_id] = (classCounts[a.class_id] || 0) + 1;
            });

            // Recent activity (last 7 days)
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            const recentCount = attendance.filter(a => new Date(a.timestamp) >= weekAgo).length;

            setStudentData({
                totalRecords,
                classesAttended,
                certificateCount: certificates.length,
                classCounts,
                recentCount,
                attendance,
                certificates
            });
        } catch (err) {
            console.error('Failed to fetch student data:', err);
            setError('Failed to load your report');
        } finally {
            setLoading(false);
        }
    };

    // TEACHER/HOD: Fetch global stats
    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/reports/stats`);
            const data = await response.json();
            if (data.success) {
                setStats(data);
            }
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        } finally {
            setLoading(false);
        }
    };

    const generateAIInsights = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`${API_URL}/api/reports/ai-insights`);
            const data = await response.json();
            if (data.success) {
                setInsights(data.insights);
            } else {
                setError(data.error || 'Failed to generate insights');
            }
        } catch (err) {
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    const fetchClassReport = async () => {
        if (!selectedClass) return;
        try {
            setClassLoading(true);
            const response = await fetch(`${API_URL}/api/reports/class/${selectedClass}`);
            const data = await response.json();
            if (data.success) {
                setClassReport(data.report);
            }
        } catch (err) {
            console.error('Failed to fetch class report:', err);
        } finally {
            setClassLoading(false);
        }
    };

    // ==================== STUDENT VIEW ====================
    if (role === 'STUDENT') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-24 px-6 pb-10">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-purple-500/20 rounded-xl">
                            <Brain className="w-8 h-8 text-purple-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">My Report</h1>
                            <p className="text-gray-400">Your personal attendance & achievement summary</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-20 text-gray-400">
                            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
                            Loading your report...
                        </div>
                    ) : !account ? (
                        <div className="text-center py-20 text-gray-400">
                            Please connect your wallet to view your report.
                        </div>
                    ) : studentData ? (
                        <>
                            {/* Student Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/20">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-blue-300 text-sm">My Attendance</p>
                                            <p className="text-3xl font-bold text-white">{studentData.totalRecords}</p>
                                        </div>
                                        <Clock className="w-10 h-10 text-blue-400 opacity-50" />
                                    </div>
                                </div>
                                <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 backdrop-blur-lg rounded-2xl p-6 border border-green-500/20">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-green-300 text-sm">Classes Attended</p>
                                            <p className="text-3xl font-bold text-white">{studentData.classesAttended}</p>
                                        </div>
                                        <CheckCircle className="w-10 h-10 text-green-400 opacity-50" />
                                    </div>
                                </div>
                                <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-purple-300 text-sm">Certificates</p>
                                            <p className="text-3xl font-bold text-white">{studentData.certificateCount || 0}</p>
                                        </div>
                                        <Award className="w-10 h-10 text-purple-400 opacity-50" />
                                    </div>
                                </div>
                                <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 backdrop-blur-lg rounded-2xl p-6 border border-orange-500/20">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-orange-300 text-sm">This Week</p>
                                            <p className="text-3xl font-bold text-white">{studentData.recentCount}</p>
                                        </div>
                                        <TrendingUp className="w-10 h-10 text-orange-400 opacity-50" />
                                    </div>
                                </div>
                            </div>

                            {/* My Attendance by Class */}
                            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 mb-8">
                                <h3 className="text-xl font-semibold text-white mb-4">My Attendance by Class</h3>
                                {Object.keys(studentData.classCounts).length === 0 ? (
                                    <p className="text-gray-400 text-center py-6">No attendance records yet. Scan your teacher's QR code to get started!</p>
                                ) : (
                                    <div className="space-y-3">
                                        {Object.entries(studentData.classCounts).map(([classId, count]) => (
                                            <div key={classId} className="flex items-center gap-3">
                                                <span className="text-gray-300 w-24 truncate font-mono">{classId}</span>
                                                <div className="flex-1 bg-gray-700 rounded-full h-4 overflow-hidden">
                                                    <div
                                                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all"
                                                        style={{ width: `${Math.min(count * 20, 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-white font-bold w-12 text-right">{count}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Recent Attendance History */}
                            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                                <h3 className="text-xl font-semibold text-white mb-4">Recent Attendance History</h3>
                                {studentData.attendance.length === 0 ? (
                                    <p className="text-gray-400 text-center py-6">No records yet.</p>
                                ) : (
                                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                                        {studentData.attendance.slice(0, 20).map((record, idx) => (
                                            <div key={record.id || idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-sm font-bold">
                                                        {idx + 1}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-white">{record.class_id}</p>
                                                        <p className="text-xs text-gray-500">{new Date(record.timestamp).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-xs px-2 py-1 rounded-full ${record.status === 'CONFIRMED'
                                                        ? 'bg-green-500/20 text-green-400'
                                                        : 'bg-yellow-500/20 text-yellow-400'
                                                        }`}>
                                                        {record.status}
                                                    </span>
                                                    {record.tx_id && (
                                                        <a
                                                            href={`https://testnet.algoexplorer.io/tx/${record.tx_id}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-xs text-blue-400 hover:text-blue-300"
                                                        >
                                                            View TX
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : null}

                    {error && (
                        <div className="mt-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl">
                            <p className="text-red-300">{error}</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ==================== TEACHER / HOD VIEW ====================
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-24 px-6 pb-10">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-500/20 rounded-xl">
                            <Brain className="w-8 h-8 text-purple-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">AI Reports</h1>
                            <p className="text-gray-400">Powered by Gemini AI — All Students Overview</p>
                        </div>
                    </div>
                    <button
                        onClick={generateAIInsights}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 
                                   text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all
                                   disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                        {loading ? (
                            <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                            <Brain className="w-5 h-5" />
                        )}
                        Generate AI Insights
                    </button>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 backdrop-blur-lg 
                                        rounded-2xl p-6 border border-blue-500/20">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-300 text-sm">Total Attendance</p>
                                    <p className="text-3xl font-bold text-white">{stats.stats.totalAttendance}</p>
                                </div>
                                <BarChart3 className="w-10 h-10 text-blue-400 opacity-50" />
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 backdrop-blur-lg 
                                        rounded-2xl p-6 border border-green-500/20">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-300 text-sm">Total Students</p>
                                    <p className="text-3xl font-bold text-white">{stats.stats.totalStudents}</p>
                                </div>
                                <Users className="w-10 h-10 text-green-400 opacity-50" />
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 backdrop-blur-lg 
                                        rounded-2xl p-6 border border-purple-500/20">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-300 text-sm">Certificates Issued</p>
                                    <p className="text-3xl font-bold text-white">{stats.stats.totalCertificates}</p>
                                </div>
                                <TrendingUp className="w-10 h-10 text-purple-400 opacity-50" />
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 backdrop-blur-lg 
                                        rounded-2xl p-6 border border-orange-500/20">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-orange-300 text-sm">Total Classes</p>
                                    <p className="text-3xl font-bold text-white">{stats.stats.totalClasses}</p>
                                </div>
                                <BarChart3 className="w-10 h-10 text-orange-400 opacity-50" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Charts Section */}
                {stats?.charts && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                            <h3 className="text-xl font-semibold text-white mb-4">Attendance by Class</h3>
                            <div className="space-y-3">
                                {Object.entries(stats.charts.byClass).map(([classId, count]) => (
                                    <div key={classId} className="flex items-center gap-3">
                                        <span className="text-gray-300 w-24 truncate">{classId}</span>
                                        <div className="flex-1 bg-gray-700 rounded-full h-4 overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full"
                                                style={{ width: `${Math.min(count * 10, 100)}%` }}
                                            />
                                        </div>
                                        <span className="text-white font-medium w-12 text-right">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                            <h3 className="text-xl font-semibold text-white mb-4">Attendance by Day</h3>
                            <div className="space-y-3">
                                {Object.entries(stats.charts.byDayOfWeek).map(([day, count]) => (
                                    <div key={day} className="flex items-center gap-3">
                                        <span className="text-gray-300 w-24">{day}</span>
                                        <div className="flex-1 bg-gray-700 rounded-full h-4 overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full rounded-full"
                                                style={{ width: `${Math.min(count * 10, 100)}%` }}
                                            />
                                        </div>
                                        <span className="text-white font-medium w-12 text-right">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* AI Insights */}
                {insights && (
                    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-lg 
                                    rounded-2xl p-8 border border-purple-500/20 mb-8">
                        <div className="flex items-center gap-3 mb-6">
                            <Brain className="w-6 h-6 text-purple-400" />
                            <h2 className="text-2xl font-bold text-white">AI-Generated Insights</h2>
                        </div>

                        <div className="mb-6 p-4 bg-white/5 rounded-xl">
                            <h3 className="text-lg font-semibold text-purple-300 mb-2">Summary</h3>
                            <p className="text-gray-200">{insights.summary}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-4 bg-white/5 rounded-xl">
                                <h3 className="text-lg font-semibold text-blue-300 mb-3 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5" /> Key Trends
                                </h3>
                                <ul className="space-y-2">
                                    {insights.trends?.map((trend, i) => (
                                        <li key={i} className="text-gray-300 flex items-start gap-2">
                                            <span className="text-blue-400">•</span>
                                            {trend}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="p-4 bg-white/5 rounded-xl">
                                <h3 className="text-lg font-semibold text-red-300 mb-3 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5" /> At-Risk Students
                                </h3>
                                {insights.atRiskStudents?.length > 0 ? (
                                    <ul className="space-y-2">
                                        {insights.atRiskStudents.map((student, i) => (
                                            <li key={i} className="text-gray-300 flex items-start gap-2">
                                                <span className="text-red-400">!</span>
                                                {student}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-green-400">No students currently at risk! 🎉</p>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 p-4 bg-white/5 rounded-xl">
                            <h3 className="text-lg font-semibold text-green-300 mb-3">Recommendations</h3>
                            <ul className="space-y-2">
                                {insights.recommendations?.map((rec, i) => (
                                    <li key={i} className="text-gray-300 flex items-start gap-2">
                                        <span className="text-green-400">✓</span>
                                        {rec}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {/* Class-Specific Report */}
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                    <h3 className="text-xl font-semibold text-white mb-4">Generate Class Report</h3>
                    <div className="flex gap-4">
                        <input
                            type="text"
                            placeholder="Enter Class ID (e.g., CS101)"
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl 
                                       text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                        />
                        <button
                            onClick={fetchClassReport}
                            disabled={classLoading || !selectedClass}
                            className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 
                                       transition-all disabled:opacity-50"
                        >
                            {classLoading ? 'Generating...' : 'Generate Report'}
                        </button>
                    </div>

                    {classReport && (
                        <div className="mt-6 p-6 bg-purple-500/10 rounded-xl border border-purple-500/20">
                            <h4 className="text-lg font-semibold text-purple-300 mb-3">
                                Report for {classReport.classId}
                            </h4>
                            <p className="text-gray-200 mb-4">{classReport.summary}</p>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-400">Total Students:</span>
                                    <span className="text-white ml-2">{classReport.totalStudents}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400">Avg Attendance:</span>
                                    <span className="text-white ml-2">{classReport.averageAttendance}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="mt-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl">
                        <p className="text-red-300">{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIReports;
