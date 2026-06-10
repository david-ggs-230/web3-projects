import { NonceManager, ethers, Wallet, Contract, JsonRpcProvider } from "ethers";

// Public Ethereum RPC Endpoints and Free Ethereum Nodes
const rpc_url: string = "http://localhost:8545";

const NFT_CONTRACT_ADDRESS: string = "0x2bF539810D92f0DF04594fA73e9ce28c152Ac4b0";
const MARKETPLACE_CONTRACT_ADDRESS: string = "0xC7975277e79BD36eb18bD490d097a6857e130e48";

const human_readable_abi: readonly string[] = [
    "constructor(address _marketplaceAddress)",
    "error ERC721EnumerableForbiddenBatchMint()",
    "error ERC721IncorrectOwner(address sender, uint256 tokenId, address owner)",
    "error ERC721InsufficientApproval(address operator, uint256 tokenId)",
    "error ERC721InvalidApprover(address approver)",
    "error ERC721InvalidOperator(address operator)",
    "error ERC721InvalidOwner(address owner)",
    "error ERC721InvalidReceiver(address receiver)",
    "error ERC721InvalidSender(address sender)",
    "error ERC721NonexistentToken(uint256 tokenId)",
    "error ERC721OutOfBoundsIndex(address owner, uint256 index)",
    "error OwnableInvalidOwner(address owner)",
    "error OwnableUnauthorizedAccount(address account)",
    "event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)",
    "event ApprovalForAll(address indexed owner, address indexed operator, bool approved)",
    "event BatchMetadataUpdate(uint256 _fromTokenId, uint256 _toTokenId)",
    "event MarketplaceUpdated(address indexed oldMarketplace, address indexed newMarketplace)",
    "event MetadataUpdate(uint256 _tokenId)",
    "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)",
    "event TokenMinted(uint256 indexed tokenId, string tokenURI, address indexed marketplaceAddress)",
    "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
    "function approve(address to, uint256 tokenId)",
    "function balanceOf(address owner) view returns (uint256)",
    "function getApproved(uint256 tokenId) view returns (address)",
    "function getOldMarketplaces() view returns (address[])",
    "function getTokenCreatorById(uint256 tokenId) view returns (address)",
    "function getTokensCreated() view returns (uint256[])",
    "function getTokensOwned() view returns (uint256[])",
    "function isApprovedForAll(address owner, address operator) view returns (bool)",
    "function isValidTokenId(uint256 tokenId) view returns (bool)",
    "function name() view returns (string)",
    "function owner() view returns (address)",
    "function ownerOf(uint256 tokenId) view returns (address)",
    "function renounceOwnership()",
    "function safeMint(string uri) returns (uint256)",
    "function safeTransferFrom(address from, address to, uint256 tokenId)",
    "function safeTransferFrom(address from, address to, uint256 tokenId, bytes data)",
    "function setApprovalForAll(address operator, bool approved)",
    "function setMarketplaceAddress(address _marketplaceAddress)",
    "function supportsInterface(bytes4 interfaceId) view returns (bool)",
    "function symbol() view returns (string)",
    "function syncMarketplaceApproval()",
    "function tokenByIndex(uint256 index) view returns (uint256)",
    "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
    "function tokenURI(uint256 tokenId) view returns (string)",
    "function totalSupply() view returns (uint256)",
    "function transferFrom(address from, address to, uint256 tokenId)",
    "function transferOwnership(address newOwner)",
    "function updateTokenURI(uint256 tokenId, string newURI)"
];

// --------------------------
// Test Wallets (from Hardhat node)
// --------------------------
// Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
const PRIVATE_KEY_1: string = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // account #0

// Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000 ETH)
const PRIVATE_KEY_2: string = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"; // account #1

// Account #11: 0x71bE63f3384f5fb98995898A86B02Fb2426c5788 (10000 ETH)
const MyNFT_OWNER_KEY: string = "0x701b615bbdfb9de65240bc28bd21bbc0d996645a3dd57e7b12bc2bdf6f192c82"; // account #11

// --------------------------
// Initialize Provider & Signers
// --------------------------
const provider: JsonRpcProvider = new ethers.JsonRpcProvider(rpc_url, undefined, { staticNetwork: true });
const wallet1: Wallet = new ethers.Wallet(PRIVATE_KEY_1, provider);
const signer1: NonceManager = new NonceManager(wallet1);
const wallet2: Wallet = new ethers.Wallet(PRIVATE_KEY_2, provider);
const signer2: NonceManager = new NonceManager(wallet2);
const mynft_owner_wallet: Wallet = new ethers.Wallet(MyNFT_OWNER_KEY, provider);
const mynft_owner_signer: NonceManager = new NonceManager(mynft_owner_wallet);

// Contract with signer (for write functions)
const nftContract: Contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, human_readable_abi, signer1);
// contract with provider (for read functions)
const nftContract2: Contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, human_readable_abi, provider);

// --------------------------
// Test 1: Mint a new NFT
// --------------------------
async function testSafeMint(): Promise<void> {
    console.log("=== [1] Testing safeMint ===");
    try {
        // contract with signer can call write functions
        console.log("Minting a new NFT with wallet1 (using contract with signer)...");
        const tokenURI: string = "https://my-nft-metadata.com/1.json";
        const tx = await nftContract.safeMint!(tokenURI);
        const receipt = await tx.wait();
        
        if (!receipt) {
            throw new Error("Transaction receipt is undefined");
        }
        
        console.log("✅ Mint successful. Tx hash:", receipt.hash);

        const totalSupply = await nftContract.totalSupply!();
        console.log("Current total supply:", totalSupply.toString(), "\n");
        
        // contract with provider can connect to a signer to call write functions
        console.log("Minting a new NFT with wallet2 (using contract with provider)...");
        const tx2 = await (nftContract2.connect(wallet2) as any).safeMint("https://my-nft-metadata.com/2.json");
        const receipt2 = await tx2.wait();
        
        if (!receipt2) {
            throw new Error("Transaction receipt is undefined");
        }
        
        console.log("✅ Mint successful. Tx hash:", receipt2.hash);
        const totalSupply2 = await nftContract2.totalSupply!();
        console.log("Current total supply:", totalSupply2.toString(), "\n");
    } catch (err) {
        const error = err as Error;
        console.error("❌ Mint failed:", error.message, "\n");
    }
}

// --------------------------
// Test 2: Update NFT Token URI
// --------------------------
async function testUpdateTokenURI(_unused?: number): Promise<void> {
    console.log("=== [2] Testing updateTokenURI ===");
    try {
        const newURI: string = "https://updated-metadata.com/1.json";
        const ownedTokens: bigint[] = await nftContract.getTokensOwned!() as bigint[];
        
        if (ownedTokens.length === 0) {
            console.error("❌ No tokens owned by wallet1 to update URI", "\n");
            return;
        }
        
        //const id: bigint = ownedTokens[0] as bigint;
        let id=0n;
        for(let i=0; i<ownedTokens.length; i++) {
            const tid = ownedTokens[i];
            const creator =await nftContract.getTokenCreatorById!(tid);
            if(creator.toLowerCase() === wallet1.address.toLowerCase()) {
                id = tid as bigint;
                break;
            }
        }
        if(id===0n){
            console.error("❌ No tokens owned by wallet1 that were created by wallet1 to update URI", "\n");
            return;
        }
 
        const tx = await nftContract.updateTokenURI!(id, newURI);
        await tx.wait();
        console.log("✅ Token URI updated for id:", id.toString());

        const updatedURI: string = await nftContract.tokenURI!(id) as string;
        console.log("New URI:", updatedURI, `for token id:`, id.toString(), "\n");
    } catch (err) {
        const error = err as Error;
        console.error("❌ Update failed:", error.message, "\n");
    }
}

// --------------------------
// Test 3: Set Marketplace Address (Owner Only)
// --------------------------
async function testSetMarketplaceAddress(): Promise<void> {
    console.log("=== [3] Testing setMarketplaceAddress ===");
    try {
        const newMarketplace: string = ethers.Wallet.createRandom().address;
        const tx = await (nftContract.connect(mynft_owner_signer) as any).setMarketplaceAddress(newMarketplace);
        await tx.wait();
        console.log("✅ Marketplace address updated", "\n");
    } catch (err) {
        const error = err as Error;
        console.error("❌ Set marketplace failed:", error.message, "\n");
    }
}

// --------------------------
// Test 4: Approve an address to transfer one NFT
// --------------------------
async function testApprove(): Promise<void> {
    console.log("=== [4] Testing approve ===");
    try {
        const ownedTokens: bigint[] = await nftContract.getTokensOwned!() as bigint[];
        
        if (ownedTokens.length === 0) {
            console.error("❌ No tokens owned by wallet1 to approve an address to transfer", "\n");
            return;
        }
        
        const id: bigint = ownedTokens[0] as bigint;
        const tx = await nftContract.approve!(wallet2.address, id);
        await tx.wait();
        console.log("✅ Approved", wallet2.address, "for Token", id);

        const approvedAddress: string = await nftContract.getApproved!(id) as string;
        console.log("Confirmed approved:", approvedAddress, "\n");
    } catch (err) {
        const error = err as Error;
        console.error("❌ Approve failed:", error.message, "\n");
    }
}

// --------------------------
// Test 5: Set Approval For All (operator)
// --------------------------
async function testSetApprovalForAll(): Promise<void> {
    console.log("=== [5] Testing setApprovalForAll ===");
    try {
        const tx = await nftContract.setApprovalForAll!(wallet2.address, true);
        await tx.wait();
        console.log("✅ ApprovalForAll granted to", wallet2.address, "\n");
    } catch (err) {
        const error = err as Error;
        console.error("❌ ApprovalForAll failed:", error.message, "\n");
    }
}

// --------------------------
// Test 6: Transfer NFT (transferFrom)
// --------------------------
async function testTransferFrom(): Promise<void> {
    console.log("=== [6] Testing transferFrom ===");
    try {
        const ownedTokens: bigint[] = await nftContract.getTokensOwned!() as bigint[];
        
        if (ownedTokens.length === 0) {
            console.error("❌ No tokens owned by wallet1 to transfer", "\n");
            return;
        }
        
        const id: bigint = ownedTokens[0] as bigint;
        const tx = await nftContract.transferFrom!(wallet1.address, wallet2.address, id);
        await tx.wait();
        console.log("✅ Transferred NFT", id, "to", wallet2.address, "\n");
    } catch (err) {
        const error = err as Error;
        console.error("❌ Transfer failed:", error.message, "\n");
    }
}

// --------------------------
// Test 7: Safe Transfer NFT
// --------------------------
async function testSafeTransferFrom(): Promise<void> {
    console.log("=== [7] Testing safeTransferFrom ===");
    try {
        const ownedTokens: bigint[] = await (nftContract.connect(signer2) as any).getTokensOwned() as bigint[];
        
        if (ownedTokens.length === 0) {
            console.error("❌ No tokens owned by wallet2 to transfer", "\n");
            return;
        }
        
        const id: bigint = ownedTokens[0] as bigint;
        console.log("Attempting safe transfer of token", id, "from wallet2 back to wallet1...");
        const tx = await (nftContract.connect(signer2) as any).safeTransferFrom(wallet2.address, wallet1.address, id);
        await tx.wait();
        console.log("✅ Safe transfer successful. NFT returned to owner.", "\n");
    } catch (err) {
        const error = err as Error;
        console.error("❌ Safe transfer failed:", error.message, "\n");
    }
}

// --------------------------
// Test 8: Sync Marketplace Approval
// --------------------------
async function testSyncMarketplaceApproval(): Promise<void> {
    console.log("=== [8] Testing syncMarketplaceApproval ===");
    try {
        const tx = await nftContract.syncMarketplaceApproval!();
        await tx.wait();
        console.log("✅ Marketplace approval synced", "\n");
    } catch (err) {
        const error = err as Error;
        console.error("❌ Sync failed:", error.message, "\n");
    }
}

// --------------------------
// Test 9: Reset Marketplace Address (Owner Only)
// --------------------------
async function testResetMarketplaceAddress(): Promise<void> {
    console.log("=== [9] Testing resetMarketplaceAddress ===");
    try {
        const newMarketplace: string = MARKETPLACE_CONTRACT_ADDRESS;
        const tx = await (nftContract2.connect(mynft_owner_signer) as any).setMarketplaceAddress(newMarketplace);
        await tx.wait();
        console.log("✅ Marketplace address reset to ", MARKETPLACE_CONTRACT_ADDRESS, "\n");
    } catch (err) {
        const error = err as Error;
        console.error("❌ Reset marketplace failed:", error.message, "\n");
    }
}

const main = async (): Promise<void> => {
    let start: number = Date.now();
    try {
        console.log("\nStarting write function tests...\n");

        await testSafeMint();
        await testUpdateTokenURI(1);
        await testSetMarketplaceAddress();
        await testApprove();
        await testSetApprovalForAll();
        await testTransferFrom();
        await testSafeTransferFrom();
        await testSyncMarketplaceApproval();
        await testResetMarketplaceAddress();
        
        console.log("=== All write function tests finished ===");
    } catch (error) {
        const err = error as Error;
        console.error("An error occurred:", err.message);
    }
    
    let end: number = Date.now();
    console.log(`Execution Time: ${end - start} ms\n`);
};

(async (): Promise<void> => {
    await main();
})();