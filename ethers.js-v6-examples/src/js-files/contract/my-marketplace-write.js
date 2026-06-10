import { NonceManager, ethers } from "ethers";

// --------------------------
// Configuration & Setup
// --------------------------
import * as MARKETPLACE_SOL_JSON from "./abis/MyNFTMarketplace.json" with { type: "json" };
import * as MYNFT_SOL_JSON from "./abis/MyNFT.json" with { type: 'json' };
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
const marketplaceContract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_SOL_JSON.default.abi, signer);
const myNftContract = new ethers.Contract(NFT_CONTRACT_ADDRESS, MYNFT_SOL_JSON.default.abi, provider);
//# Account #15
//Address: 0xcd3B766CCDd6AE721141F452C550Ca635964ce71 (10000 ETH)
//PK: 0x8166f546bab6da521a8369cab06c5d2b9e46670292d85c875ee9ec20e84ffb61
const signer2_privkey = "0x8166f546bab6da521a8369cab06c5d2b9e46670292d85c875ee9ec20e84ffb61";
const wallet2 = new ethers.Wallet(signer2_privkey, provider);
const signer2 = new NonceManager(wallet2);

// ------------------------------------------------------------------------------
// 1. Mint a new NFT
// ------------------------------------------------------------------------------
const nftMint = async (nftContractAddress, tokenURI) => {
  try {
    // contract with signer can call write functions
    //console.log("Minting a new NFT with wallet (using contract with signer)...");
    const nftContract = new ethers.Contract(nftContractAddress, MYNFT_SOL_JSON.default.abi, signer);
    const tx = await nftContract.safeMint(tokenURI ?? "https://my-nft-metadata.com/1.json");
    const receipt = await tx.wait();
    // Get first token ID from the emitted event
    const mintEvent = receipt.logs.find(
      (log) => log.fragment.name === "TokenMinted",
    );

    // Get token ID from the correct event
    const tokenId = mintEvent.args.tokenId;
    //console.log("Mint successful. TokenId:", tokenId, ", Tx hash:", receipt.hash);
    return tokenId;
  } catch (err) {
    console.error("❌ Mint failed:", err.message);
    return undefined;
  }
};

// ------------------------------------------------------------------------------
// 2. create nft token and list market item (mint + list)
// ------------------------------------------------------------------------------
const createMarketItem = async (nftContractAddress, tokenURI, price) => {
  try {
    // Get current listing fee to include with the transaction
    const listingFee = await marketplaceContract.getListingFee();
    //console.log(`Listing fee: ${ethers.formatEther(listingFee)} ETH`);
    const tokenId = await nftMint(nftContractAddress, tokenURI);
    const tx = await marketplaceContract.createMarketItem(
      nftContractAddress,
      tokenId,
      price,
      { value: listingFee } // Send listing fee with the transaction
    );

    const receipt = await tx.wait();
    const event = receipt.logs.find(log => log.fragment?.name === "MarketItemCreated");
    const marketItemId = event.args.marketItemId;
    //console.log(`Created Market Item ID: ${marketItemId}`);
    return marketItemId;
  } catch (err) {
    console.error("❌ Mint failed:", err.message);
    return undefined;
  }
};

// ------------------------------------------------------------------------------
// 3. show listed market item by tokenId
// ------------------------------------------------------------------------------
const getMarketItemByTokenId = async (nftContractAddress, tokenURI, price) => {
  try {
    // 1. List a market item first
    const listingFee = await marketplaceContract.getListingFee();
    const tokenId = await nftMint(nftContractAddress, tokenURI);
    const tx = await marketplaceContract.createMarketItem(
      nftContractAddress,
      tokenId,
      price,
      { value: listingFee } // Send listing fee with the transaction
    );
    const receipt = await tx.wait();
    const event = receipt.logs.find(log => log.fragment?.name === "MarketItemCreated");
    const marketItemId = event.args.marketItemId;

    // 2. Get the listed market item by tokenId
    const [item, exists] = await marketplaceContract.getLatestMarketItemByTokenId(nftContractAddress, tokenId);
    if (!exists) {
      console.error("❌ Market item listing failed for marketItemId: ", marketItemId, " and tokenId: ", tokenId);
      return;
    }
    console.error("Market item Id:", marketItemId, " item.marketItemId:", item.marketItemId, " and tokenId:", item.tokenId);
    return item;
  } catch (err) {
    console.error("❌ Mint failed:", err.message);
    return undefined;
  }
};

// ------------------------------------------------------------------------------
// 4. Purchase an NFT (payable - send full price)
// ------------------------------------------------------------------------------
const createMarketSale = async () => {
  try {
    // 1. List market items for user: signer
    const items = await marketplaceContract.connect(signer).fetchListedMarketItems();
    if (items.length === 0) {
      console.error("❌ No listed market item.\n");
      return;
    }
    const marketItemId = items[0].marketItemId;
    const tokenId = items[0].tokenId;
    const currOwner = await myNftContract.ownerOf(tokenId);
    const price=items[0].price;
    // const balance = await provider.getBalance(currOwner);
    // const signer_balance = await provider.getBalance(wallet);
    // const marketplace_balance = await provider.getBalance(MARKETPLACE_ADDRESS);
    //const buyer_balance = await provider.getBalance(wallet2.address);
    // console.log(`Balance of owner: ${currOwner}: ${ethers.formatEther(balance)} ETH`);
    // console.log(`Balance of signer: ${wallet.address}: ${ethers.formatEther(signer_balance)} ETH`);
    // console.log(`Balance of marketplace: ${MARKETPLACE_ADDRESS}: ${ethers.formatEther(marketplace_balance)} ETH`);
    //console.log(`Balance of buyer: ${wallet2.address}: ${ethers.formatEther(buyer_balance)} ETH`);

    console.log("Before purchase: Market item Id:", marketItemId, " tokenId:", tokenId, " Owner:", currOwner, " Seller:", wallet.address, " Buyer:", wallet2.address);
    //const NFT_PRICE = ethers.parseEther("0.1");
    // 2. buy an item
    await marketplaceContract.connect(signer2).createMarketSale(marketItemId, { value: price });
    const newOwner = await myNftContract.ownerOf(tokenId);
    console.log("After purchase: Market item Id:", marketItemId, " tokenId:", tokenId, " Owner:", newOwner, " Seller:", wallet.address, " Buyer:", wallet2.address);
  } catch (err) {
    console.error("❌ Market Sale failed:", err.message);
    return undefined;
  }
};


// ------------------------------------------------------------------------------
// 5. Cancel a market item listing (seller only)
// ------------------------------------------------------------------------------
const cancelMarketItem = async () => {
  try {
    // 1. List market items for user: signer
    const items = await marketplaceContract.connect(signer).fetchListedMarketItems();
    if (items.length === 0) {
      console.error("❌ No listed market item.\n");
      return;
    }
    const marketItemId = items[0].marketItemId;
    const tokenId = items[0].tokenId;
    const currOwner = await myNftContract.ownerOf(tokenId);

    console.log("Before canceling: Market item Id:", marketItemId, " tokenId:", tokenId, " Owner:", currOwner, " Seller:", wallet.address);
    // 2. cancel an item listing
    await marketplaceContract.connect(signer).cancelMarketItem(marketItemId);
    const newOwner = await myNftContract.ownerOf(tokenId);

    console.log("After canceling: Market item Id:", marketItemId, " tokenId:", tokenId, " Owner:", newOwner, " Seller:", wallet.address);
  } catch (err) {
    console.error("❌ Market item cancel failed:", err.message);
    return undefined;
  }
};


// ------------------------------------------------------------------------------
// 5. Relist a canceled/sold NFT (payable - requires listing fee)
// ------------------------------------------------------------------------------
const relistMarketItem = async () => {
  try {
    // 1. List market items for user: signer
    const items = await marketplaceContract.connect(signer).fetchListedMarketItems();
    if (items.length === 0) {
      console.error("❌ No listed market item.\n");
      return;
    }

    const marketItemId = items[0].marketItemId;
    const tokenId = items[0].tokenId;
    const currOwner = await myNftContract.ownerOf(tokenId);
    // 2. cancel an item listing

    console.log("Before canceling: Market item Id:", marketItemId, " tokenId:", tokenId, " Owner:", currOwner, " Seller:", wallet.address);
    await marketplaceContract.connect(signer).cancelMarketItem(marketItemId);
    const newOwner = await myNftContract.ownerOf(tokenId);

    console.log("After canceling: Market item Id:", marketItemId, " tokenId:", tokenId, " Owner:", newOwner, " Seller:", wallet.address);

    const price = ethers.parseEther("0.2");
    console.log("Before relisting: Market item Id:", marketItemId, " tokenId:", tokenId, " Owner:", currOwner, " Seller:", items[0].seller);
    const tx = await marketplaceContract.relistMarketItem(marketItemId, price, {
      value: LISTING_FEE,
    });
    await tx.wait();
    const newOwner2 = await myNftContract.ownerOf(tokenId);

    const item2 = await marketplaceContract.connect(signer).getMarketItem(marketItemId);
    console.log("After relisting: Market item Id:", marketItemId, " tokenId:", tokenId, " Owner:", newOwner2, " Seller:", item2.seller);
  } catch (err) {
    console.error("❌ Relist a canceled/sold market item failed:", err.message);
    return undefined;
  }
};



async function runExamples() {
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
    // await updateListingFee(); // Update fee to 0.01 ETH

  } catch (error) {
    console.error("Error executing examples:", error);
  }
}

// Run the example workflow
runExamples();