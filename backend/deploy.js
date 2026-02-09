const fs = require('fs');
const path = require('path');
const algosdk = require('algosdk');
const dotenv = require('dotenv');

dotenv.config();

// Connect to Algorand Testnet (or Sandbox)
const token = {
    'X-API-Key': process.env.ALGOD_TOKEN || ''
}
const server = process.env.ALGOD_SERVER || 'https://testnet-api.algonode.cloud';
const port = process.env.ALGOD_PORT || '';

const client = new algosdk.Algodv2(token, server, port);

async function deployContract(name) {
    try {
        console.log(`Deploying ${name}...`);

        // Read TEAL files
        const approvalPath = path.join(__dirname, '..', 'contracts', `${name}_approval.teal`);
        const clearPath = path.join(__dirname, '..', 'contracts', `${name}_clear.teal`); // Assuming exists, or use minimal

        if (!fs.existsSync(approvalPath)) {
            console.error(`Approval program for ${name} not found at ${approvalPath}. compile first!`);
            return;
        }

        const approvalSource = fs.readFileSync(approvalPath, 'utf8');
        // Minimal clear program if not provided
        const clearSource = "#pragma version 6\nint 1\nreturn";

        // Compile
        const approvalCompile = await client.compile(approvalSource).do();
        const clearCompile = await client.compile(clearSource).do();

        if (!approvalCompile.result || !clearCompile.result) {
            throw new Error(`Compilation failed for ${name}`);
        }

        console.log(`${name} compiled. Hash: ${approvalCompile.hash}`);

        // Deploy (Create App) - Using a dummy account or user provided mnemonic
        // For this demo, we can't actually sign without a funded account.
        // We will just output the compiled approval program as base64 to be used in frontend.

        // Save artifact
        fs.writeFileSync(path.join(__dirname, '..', 'frontend', 'src', `${name}_artifact.json`), JSON.stringify({
            approvalProgram: approvalCompile.result,
            clearProgram: clearCompile.result,
            localInts: 1,
            localBytes: 1,
            globalInts: 1,
            globalBytes: 1
        }, null, 2));

        console.log(`${name} artifact saved to frontend.`);

    } catch (error) {
        console.error(`Failed to deploy ${name}:`, error.message);
    }
}

(async () => {
    await deployContract('attendance');
    await deployContract('certificate');
    await deployContract('voting');
})();
