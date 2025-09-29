const bip39 = require('bip39');
const HDWallet = require('ethereumjs-wallet').hdkey;
const Web3Import = require('web3');
const Web3 = Web3Import.default ? Web3Import.default : Web3Import;

// ⚠️ WARNING: DO NOT USE ANY GENERATED PHRASES OR KEYS FOR REAL CRYPTO. 
// THEY ARE GENERATED IN A PUBLIC ENVIRONMENT AND ARE COMPROMISED. 
// FOR FUN/EDUCATIONAL USE ONLY.

// --- Configuration ---
const BSC_RPC_URL = 'https://bsc-dataseed.binance.org/'; // Public BSC RPC Endpoint
const derivationPath = "m/44'/60'/0'/0/0";           // Standard Ethereum/BSC path
const web3 = new Web3(BSC_RPC_URL); 
const WORD_COUNT = 12;                               // BIP39 standard word count (12 or 24)
const WALLET_COUNT = 10;                             // Number of random wallets to generate and check

// --- New Function: Generates N random 12-word seed phrases ---
/**
 * Generates an array of cryptographically secure random 12-word BIP39 seed phrases.
 * @param {number} count - The number of seed phrases to generate.
 * @returns {string[]} An array of seed phrase strings.
 */
function generateRandomSeedPhrases(count) {
    const phrases = [];
    console.log(`\nStarting generation of ${count} random ${WORD_COUNT}-word seeds...`);
    for (let i = 0; i < count; i++) {
        // Generates a 12-word mnemonic (128 bits of entropy)
        const mnemonic = bip39.generateMnemonic(128); 
        phrases.push(mnemonic);
    }
    return phrases;
}

// --- Balance Check Logic (unchanged) ---
async function getBscBalance(address) {
    try {
        // Query the balance directly from the BSC node
        const balanceInWei = await web3.eth.getBalance(address); 
        
        // Convert balance from Wei (10^18) to BNB (ether unit in Web3 context)
        const balanceInBNB = web3.utils.fromWei(balanceInWei, 'ether'); 
        
        return `${Number(balanceInBNB).toFixed(6)} BNB`;

    } catch (error) {
        // Catches RPC or Web3 connection errors
        return `Web3 Error: ${error.message}`;
    }
}

// --- Main Execution ---
async function generateAndCheckBalances() {
    
    // 1. Generate the array of random seed phrases
    const seedPhrases = generateRandomSeedPhrases(WALLET_COUNT);

    console.log(`\nStarting balance check for ${WALLET_COUNT} newly generated wallets...`);
    console.log("-----------------------------------------------------------------------\n");

    for (let i = 0; i < seedPhrases.length; i++) {
        const seedPhrase = seedPhrases[i];
        let address = "N/A";
        let balance = "N/A";

        try {
            // 2. Generate Address from Seed
            const seed = await bip39.mnemonicToSeed(seedPhrase);
            const hdwallet = HDWallet.fromMasterSeed(seed);
            const wallet = hdwallet.derivePath(derivationPath).getWallet();
            address = wallet.getAddressString();

            // 3. Fetch Balance
            balance = await getBscBalance(address);

        } catch (error) {
            balance = `Generation Error: ${error.message}`;
        }
        
        console.log(`[#${(i + 1).toString().padStart(3, '0')}]`);
        console.log(`  Phrase:  ${seedPhrase}`);
        console.log(`  Address: ${address}`);
        console.log(`  Balance: ${balance}`);
        console.log('---');

        // Add a small delay to be kind to the public RPC node
        await new Promise(resolve => setTimeout(resolve, 100)); 
    }
    console.log('\nProcessing complete.');
}

generateAndCheckBalances();