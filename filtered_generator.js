const bip39 = require('bip39');
const HDWallet = require('ethereumjs-wallet').hdkey;
const Web3Import = require('web3');
const Web3 = Web3Import.default ? Web3Import.default : Web3Import;
const fs = require('fs');

// ⚠️ WARNING: DO NOT USE THESE PHRASES OR KEYS FOR REAL CRYPTO.
// They are generated in a public environment and are compromised.
// FOR FUN/EDUCATIONAL USE ONLY.

// --- Configuration ---
const BSC_RPC_URL = 'https://bsc-dataseed.binance.org/';
const derivationPath = "m/44'/60'/0'/0/0";
const web3 = new Web3(BSC_RPC_URL);
const INTERVAL_SECONDS = 10;
const OUTPUT_FILE = 'found_wallets.txt'; // Changed file name to reflect filtering

// --- Helper Functions ---

function generateRandomSeedPhrase() {
    return bip39.generateMnemonic(128);
}

function generateWalletDetails(seedPhrase) {
    const seed = bip39.mnemonicToSeedSync(seedPhrase);
    const hdwallet = HDWallet.fromMasterSeed(seed);
    const wallet = hdwallet.derivePath(derivationPath).getWallet();
    return { address: wallet.getAddressString() };
}

// Fetches balance and returns the balance in BNB as a number, and the raw string
async function getBscBalance(address) {
    try {
        const balanceInWei = await web3.eth.getBalance(address);
        const balanceInBNB = web3.utils.fromWei(balanceInWei, 'ether');
        const balanceNumeric = Number(balanceInBNB);
        
        return { 
            numeric: balanceNumeric, 
            display: `${balanceNumeric.toFixed(6)} BNB` 
        };
    } catch (error) {
        return { 
            numeric: 0, 
            display: `Web3 Error: ${error.message}` 
        };
    }
}

// Appends result to file (only called if balance > 0)
function saveToFile(details) {
    const now = new Date().toISOString();
    const logEntry = `[${now}] | SEED FOUND! | Seed: ${details.seedPhrase} | Address: ${details.address} | Balance: ${details.balance}\n`;
    
    fs.appendFileSync(OUTPUT_FILE, logEntry);
    console.log(`✅ [SUCCESS!] MATCH FOUND AND SAVED TO ${OUTPUT_FILE}`);
}

// --- Main Looping Logic (Modified) ---

async function processSingleWallet() {
    console.log(`\n--- Running New Cycle (${new Date().toLocaleTimeString()}) ---`);
    
    const seedPhrase = generateRandomSeedPhrase();
    let details = { seedPhrase, address: 'N/A', balance: 'N/A', balanceNumeric: 0 };

    try {
        // 1. Generate Address
        const walletDetails = generateWalletDetails(seedPhrase);
        details.address = walletDetails.address;
        
        // 2. Fetch Balance
        const balanceResult = await getBscBalance(details.address);
        details.balance = balanceResult.display;
        details.balanceNumeric = balanceResult.numeric; // Store numeric value for comparison

        console.log(`  Seed:    ${details.seedPhrase}`);
        console.log(`  Address: ${details.address}`);
        console.log(`  Balance: ${details.balance}`);

        // 3. Conditional Save Logic
        if (details.balanceNumeric > 0) {
            saveToFile(details);
        } else {
            console.log("  Status: Balance is zero. Not saving.");
        }

    } catch (error) {
        console.error(`  An unexpected error occurred: ${error.message}`);
        details.balance = `CRITICAL ERROR: ${error.message}`;
        // Optionally save the error case, but generally not needed for zero balance filter
    }
}

// Start the continuous execution
function startContinuousGeneration() {
    console.log(`\n*** Filtered Wallet Generator Started ***`);
    console.log(`Generating and checking one wallet every ${INTERVAL_SECONDS} seconds.`);
    console.log(`Only wallets with a balance > 0 BNB will be saved to ${OUTPUT_FILE}.`);

    processSingleWallet();
    setInterval(processSingleWallet, INTERVAL_SECONDS * 1000);
}

startContinuousGeneration();