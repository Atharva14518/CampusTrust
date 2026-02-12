import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, QrCode, AlertCircle, CheckCircle } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { Html5Qrcode } from 'html5-qrcode';

const QRScanner = () => {
    const navigate = useNavigate();
    const { account, connectWallet } = useWallet();
    const [scanning, setScanning] = useState(false);
    const [error, setError] = useState('');
    const [cameraId, setCameraId] = useState(null);
    const scannerRef = useRef(null);
    const html5QrCodeRef = useRef(null);

    useEffect(() => {
        return () => {
            // Cleanup scanner on unmount
            if (html5QrCodeRef.current && scanning) {
                html5QrCodeRef.current.stop().catch(err => console.error('Stop error:', err));
            }
        };
    }, [scanning]);

    const startScanning = async () => {
        if (!account) {
            setError('Please connect your wallet first');
            return;
        }

        try {
            setError('');
            setScanning(true);

            // Get camera devices
            const devices = await Html5Qrcode.getCameras();
            if (devices && devices.length) {
                // Use back camera if available, otherwise first camera
                const backCamera = devices.find(d => d.label.toLowerCase().includes('back'));
                const selectedCamera = backCamera || devices[0];

                // Initialize scanner
                const html5QrCode = new Html5Qrcode("qr-reader");
                html5QrCodeRef.current = html5QrCode;

                await html5QrCode.start(
                    selectedCamera.id,
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1.0
                    },
                    (decodedText) => {
                        // QR code detected!
                        console.log('🔍 QR Code RAW scanned text:', decodedText);

                        // Stop scanning
                        html5QrCode.stop().then(() => {
                            setScanning(false);

                            try {
                                // The QR code contains a full URL like: http://localhost:5174/mark-attendance?data=...
                                // We need to extract the 'data' parameter from it
                                const url = new URL(decodedText);
                                console.log('🔍 Parsed as URL - pathname:', url.pathname, 'search:', url.search);

                                const dataParam = url.searchParams.get('data');
                                console.log('🔍 Extracted data parameter:', dataParam);

                                if (dataParam) {
                                    // Navigate with the extracted data
                                    const targetPath = `/mark-attendance?data=${encodeURIComponent(dataParam)}`;
                                    console.log('🔍 Navigating to:', targetPath);
                                    navigate(targetPath);
                                } else {
                                    // If no data param found, maybe it's just raw JSON? Try passing it as-is
                                    navigate(`/mark-attendance?data=${encodeURIComponent(decodedText)}`);
                                }
                            } catch (urlError) {
                                // If it's not a valid URL, assume it's raw JSON data
                                console.log('🔍 Not a URL (error:', urlError.message, '), treating as raw JSON data');
                                navigate(`/mark-attendance?data=${encodeURIComponent(decodedText)}`);
                            }
                        }).catch(err => {
                            console.error('Failed to stop scanner:', err);
                        });
                    },
                    (error) => {
                        // Ignore scan errors (happens continuously while scanning)
                    }
                );
            } else {
                setError('No cameras found on this device');
                setScanning(false);
            }
        } catch (err) {
            console.error('Camera error:', err);
            setError('Failed to access camera. Please grant camera permissions and try again.');
            setScanning(false);
        }
    };

    const stopScanning = () => {
        if (html5QrCodeRef.current) {
            html5QrCodeRef.current.stop()
                .then(() => {
                    setScanning(false);
                })
                .catch(err => {
                    console.error('Failed to stop scanner:', err);
                    setScanning(false);
                });
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] pt-24 px-4 pb-20">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                        <QrCode className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Scan QR Code</h1>
                    <p className="text-gray-400">Scan your teacher's QR code to mark attendance</p>
                </div>

                {/* Wallet Check */}
                {!account && (
                    <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-xl flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                        <div>
                            <p className="text-yellow-300 font-medium">Wallet Not Connected</p>
                            <p className="text-yellow-400/80 text-sm">You need to connect your wallet before scanning</p>
                            <button
                                onClick={connectWallet}
                                className="mt-3 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg transition-colors"
                            >
                                Connect Wallet
                            </button>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                        <p className="text-red-300">{error}</p>
                    </div>
                )}

                {/* Scanner Area */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
                    {!scanning ? (
                        <div className="text-center py-12">
                            <div className="w-32 h-32 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-2 border-dashed border-white/20 flex items-center justify-center">
                                <Camera className="w-16 h-16 text-gray-400" />
                            </div>
                            <p className="text-gray-400 mb-6">
                                Position the QR code within the camera frame
                            </p>
                            <button
                                onClick={startScanning}
                                disabled={!account}
                                className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto"
                            >
                                <Camera size={20} />
                                Start Camera
                            </button>
                        </div>
                    ) : (
                        <div>
                            {/* QR Scanner Container */}
                            <div id="qr-reader" className="rounded-lg overflow-hidden mb-4"></div>

                            <div className="flex flex-col items-center gap-3">
                                <div className="flex items-center gap-2 text-green-400">
                                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                                    <span className="text-sm font-medium">Camera Active - Scanning...</span>
                                </div>
                                <button
                                    onClick={stopScanning}
                                    className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 font-bold rounded-lg transition-colors"
                                >
                                    Stop Scanning
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Instructions */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5">
                    <h3 className="text-blue-300 font-bold mb-3 flex items-center gap-2">
                        <CheckCircle size={18} />
                        How it works:
                    </h3>
                    <ol className="space-y-2 text-sm text-blue-200/80">
                        <li className="flex gap-2">
                            <span className="text-blue-400 font-bold">1.</span>
                            <span>Make sure you're connected to your wallet</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-blue-400 font-bold">2.</span>
                            <span>Click "Start Camera" and allow camera permissions</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-blue-400 font-bold">3.</span>
                            <span>Point your camera at the teacher's QR code</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-blue-400 font-bold">4.</span>
                            <span>The code will be detected automatically</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-blue-400 font-bold">5.</span>
                            <span>Sign the transaction with your wallet to mark attendance</span>
                        </li>
                    </ol>
                </div>
            </div>
        </div>
    );
};

export default QRScanner;
