import React, { useState, useEffect, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { CheckCircle, Users, Copy, ExternalLink, MapPin, Clock, AlertTriangle, Navigation } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { API_URL } from '../config';
import attendanceArtifact from '../attendance_artifact.json';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker for classroom
const classroomIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Map click handler component
const LocationMarker = ({ position, setPosition }) => {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
    });

    return position === null ? null : (
        <Marker position={position} icon={classroomIcon}>
            <Popup>Classroom Location</Popup>
        </Marker>
    );
};

const Attendance = () => {
    const { account } = useWallet();
    const [classId, setClassId] = useState('');
    const [showQR, setShowQR] = useState(false);
    const [attendanceList, setAttendanceList] = useState([]);
    const [qrData, setQrData] = useState('');
    const [scanUrl, setScanUrl] = useState('');
    const [copied, setCopied] = useState(false);

    // Geolocation state
    const [classroomLocation, setClassroomLocation] = useState(null);
    const [showMap, setShowMap] = useState(false);
    const [userLocation, setUserLocation] = useState(null);

    // QR Expiry state
    const [qrExpiry, setQrExpiry] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes
    const [isExpired, setIsExpired] = useState(false);

    // Default map center (can be user's location or a default)
    const [mapCenter, setMapCenter] = useState([18.5204, 73.8567]); // Pune, India

    // Get user's current location for map center
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setMapCenter([position.coords.latitude, position.coords.longitude]);
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => console.log('Geolocation error:', error)
            );
        }
    }, []);

    useEffect(() => {
        if (showQR && classId) {
            fetchAttendanceList();
            const interval = setInterval(fetchAttendanceList, 3000);
            return () => clearInterval(interval);
        }
    }, [showQR, classId]);

    // QR Expiry countdown
    useEffect(() => {
        if (showQR && qrExpiry) {
            const interval = setInterval(() => {
                const now = Date.now();
                const remaining = Math.max(0, Math.floor((qrExpiry - now) / 1000));
                setTimeRemaining(remaining);

                if (remaining === 0) {
                    setIsExpired(true);
                }
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [showQR, qrExpiry]);

    const fetchAttendanceList = async () => {
        try {
            const res = await fetch(`${API_URL}/api/attendance/class?classId=${classId}`);
            const data = await res.json();
            if (data.success) {
                setAttendanceList(data.attendance);
            }
        } catch (error) {
            console.error('Failed to fetch attendance:', error);
        }
    };

    const handleGenerate = () => {
        if (!classId) {
            alert('Please enter a Class ID');
            return;
        }

        if (!classroomLocation) {
            alert('Please set the classroom location on the map first!');
            return;
        }

        const expiryTime = Date.now() + (5 * 60 * 1000); // 5 minutes from now

        const data = {
            classId,
            timestamp: Date.now(),
            expiry: expiryTime,
            location: {
                lat: classroomLocation.lat,
                lng: classroomLocation.lng
            },
            maxDistance: 100, // meters
            appId: attendanceArtifact.appId
        };

        const baseUrl = window.location.origin;
        const url = `${baseUrl}/mark-attendance?data=${encodeURIComponent(JSON.stringify(data))}`;

        setQrData(url);
        setScanUrl(url);
        setQrExpiry(expiryTime);
        setTimeRemaining(300);
        setIsExpired(false);
        setShowQR(true);
    };

    const handleRegenerate = () => {
        handleGenerate();
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(scanUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-[#0f172a] pt-24 px-4 text-white pb-20">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8 text-center">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
                        Attendance System
                    </h1>
                    <p className="text-gray-400">Blockchain-verified with geolocation & time-limited QR</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Map Panel */}
                    <div className="lg:col-span-1 bg-white/5 p-6 rounded-2xl border border-white/10">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <MapPin className="text-red-400" />
                            Set Classroom Location
                        </h2>
                        <p className="text-sm text-gray-400 mb-4">
                            Click on map or use button to set classroom location.
                        </p>

                        {/* Use My Location Button */}
                        <button
                            onClick={() => {
                                if (navigator.geolocation) {
                                    navigator.geolocation.getCurrentPosition(
                                        (pos) => {
                                            const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                                            setClassroomLocation(loc);
                                            setMapCenter([loc.lat, loc.lng]);
                                            alert(`📍 Location set to your current position!\n\nLat: ${loc.lat.toFixed(6)}\nLng: ${loc.lng.toFixed(6)}`);
                                        },
                                        (err) => alert('Could not get location. Please enable GPS.')
                                    );
                                }
                            }}
                            className="w-full mb-4 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 py-3 rounded-lg font-bold flex items-center justify-center gap-2"
                        >
                            <Navigation size={18} />
                            📍 Use My Current Location
                        </button>

                        <div className="h-48 rounded-xl overflow-hidden border border-white/20 mb-4">
                            <MapContainer
                                center={mapCenter}
                                zoom={16}
                                style={{ height: '100%', width: '100%' }}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <LocationMarker position={classroomLocation} setPosition={setClassroomLocation} />
                            </MapContainer>
                        </div>

                        {classroomLocation && (
                            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-sm">
                                <div className="flex items-center gap-2 text-green-400 font-medium mb-1">
                                    <CheckCircle size={16} /> Location Set!
                                </div>
                                <p className="text-gray-400 font-mono text-xs">
                                    {classroomLocation.lat.toFixed(6)}, {classroomLocation.lng.toFixed(6)}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* QR Generator */}
                    <div className="lg:col-span-1 bg-white/5 p-6 rounded-2xl border border-white/10">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Clock className="text-blue-400" />
                            Generate QR Code
                        </h2>

                        <input
                            type="text"
                            placeholder="Enter Class ID (e.g. CS101)"
                            className="w-full bg-black/30 border border-white/20 rounded-lg p-3 mb-4 text-white focus:outline-none focus:border-blue-500"
                            value={classId}
                            onChange={(e) => setClassId(e.target.value)}
                        />

                        <button
                            onClick={handleGenerate}
                            disabled={!classroomLocation}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-3 rounded-lg font-bold mb-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {!classroomLocation ? '📍 Set Location First' : '🎯 Generate QR Code'}
                        </button>

                        {showQR && (
                            <div className="text-center space-y-4">
                                {/* Expiry Timer */}
                                <div className={`flex items-center justify-center gap-2 p-3 rounded-lg ${isExpired
                                    ? 'bg-red-500/20 border border-red-500/50'
                                    : timeRemaining < 60
                                        ? 'bg-yellow-500/20 border border-yellow-500/50'
                                        : 'bg-green-500/20 border border-green-500/50'
                                    }`}>
                                    {isExpired ? (
                                        <>
                                            <AlertTriangle className="text-red-400" size={20} />
                                            <span className="text-red-400 font-bold">QR EXPIRED</span>
                                        </>
                                    ) : (
                                        <>
                                            <Clock className={timeRemaining < 60 ? 'text-yellow-400' : 'text-green-400'} size={20} />
                                            <span className={`font-mono text-xl font-bold ${timeRemaining < 60 ? 'text-yellow-400' : 'text-green-400'}`}>
                                                {formatTime(timeRemaining)}
                                            </span>
                                        </>
                                    )}
                                </div>

                                {/* QR Code */}
                                <div className={`bg-white p-4 rounded-xl inline-block ${isExpired ? 'opacity-30' : ''}`}>
                                    <QRCodeCanvas value={qrData} size={180} level="H" />
                                </div>

                                {isExpired ? (
                                    <button
                                        onClick={handleRegenerate}
                                        className="w-full bg-gradient-to-r from-orange-600 to-red-600 py-3 rounded-lg font-bold"
                                    >
                                        🔄 Regenerate QR
                                    </button>
                                ) : (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={copyToClipboard}
                                            className="flex-1 bg-white/10 hover:bg-white/20 py-2 rounded-lg text-sm flex items-center justify-center gap-2"
                                        >
                                            <Copy size={16} />
                                            {copied ? 'Copied!' : 'Copy'}
                                        </button>
                                        <a
                                            href={scanUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex-1 bg-purple-600 hover:bg-purple-700 py-2 rounded-lg text-sm flex items-center justify-center gap-2"
                                        >
                                            <ExternalLink size={16} />
                                            Open
                                        </a>
                                    </div>
                                )}

                                <div className="text-xs text-gray-500">
                                    📍 Location: {classroomLocation?.lat.toFixed(4)}, {classroomLocation?.lng.toFixed(4)}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Attendance List */}
                    <div className="lg:col-span-1 bg-white/5 p-6 rounded-2xl border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Users className="text-blue-400" />
                                Live Attendance
                            </h2>
                            {showQR && (
                                <span className="bg-green-500/20 text-green-400 text-sm px-3 py-1 rounded-full animate-pulse">
                                    {attendanceList.length} Present
                                </span>
                            )}
                        </div>

                        <div className="space-y-3 max-h-[400px] overflow-y-auto">
                            {!showQR ? (
                                <div className="text-center py-12">
                                    <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                    <p className="text-gray-400 text-sm">Generate QR to start</p>
                                </div>
                            ) : attendanceList.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="animate-pulse">
                                        <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                    </div>
                                    <p className="text-gray-400 text-sm">Waiting for students...</p>
                                </div>
                            ) : (
                                attendanceList.map((record, idx) => (
                                    <div key={record.id} className="bg-black/30 p-3 rounded-lg border border-white/10 hover:border-green-500/30 transition-all">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-sm font-bold">
                                                    {idx + 1}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white text-sm">
                                                        {record.student_name || 'Anonymous'}
                                                    </p>
                                                    <p className="font-mono text-xs text-gray-500">
                                                        {record.wallet_address?.substring(0, 6)}...
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {record.distance && (
                                                    <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded">
                                                        {record.distance}m
                                                    </span>
                                                )}
                                                <CheckCircle className="text-green-400" size={16} />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Features Banner */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-r from-blue-900/50 to-blue-800/30 border border-blue-500/20 rounded-xl p-4 flex items-center gap-4">
                        <div className="p-3 bg-blue-500/20 rounded-lg">
                            <MapPin className="text-blue-400" size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">Geo-Verified</h3>
                            <p className="text-sm text-gray-400">100m radius check</p>
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-900/50 to-purple-800/30 border border-purple-500/20 rounded-xl p-4 flex items-center gap-4">
                        <div className="p-3 bg-purple-500/20 rounded-lg">
                            <Clock className="text-purple-400" size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">Time-Limited</h3>
                            <p className="text-sm text-gray-400">5 min QR expiry</p>
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-green-900/50 to-green-800/30 border border-green-500/20 rounded-xl p-4 flex items-center gap-4">
                        <div className="p-3 bg-green-500/20 rounded-lg">
                            <CheckCircle className="text-green-400" size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">Blockchain Proof</h3>
                            <p className="text-sm text-gray-400">Immutable records</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Attendance;
