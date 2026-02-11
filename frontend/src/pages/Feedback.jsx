import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { useWallet } from '../context/WalletContext';
import algosdk from 'algosdk';
import {
    MessageSquare, Shield, CheckCircle, AlertCircle, Send,
    ExternalLink, Lock, RefreshCw, ThumbsUp, ThumbsDown, Minus
} from 'lucide-react';

const ALGOD_SERVER = 'https://testnet-api.4160.nodely.dev';

const Feedback = () => {
    const { account, connectWallet, isConnecting, signTransactions } = useWallet();
    const [feedbackText, setFeedbackText] = useState('');
    const [classId, setClassId] = useState('');
    const [teacherId, setTeacherId] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);
    const [allFeedback, setAllFeedback] = useState([]);
    const [loading, setLoading] = useState(true);
    const [verifyingId, setVerifyingId] = useState(null);
    const [verificationResult, setVerificationResult] = useState(null);

    useEffect(() => {
        fetchAllFeedback();
    }, []);

    const fetchAllFeedback = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/feedback/all?limit=20`);
            const data = await response.json();
            if (data.success) {
                setAllFeedback(data.feedback);
            }
        } catch (err) {
            console.error('Failed to fetch feedback:', err);
        } finally {
            setLoading(false);
        }
    };

    const submitFeedback = async () => {
        if (!account) {
            alert('Please connect your wallet first');
            return;
        }

        if (!feedbackText.trim()) {
            alert('Please enter your feedback');
            return;
        }

        setSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            // Create a hash of the feedback for blockchain storage
            const encoder = new TextEncoder();
            const data = encoder.encode(feedbackText + account + Date.now());
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const feedbackHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

            // Create Algorand transaction with feedback hash in note
            const algodClient = new algosdk.Algodv2('', ALGOD_SERVER, '');
            const params = await algodClient.getTransactionParams().do();

            // Create a 0 ALGO transaction to self with feedback hash in note
            const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
                sender: account,
                receiver: account,
                amount: 0,
                note: encoder.encode(`TrustCampus Feedback: ${feedbackHash.substring(0, 32)}`),
                suggestedParams: params
            });

            // Encode for signing
            const encodedTxn = algosdk.encodeUnsignedTransaction(txn);
            const txnB64 = Buffer.from(encodedTxn).toString('base64');

            console.log('Requesting signature from wallet...');

            // Sign with wallet (Lute or Pera)
            let signedTxnB64;
            try {
                const signResult = await signTransactions([
                    { txn: txnB64 }
                ]);
                signedTxnB64 = signResult[0];
            } catch (signError) {
                console.error('Signing failed:', signError);
                throw new Error('Transaction signing was rejected');
            }

            // Decode and submit
            const signedTxn = new Uint8Array(Buffer.from(signedTxnB64, 'base64'));
            const { txid } = await algodClient.sendRawTransaction(signedTxn).do();

            console.log('Transaction submitted:', txid);

            // Wait for confirmation
            await algosdk.waitForConfirmation(algodClient, txid, 4);

            // Submit to backend with tx_id
            const response = await fetch(`${API_URL}/api/feedback/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    student_address: account,
                    teacher_id: teacherId || null,
                    class_id: classId || null,
                    feedback_text: feedbackText,
                    tx_id: txid
                })
            });

            const result = await response.json();

            if (result.success) {
                setSuccess({
                    message: 'Feedback submitted and verified on blockchain!',
                    txId: txid,
                    hash: result.data.hash,
                    sentiment: result.data.sentiment
                });
                setFeedbackText('');
                setClassId('');
                setTeacherId('');
                fetchAllFeedback();
            } else {
                throw new Error(result.error || 'Submission failed');
            }

        } catch (err) {
            console.error('Feedback submission error:', err);
            setError(err.message || 'Failed to submit feedback');
        } finally {
            setSubmitting(false);
        }
    };

    const verifyFeedback = async (id) => {
        setVerifyingId(id);
        setVerificationResult(null);

        try {
            const response = await fetch(`${API_URL}/api/feedback/verify/${id}`);
            const data = await response.json();

            if (data.success) {
                setVerificationResult({
                    id,
                    ...data.verification,
                    explorerUrl: data.explorerUrl
                });
            }
        } catch (err) {
            console.error('Verification failed:', err);
        } finally {
            setVerifyingId(null);
        }
    };

    const getSentimentIcon = (score) => {
        if (score >= 0.7) return <ThumbsUp className="w-4 h-4 text-green-400" />;
        if (score >= 0.4) return <Minus className="w-4 h-4 text-yellow-400" />;
        return <ThumbsDown className="w-4 h-4 text-red-400" />;
    };

    const getSentimentColor = (score) => {
        if (score >= 0.7) return 'text-green-400';
        if (score >= 0.4) return 'text-yellow-400';
        return 'text-red-400';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-24 px-6 pb-10">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-blue-500/20 rounded-xl">
                        <Shield className="w-8 h-8 text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Tamper-Proof Feedback</h1>
                        <p className="text-gray-400">Blockchain-verified, immutable feedback system</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Submit Feedback Form */}
                    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-blue-400" />
                            Submit Feedback
                        </h2>

                        {!account ? (
                            <div className="text-center py-8">
                                <Lock className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                                <p className="text-gray-400 mb-4">Connect your wallet to submit feedback</p>
                                <button
                                    onClick={connectWallet}
                                    disabled={isConnecting}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"
                                >
                                    {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-gray-300 text-sm mb-2">Class ID (optional)</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., CS101"
                                        value={classId}
                                        onChange={(e) => setClassId(e.target.value)}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl 
                                                   text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-300 text-sm mb-2">Teacher ID (optional)</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., T001"
                                        value={teacherId}
                                        onChange={(e) => setTeacherId(e.target.value)}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl 
                                                   text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-300 text-sm mb-2">Your Feedback *</label>
                                    <textarea
                                        placeholder="Share your honest feedback about the course, teaching quality, or any suggestions..."
                                        value={feedbackText}
                                        onChange={(e) => setFeedbackText(e.target.value)}
                                        rows={5}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl 
                                                   text-white placeholder-gray-400 focus:outline-none focus:border-blue-500
                                                   resize-none"
                                    />
                                </div>

                                <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                                    <div className="flex items-start gap-3">
                                        <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                        <div className="text-sm text-blue-200">
                                            <p className="font-medium mb-1">Blockchain Protected</p>
                                            <p className="text-blue-300/80">
                                                Your feedback will be hashed and stored on Algorand blockchain,
                                                making it tamper-proof and verifiable.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={submitFeedback}
                                    disabled={submitting || !feedbackText.trim()}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-4 
                                               bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl 
                                               hover:from-blue-700 hover:to-cyan-700 transition-all
                                               disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                >
                                    {submitting ? (
                                        <>
                                            <RefreshCw className="w-5 h-5 animate-spin" />
                                            Signing & Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            Submit Feedback
                                        </>
                                    )}
                                </button>

                                {success && (
                                    <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-xl">
                                        <div className="flex items-start gap-3">
                                            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-green-300 font-medium">{success.message}</p>
                                                <p className="text-green-400/80 text-sm mt-1">
                                                    Sentiment: {success.sentiment?.sentiment}
                                                    ({(success.sentiment?.score * 100).toFixed(0)}%)
                                                </p>
                                                <a
                                                    href={`https://testnet.algoexplorer.io/tx/${success.txId}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-400 text-sm flex items-center gap-1 mt-2 hover:underline"
                                                >
                                                    View on AlgoExplorer <ExternalLink className="w-3 h-3" />
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {error && (
                                    <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl">
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="w-5 h-5 text-red-400" />
                                            <p className="text-red-300">{error}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Feedback List */}
                    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                <Shield className="w-5 h-5 text-green-400" />
                                Verified Feedback
                            </h2>
                            <button
                                onClick={fetchAllFeedback}
                                className="p-2 text-gray-400 hover:text-white transition-colors"
                            >
                                <RefreshCw className="w-5 h-5" />
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-12">
                                <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
                            </div>
                        ) : allFeedback.length === 0 ? (
                            <div className="text-center py-12">
                                <MessageSquare className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                                <p className="text-gray-400">No feedback submitted yet</p>
                            </div>
                        ) : (
                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                                {allFeedback.map((fb) => (
                                    <div
                                        key={fb.id}
                                        className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <p className="text-gray-200 text-sm line-clamp-3">
                                                    {fb.feedback_text}
                                                </p>
                                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                                                    {fb.class_id && (
                                                        <span>Class: {fb.class_id}</span>
                                                    )}
                                                    <span className="flex items-center gap-1">
                                                        {getSentimentIcon(fb.sentiment_score)}
                                                        <span className={getSentimentColor(fb.sentiment_score)}>
                                                            {((fb.sentiment_score || 0) * 100).toFixed(0)}%
                                                        </span>
                                                    </span>
                                                    <span>{new Date(fb.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end gap-2">
                                                {fb.verified ? (
                                                    <span className="flex items-center gap-1 px-2 py-1 bg-green-500/20 
                                                                     text-green-400 text-xs rounded-full">
                                                        <CheckCircle className="w-3 h-3" />
                                                        Verified
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 
                                                                     text-yellow-400 text-xs rounded-full">
                                                        <AlertCircle className="w-3 h-3" />
                                                        Pending
                                                    </span>
                                                )}

                                                {fb.tx_id && (
                                                    <a
                                                        href={`https://testnet.algoexplorer.io/tx/${fb.tx_id}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-400 text-xs flex items-center gap-1 hover:underline"
                                                    >
                                                        Tx <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                )}

                                                <button
                                                    onClick={() => verifyFeedback(fb.id)}
                                                    disabled={verifyingId === fb.id}
                                                    className="text-xs text-gray-400 hover:text-white transition-colors"
                                                >
                                                    {verifyingId === fb.id ? 'Verifying...' : 'Verify'}
                                                </button>
                                            </div>
                                        </div>

                                        {verificationResult?.id === fb.id && (
                                            <div className="mt-3 pt-3 border-t border-white/10 text-xs">
                                                <p className="text-gray-300">
                                                    Hash: <code className="text-blue-400">{verificationResult.hashStored?.substring(0, 32)}...</code>
                                                </p>
                                                <p className={`mt-1 ${verificationResult.tamperProof ? 'text-green-400' : 'text-yellow-400'}`}>
                                                    {verificationResult.tamperProof
                                                        ? '✓ Blockchain verified - Tamper proof'
                                                        : '⚠ Not yet verified on blockchain'}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Feedback;
