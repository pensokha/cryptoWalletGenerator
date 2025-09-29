const bip39 = require('bip39');
const HDWallet = require('ethereumjs-wallet').hdkey;
const axios = require('axios'); // For API calls

// ⚠️ WARNING: DO NOT USE THESE PHRASES OR KEYS FOR REAL CRYPTO.
// THEY ARE PUBLIC AND COMPROMISED. FOR FUN/EDUCATIONAL USE ONLY.

// -----------------------------------------------------------
// 🚨 REQUIRED: REPLACE 'YOUR_BSCSCAN_API_KEY_HERE' WITH YOUR KEY
// -----------------------------------------------------------
const BSCSCAN_API_KEY = "87R3BFG11FBNJE9RSC47W6JHPGHY2VA5J7"; 

// ⚠️ WARNING: DO NOT USE THESE PHRASES OR KEYS FOR REAL CRYPTO.
// THEY ARE PUBLIC AND COMPROMISED. FOR FUN/EDUCATIONAL USE ONLY.

// Your 100-item array of 12-word seed phrases
const seedPhrases = [
  "whisper emerald jubilee vivid paradox albatross prowess utopia quake legacy opal vulture",
  "ferret oracle mirage vivid sylvan jolt tycoon flicker jungle rhapsody paradox isle",
  "horizon mellifluous emerald tundra citadel prowess unite grumble hush mural wisp sylvan",
  "quartz cobweb tempest crater iridescent bronze sylvan pirate citadel blossom pinnacle legacy",
  "juniper isle imprint vortex rhapsody mercury tycoon vivid limerick celestial kindred jungle",
  "canyon iridescent nomad xylophone indigo sapphire zenith crater gossamer unite petrichor vortex",
  "kindred petrichor crypt mercury owl velvet ephemeral isle juxtapose dingo quake tycoon",
  "solstice zinc onyx ziggurat galaxy phantom cascade citadel tycoon juxtapose canyon chrysalis",
  "grail nectar tycoon crypt confluence tundra kindred horizon ziggurat symphony isle vortex",
  "crypt urchin mellifluous fable nova ziggurat cascade nectar prowess dreamt doppelganger apricot",
  "echo tranquil eon galaxy quiver glimmer phantom flicker quartz mercury urchin pirate",
  "gossamer xylophone crescendo urchin magnet drizzle nomad juniper sapphire mercury sylvan eon",
  "awkward pirate pinnacle serene xylophone galaxy horizon sculpt wisp eon magnet dingo",
  "dingo labyrinth tycoon cascade quake velvet riddle mural wander emerald ferret prowess",
  "hush alchemy apricot eon velvet legacy tundra celestial zephyr opal mercury crater",
  "phantom tempest gnome horizon echo riddle kismet bramble cascade quiver crescendo tranquil",
  "galaxy karma vivid jubilee celestial mural awkward petrichor nectar apricot fluent lantern",
  "sylvan jester nectar xylophone glimmer zenith tranquil rhapsody haiku albatross alchemy limerick",
  "cobweb vivid ferret vortex mural isle labyrinth symphony quartz glimmer nomad jubilee",
  "ephemeral vivid karma prowess juxtapose symphony pirate fable emerald glimmer citadel oracle",
  "blossom urchin vulture pirate labyrinth sculpt crescendo vivid sapphire isle vortex dreamt",
  "tycoon drizzle crater canyon oracle unite mirage flannel pirate galaxy wisp vivid",
  "tempest labyrinth mural pirate albatross opal crypt grumble wander limerick fluent nova",
  "unite phantom wisp jubilee zenith mural imprint crescendo canyon chrysalis alchemy wander",
  "doppelganger lunar zephyr bramble crypt galaxy utopia ephemeral imprint mirage fluent quartz",
  "confluence fable ferret crater vortex yawn urchin lantern flicker canyon volcano eon",
  "gossamer nectar wisp emerald heirloom jester hush tempest jubilee petrichor albatross magnet",
  "jungle riddle owl labyrinth celestial horizon juniper sapphire haiku gossamer raven dingo",
  "iridescent sylvan pinnacle tycoon fable jubilee echo magnet pirate canyon chrysalis labyrinth",
  "sapphire gossamer jester labyrinth yacht crypt galaxy onyx ferret mural wisp owl",
  "zephyr whisper karma pinnacle grumble xylophone flicker haiku kismet crescendo pirate sculpt",
  "nectar tycoon legacy xylophone labyrinth vortex gnome ferret magnet tempest drizzle bramble",
  "cascade xylophone dingo galaxy magnet zenith quiver crypt sylvan owl yacht pirate",
  "canyon grail gnome confluence kiwi velvet ferret sculpt ephemeral apricot karma kismet",
  "limerick bramble raven indigo confluence tundra zinc paradox lantern ephemeral awkward bronze",
  "oracle solstice magnet opal urchin cobweb celestial emerald karma heirloom whisper jubilee",
  "shroud raven jolt pinnacle fable bramble prowess apricot ferret nova tempest isle",
  "juniper ziggurat blossom legacy flannel onyx yacht owl raven echo eon iridescent",
  "crescendo grail flicker lantern kiwi insomnia cobweb quartz sapphire drizzle chrysalis limerick",
  "magnet horizon petrichor doppelganger tempest velvet jolt vulture canyon utopia urchin serene",
  "cobweb dreamt vortex ziggurat wisp lunar serene eon whisper cascade heirloom haiku",
  "yawn doppelganger haiku juxtapose mellifluous wander cobweb imprint grumble utopia emerald paradox",
  "haiku azure solstice wander gnome pinnacle apricot blossom quiver dingo owl vulture",
  "lunar tempest yacht mirage quake azure tycoon ziggurat mercury gnome horizon paradox",
  "fable nova opal whisper kismet celestial jolt echo velvet zenith vortex riddle",
  "vortex magnet gnome zenith wander canyon symphony grail rhapsody yacht vivid quake",
  "celestial juniper mercury chrysalis petrichor limerick nectar vulture juxtapose apricot labyrinth urchin",
  "urchin utopia imprint heirloom mercury citadel pinnacle limerick dingo drizzle fluent oracle",
  "alchemy volcano iridescent juxtapose citadel urchin unite ferret emerald prowess opal raven",
  "kiwi ephemeral nova quiver hush wander dingo vortex shroud ziggurat celestial limerick",
  "horizon grail owl mural dingo tundra tranquil jolt wagon glimmer celestial alchemy",
  "haiku echo legacy horizon zenith bramble limerick crater mirage juxtapose ephemeral nomad",
  "kismet urchin blossom albatross dingo unite riddle solstice grumble yacht lantern owl",
  "urchin legacy serene alchemy glimmer eon onyx juxtapose mirage zenith fluent quake",
  "zenith tundra iridescent urchin magnet velvet confluence vortex tempest crypt emerald rhapsody",
  "eon alchemy tundra rhapsody utopia solstice juniper yawn fable flicker indigo crypt",
  "heirloom isle gossamer jolt yacht paradox confluence riddle zenith ziggurat glimmer zinc",
  "crater yawn mirage xylophone pinnacle wisp vivid fluent flannel onyx quake jungle",
  "confluence bronze canyon nova juniper zenith drizzle jester nectar quake wisp riddle",
  "ferret sylvan mirage azure nomad crater sapphire mercury yawn confluence awkward doppelganger",
  "ziggurat jubilee riddle hush kismet onyx awkward mercury xylophone prowess nova ferret",
  "mirage canyon albatross quartz quake ziggurat utopia juniper ferret tempest blossom yawn",
  "echo vivid legacy sylvan quartz bronze sapphire shroud juxtapose labyrinth cascade quiver",
  "karma kindred sapphire serene tycoon wagon hush petrichor tundra jester mellifluous yawn",
  "wander drizzle vulture onyx jubilee juxtapose confluence vivid mellifluous citadel zenith karma",
  "utopia dreamt crypt bronze vortex citadel phantom indigo labyrinth glimmer xylophone pirate",
  "labyrinth vulture onyx quake zenith juniper echo raven crater jolt azure dreamt",
  "serene eon quiver vivid hush doppelganger kiwi tundra quartz karma shroud ephemeral",
  "prowess quiver fluent pirate raven whisper jungle crescendo tranquil quake yawn sculpt",
  "limerick nectar crescendo volcano bramble tycoon opal gnome isle mirage quake insomnia",
  "gossamer imprint kismet lantern quiver sapphire sculpt zinc flannel tycoon shroud juxtapose",
  "volcano urchin shroud sculpt velvet nectar kindred blossom gossamer phantom lantern unite",
  "azure juniper phantom vortex lantern indigo paradox yawn chrysalis mellifluous velvet fluent",
  "juniper paradox tycoon quake grail indigo dingo yawn wisp glimmer labyrinth quartz",
  "labyrinth pinnacle dreamt tycoon canyon nectar quartz whisper cobweb mural magnet serene",
  "riddle horizon yacht nova sculpt pinnacle nectar apricot tranquil juxtapose vortex volcano",
  "chrysalis dreamt limerick haiku oracle ziggurat whisper velvet albatross quartz glimmer ferret",
  "tycoon eon vortex drizzle dreamt echo mural cascade hush indigo volcano alchemy",
  "gossamer unite solstice horizon rhapsody alchemy blossom nomad vivid celestial ziggurat wagon",
  "whisper karma jolt azure isle celestial cobweb limerick legacy hush flicker pinnacle",
  "symphony echo kiwi juniper horizon phantom bronze lunar petrichor dreamt doppelganger drizzle",
  "nova chrysalis owl ephemeral wisp blossom ferret quiver solstice jolt insomnia serene",
  "nectar sapphire kindred ephemeral grail horizon ziggurat oracle chrysalis insomnia albatross vortex",
  "lantern zephyr dreamt glimmer confluence riddle apricot labyrinth paradox blossom kindred lunar",
  "vulture drizzle vivid cobweb nova bramble chrysalis blossom celestial jungle wander confluence",
  "ephemeral grail citadel wander horizon nova insomnia nomad flicker fluent jolt tranquil",
  "gossamer echo tranquil pinnacle haiku azure blossom sapphire dingo nomad flicker glimmer",
  "wagon quake juxtapose mirage owl yawn dingo gossamer onyx kismet azure vivid",
  "zenith opal vortex hush apricot dreamt tempest wander xylophone tycoon eon celestial",
  "wisp lantern canyon wagon eon phantom nomad xylophone crescendo nectar tranquil cobweb",
  "serene symphony chrysalis whisper kindred phantom crypt blossom zephyr bramble gnome cobweb",
  "haiku yacht zephyr dingo tycoon crater onyx lantern glimmer cascade fable serene",
  "nomad symphony nova ferret kindred petrichor onyx vivid wagon zenith kismet zinc",
  "ferret crescendo crater echo yacht riddle galaxy ephemeral mercury cobweb juniper bronze",
  "celestial nectar lantern onyx dreamt doppelganger zephyr crypt sculpt jungle urchin yawn",
  "cascade indigo albatross nomad jubilee eon riddle nectar iridescent crater jester mirage",
  "unite albatross doppelganger vulture iridescent apricot mural yacht gnome pinnacle kismet jubilee",
  "owl nova albatross wander hush riddle tundra sapphire kiwi kindred tranquil flicker",
  "celestial eon mercury juxtapose chrysalis owl karma vivid shroud kindred glimmer imprint",
  "jester ferret utopia zenith lantern mirage tranquil crescendo nova lunar vulture eon"
];

// Standard Ethereum derivation path for the first account
const derivationPath = "m/44'/60'/0'/0/0";

// --- Core Logic ---

// --- Updated getBscBalance function ---

async function getBscBalance(address) {
    // This is the standard V1 structure, which should still work on BscScan.
    // If BscScan truly forced V2, the entire API structure would change.
    // We are simply re-confirming the correct V1 endpoint format.
    const apiUrl = `https://api.bscscan.com/api?chainid=56&module=account&action=balance&address=${address}&tag=latest&apikey=${BSCSCAN_API_KEY}`;
    
    try {
        const response = await axios.get(apiUrl);
        const data = response.data;
        
        if (data.status === '1') {
            // Balance is returned in Wei (10^18 Wei = 1 BNB)
            const balanceInWei = BigInt(data.result); 
            const balanceInBNB = Number(balanceInWei) / 1e18;
            return `${balanceInBNB.toFixed(6)} BNB`;
        } else {
            // Check for the specific V1 Deprecation error
            if (data.message && data.message.includes('deprecated V1 endpoint')) {
                return `API Error: Deprecated V1 Endpoint Used (Check BscScan Docs for V2)`;
            }
            return `API Error: ${data.result || data.message || 'Unknown error'}`;
        }
    } catch (error) {
        return `Request Error: ${error.message}`;
    }
}

async function generateAndCheckBalances() {
    if (BSCSCAN_API_KEY === "YOUR_BSCSCAN_API_KEY_HERE") {
        console.error("FATAL ERROR: Please replace 'YOUR_BSCSCAN_API_KEY_HERE' with a real BscScan API Key.");
        return;
    }
    
    console.log(`\nStarting check for ${seedPhrases.length} wallets. This may take a moment due to API call limits.`);
    console.log("---------------------------------------------------------------------------\n");

    for (let i = 0; i < seedPhrases.length; i++) {
        const seedPhrase = seedPhrases[i];
        let address = "N/A";
        let balance = "N/A";

        try {
            // 1. Generate Address
            const seed = await bip39.mnemonicToSeed(seedPhrase);
            const hdwallet = HDWallet.fromMasterSeed(seed);
            const wallet = hdwallet.derivePath(derivationPath).getWallet();
            address = wallet.getAddressString();

            // 2. Fetch Balance from BscScan
            balance = await getBscBalance(address);

        } catch (error) {
            balance = `Generation Error: ${error.message}`;
        }
        
        console.log(`[#${(i + 1).toString().padStart(3, '0')}]`);
        console.log(`  Phrase:  ${seedPhrase}`);
        console.log(`  Address: ${address}`);
        console.log(`  Balance: ${balance}`);
        console.log('---');

        // Note: BscScan has a rate limit. Adding a small delay helps prevent rate-limiting.
        await new Promise(resolve => setTimeout(resolve, 300)); 
    }
    console.log('\nProcessing complete.');
}

generateAndCheckBalances();