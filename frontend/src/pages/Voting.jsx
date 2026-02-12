import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { API_URL } from '../config';
import { Vote, Clock, CheckCircle, XCircle, Plus, Users, Timer, Shield, ExternalLink } from 'lucide-react';
import algosdk from 'algosdk';

const Voting = () => {
    const { account, signTransactions, verifyConnection } = useWallet();
    const role = localStorage.getItem('userRole') || 'STUDENT';
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [deadlineMinutes, setDeadlineMinutes] = useState(60);
    const [creating, setCreating] = useState(false);
    const [votingId, setVotingId] = useState(null);
    const [txStatus, setTxStatus] = useState('');

    useEffect(() => {
        fetchProposals();
        const interval = setInterval(fetchProposals, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchProposals = async () => {
        try {
            const res = await fetch(`${API_URL}/api/voting/proposals`);
            const data = await res.json();
            if (data.success) {
                setProposals(data.proposals);
            }
        } catch (error) {
            console.error('Failed to fetch proposals:', error);
        } finally {
            setLoading(false);
        }
    };

    // ========== BLOCKCHAIN: Sign a transaction to record vote/proposal on-chain ==========
    const signAndSubmitVoteTx = async (noteText) => {
        try {
            await verifyConnection();

            const algodClient = new algosdk.Algodv2('', 'https://testnet-api.4160.nodely.dev', '');
            const params = await algodClient.getTransactionParams().do();

            const encoder = new TextEncoder();
            const noteData = encoder.encode(noteText);

            // 0-ALGO self-payment with vote data in note field
            const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
                sender: account,
                receiver: account,
                amount: 0,
                note: noteData,
                suggestedParams: params
            });

            setTxStatus('Signing transaction...');

            // Sign using wallet (Pera/Lute/Defly)
            const txnB64 = Buffer.from(algosdk.encodeUnsignedTransaction(txn)).toString('base64');
            const signedTxns = await signTransactions([{ txn: txnB64 }]);

            if (!signedTxns || !signedTxns[0]) {
                throw new Error('Transaction signing was cancelled');
            }

            setTxStatus('Submitting to Algorand...');

            // Submit to blockchain
            const { txid } = await algodClient.sendRawTransaction(
                new Uint8Array(Buffer.from(signedTxns[0], 'base64'))
            ).do();

            setTxStatus('Waiting for confirmation...');

            // Wait for confirmation
            await algosdk.waitForConfirmation(algodClient, txid, 10);

            setTxStatus('');
            return txid;
        } catch (error) {
            setTxStatus('');
            throw error;
        }
    };

    // ========== CREATE PROPOSAL (with blockchain) ==========
    const handleCreate = async () => {
        if (!newTitle.trim() || !account) return;
        setCreating(true);
        try {
            // Step 1: Sign blockchain transaction
            const noteText = `TrustCampus:PROPOSAL:${newTitle.trim()}:by:${role}:${account}`;
            const txId = await signAndSubmitVoteTx(noteText);

            // Step 2: Record in backend database
            const res = await fetch(`${API_URL}/api/voting/proposals`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: newTitle,
                    description: newDescription,
                    creatorAddress: account,
                    creatorRole: role,
                    deadlineMinutes: parseInt(deadlineMinutes),
                    txId: txId
                })
            });
            const data = await res.json();
            if (data.success) {
                setNewTitle('');
                setNewDescription('');
                setShowCreate(false);
                fetchProposals();
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error('Create proposal error:', error);
            if (error.message?.includes('cancelled')) {
                alert('Transaction was cancelled');
            } else {
                alert('Failed to create proposal: ' + error.message);
            }
        } finally {
            setCreating(false);
        }
    };

    // ========== CAST VOTE (with blockchain) ==========
    const handleVote = async (proposalId, proposalTitle, choice) => {
        if (!account) {
            alert('Please connect your wallet first');
            return;
        }

        setVotingId(proposalId);
        try {
            // Step 1: Sign blockchain transaction with vote data
            const noteText = `TrustCampus:VOTE:${proposalId}:${proposalTitle}:${choice}:by:${account}`;
            const txId = await signAndSubmitVoteTx(noteText);

            // Step 2: Record in backend database
            const res = await fetch(`${API_URL}/api/voting/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    proposalId,
                    voterAddress: account,
                    choice,
                    txId: txId
                })
            });
            const data = await res.json();
            if (data.success) {
                fetchProposals();
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error('Vote error:', error);
            if (error.message?.includes('cancelled')) {
                alert('Transaction was cancelled');
            } else {
                alert('Failed to vote: ' + error.message);
            }
        } finally {
            setVotingId(null);
        }
    };

    const getTimeRemaining = (deadline) => {
        if (!deadline) return 'No deadline';
        const remaining = new Date(deadline) - new Date();
        if (remaining <= 0) return 'Expired';
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const mins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        if (hours > 0) return `${hours}h ${mins}m remaining`;
        return `${mins}m remaining`;
    };

    const isExpired = (deadline) => {
        if (!deadline) return false;
        return new Date(deadline) < new Date();
    };

    return (
        <div className="min-h-screen bg-[#0f172a] pt-24 px-4 pb-20 text-white">
            <div className="max-w-5xl mx-auto">
                <header className="mb-10 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                            🗳️ Voting & Proposals
                        </h1>
                        <p className="text-gray-400 flex items-center gap-2 mt-1">
                            <Shield size={14} className="text-green-400" />
                            {role === 'STUDENT' ? 'Vote on proposals — verified on Algorand blockchain' : 'Create & manage proposals — blockchain verified'}
                        </p>
                    </div>

                    {(role === 'TEACHER' || role === 'HOD') && (
                        <button
                            onClick={() => setShowCreate(!showCreate)}
                            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-purple-500/20"
                        >
                            <Plus size={20} />
                            Create Proposal
                        </button>
                    )}
                </header>

                {/* Blockchain Status Banner */}
                {txStatus && (
                    <div className="mb-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-xl flex items-center gap-3 animate-pulse">
                        <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                        <p className="text-blue-300 font-medium">{txStatus}</p>
                    </div>
                )}

                {/* Create Proposal Form */}
                {showCreate && (
                    <div className="mb-8 bg-white/5 border border-purple-500/30 rounded-2xl p-6">
                        <h3 className="text-xl font-bold mb-4 text-purple-300 flex items-center gap-2">
                            <Shield size={18} />
                            New Proposal (recorded on Algorand)
                        </h3>
                        <input
                            type="text"
                            placeholder="Proposal Title"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="w-full bg-black/30 border border-white/20 rounded-lg p-3 mb-4 text-white focus:outline-none focus:border-purple-500"
                        />
                        <textarea
                            placeholder="Description (optional)"
                            value={newDescription}
                            onChange={(e) => setNewDescription(e.target.value)}
                            rows={3}
                            className="w-full bg-black/30 border border-white/20 rounded-lg p-3 mb-4 text-white focus:outline-none focus:border-purple-500 resize-none"
                        />
                        <div className="flex items-center gap-4 mb-4">
                            <label className="text-sm text-gray-400">Voting Duration:</label>
                            <select
                                value={deadlineMinutes}
                                onChange={(e) => setDeadlineMinutes(e.target.value)}
                                className="bg-black/30 border border-white/20 rounded-lg p-2 text-white focus:outline-none"
                            >
                                <option value={15}>15 minutes</option>
                                <option value={30}>30 minutes</option>
                                <option value={60}>1 hour</option>
                                <option value={120}>2 hours</option>
                                <option value={1440}>24 hours</option>
                                <option value={4320}>3 days</option>
                                <option value={10080}>7 days</option>
                            </select>
                        </div>
                        <p className="text-xs text-gray-500 mb-4 flex items-center gap-1">
                            <Shield size={12} className="text-green-400" />
                            This will sign a blockchain transaction to verify your proposal creation
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={handleCreate}
                                disabled={creating || !newTitle.trim()}
                                className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {creating ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Signing...
                                    </>
                                ) : (
                                    'Create & Sign'
                                )}
                            </button>
                            <button
                                onClick={() => setShowCreate(false)}
                                className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-lg font-bold transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Proposals List */}
                {loading ? (
                    <div className="text-center py-20 text-gray-400">Loading proposals...</div>
                ) : proposals.length === 0 ? (
                    <div className="text-center py-20">
                        <Vote className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 text-lg">No proposals yet</p>
                        <p className="text-gray-500 text-sm">
                            {role === 'STUDENT'
                                ? 'Teachers or HOD will create proposals for you to vote on.'
                                : 'Click "Create Proposal" to start.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {proposals.map((proposal) => {
                            const expired = isExpired(proposal.deadline);
                            const totalVotes = (proposal.yes_votes || 0) + (proposal.no_votes || 0) + (proposal.abstain_votes || 0);
                            const yesPercent = totalVotes > 0 ? ((proposal.yes_votes || 0) / totalVotes * 100).toFixed(0) : 0;
                            const noPercent = totalVotes > 0 ? ((proposal.no_votes || 0) / totalVotes * 100).toFixed(0) : 0;

                            return (
                                <div
                                    key={proposal.id}
                                    className={`bg-white/5 border rounded-2xl p-6 transition-all ${expired ? 'border-white/5 opacity-70' : 'border-white/10 hover:border-purple-500/30'}`}
                                >
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-white mb-1">{proposal.title}</h3>
                                            {proposal.description && (
                                                <p className="text-gray-400 text-sm">{proposal.description}</p>
                                            )}
                                            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Users size={12} />
                                                    By {proposal.creator_role}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Timer size={12} />
                                                    {getTimeRemaining(proposal.deadline)}
                                                </span>
                                                {proposal.tx_id && (
                                                    <a
                                                        href={`https://testnet.algoexplorer.io/tx/${proposal.tx_id}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
                                                    >
                                                        <Shield size={12} />
                                                        On-chain
                                                        <ExternalLink size={10} />
                                                    </a>
                                                )}
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${expired
                                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                            : 'bg-green-500/20 text-green-400 border border-green-500/30 animate-pulse'
                                            }`}>
                                            {expired ? 'Closed' : '🔴 Live'}
                                        </span>
                                    </div>

                                    {/* Vote Progress Bar */}
                                    <div className="mb-4">
                                        <div className="flex justify-between text-xs text-gray-400 mb-2">
                                            <span>✅ Yes: {proposal.yes_votes || 0} ({yesPercent}%)</span>
                                            <span>Total: {totalVotes} votes</span>
                                            <span>❌ No: {proposal.no_votes || 0} ({noPercent}%)</span>
                                        </div>
                                        <div className="w-full h-3 bg-black/30 rounded-full overflow-hidden flex">
                                            <div
                                                className="bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
                                                style={{ width: `${yesPercent}%` }}
                                            />
                                            <div
                                                className="bg-gradient-to-r from-red-500 to-rose-400 transition-all duration-500"
                                                style={{ width: `${noPercent}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Vote Buttons */}
                                    {!expired && account && (
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleVote(proposal.id, proposal.title, 'YES')}
                                                disabled={votingId === proposal.id}
                                                className="flex-1 flex items-center justify-center gap-2 bg-green-500/20 hover:bg-green-500/40 text-green-400 py-3 rounded-xl font-bold transition-all border border-green-500/30 disabled:opacity-50"
                                            >
                                                {votingId === proposal.id ? (
                                                    <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <CheckCircle size={18} />
                                                )}
                                                Vote Yes
                                            </button>
                                            <button
                                                onClick={() => handleVote(proposal.id, proposal.title, 'NO')}
                                                disabled={votingId === proposal.id}
                                                className="flex-1 flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 py-3 rounded-xl font-bold transition-all border border-red-500/30 disabled:opacity-50"
                                            >
                                                {votingId === proposal.id ? (
                                                    <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <XCircle size={18} />
                                                )}
                                                Vote No
                                            </button>
                                            <button
                                                onClick={() => handleVote(proposal.id, proposal.title, 'ABSTAIN')}
                                                disabled={votingId === proposal.id}
                                                className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-gray-400 py-3 px-6 rounded-xl font-bold transition-all border border-white/10 disabled:opacity-50"
                                            >
                                                Abstain
                                            </button>
                                        </div>
                                    )}

                                    {/* Blockchain verification note */}
                                    {!expired && account && (
                                        <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
                                            <Shield size={10} className="text-green-500" />
                                            Your vote will be permanently recorded on Algorand blockchain
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Voting;
