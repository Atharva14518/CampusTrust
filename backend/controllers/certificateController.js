const db = require('../db');
const axios = require('axios');
const FormData = require('form-data');
const algosdk = require('algosdk');
const fs = require('fs');
const path = require('path');

// Algorand Client
const algodClient = new algosdk.Algodv2('', process.env.ALGO_ALGOD_SERVER || 'https://testnet-api.4160.nodely.dev', '');

// IPFS Pinata Configuration (check both naming conventions)
const PINATA_API_KEY = process.env.PINATA_API_KEY || process.env.IPFS_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY || process.env.IPFS_SECRET_KEY;

// Log if Pinata is configured
if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
    console.warn('⚠️ Pinata API keys not configured! Certificate minting will fail.');
} else {
    console.log('✓ Pinata IPFS configured');
}

exports.mintCertificate = async (req, res) => {
    try {
        const { title, course, date, description, studentAddress } = req.body;
        const file = req.file;

        if (!file || !studentAddress) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        // 1. Upload Image to IPFS
        const imageFormData = new FormData();
        imageFormData.append('file', fs.createReadStream(file.path));

        const imageUpload = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', imageFormData, {
            headers: {
                ...imageFormData.getHeaders(),
                'pinata_api_key': PINATA_API_KEY,
                'pinata_secret_api_key': PINATA_SECRET_KEY
            }
        });

        const imageIPFS = imageUpload.data.IpfsHash;

        // 2. Create Metadata JSON
        const metadata = {
            name: title,
            description: description || `Certificate for ${course}`,
            image: `ipfs://${imageIPFS}`,
            properties: {
                course: course,
                date: date,
                issuer: 'TrustCampus',
                recipient: studentAddress,
                timestamp: new Date().toISOString()
            }
        };

        // 3. Upload Metadata to IPFS
        const metadataUpload = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', metadata, {
            headers: {
                'pinata_api_key': PINATA_API_KEY,
                'pinata_secret_api_key': PINATA_SECRET_KEY
            }
        });

        const metadataCID = metadataUpload.data.IpfsHash;

        // 4. Create Algorand ASA (NFT) Transaction
        const params = await algodClient.getTransactionParams().do();

        const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
            from: studentAddress,
            total: 1,
            decimals: 0,
            assetName: title.substring(0, 32),
            unitName: 'CERT',
            assetURL: `ipfs://${metadataCID}`,
            assetMetadataHash: new Uint8Array(Buffer.from(metadataCID.substring(0, 32))),
            defaultFrozen: false,
            freeze: studentAddress,
            manager: studentAddress,
            clawback: undefined,
            reserve: undefined,
            suggestedParams: params
        });

        // 5. Return unsigned transaction for Lute to sign
        const txnBytes = algosdk.encodeUnsignedTransaction(txn);
        const txnB64 = Buffer.from(txnBytes).toString('base64');

        // 6. Store in database (pending confirmation)
        const [rows] = await db.execute(
            'INSERT INTO certificates (student_address, title, course, metadata_cid, image_cid, status) VALUES (?, ?, ?, ?, ?, ?)',
            [studentAddress, title, course, metadataCID, imageIPFS, 'PENDING']
        );

        // Clean up uploaded file
        fs.unlinkSync(file.path);

        res.json({
            success: true,
            txn: txnB64,
            metadataCID,
            imageIPFS,
            certificateId: rows.insertId
        });

    } catch (error) {
        console.error('Mint error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.confirmCertificate = async (req, res) => {
    try {
        const { certificateId, assetId, txId } = req.body;

        console.log('Confirming certificate:', { certificateId, assetId, txId });

        await db.execute(
            'UPDATE certificates SET asset_id = ?, tx_id = ?, status = ? WHERE id = ?',
            [assetId, txId, 'CONFIRMED', certificateId]
        );

        console.log('✓ Certificate confirmed:', certificateId);
        res.json({ success: true });
    } catch (error) {
        console.error('Confirm error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getMyCertificates = async (req, res) => {
    try {
        const { address } = req.query;

        if (!address) {
            return res.status(400).json({ error: 'Address required' });
        }

        // Get from database
        const [rows] = await db.execute(
            'SELECT * FROM certificates WHERE student_address = ? ORDER BY created_at DESC',
            [address]
        );

        res.json({ success: true, certificates: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getAllCertificates = async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT * FROM certificates WHERE status = ? ORDER BY created_at DESC LIMIT 50',
            ['CONFIRMED']
        );

        res.json({ success: true, certificates: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
