import React from 'react';
import { useParams } from 'react-router-dom';
import { Award, CheckCircle, Shield } from 'lucide-react';

const Verification = () => {
    const { id } = useParams();

    // Mock verification (in real app, fetch from blockchain/backend)
    const isValid = true;
    const certDetails = {
        student: "Vijay",
        course: "Advanced Blockchain Development",
        date: "2025-10-15",
        issuer: "TrustCampus",
        hash: "0x123...abc"
    };

    return (
        <div className="min-h-screen bg-[#0f172a] pt-24 px-4 flex items-center justify-center">
            <div className="bg-white/5 border border-purple-500/50 p-8 rounded-2xl max-w-lg w-full text-center shadow-2xl shadow-purple-900/40 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-blue-500" />

                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-400" />
                </div>

                <h1 className="text-3xl font-bold mb-2">Certificate Verified</h1>
                <p className="text-gray-400 mb-8">This credential is authentic and stored on Algorand.</p>

                <div className="bg-black/30 p-6 rounded-xl text-left space-y-4">
                    <div className="flex justify-between border-b border-white/10 pb-2">
                        <span className="text-gray-400">Certificate ID</span>
                        <span className="font-mono">{id}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/10 pb-2">
                        <span className="text-gray-400">Student Name</span>
                        <span>{certDetails.student}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/10 pb-2">
                        <span className="text-gray-400">Course</span>
                        <span>{certDetails.course}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/10 pb-2">
                        <span className="text-gray-400">Issued On</span>
                        <span>{certDetails.date}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                        <span className="text-gray-400">Issuer</span>
                        <div className="flex items-center gap-2">
                            <Shield size={16} className="text-blue-400" />
                            <span>{certDetails.issuer}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <a href={`https://testnet.algoexplorer.io/asset/${id}`} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 text-sm underline">
                        View on AlgoExplorer
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Verification;
