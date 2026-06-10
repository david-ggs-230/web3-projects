import { ethers, JsonRpcProvider } from "ethers";
import MARKETPLACE_SOL_JSON from "./abis/MyNFTMarketplace.json" with { type: "json" };

// ==============================
// Contract Configuration
// ==============================
// RPC URL (local or public RPC)
const RPC_URL = "http://localhost:8545";

// Deployed NFT Marketplace contract address
const MARKETPLACE_ADDRESS = "0xC7975277e79BD36eb18bD490d097a6857e130e48";

/**
 * Parse raw tuple data from contract into a readable object
 * @param {Array} item - Raw tuple array from smart contract
 * @returns {Object} Formatted MarketItem object
 */
function parseMarketItem(item: any) {
    return {
        marketItemId: item[0],
        nftContractAddress: item[1],
        tokenId: item[2],
        creator: item[3],
        seller: item[4],
        owner: item[5],
        price: item[6],
        listingfee: item[7],
        sold: item[8],
        canceled: item[9],
    };
}

/**
 * Call ALL read-only functions from the NFT Marketplace contract
 * These functions do NOT cost gas and do not send transactions
 */
async function runAllReadonlyFunctions() {
    try {
        // Initialize blockchain provider
        const provider = new JsonRpcProvider(RPC_URL);

        // Create contract instance for read operations
        const contract = new ethers.Contract(
            MARKETPLACE_ADDRESS,
            MARKETPLACE_SOL_JSON.abi,
            provider
        );

        console.log("\n===== Calling Marketplace View Functions =====\n");

        // 1. Get marketplace listing fee
        const listingFee = await contract.getListingFee!();
        console.log("1. Listing Fee:", ethers.formatEther(listingFee), "ETH");

        // 2. Get single market item by ID (get tokenId from the function returns )
        const myOwnedItems = await contract.fetchOwnedMarketItems!();
        if (myOwnedItems.length > 0) {
            const id = myOwnedItems[0].tokenId;
            const marketItem = await contract.getMarketItem!(id);
            console.log("\n2. Single Market Item:", parseMarketItem(marketItem));
        }else{
            console.log("\n2. Single Market Item:", undefined);
        }

        // 3. Get all listed NFT items
        const listedItems = await contract.fetchListedMarketItems!();
        console.log("\n3. Total Listed Items:", listedItems.length);

        // 4. Get items purchased by the current user
        const myPurchased = await contract.fetchOwnPurchasedMarketItems!();
        console.log("\n4. My Purchased Items:", myPurchased.length);

        // 5. Get items currently being sold by the user
        const mySelling = await contract.fetchOwnSellingMarketItems!();
        console.log("\n5. My Selling Items:", mySelling.length);

        // 6. Get all items owned by the user
        const myOwned = await contract.fetchOwnedMarketItems!();
        console.log("\n6. My Owned Items:", myOwned.length);

        // 7. Get latest market item by NFT contract + token ID
        const TEST_NFT_CONTRACT = "0x2bF539810D92f0DF04594fA73e9ce28c152Ac4b0";
        const TEST_TOKEN_ID = 1;
        const [latestItem, exists] = await contract.getLatestMarketItemByTokenId!(
            TEST_NFT_CONTRACT,
            TEST_TOKEN_ID
        );
        console.log("\n7. Item Exists:", exists);
        if (exists) console.log("Latest Item:", parseMarketItem(latestItem));

        // 8. Get latest market item ID from token ID
        const latestMarketId = await contract.tokenIdToLatestMarketItemId!(
            TEST_NFT_CONTRACT,
            TEST_TOKEN_ID
        );
        console.log("\n8. Latest Market Item ID:", latestMarketId.toString());

    } catch (err) {
        const error = err as Error;
        console.error("❌ Error calling view functions:", error.message, "\n");
    }
}

// Execute the read functions
runAllReadonlyFunctions();