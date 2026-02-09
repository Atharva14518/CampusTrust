const fs = require('fs');
const path = require('path');
const algosdk = require('algosdk');
const dotenv = require('dotenv');

dotenv.config();

// Connect to Algorand Testnet
const token = process.env.ALGO_ALGOD_TOKEN || '';
const server = process.env.ALGO_ALGOD_SERVER || 'https://testnet-api.4160.nodely.dev';
const port = process.env.ALGO_ALGOD_PORT || '';

const client = new algosdk.Algodv2(token, server, port);

// Helper to recover account
function getAccount() {
    try {
        let mnemonic = process.env.LUTE_MNEMONIC;
        if (!mnemonic) throw new Error("LUTE_MNEMONIC not found in .env");
        // Remove quotes if present
        mnemonic = mnemonic.replace(/^["']|["']$/g, '').trim();
        return algosdk.mnemonicToSecretKey(mnemonic);
    } catch (e) {
        console.error("Error recovering account:", e.message);
        process.exit(1);
    }
}

async function deployContract(name, sender) {
    try {
        console.log(`Deploying ${name}...`);

        // Read TEAL files
        const approvalPath = path.join(__dirname, '..', 'contracts', `${name}_approval.teal`);

        if (!fs.existsSync(approvalPath)) {
            console.error(`Approval file for ${name} missing!`);
            return;
        }

        const approvalSource = fs.readFileSync(approvalPath, 'utf8');
        const clearSource = "#pragma version 6\nint 1\nreturn";

        // Compile programs
        const approvalCompile = await client.compile(approvalSource).do();
        const clearCompile = await client.compile(clearSource).do();

        console.log(`${name} compiled. Hash: ${approvalCompile.hash}`);

        // Get transaction params
        const params = await client.getTransactionParams().do();

        // Create application using Transaction class directly
        const approvalProgram = new Uint8Array(Buffer.from(approvalCompile.result, "base64"));
        const clearProgram = new Uint8Array(Buffer.from(clearCompile.result, "base64"));

        const txn = new algosdk.Transaction({
            from: sender.addr,
            fee: params.minFee || 1000,
            firstRound: params.firstRound,
            lastRound: params.lastRound,
            genesisID: params.genesisID,
            genesisHash: params.genesisHash,
            type: 'appl',
            appOnComplete: algosdk.OnApplicationComplete.NoOpOC,
            appApprovalProgram: approvalProgram,
            appClearProgram: clearProgram,
            appLocalInts: 1,
            appLocalByteSlices: 1,
            appGlobalInts: 1,
            appGlobalByteSlices: 1
        });

        // Sign transaction
        const signedTxn = txn.signTxn(sender.sk);

        // Submit transaction
        const { txId } = await client.sendRawTransaction(signedTxn).do();
        console.log(`Transaction sent: ${txId}`);

        // Wait for confirmation
        await algosdk.waitForConfirmation(client, txId, 4);
        const ptx = await client.pendingTransactionInformation(txId).do();
        const appId = ptx["application-index"];

        console.log(`✓ ${name} deployed with App ID: ${appId}`);

        // Save artifact
        const artifactPath = path.join(__dirname, '..', 'frontend', 'src', `${name}_artifact.json`);
        let artifact = {};
        if (fs.existsSync(artifactPath)) {
            artifact = JSON.parse(fs.readFileSync(artifactPath));
        }
        artifact.appId = appId;
        artifact.approvalProgram = approvalCompile.result;
        artifact.clearProgram = clearCompile.result;

        fs.writeFileSync(artifactPath, JSON.stringify(artifact, null, 2));

    } catch (error) {
        console.error(`Failed to deploy ${name}:`, error.message);
        if (error.response) {
            console.error('Response data:', error.response.body);
        }
    }
}

(async () => {
    const sender = getAccount();
    console.log(`Deploying with account: ${sender.addr}\n`);

    await deployContract('attendance', sender);
    await deployContract('certificate', sender);
    await deployContract('voting', sender);
    
    console.log('\nDeployment complete!');
})();
