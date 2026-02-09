import React, { useState, useEffect } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { FileText, Download, CheckCircle, AlertTriangle, Users, Award, Clock } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Admin = () => {
    const [generating, setGenerating] = useState(false);
    const [report, setReport] = useState(null);
    const [stats, setStats] = useState({
        students: 0,
        attendance: 0,
        certificates: 0,
        attendanceByDept: {}
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/analytics/summary');
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error("Failed to fetch stats", error);
        }
    };

    const handleGenerateReport = async () => {
        setGenerating(true);
        try {
            const res = await fetch('http://localhost:5000/api/reports/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (res.ok) {
                const data = await res.json();
                setReport(data.report);
            } else {
                const err = await res.json();
                throw new Error(err.details || "Backend error");
            }
        } catch (error) {
            console.error("Report generation failed:", error);
            alert("Failed to generate report: " + error.message);
        } finally {
            setGenerating(false);
        }
    };

    const attendanceData = {
        labels: Object.keys(stats.attendanceByDept).length > 0 ? Object.keys(stats.attendanceByDept) : ['CSE', 'ECE', 'MECH', 'CIVIL'],
        datasets: [{
            label: 'Attendance %',
            data: Object.keys(stats.attendanceByDept).length > 0 ? Object.values(stats.attendanceByDept) : [85, 78, 92, 88],
            backgroundColor: ['#a855f7', '#3b82f6', '#10b981', '#f59e0b'],
        }]
    };

    const certData = {
        labels: ['Total Issued', 'Pending'],
        datasets: [{
            data: [stats.certificates, 50], // Mock pending
            backgroundColor: ['#10b981', '#f59e0b'],
            borderWidth: 0
        }]
    };

    return (
        <div className="min-h-screen bg-[#0f172a] pt-24 px-4 pb-20 text-white">
            <div className="max-w-7xl mx-auto">
                <header className="mb-10 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                        <p className="text-gray-400">Overview & Reports (Real-time)</p>
                    </div>
                    <button
                        onClick={handleGenerateReport}
                        disabled={generating}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-purple-500/30 transition-all disabled:opacity-50"
                    >
                        {generating ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" /> : <FileText size={20} />}
                        {generating ? 'AI Generating...' : 'Generate NAAC Report'}
                    </button>
                </header>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex items-center gap-4">
                        <div className="bg-blue-500/20 p-3 rounded-lg text-blue-400"><Users size={24} /></div>
                        <div>
                            <p className="text-gray-400 text-sm">Total Students</p>
                            <h3 className="text-2xl font-bold">{stats.students}</h3>
                        </div>
                    </div>
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex items-center gap-4">
                        <div className="bg-purple-500/20 p-3 rounded-lg text-purple-400"><Clock size={24} /></div>
                        <div>
                            <p className="text-gray-400 text-sm">Attendance Records</p>
                            <h3 className="text-2xl font-bold">{stats.attendance}</h3>
                        </div>
                    </div>
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex items-center gap-4">
                        <div className="bg-green-500/20 p-3 rounded-lg text-green-400"><Award size={24} /></div>
                        <div>
                            <p className="text-gray-400 text-sm">Certificates Issued</p>
                            <h3 className="text-2xl font-bold">{stats.certificates}</h3>
                        </div>
                    </div>
                </div>

                {/* Report Result */}
                {report && (
                    <div className="mb-10 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/50 p-6 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-purple-300 flex items-center gap-2">
                                <CheckCircle size={20} /> AI Generated Report (Ollama)
                            </h3>
                            <button className="text-gray-400 hover:text-white"><Download size={20} /></button>
                        </div>
                        <p className="whitespace-pre-wrap text-gray-300 leading-relaxed font-mono text-sm">{report}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <h3 className="text-xl font-bold mb-6">Department Attendance</h3>
                        <div className="h-64">
                            <Bar data={attendanceData} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { grid: { color: 'rgba(255,255,255,0.1)' } }, x: { grid: { display: false } } } }} />
                        </div>
                    </div>
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <h3 className="text-xl font-bold mb-6">Certificate & Asset Status</h3>
                        <div className="h-64 flex justify-center">
                            <Doughnut data={certData} options={{ responsive: true, plugins: { legend: { position: 'right', labels: { color: 'white' } } } }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Admin;
