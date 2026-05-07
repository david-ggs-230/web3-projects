const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyNFTMarketplace", function () {
    //let MyNFTContractFactory;
    let myNFT;
    let myNFTAddress;
    //let MarketplaceContractFactory;
    let marketplace;
    let marketplaceAddr;
    let owner, seller, buyer, otherAccount;

    const LISTING_FEE = ethers.parseEther("0.0015");
    const NFT_PRICE = ethers.parseEther("0.1");
    const TEST_TOKEN_URI = "ipfs://test-metadata-uri";

    beforeEach(async function () {
        [owner, seller, buyer, otherAccount] = await ethers.getSigners();

        // Deploy marketplace first
        MarketplaceContractFactory = await ethers.getContractFactory("MyNFTMarketplace");
        marketplace = await MarketplaceContractFactory.deploy();
        await marketplace.waitForDeployment();
        marketplaceAddr = await marketplace.getAddress();

        // Deploy NFT with marketplace address
        MyNFTContractFactory = await ethers.getContractFactory("MyNFT");
        myNFT = await MyNFTContractFactory.deploy(marketplaceAddr);
        await myNFT.waitForDeployment();
        myNFTAddress = await myNFT.getAddress();
    });

    // ------------------------------
    // Deployment
    // ------------------------------
    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            // Only owner can call updateListingFee, non-owner should be reverted
            await expect(
                marketplace.connect(seller).updateListingFee(ethers.parseEther("0.0"))
            ).to.be.revertedWith("Only marketplace owner can call this");
            // Owner should be reverted with wrong argument to trigger custom error
            await expect(
                marketplace.connect(owner).updateListingFee(ethers.parseEther("0.0"))
            ).to.be.revertedWith("Listing price must be greater than 0");
        });

        it("Should initialize listing fee correctly", async function () {
            expect(await marketplace.getListingFee()).to.equal(LISTING_FEE);
        });
    });

    // ------------------------------
    // Fee Management
    // ------------------------------
    describe("Fee Management", function () {
        it("Owner can update listing fee", async function () {
            const newFee = ethers.parseEther("0.002");
            await marketplace.updateListingFee(newFee);
            expect(await marketplace.getListingFee()).to.equal(newFee);
        });

        it("Non-owner cannot update fee", async function () {
            await expect(
                marketplace.connect(seller).updateListingFee(ethers.parseEther("0.002"))
            ).to.be.revertedWith("Only marketplace owner can call this");
        });
    });

    // ------------------------------
    // create nft token and list market item (mint + list)
    // ------------------------------
    describe("Create nft token and list market item", function () {
        it("Should mint and list NFT successfully", async function () {
            // 1. Mint NFT token and wait for transaction confirmation
            const tx1 = await myNFT.connect(seller).safeMint(TEST_TOKEN_URI);
            const receipt1 = await tx1.wait();

            // Get token ID from the emitted event
            const mintEvent = receipt1.logs.find(
                (log) => log.fragment.name === "TokenMinted",
            );
            // Get token ID from the correct event
            const tokenId = mintEvent.args.tokenId;

            // 2. List token
            const listTx = await marketplace.connect(seller).createMarketItem(
                myNFTAddress,
                tokenId,
                NFT_PRICE,
                { value: LISTING_FEE }
            );
            const listReceipt = await listTx.wait();
            const event = listReceipt.logs.find(log => log.fragment?.name === "MarketItemCreated");
            expect(event).to.not.be.undefined;

            const [item, exists] = await marketplace.getLatestMarketItemByTokenId(
                myNFTAddress,
                tokenId
            );

            expect(exists).to.be.true;
            expect(item.seller).to.equal(seller.address);
            expect(item.price).to.equal(NFT_PRICE);
            expect(await myNFT.ownerOf(tokenId)).to.equal(await marketplace.getAddress());
        });
    });

    // ------------------------------
    // createMarketItem (list existing NFT)
    // ------------------------------
    describe("createMarketItem", function () {
        beforeEach(async function () {
            await myNFT.connect(seller).safeMint(TEST_TOKEN_URI);
        });

        it("Should list existing NFT", async function () {
            await marketplace.connect(seller).createMarketItem(
                await myNFT.getAddress(),
                1,
                NFT_PRICE,
                { value: LISTING_FEE }
            );

            const [item, exists] = await marketplace.getLatestMarketItemByTokenId(
                await myNFT.getAddress(),
                1
            );
            expect(exists).to.be.true;
            expect(item.seller).to.equal(seller.address);
        });

        it("Rejects non-owner listing", async function () {
            await expect(
                marketplace.connect(buyer).createMarketItem(
                    await myNFT.getAddress(),
                    1,
                    NFT_PRICE,
                    { value: LISTING_FEE }
                )
            ).to.be.revertedWith("Only token owner can list");
        });
    });

    // ------------------------------
    // createMarketSale (buy NFT)
    // ------------------------------
    describe("createMarketSale", function () {
        beforeEach(async function () {
            await myNFT.connect(seller).safeMint(TEST_TOKEN_URI);
            await marketplace.connect(seller).createMarketItem(
                myNFTAddress,
                1,
                NFT_PRICE,
                { value: LISTING_FEE }
            );
        });

        it("Should buy NFT successfully", async function () {
            await marketplace.connect(buyer).createMarketSale(1, { value: NFT_PRICE });
            expect(await myNFT.ownerOf(1)).to.equal(buyer.address);
        });

        it("Rejects buying own NFT", async function () {
            await expect(
                marketplace.connect(seller).createMarketSale(1, { value: NFT_PRICE })
            ).to.be.revertedWith("Cannot buy your own item");
        });
    });

    // ------------------------------
    // cancelMarketItem
    // ------------------------------
    describe("cancelMarketItem", function () {
        beforeEach(async function () {
            await myNFT.connect(seller).safeMint(TEST_TOKEN_URI);
            await marketplace.connect(seller).createMarketItem(
                await myNFT.getAddress(),
                1,
                NFT_PRICE,
                { value: LISTING_FEE }
            );
        });

        it("Seller can cancel listing", async function () {
            await marketplace.connect(seller).cancelMarketItem(1);
            expect(await myNFT.ownerOf(1)).to.equal(seller.address);
        });

        it("Non-seller cannot cancel", async function () {
            await expect(
                marketplace.connect(buyer).cancelMarketItem(1)
            ).to.be.revertedWith("Only the seller can cancel");
        });
    });

    // ------------------------------
    // relistMarketItem
    // ------------------------------
    describe("relistMarketItem", function () {
        beforeEach(async function () {
            await myNFT.connect(seller).safeMint(TEST_TOKEN_URI);
            await marketplace.connect(seller).createMarketItem(
                myNFTAddress,
                1,
                NFT_PRICE,
                { value: LISTING_FEE }
            );
            await marketplace.connect(buyer).createMarketSale(1, { value: NFT_PRICE });
        });

        it("Buyer can relist purchased NFT", async function () {
            await myNFT.connect(buyer).syncMarketplaceApproval();
            await marketplace.connect(buyer).relistMarketItem(
                1,
                ethers.parseEther("0.15"),
                { value: LISTING_FEE }
            );

            const [item] = await marketplace.getLatestMarketItemByTokenId(
                await myNFT.getAddress(),
                1
            );
            expect(item.seller).to.equal(buyer.address);
            expect(item.sold).to.be.false;
        });
    });

    // ------------------------------
    // Admin functions
    // ------------------------------
    describe("Admin Functions", function () {
        beforeEach(async function () {
            await myNFT.connect(seller).safeMint(TEST_TOKEN_URI);
            await marketplace.connect(seller).createMarketItem(
                await myNFT.getAddress(),
                1,
                NFT_PRICE,
                { value: LISTING_FEE }
            );
        });

        it("Admin can cancel listing and refund fee", async function () {
            await marketplace.cancelItemListingAndRefundByAdmin(1);
            expect(await myNFT.ownerOf(1)).to.equal(seller.address);
        });

        it("Owner can withdraw fees", async function () {
            await marketplace.deposit({ value: NFT_PRICE});
            const balance = await ethers.provider.getBalance(await marketplace.getAddress());
            
            expect(balance).to.be.equal(NFT_PRICE+LISTING_FEE);
            await marketplace.withdrawBalance();
            
            const newBalance = await ethers.provider.getBalance(await marketplace.getAddress());
            expect(newBalance).to.be.equal(LISTING_FEE);
        });
    });

    // ------------------------------
    // Fetch functions
    // ------------------------------
    describe("Fetch Functions", function () {
        it("fetchListedMarketItems returns listed items", async function () {
            await myNFT.connect(seller).safeMint(TEST_TOKEN_URI);
            await marketplace.connect(seller).createMarketItem(
                await myNFT.getAddress(),
                1,
                NFT_PRICE,
                { value: LISTING_FEE }
            );

            const items = await marketplace.fetchListedMarketItems();
            expect(items.length).to.equal(1);
        });

        it("fetchOwnPurchasedMarketItems returns purchased items", async function () {
            await myNFT.connect(seller).safeMint(TEST_TOKEN_URI);
            await marketplace.connect(seller).createMarketItem(
                await myNFT.getAddress(),
                1,
                NFT_PRICE,
                { value: LISTING_FEE }
            );
            await marketplace.connect(buyer).createMarketSale(1, { value: NFT_PRICE });

            const items = await marketplace.connect(buyer).fetchOwnPurchasedMarketItems();
            expect(items.length).to.equal(1);
        });
    });
});