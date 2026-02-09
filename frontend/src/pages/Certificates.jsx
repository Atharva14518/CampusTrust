import React, { useState, useEffect } from 'react';
import { Award, ExternalLink, Upload, Loader2, CheckCircle, X, FileText, Calendar, User, Hash, Link2 } from 'lucide-react';
import algosdk from 'algosdk';
import { useWallet } from '../context/WalletContext';
import { API_URL } from '../config';
import { Buffer } from 'buffer';
window.Buffer = Buffer;

const Certificates = () => {
    const { account, lute, verifyConnection } = useWallet();
    const [certificates, setCertificates] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState(null);
    const [formData, setFormData] = useState({ title: '', course: '', date: '', description: '' });
    const [allCertificates, setAllCertificates] = useState([]);
    const [activeTab, setActiveTab] = useState('my');
    const [selectedCert, setSelectedCert] = useState(null); // For modal

    useEffect(() => {
        if (account) {
            fetchMyCertificates();
        }
        fetchAllCertificates();
    }, [account]);

    const fetchMyCertificates = async () => {
        try {
            const res = await fetch(`${API_URL}/api/certificate/my?address=${account}`);
            const data = await res.json();
            if (data.success) {
                setCertificates(data.certificates);
            }
        } catch (error) {
            console.error('Failed to fetch certificates:', error);
        }
    };

    const fetchAllCertificates = async () => {
        try {
            const res = await fetch(`${API_URL}/api/certificate/all`);
            const data = await res.json();
            if (data.success) {
                setAllCertificates(data.certificates);
            }
        } catch (error) {
            console.error('Failed to fetch all certificates:', error);
        }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleMint = async (e) => {
        e.preventDefault();
        if (!account || !file || !lute) {
            alert('Please connect wallet and select a file');
            return;
        }

        setUploading(true);
        try {
            // 1. Upload to Backend -> IPFS
            const uploadData = new FormData();
            uploadData.append('file', file);
            uploadData.append('title', formData.title);
            uploadData.append('course', formData.course);
            uploadData.append('date', formData.date);
            uploadData.append('description', formData.description);
            uploadData.append('studentAddress', account);

            const res = await fetch(`${API_URL}/api/certificate/mint`, {
                method: 'POST',
                body: uploadData
            });

            const data = await res.json();
            if (!data.success) throw new Error(data.error);

            // 2. Verify wallet connection is authenticated before signing
            await verifyConnection();

            console.log('═══════════════════════════════════════');
            console.log('SIGNING NFT CERTIFICATE TRANSACTION');
            console.log('Transaction type: Asset Creation (NFT)');
            console.log('Creator:', account);
            console.log('Requesting signature from Lute wallet...');
            console.log('═══════════════════════════════════════');

            const signedTxns = await lute.signTxns([{ txn: data.txn }]);

            if (!signedTxns || !signedTxns[0]) {
                throw new Error('Transaction signing failed. Please approve the transaction in Lute wallet.');
            }

            console.log('✓ Transaction signed successfully!');

            // 3. Submit to Algorand
            console.log('Submitting signed transaction to Algorand...');
            const algodClient = new algosdk.Algodv2('', 'https://testnet-api.4160.nodely.dev', '');

            const sendResponse = await algodClient.sendRawTransaction(
                new Uint8Array(Buffer.from(signedTxns[0], 'base64'))
            ).do();

            // Handle different SDK versions - txid can be in different locations
            const txId = sendResponse.txid || sendResponse.txId || sendResponse;

            console.log('✓ Transaction submitted:', txId);

            // 4. Wait for confirmation (increased timeout for network delays)
            console.log('Waiting for blockchain confirmation (this may take 10-30 seconds)...');
            await algosdk.waitForConfirmation(algodClient, txId, 20);

            // 5. Get asset ID from transaction
            const ptx = await algodClient.pendingTransactionInformation(txId).do();
            const assetId = ptx['asset-index'];

            console.log('✓ Asset created! Asset ID:', assetId);

            // 6. Confirm with backend
            const confirmResponse = await fetch(`${API_URL}/api/certificate/confirm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    certificateId: data.certificateId,
                    assetId: String(assetId), // Convert to string for JSON
                    txId: String(txId)
                })
            });

            if (!confirmResponse.ok) {
                console.error('Confirm failed, but NFT was created on blockchain');
            }

            alert(`Certificate Minted! Asset ID: ${assetId}`);
            setFormData({ title: '', course: '', date: '', description: '' });
            setFile(null);
            fetchMyCertificates();
            fetchAllCertificates();

        } catch (error) {
            console.error(error);
            alert('Minting failed: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    // Get IPFS URL for document
    const getDocumentUrl = (cert) => {
        if (cert.file_cid) {
            return `https://gateway.pinata.cloud/ipfs/${cert.file_cid}`;
        }
        if (cert.ipfs_hash) {
            return `https://gateway.pinata.cloud/ipfs/${cert.ipfs_hash}`;
        }
        return null;
    };

    return (
        <div className="min-h-screen bg-[#0f172a] pt-24 px-4 pb-20">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12 text-center">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500 mb-4">
                        Certificate Vault
                    </h1>
                    <p className="text-gray-400">Mint your achievements as verifiable NFTs on Algorand</p>
                </header>

                {/* Minting Form */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-12 max-w-2xl mx-auto">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <Upload className="text-pink-500" /> Upload New Certificate
                    </h2>
                    <form onSubmit={handleMint} className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Title *</label>
                            <input
                                type="text"
                                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-pink-500"
                                placeholder="e.g. Hackathon Winner"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Course/Event</label>
                                <input
                                    type="text"
                                    className="w-full bg-black/30 border border-white/10 rounded-lg p-3"
                                    placeholder="e.g. AlgoAttendance"
                                    value={formData.course}
                                    onChange={e => setFormData({ ...formData, course: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Date</label>
                                <input
                                    type="date"
                                    className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white [color-scheme:dark]"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Description</label>
                            <textarea
                                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 h-24"
                                placeholder="Details about the achievement..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Certificate File * (Image/PDF)</label>
                            <input
                                type="file"
                                accept="image/*,application/pdf"
                                onChange={handleFileChange}
                                className="block w-full text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-500/10 file:text-pink-400 hover:file:bg-pink-500/20"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={uploading || !account}
                            className="w-full bg-gradient-to-r from-pink-600 to-purple-600 py-3 rounded-xl font-bold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {uploading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="animate-spin" /> Minting NFT...
                                </span>
                            ) : (
                                'Mint Certificate NFT'
                            )}
                        </button>
                        {!account && (
                            <p className="text-center text-sm text-yellow-400">Please connect your Lute wallet first</p>
                        )}
                    </form>
                </div>

                {/* Tabs */}
                <div className="flex justify-center mb-8 bg-white/5 p-1 rounded-full w-fit mx-auto">
                    <button
                        onClick={() => setActiveTab('my')}
                        className={`px-6 py-2 rounded-full transition-all ${activeTab === 'my' ? 'bg-pink-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        My Certificates
                    </button>
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-6 py-2 rounded-full transition-all ${activeTab === 'all' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        All Certificates
                    </button>
                </div>

                {/* Gallery */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {(activeTab === 'my' ? certificates : allCertificates).map((cert) => (
                        <div
                            key={cert.id}
                            onClick={() => setSelectedCert(cert)}
                            className="group bg-white/5 rounded-2xl border border-white/10 p-6 hover:border-pink-500/50 transition-all cursor-pointer hover:scale-[1.02]"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <Award className="text-yellow-500 w-10 h-10" />
                                <span className={`text-xs px-2 py-1 rounded ${cert.status === 'CONFIRMED'
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-yellow-500/20 text-yellow-400'
                                    }`}>
                                    {cert.status === 'CONFIRMED' ? 'Verified' : 'Pending'}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold mb-1">{cert.title}</h3>
                            <p className="text-gray-400 text-sm mb-2">{cert.course}</p>
                            {cert.asset_id && (
                                <p className="text-xs text-gray-500 mb-4">Asset ID: {cert.asset_id}</p>
                            )}
                            <p className="text-xs text-pink-400">Click to view details →</p>
                        </div>
                    ))}
                    {(activeTab === 'my' ? certificates : allCertificates).length === 0 && (
                        <div className="col-span-full text-center py-20 text-gray-500">
                            {activeTab === 'my'
                                ? 'No certificates found. Mint your first one above!'
                                : 'No certificates have been minted yet.'}
                        </div>
                    )}
                </div>
            </div>

            {/* Certificate Detail Modal */}
            {selectedCert && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedCert(null)}
                >
                    <div
                        className="bg-[#1a1f2e] border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <Award className="text-yellow-500 w-8 h-8" />
                                <div>
                                    <h2 className="text-2xl font-bold">{selectedCert.title}</h2>
                                    <p className="text-gray-400">{selectedCert.course}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedCert(null)}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left: Document Preview */}
                            <div className="bg-black/30 rounded-xl p-4">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <FileText className="text-pink-400" /> Document Preview
                                </h3>
                                {getDocumentUrl(selectedCert) ? (
                                    <div className="relative">
                                        <img
                                            src={getDocumentUrl(selectedCert)}
                                            alt={selectedCert.title}
                                            className="w-full rounded-lg max-h-[400px] object-contain bg-gray-900"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                        <div className="hidden flex-col items-center justify-center h-[300px] bg-gray-800 rounded-lg">
                                            <FileText className="w-16 h-16 text-gray-500 mb-4" />
                                            <p className="text-gray-400 mb-4">PDF Document</p>
                                            <a
                                                href={getDocumentUrl(selectedCert)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="px-4 py-2 bg-pink-600 rounded-lg hover:bg-pink-700 transition-colors"
                                            >
                                                Open PDF
                                            </a>
                                        </div>
                                        <a
                                            href={getDocumentUrl(selectedCert)}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="mt-4 block text-center py-2 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-colors"
                                        >
                                            View Full Size ↗
                                        </a>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-[300px] bg-gray-800 rounded-lg">
                                        <FileText className="w-16 h-16 text-gray-500 mb-4" />
                                        <p className="text-gray-400">No document preview available</p>
                                    </div>
                                )}
                            </div>

                            {/* Right: Details */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold mb-4">Certificate Details</h3>

                                <div className="bg-black/30 rounded-xl p-4 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <User className="text-blue-400 w-5 h-5" />
                                        <div>
                                            <p className="text-xs text-gray-400">Owner</p>
                                            <p className="text-sm font-mono break-all">
                                                {selectedCert.student_address?.slice(0, 8)}...{selectedCert.student_address?.slice(-8)}
                                            </p>
                                        </div>
                                    </div>

                                    {selectedCert.date && (
                                        <div className="flex items-center gap-3">
                                            <Calendar className="text-green-400 w-5 h-5" />
                                            <div>
                                                <p className="text-xs text-gray-400">Date</p>
                                                <p className="text-sm">{new Date(selectedCert.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    )}

                                    {selectedCert.asset_id && (
                                        <div className="flex items-center gap-3">
                                            <Hash className="text-yellow-400 w-5 h-5" />
                                            <div>
                                                <p className="text-xs text-gray-400">Asset ID (NFT)</p>
                                                <p className="text-sm font-mono">{selectedCert.asset_id}</p>
                                            </div>
                                        </div>
                                    )}

                                    {selectedCert.tx_id && (
                                        <div className="flex items-center gap-3">
                                            <Link2 className="text-purple-400 w-5 h-5" />
                                            <div>
                                                <p className="text-xs text-gray-400">Transaction ID</p>
                                                <p className="text-sm font-mono break-all">{selectedCert.tx_id?.slice(0, 20)}...</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3">
                                        <CheckCircle className={`w-5 h-5 ${selectedCert.status === 'CONFIRMED' ? 'text-green-400' : 'text-yellow-400'}`} />
                                        <div>
                                            <p className="text-xs text-gray-400">Status</p>
                                            <p className={`text-sm font-semibold ${selectedCert.status === 'CONFIRMED' ? 'text-green-400' : 'text-yellow-400'}`}>
                                                {selectedCert.status === 'CONFIRMED' ? '✓ Blockchain Verified' : '⏳ Pending'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {selectedCert.description && (
                                    <div className="bg-black/30 rounded-xl p-4">
                                        <p className="text-xs text-gray-400 mb-2">Description</p>
                                        <p className="text-sm text-gray-200">{selectedCert.description}</p>
                                    </div>
                                )}

                                {/* Action Links */}
                                <div className="flex flex-wrap gap-3">
                                    {selectedCert.asset_id && (
                                        <a
                                            href={`https://testnet.algoexplorer.io/asset/${selectedCert.asset_id}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center gap-2 px-4 py-2 bg-pink-600/20 text-pink-400 rounded-lg hover:bg-pink-600/30 transition-colors"
                                        >
                                            <ExternalLink size={16} /> View on AlgoExplorer
                                        </a>
                                    )}
                                    {selectedCert.metadata_cid && (
                                        <a
                                            href={`https://gateway.pinata.cloud/ipfs/${selectedCert.metadata_cid}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-colors"
                                        >
                                            <ExternalLink size={16} /> View Metadata (IPFS)
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Certificates;

