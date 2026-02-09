// API Configuration
// Automatically detects if running on mobile/network and uses correct URL

const getApiUrl = () => {
    // In production, use environment variable or same origin (for single-service deploy)
    if (import.meta.env.PROD) {
        return import.meta.env.VITE_API_URL || '';
    }

    // In development, check if we're accessing from network
    const hostname = window.location.hostname;

    // If accessing via IP address (mobile), use that IP
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
        return `http://${hostname}:3000`;
    }

    // Default to localhost
    return 'http://localhost:3000';
};

export const API_URL = getApiUrl();

console.log('API URL configured as:', API_URL);
