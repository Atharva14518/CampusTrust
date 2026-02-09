import React, { useState, useEffect } from 'react';
import { Award, ExternalLink, Upload, Loader2, CheckCircle } from 'lucide-react';
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
            const { txId } = await algodClient.sendRawTransaction(
                new Uint8Array(Buffer.from(signedTxns[0], 'base64'))
            ).do();

            console.log('✓ Transaction submitted:', txId);

            // 4. Wait for confirmation
            await algosdk.waitForConfirmation(algodClient, txId, 4);

            // 5. Get asset ID from transaction
            const ptx = await algodClient.pendingTransactionInformation(txId).do();
            const assetId = ptx['asset-index'];

            // 6. Confirm with backend
            await fetch(`${API_URL}/api/certificate/confirm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    certificateId: data.certificateId,
                    assetId,
                    txId
                })
            });

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
                        <div key={cert.id} className="group bg-white/5 rounded-2xl border border-white/10 p-6 hover:border-pink-500/50 transition-all">
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
                            <div className="flex gap-2">
                                {cert.asset_id && (
                                    <a
                                        href={`https://testnet.algoexplorer.io/asset/${cert.asset_id}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-pink-400 hover:text-pink-300 text-sm flex items-center gap-1"
                                    >
                                        Explorer <ExternalLink size={14} />
                                    </a>
                                )}
                                {cert.metadata_cid && (
                                    <a
                                        href={`https://gateway.pinata.cloud/ipfs/${cert.metadata_cid}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"
                                    >
                                        IPFS <ExternalLink size={14} />
                                    </a>
                                )}
                            </div>
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
        </div>
    );
};

export default Certificates;
