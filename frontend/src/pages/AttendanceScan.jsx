import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2, AlertCircle, MapPin, Navigation, Clock, AlertTriangle } from 'lucide-react';
import algosdk from 'algosdk';
import { useWallet } from '../context/WalletContext';
import { API_URL } from '../config';
import confetti from 'canvas-confetti';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom markers
const classroomIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const studentIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

// Calculate distance between two points
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
};

const AttendanceScan = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { account, connectWallet, verifyConnection, signTransactions, walletType } = useWallet();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [txId, setTxId] = useState('');
    const [studentName, setStudentName] = useState('');
    const [parentPhone, setParentPhone] = useState('');
    const [sendSms, setSendSms] = useState(true);
    const [classData, setClassData] = useState(null);

    // Geolocation state
    const [studentLocation, setStudentLocation] = useState(null);
    const [distance, setDistance] = useState(null);
    const [locationLoading, setLocationLoading] = useState(true);
    const [locationError, setLocationError] = useState(null);
    const [isWithinRange, setIsWithinRange] = useState(false);

    // QR Expiry
    const [isExpired, setIsExpired] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(0);

    useEffect(() => {
        const data = searchParams.get('data');
        if (data) {
            try {
                const parsed = JSON.parse(decodeURIComponent(data));
                setClassData(parsed);

                // Check expiry
                if (parsed.expiry) {
                    const remaining = Math.max(0, Math.floor((parsed.expiry - Date.now()) / 1000));
                    setTimeRemaining(remaining);
                    setIsExpired(remaining === 0);
                }
            } catch (e) {
                setError('Invalid QR code data');
            }
        }
    }, [searchParams]);

    // QR Expiry countdown
    useEffect(() => {
        if (classData?.expiry) {
            const interval = setInterval(() => {
                const remaining = Math.max(0, Math.floor((classData.expiry - Date.now()) / 1000));
                setTimeRemaining(remaining);
                if (remaining === 0) setIsExpired(true);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [classData]);

    // Get student's location
    useEffect(() => {
        if (classData?.location) {
            setLocationLoading(true);

            if (!navigator.geolocation) {
                setLocationError('Geolocation not supported');
                setLocationLoading(false);
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const studentLoc = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    setStudentLocation(studentLoc);

                    // Calculate distance
                    const dist = calculateDistance(
                        studentLoc.lat, studentLoc.lng,
                        classData.location.lat, classData.location.lng
                    );
                    setDistance(Math.round(dist));
                    setIsWithinRange(dist <= (classData.maxDistance || 100));
                    setLocationLoading(false);
                },
                (err) => {
                    setLocationError('Please enable location access');
                    setLocationLoading(false);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        } else {
            setLocationLoading(false);
            setIsWithinRange(true); // Legacy QR without location
        }
    }, [classData]);

    const triggerConfetti = () => {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
        setTimeout(() => {
            confetti({
                particleCount: 50,
                angle: 60,
                spread: 55,
                origin: { x: 0 }
            });
            confetti({
                particleCount: 50,
                angle: 120,
                spread: 55,
                origin: { x: 1 }
            });
        }, 250);
    };

    const handleMarkAttendance = async () => {
        if (!account) {
            try { await connectWallet(); } catch (e) { }
            return;
        }

        if (!studentName.trim()) {
            setError('Please enter your name');
            return;
        }

        if (!classData) {
            setError('No class data found');
            return;
        }

        if (isExpired) {
            setError('This QR code has expired! Ask your teacher for a new one.');
            return;
        }

        if (classData.location && !isWithinRange) {
            setError(`You are ${distance}m away. Please move within ${classData.maxDistance || 100}m of the classroom.`);
            return;
        }

        if (!account || account.length !== 58) {
            setError('Invalid wallet address. Please reconnect.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            try { await verifyConnection(); } catch (e) {
                setError('Please connect your wallet first');
                setLoading(false);
                return;
            }

            const algodClient = new algosdk.Algodv2('', 'https://testnet-api.4160.nodely.dev', '');
            const params = await algodClient.getTransactionParams().do();

            const encoder = new TextEncoder();
            const noteData = encoder.encode(
                `TrustCampus:${classData.classId}:${studentName.trim()}:${distance || 0}m`
            );

            const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
                sender: account,
                receiver: account,
                amount: 0,
                note: noteData,
                suggestedParams: params
            });

            // Use universal signTransactions that works for both Lute and Pera
            const txnB64 = Buffer.from(algosdk.encodeUnsignedTransaction(txn)).toString('base64');
            const signedTxns = await signTransactions([{ txn: txnB64 }]);

            if (!signedTxns || !signedTxns[0]) {
                throw new Error('Signing cancelled');
            }

            const { txid: submittedTxId } = await algodClient.sendRawTransaction(
                new Uint8Array(Buffer.from(signedTxns[0], 'base64'))
            ).do();

            await algosdk.waitForConfirmation(algodClient, submittedTxId, 10);

            // Record in backend with distance
            const response = await fetch(`${API_URL}/api/attendance/mark`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    classId: classData.classId,
                    walletAddress: account,
                    studentName: studentName.trim(),
                    txId: submittedTxId,
                    distance: distance,
                    // Send location data for SERVER-SIDE validation (anti-fake GPS)
                    studentLocation: studentLocation,
                    classLocation: classData.location,
                    qrExpiry: classData.expiry,
                    maxDistance: classData.maxDistance || 100,
                    parentPhone: sendSms ? parentPhone : null
                })
            });

            setTxId(submittedTxId);
            setSuccess(true);
            triggerConfetti();

        } catch (err) {
            console.error(err);
            let msg = err.message || 'Failed to mark attendance';

            if (msg.includes('Genesis') || msg.includes('Network')) {
                msg = 'Network Mismatch: Please switch your wallet app to TestNet in settings.';
            }

            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Expired QR
    if (isExpired && classData) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 max-w-md w-full text-center">
                    <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-red-400 mb-2">QR Code Expired!</h2>
                    <p className="text-gray-400 mb-6">This attendance QR has expired. Please ask your teacher for a new one.</p>
                    <button
                        onClick={() => navigate('/attendance')}
                        className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-bold text-white"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    // Invalid QR
    if (!classData) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md w-full text-center">
                    <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Invalid QR Code</h2>
                    <p className="text-gray-400 mb-6">Please scan a valid attendance QR code</p>
                    <button
                        onClick={() => navigate('/scan')}
                        className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-bold text-white"
                    >
                        Scan Again
                    </button>
                </div>
            </div>
        );
    }

    // Success
    if (success) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md w-full text-center">
                    <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                        <CheckCircle className="w-12 h-12 text-green-500" />
                    </div>
                    <h2 className="text-3xl font-bold text-green-400 mb-2">🎉 Attendance Marked!</h2>
                    <p className="text-gray-300 mb-2">
                        Class: <span className="font-bold text-purple-400">{classData.classId}</span>
                    </p>
                    {distance !== null && (
                        <p className="text-sm text-green-400 mb-4">
                            ✓ Verified at {distance}m from classroom
                        </p>
                    )}
                    <div className="bg-black/30 rounded-lg p-4 mb-6">
                        <p className="text-xs text-gray-400 mb-1">Transaction ID:</p>
                        <a
                            href={`https://testnet.algoexplorer.io/tx/${txId}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-400 hover:underline font-mono text-xs break-all"
                        >
                            {txId}
                        </a>
                    </div>
                    <button
                        onClick={() => navigate('/student')}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 py-3 rounded-lg font-bold text-white"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4 py-8">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 max-w-lg w-full">
                <h2 className="text-2xl font-bold text-white mb-4 text-center">Mark Attendance</h2>

                {/* Timer */}
                {classData.expiry && (
                    <div className={`flex items-center justify-center gap-2 p-3 rounded-lg mb-4 ${timeRemaining < 60 ? 'bg-yellow-500/20 border border-yellow-500/50' : 'bg-green-500/20 border border-green-500/50'
                        }`}>
                        <Clock className={timeRemaining < 60 ? 'text-yellow-400' : 'text-green-400'} size={18} />
                        <span className={`font-mono font-bold ${timeRemaining < 60 ? 'text-yellow-400' : 'text-green-400'}`}>
                            {formatTime(timeRemaining)} remaining
                        </span>
                    </div>
                )}

                {/* Class Info */}
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-400 mb-1">Class ID:</p>
                    <p className="text-xl font-bold text-purple-400">{classData.classId}</p>
                </div>

                {/* Location Verification */}
                {classData.location && (
                    <div className="mb-4">
                        <div className="h-40 rounded-xl overflow-hidden border border-white/20 mb-3">
                            {studentLocation && (
                                <MapContainer
                                    center={[classData.location.lat, classData.location.lng]}
                                    zoom={17}
                                    style={{ height: '100%', width: '100%' }}
                                    zoomControl={false}
                                >
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <Marker position={[classData.location.lat, classData.location.lng]} icon={classroomIcon}>
                                        <Popup>Classroom</Popup>
                                    </Marker>
                                    <Circle
                                        center={[classData.location.lat, classData.location.lng]}
                                        radius={classData.maxDistance || 100}
                                        pathOptions={{ color: isWithinRange ? 'green' : 'red', fillOpacity: 0.1 }}
                                    />
                                    <Marker position={[studentLocation.lat, studentLocation.lng]} icon={studentIcon}>
                                        <Popup>You</Popup>
                                    </Marker>
                                </MapContainer>
                            )}
                        </div>

                        {locationLoading ? (
                            <div className="flex items-center justify-center gap-2 text-gray-400 py-2">
                                <Loader2 className="animate-spin" size={16} />
                                Getting your location...
                            </div>
                        ) : locationError ? (
                            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-center">
                                <p className="text-red-400 text-sm">{locationError}</p>
                            </div>
                        ) : (
                            <div className={`rounded-lg p-3 text-center ${isWithinRange
                                ? 'bg-green-500/20 border border-green-500/50'
                                : 'bg-red-500/20 border border-red-500/50'
                                }`}>
                                <div className="flex items-center justify-center gap-2">
                                    <Navigation size={16} className={isWithinRange ? 'text-green-400' : 'text-red-400'} />
                                    <span className={`font-bold ${isWithinRange ? 'text-green-400' : 'text-red-400'}`}>
                                        {distance}m from classroom
                                    </span>
                                </div>
                                <p className="text-xs mt-1 text-gray-400">
                                    {isWithinRange
                                        ? '✓ You are within range!'
                                        : `✗ Move within ${classData.maxDistance || 100}m to mark attendance`
                                    }
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {!account ? (
                    <div className="text-center">
                        <p className="text-gray-400 mb-4">Connect your Lute wallet to continue</p>
                        <button
                            onClick={connectWallet}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 py-3 rounded-lg font-bold text-white"
                        >
                            Connect Lute Wallet
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Your Name</label>
                            <input
                                type="text"
                                placeholder="Enter your full name"
                                className="w-full bg-black/30 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"
                                value={studentName}
                                onChange={(e) => setStudentName(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        {/* Parent SMS Notification */}
                        <div className="bg-gradient-to-r from-green-900/30 to-teal-900/30 border border-green-500/30 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">📱</span>
                                    <span className="text-sm font-medium text-white">Notify Parent via SMS</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSendSms(!sendSms)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${sendSms ? 'bg-green-500' : 'bg-gray-600'
                                        }`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${sendSms ? 'translate-x-6' : 'translate-x-1'
                                        }`} />
                                </button>
                            </div>
                            {sendSms && (
                                <input
                                    type="tel"
                                    placeholder="Parent's phone (+91XXXXXXXXXX)"
                                    className="w-full bg-black/30 border border-white/20 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 text-sm"
                                    value={parentPhone}
                                    onChange={(e) => setParentPhone(e.target.value)}
                                    disabled={loading}
                                />
                            )}
                            <p className="text-xs text-gray-500 mt-2">
                                {sendSms ? 'Parent will receive SMS when you mark attendance' : 'SMS notifications disabled'}
                            </p>
                        </div>

                        <div className="bg-black/30 rounded-lg p-3">
                            <p className="text-xs text-gray-400 mb-1">Connected Wallet:</p>
                            <p className="font-mono text-xs text-gray-300 break-all">{account}</p>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                                <p className="text-red-400 text-sm">{error}</p>
                            </div>
                        )}

                        <button
                            onClick={handleMarkAttendance}
                            disabled={loading || !studentName.trim() || (classData.location && !isWithinRange)}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 py-4 rounded-lg font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" />
                                    Signing Transaction...
                                </>
                            ) : (
                                <>
                                    <CheckCircle size={20} />
                                    Mark Attendance
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AttendanceScan;
