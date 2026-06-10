import { ethers, JsonRpcProvider, Wallet, ZeroAddress, BaseContract } from "ethers";

// Public Ethereum RPC Endpoints and Free Ethereum Nodes
const rpc_urls: string[] = [
    // Local hardhat node
    "http://localhost:8545"
];

const readMyNFTContract = async (rpc_url: string): Promise<void> => {
    let start = Date.now();
    try {
        // MyNFT contract on local hardhat node
        const mynftContractAddress = "0x2bF539810D92f0DF04594fA73e9ce28c152Ac4b0";

        // Account #11 private key (for owner-only functions)
        const mynft_owner_privkey = "0x701b615bbdfb9de65240bc28bd21bbc0d996645a3dd57e7b12bc2bdf6f192c82";

        // MyNFT contract - human readable ABI (All view functions from the contract ABI)
        const human_readable_abi: string[] = [
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
            "function supportsInterface(bytes4 interfaceId) view returns (bool)",
            "function symbol() view returns (string)",
            "function tokenByIndex(uint256 index) view returns (uint256)",
            "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
            "function tokenURI(uint256 tokenId) view returns (string)",
            "function totalSupply() view returns (uint256)"
        ];

        console.log(`Getting information from RPC URL: ${rpc_url}`);

        // Create provider with timeout configuration
        const provider: JsonRpcProvider = new ethers.JsonRpcProvider(rpc_url);

        // Get current block number
        const blockNumber: number = await provider.getBlockNumber();
        console.log("Current block number:", blockNumber);

        // Create contract instance
        const nftContract = new ethers.Contract(
            mynftContractAddress,
            human_readable_abi,
            provider
        );

        // Test constants
        const testAddress: string = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
        const testTokenId: number = 1;

        console.log("\n********************************************************************************");

        // --------------------------
        // Basic contract information
        // --------------------------
        console.log("【1】Basic Information");
        const name: string = await nftContract.name!();
        console.log("Token Name:", name);

        const symbol: string = await nftContract.symbol!();
        console.log("Token symbol:", symbol);

        const totalSupply: bigint = await nftContract.totalSupply!();
        console.log("Total supply:", totalSupply.toString(), symbol);
        console.log("");

        // --------------------------
        // Contract ownership
        // --------------------------
        console.log("【2】Contract Ownership");
        const contractOwner: string = await nftContract.owner!();
        console.log("Contract Owner:", contractOwner);
        console.log("");

        // --------------------------
        // NFT balance of target address
        // --------------------------
        console.log("【3】NFT Balance");
        const balance: bigint = await nftContract.balanceOf!(testAddress);
        console.log(`Address ${testAddress} owns ${balance.toString()} ${symbol}(s)`);
        console.log("");

        // --------------------------
        // All token IDs owned by the address
        // --------------------------
        console.log("【4】Owned Token IDs");
        const ownedTokens: bigint[] = await nftContract.getTokensOwned!();
        console.log("Token IDs:", ownedTokens.map((id) => id.toString()));
        console.log("");

        // --------------------------
        // All token IDs created by the address
        // --------------------------
        console.log("【5】Created Token IDs");
        const createdTokens: bigint[] = await nftContract.getTokensCreated!();
        console.log("Created Token IDs:", createdTokens.map((id) => id.toString()));
        console.log("");

        // --------------------------
        // Historical marketplace addresses (owner only)
        // --------------------------
        console.log("【6】Historical Marketplace Addresses");
        const mynft_owner_wallet: Wallet = new ethers.Wallet(mynft_owner_privkey, provider);

        const oldMarkets: string[] = await (nftContract.connect(mynft_owner_wallet) as unknown as { getOldMarketplaces: () => Promise<string[]> }).getOldMarketplaces();
        console.log("Old Marketplaces:", oldMarkets);
        console.log("");

        // --------------------------
        // Token ID validity check
        // --------------------------
        console.log("【7】Token ID Validation");
        const isValid: boolean = await nftContract.isValidTokenId!(testTokenId);
        console.log(`Token ID ${testTokenId} is valid:`, isValid);
        console.log("");

        // --------------------------
        // Detailed info of single NFT
        // --------------------------
        if (isValid) {
            console.log("【8】Single Token Details");
            const tokenOwner: string = await nftContract.ownerOf!(testTokenId);
            console.log(`Owner of Token ${testTokenId}:`, tokenOwner);

            const tokenUri: string = await nftContract.tokenURI!(testTokenId);
            console.log(`URI of Token ${testTokenId}:`, tokenUri);

            const creator: string = await nftContract.getTokenCreatorById!(testTokenId);
            console.log(`Creator of Token ${testTokenId}:`, creator);

            const approvedAddress: string = await nftContract.getApproved!(testTokenId);
            console.log(`Approved address for Token ${testTokenId}:`, approvedAddress);
            console.log("");
        }

        // --------------------------
        // Enumeration queries
        // --------------------------
        console.log("【9】Enumeration Queries");
        if (totalSupply > 0n) {
            const tokenByIndex: bigint = await nftContract.tokenByIndex!(0);
            console.log("Token ID at index 0:", tokenByIndex.toString());
        }

        if (balance > 0n) {
            const ownerTokenByIndex: bigint = await nftContract.tokenOfOwnerByIndex!(testAddress, 0);
            console.log(`Token ID at index 0 for target address:`, ownerTokenByIndex.toString());
        }
        console.log("");

        // --------------------------
        // Approval status check
        // --------------------------
        console.log("【10】Approval Check");
        const isApprovedForAll: boolean = await nftContract.isApprovedForAll!(testAddress, ZeroAddress);
        console.log(`Approved for all to zero address:`, isApprovedForAll);
        console.log("");

        // --------------------------
        // Interface support detection
        // --------------------------
        console.log("【11】Interface Support Check");
        const erc721InterfaceId: string = "0x80ac58cd"; // Standard ERC721 interface ID
        const supportERC721: boolean = await nftContract.supportsInterface!(erc721InterfaceId);
        console.log("Supports ERC721 standard:", supportERC721);

        console.log("\nAll view functions executed successfully!");

    } catch (error) {
        // Type-safe error handling
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        console.error("An error occurred:", errorMessage);
    } finally {
        const end = Date.now();
        console.log(`Execution Time: ${end - start} ms\n`);
    }
};

const main = async (): Promise<void> => {
    // Read MyNFT contract on local hardhat node
    await readMyNFTContract(rpc_urls[0] as string);
};

// Execute main function and handle top-level errors
main().catch((error) => {
    console.error("Fatal error in main function:", error instanceof Error ? error.message : error);
    process.exit(1);
});