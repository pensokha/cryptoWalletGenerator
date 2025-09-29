const bip39 = require('bip39');
const HDWallet = require('ethereumjs-wallet').hdkey;
const Web3Import = require('web3');
const Web3 = Web3Import.default ? Web3Import.default : Web3Import;
const fs = require('fs');

// ⚠️ WARNING: DO NOT USE THESE PHRASES OR KEYS FOR REAL CRYTO.
// They are generated in a public environment and are compromised.
// FOR FUN/EDUCATIONAL USE ONLY.

// --- Configuration ---
const BSC_RPC_URL = 'https://bsc-dataseed.binance.org/';
const derivationPath = "m/44'/60'/0'/0/0";
const web3 = new Web3(BSC_RPC_URL);

// --- Timer Settings ---
const BATCH_SIZE = 10;                 // <<< NEW: Number of wallets to check per interval
const INTERVAL_SECONDS = 5;
const OUTPUT_FILE = 'found_wallets.txt'; 

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
        // Log connection/RPC errors but return 0 balance to maintain loop flow
        console.error(`  [ERROR] Web3 Query Failed for ${address}: ${error.message}`);
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

// --- Main Looping Logic (Batch Processing) ---

async function processBatch() {
    console.log(`\n--- Running New Cycle (${new Date().toLocaleTimeString()}) ---`);
    console.log(`--- Checking BATCH of ${BATCH_SIZE} Wallets ---`);
    
    let walletsProcessed = 0;
    let foundWallets = 0;

    for (let i = 0; i < BATCH_SIZE; i++) {
        const seedPhrase = generateRandomSeedPhrase();
        let details = { seedPhrase, address: 'N/A', balance: 'N/A', balanceNumeric: 0 };

        try {
            // 1. Generate Address
            const walletDetails = generateWalletDetails(seedPhrase);
            details.address = walletDetails.address;
            
            // 2. Fetch Balance
            const balanceResult = await getBscBalance(details.address);
            details.balance = balanceResult.display;
            details.balanceNumeric = balanceResult.numeric;

            // 3. Conditional Save Logic
            if (details.balanceNumeric > 0) {
                saveToFile(details);
                foundWallets++;
            } else {
                // Log 0 balance to console without saving to file
                 console.log(`  [Checked] ${details.address}: 0 BNB`); 
            }


        } catch (error) {
            console.error(`  [CRITICAL ERROR] Failed to process wallet: ${error.message}`);
        }
        
        walletsProcessed++;
        
        // Add a micro-delay to prevent flooding the public RPC node within the batch
        // If 50 checks fail due to rate limiting, increase this delay.
        await new Promise(resolve => setTimeout(resolve, 50)); 
    }
    
    console.log(`--- Cycle Complete: ${walletsProcessed} wallets processed. ${foundWallets} wallets saved. ---`);
}

// Start the continuous execution
function startContinuousGeneration() {
    console.log(`\n*** Filtered Wallet Generator Started ***`);
    console.log(`Processing a batch of ${BATCH_SIZE} wallets every ${INTERVAL_SECONDS} seconds.`);
    console.log(`Only wallets with a balance > 0 BNB will be saved to ${OUTPUT_FILE}.`);

    // Run immediately and then repeat every INTERVAL_SECONDS
    processBatch();
    setInterval(processBatch, INTERVAL_SECONDS * 1000);
}

startContinuousGeneration();