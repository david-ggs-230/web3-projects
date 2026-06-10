import { NonceManager, ethers, TransactionResponse, TransactionReceipt } from "ethers";
import MARKETPLACE_SOL_JSON from "./abis/MyNFTMarketplace.json" with { type: "json" };
import MYNFT_SOL_JSON from "./abis/MyNFT.json" with { type: "json" };

// --------------------------
// Configuration & Setup
// --------------------------
const TOKEN_URI = "ipfs://test-metadata-uri";

const LISTING_FEE = ethers.parseEther("0.0015");
const NFT_PRICE = ethers.parseEther("0.1");
// Replace with your contract address
const MARKETPLACE_ADDRESS = "0xfbfbfDdd6e35dA57b7B0F9a2C10E34Be70B3A4E9";
const NFT_CONTRACT_ADDRESS = "0x72bb9c7ffbE2Ed234e53bc64862DdA6d9fFF333b";

// Replace with your provider URL (e.g., Infura/Alchemy) and private key
const PROVIDER_URL = "http://localhost:8545";
// Account #10: 0xBcd4042DE499D14e55001CcbB24a551F3b954096 (10000 ETH)
//const marketplace_owner_privkey = "0xf214f2b2cd398c806f84e317254e0f0b801d0643303237d97a22a48e01628897";
//# Account #1
//Address: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
//PK: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
const signer_privkey = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";

// Initialize provider, signer, and contract instance
const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
const wallet = new ethers.Wallet(signer_privkey, provider);
const signer = new NonceManager(wallet);
const marketplaceContract = new ethers.Contract(
  MARKETPLACE_ADDRESS,
  MARKETPLACE_SOL_JSON.abi,
  signer
);
const myNftContract = new ethers.Contract(
  NFT_CONTRACT_ADDRESS,
  MYNFT_SOL_JSON.abi,
  provider
);

//# Account #15
//Address: 0xcd3B766CCDd6AE721141F452C550Ca635964ce71 (10000 ETH)
//PK: 0x8166f546bab6da521a8369cab06c5d2b9e46670292d85c875ee9ec20e84ffb61
const signer2_privkey = "0x8166f546bab6da521a8369cab06c5d2b9e46670292d85c875ee9ec20e84ffb61";
const wallet2 = new ethers.Wallet(signer2_privkey, provider);
const signer2 = new NonceManager(wallet2);

/**
 * 1. Mint a new NFT
 * @param nftContractAddress - Address of ERC721 contract
 * @param tokenURI - Metadata URI for the NFT
 * @returns {Promise<bigint | undefined>} - Minted token ID or undefined if failed
 */
const nftMint = async (
  nftContractAddress: string,
  tokenURI?: string
): Promise<bigint | undefined> => {
  try {
    const nftContract = new ethers.Contract(
      nftContractAddress,
      MYNFT_SOL_JSON.abi,
      signer
    );
    const tx = await nftContract.safeMint!(tokenURI ?? "https://my-nft-metadata.com/1.json");
    const receipt = await tx.wait();
    
    // Get first token ID from the emitted event
    const mintEvent = receipt.logs.find(
      (log: any) => log.fragment?.name === "TokenMinted"
    );

    if (!mintEvent || !mintEvent.args) {
      throw new Error("TokenMinted event not found or missing args");
    }

    // Get token ID from the correct event
    const tokenId = mintEvent.args.tokenId as bigint;
    console.log(" Mint successful. TokenId:", tokenId, ", Tx hash:", receipt.hash);
    return tokenId;
  } catch (err) {
    const error = err as Error;
    console.error("❌ Mint failed:", error.message);
    return undefined;
  }
};

/**
 * 2. Create NFT token and list market item (mint + list)
 * @param nftContractAddress - Address of ERC721 contract
 * @param tokenURI - Metadata URI for the NFT
 * @param price - Listing price (in wei)
 * @returns {Promise<bigint | undefined>} - Market item ID or undefined if failed
 */
const createMarketItem = async (
  nftContractAddress: string,
  tokenURI: string,
  price: bigint
): Promise<bigint | undefined> => {
  try {
    // Get current listing fee to include with the transaction
    const listingFee = await marketplaceContract.getListingFee!();
    console.log(`Listing fee: ${ethers.formatEther(listingFee)} ETH`);
    
    const tokenId = await nftMint(nftContractAddress, tokenURI);
    if (tokenId === undefined) {
      throw new Error("NFT minting failed");
    }

    const tx = await marketplaceContract.createMarketItem!(
      nftContractAddress,
      tokenId,
      price,
      { value: listingFee } // Send listing fee with the transaction
    );

    const receipt = await tx.wait();
    const event = receipt.logs.find((log: any) => log.fragment?.name === "MarketItemCreated");
    
    if (!event || !event.args) {
      throw new Error("MarketItemCreated event not found or missing args");
    }

    const marketItemId = event.args.marketItemId as bigint;
    console.log(`Created Market Item ID: ${marketItemId}`);
    return marketItemId;
  } catch (err) {
    const error = err as Error;
    console.error("❌ Create market item failed:", error.message);
    return undefined;
  }
};

/**
 * 3. Show listed market item by tokenId
 * @param nftContractAddress - Address of ERC721 contract
 * @param tokenURI - Metadata URI for the NFT
 * @param price - Listing price (in wei)
 * @returns {Promise<any | undefined>} - Market item data or undefined if failed
 */
const getMarketItemByTokenId = async (
  nftContractAddress: string,
  tokenURI: string,
  price: bigint
): Promise<any | undefined> => {
  try {
    // 1. List a market item first
    const listingFee = await marketplaceContract.getListingFee!();
    const tokenId = await nftMint(nftContractAddress, tokenURI);
    
    if (tokenId === undefined) {
      throw new Error("NFT minting failed");
    }

    const tx = await marketplaceContract.createMarketItem!(
      nftContractAddress,
      tokenId,
      price,
      { value: listingFee } // Send listing fee with the transaction
    );
    
    const receipt = await tx.wait();
    const event = receipt.logs.find((log :any)=> log.fragment?.name === "MarketItemCreated");
    
    if (!event || !event.args) {
      throw new Error("MarketItemCreated event not found or missing args");
    }

    const marketItemId = event.args.marketItemId as bigint;

    // 2. Get the listed market item by tokenId
    const [item, exists] = await marketplaceContract.getLatestMarketItemByTokenId!(
      nftContractAddress,
      tokenId
    );
    
    if (!exists) {
      console.error("❌ Market item listing failed for marketItemId: ", marketItemId, " and tokenId: ", tokenId);
      return undefined;
    }
    
    console.log(" Market item Id:", marketItemId, " item.marketItemId:", item.marketItemId, " and tokenId:", item.tokenId);
    return item;
  } catch (err) {
    const error = err as Error;
    console.error("❌ Get market item failed:", error.message);
    return undefined;
  }
};

/**
 * 4. Purchase an NFT (payable - send full price)
 * @returns {Promise<void | undefined>}
 */
const createMarketSale = async (): Promise<void | undefined> => {
  try {
    // 1. List market items for user: signer
    const items = await (marketplaceContract.connect(signer) as any).fetchListedMarketItems();
    if (items.length === 0) {
      console.error("❌ No listed market item.\n");
      return;
    }
    
    const marketItemId = items[0].marketItemId;
    const tokenId = items[0].tokenId as bigint;
    const currOwner = await myNftContract.ownerOf!(tokenId);
const price=items[0].price as bigint;
    console.log("Before purchase: Market item Id:", marketItemId, " tokenId:", tokenId, " Owner:", currOwner, " Seller:", wallet.address, " Buyer:", wallet2.address);
    
    // 2. buy an item
    await (marketplaceContract.connect(signer2) as any).createMarketSale(marketItemId, { value: price });
    const newOwner = await myNftContract.ownerOf!(tokenId);
    
    console.log("After purchase: Market item Id:", marketItemId, " tokenId:", tokenId, " Owner:", newOwner, " Seller:", wallet.address, " Buyer:", wallet2.address);
  } catch (err) {
    const error = err as Error;
    console.error("❌ Market Sale failed:", error.message);
    return undefined;
  }
};

/**
 * 5. Cancel a market item listing (seller only)
 * @returns {Promise<void | undefined>}
 */
const cancelMarketItem = async (): Promise<void | undefined> => {
  try {
    // 1. List market items for user: signer
    const items = await (marketplaceContract.connect(signer) as any).fetchListedMarketItems();
    if (items.length === 0) {
      console.error("❌ No listed market item.\n");
      return;
    }
    
    const marketItemId = items[0].marketItemId;
    const tokenId = items[0].tokenId as bigint;
    const currOwner = await myNftContract.ownerOf!(tokenId);

    console.log("Before canceling: Market item Id:", marketItemId, " tokenId:", tokenId, " Owner:", currOwner, " Seller:", wallet.address);
    
    // 2. cancel an item listing
    await (marketplaceContract.connect(signer) as any).cancelMarketItem(marketItemId);
    const newOwner = await myNftContract.ownerOf!(tokenId);

    console.log("After canceling: Market item Id:", marketItemId, " tokenId:", tokenId, " Owner:", newOwner, " Seller:", wallet.address);
  } catch (err) {
    const error = err as Error;
    console.error("❌ Market item cancel failed:", error.message);
    return undefined;
  }
};

/**
 * 5. Relist a canceled/sold NFT (payable - requires listing fee)
 * @returns {Promise<void | undefined>}
 */
const relistMarketItem = async (): Promise<void | undefined> => {
  try {
    // 1. List market items for user: signer
    const items = await (marketplaceContract.connect(signer) as any).fetchListedMarketItems();
    if (items.length === 0) {
      console.error("❌ No listed market item.\n");
      return;
    }

    const marketItemId = items[0].marketItemId;
    const tokenId = items[0].tokenId as bigint;
    const currOwner = await myNftContract.ownerOf!(tokenId);
    
    // 2. cancel an item listing
    console.log("Before canceling: Market item Id:", marketItemId, " tokenId:", tokenId, " Owner:", currOwner, " Seller:", wallet.address);
    await (marketplaceContract.connect(signer) as any).cancelMarketItem(marketItemId);
    const newOwner = await myNftContract.ownerOf!(tokenId);

    console.log("After canceling: Market item Id:", marketItemId, " tokenId:", tokenId, " Owner:", newOwner, " Seller:", wallet.address);

    const price = ethers.parseEther("0.2");
    console.log("Before relisting: Market item Id:", marketItemId, " tokenId:", tokenId, " Owner:", currOwner, " Seller:", items[0].seller);
    
    const tx = await marketplaceContract.relistMarketItem!(marketItemId, price, {
      value: LISTING_FEE,
    });
    
    await tx.wait();
    const newOwner2 = await myNftContract.ownerOf!(tokenId);
    const item2 = await (marketplaceContract.connect(signer) as any).getMarketItem(marketItemId);
    
    console.log("After relisting: Market item Id:", marketItemId, " tokenId:", tokenId, " Owner:", newOwner2, " Seller:", item2.seller);
  } catch (err) {
    const error = err as Error;
    console.error("❌ Relist a canceled/sold market item failed:", error.message);
    return undefined;
  }
};


/**
 * Run example workflow
 */
async function runExamples(): Promise<void> {
  try {
    console.log("\n===== Calling Marketplace Write Functions =====\n");
    console.log("=== [1] Mint a new NFT");
    const tokenId=await nftMint(NFT_CONTRACT_ADDRESS);
    console.log("Mint a new NFT with tokenId:",tokenId);
    console.log("\n=== [2] Create nft token and list market item (mint + list)");
        const marketItemId=await createMarketItem(
      NFT_CONTRACT_ADDRESS,
      TOKEN_URI,
      ethers.parseEther("0.1") // 0.1 ETH price
    );

    console.log("Mint and list an NFT item with marketItemId:",marketItemId);
    console.log("\n=== [3] Show listed market item by tokenId");
    await getMarketItemByTokenId(
      NFT_CONTRACT_ADDRESS,
      TOKEN_URI,
      ethers.parseEther("0.1") // 0.1 ETH price
    );

    console.log("\n=== [4] Purchase an NFT (payable - send full price)");
    await createMarketSale();

    console.log("\n=== [5] Cancel a market item listing (seller only)");
    await cancelMarketItem();

    console.log("\n=== [6] Relist a canceled/sold NFT (payable - requires listing fee)");
    await relistMarketItem();
    console.log("\n=== All write function tests finished ===");

  } catch (error) {
    const err = error as Error;
    console.error("Error executing examples:", err.message);
  }
}

// Run the example workflow
runExamples();