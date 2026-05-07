const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyNFTMarketplace-test3", function () {
  let marketplace, marketplaceAddr;
  let nft;
  let owner, seller, buyer, feeReceiver;
  
  const TEST_TOKEN_URI = "ipfs://test-metadata-uri";
  const LISTING_FEE = ethers.parseEther("0.0015");
  const NFT_PRICE = ethers.parseEther("0.1");

  // Deploy fresh contracts before every test
  beforeEach(async function () {
    [owner, seller, buyer, feeReceiver] = await ethers.getSigners();

    // Deploy Marketplace
    const Marketplace = await ethers.getContractFactory("MyNFTMarketplace");
    marketplace = await Marketplace.deploy();
    await marketplace.waitForDeployment();
    marketplaceAddr = await marketplace.getAddress();

    // Deploy NFT contract (assumes MyNFT is mintable by owner)
    const MyNFT = await ethers.getContractFactory("MyNFT");
    nft = await MyNFT.deploy(marketplaceAddr);
    await nft.waitForDeployment();
    const nftAddress = await nft.getAddress();
    
    // Mint an NFT for seller: tokenId=1
    await nft.connect(seller).safeMint(TEST_TOKEN_URI);
  });

  describe("Deployment & Basic Settings", function () {
    it("Should set the right owner", async function () {
         //non-owner should not be able to call owner-only functions
        await expect(marketplace.connect(seller).updateListingFee(0n)).to.be.revertedWith("Only marketplace owner can call this");
        //owner should be able to call owner-only functions
        await expect(marketplace.connect(owner).updateListingFee(0n)).to.be.revertedWith("Listing price must be greater than 0");
        // owner should be able to set valid listing fee
        await marketplace.connect(owner).updateListingFee(LISTING_FEE+10n);
        expect(await marketplace.getListingFee()).to.equal(LISTING_FEE+10n);
    });

    it("Should have correct initial listing fee", async function () {
      expect(await marketplace.getListingFee()).to.equal(LISTING_FEE);
    });
  });

  describe("Market Item Listing", function () {
    it("Should create a market item and transfer NFT to marketplace", async function () {
      const nftAddr = await nft.getAddress();
      await nft.connect(seller).approve(await marketplace.getAddress(), 1);

      await marketplace.connect(seller).createMarketItem(
        nftAddr,
        1,
        NFT_PRICE,
        { value: LISTING_FEE }
      );

      const item = await marketplace.getMarketItem(1);
      expect(item.seller).to.equal(seller.address);
      expect(item.price).to.equal(NFT_PRICE);
      expect(await nft.ownerOf(1)).to.equal(await marketplace.getAddress());
    });

    it("Should fail if listing fee is incorrect", async function () {
      const nftAddr = await nft.getAddress();
      await nft.connect(seller).approve(await marketplace.getAddress(), 1);

      await expect(
        marketplace.connect(seller).createMarketItem(
          nftAddr, 1, NFT_PRICE, { value: 0 }
        )
      ).to.be.revertedWith("Incorrect listing fee amount");
    });
  });

  describe("Buying NFT", function () {
    beforeEach(async function () {
      const nftAddr = await nft.getAddress();
      await nft.connect(seller).approve(await marketplace.getAddress(), 1);
      await marketplace.connect(seller).createMarketItem(
        nftAddr, 1, NFT_PRICE, { value: LISTING_FEE }
      );
    });

    it("Should execute sale and transfer NFT to buyer", async function () {
      await marketplace.connect(buyer).createMarketSale(1, { value: NFT_PRICE });
      expect(await nft.ownerOf(1)).to.equal(buyer.address);
    });

    it("Should pay seller and fee to owner", async function () {
      const sellerBalanceBefore = await ethers.provider.getBalance(seller.address);

      const tx = await marketplace.connect(buyer).createMarketSale(1, { value: NFT_PRICE });
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const sellerBalanceAfter = await ethers.provider.getBalance(seller.address);
      expect(sellerBalanceAfter).to.be.closeTo(
        sellerBalanceBefore + NFT_PRICE,
        gasUsed
      );
    });

    it("Should fail if buyer sends wrong price", async function () {
      await expect(
        marketplace.connect(buyer).createMarketSale(1, { value: 0 })
      ).to.be.revertedWith("Incorrect payment amount");
    });
  });

  describe("Cancel Listing", function () {
    beforeEach(async function () {
      const nftAddr = await nft.getAddress();
      await nft.connect(seller).approve(await marketplace.getAddress(), 1);
      await marketplace.connect(seller).createMarketItem(
        nftAddr, 1, NFT_PRICE, { value: LISTING_FEE }
      );
    });

    it("Should cancel listing and return NFT to seller", async function () {
      await marketplace.connect(seller).cancelMarketItem(1);
      expect(await nft.ownerOf(1)).to.equal(seller.address);
    });

    it("Should mark item as canceled", async function () {
      await marketplace.connect(seller).cancelMarketItem(1);
      const item = await marketplace.getMarketItem(1);
      expect(item.canceled).to.be.true;
    });
  });

  describe("Relisting NFT", function () {
    beforeEach(async function () {
      const nftAddr = await nft.getAddress();
      await nft.connect(seller).approve(await marketplace.getAddress(), 1);
      await marketplace.connect(seller).createMarketItem(
        nftAddr, 1, NFT_PRICE, { value: LISTING_FEE }
      );
      await marketplace.connect(buyer).createMarketSale(1, { value: NFT_PRICE });
    });

    it("Should relist purchased NFT", async function () {
      const nftAddr = await nft.getAddress();
      await nft.connect(buyer).approve(await marketplace.getAddress(), 1);
      await marketplace.connect(buyer).relistMarketItem(
        1, ethers.parseEther("0.15"), { value: LISTING_FEE }
      );

      const item = await marketplace.getMarketItem(1);
      expect(item.seller).to.equal(buyer.address);
      expect(item.price).to.equal(ethers.parseEther("0.15"));
      expect(await nft.ownerOf(1)).to.equal(await marketplace.getAddress());
    });
  });

  describe("Admin Functions", function () {
    it("Owner can update listing fee", async function () {
      const newFee = ethers.parseEther("0.002");
      await marketplace.connect(owner).updateListingFee(newFee);
      expect(await marketplace.getListingFee()).to.equal(newFee);
    });

    it("Non-owner cannot update fee", async function () {
      await expect(
        marketplace.connect(seller).updateListingFee(ethers.parseEther("0.002"))
      ).to.be.revertedWith("Only marketplace owner can call this");
    });

    it("Admin can cancel listing and refund fee", async function () {
      const nftAddr = await nft.getAddress();
      await nft.connect(seller).approve(await marketplace.getAddress(), 1);
      await marketplace.connect(seller).createMarketItem(
        nftAddr, 1, NFT_PRICE, { value: LISTING_FEE }
      );

      await marketplace.connect(owner).cancelItemListingAndRefundByAdmin(1);
      const item = await marketplace.getMarketItem(1);
      expect(item.canceled).to.be.true;
    });
  });

  describe("Owner Deposit & Withdraw", function () {
    it("Owner can deposit ETH to contract (Owner → Contract)", async function () {
      const depositAmount = ethers.parseEther("1.0");
      await expect(marketplace.connect(owner).deposit({ value: depositAmount }))
        .to.emit(marketplace, "OwnerDeposited")
        .withArgs(owner.address, depositAmount);
      const balance = await ethers.provider.getBalance(await marketplace.getAddress());
      expect(balance).to.equal(depositAmount); 
    });

    it("Owner can withdraw available funds", async function () {
      // Deposit first
      await marketplace.connect(owner).deposit({ value: ethers.parseEther("1.0") });

      // Withdraw
      const balanceBefore =  await ethers.provider.getBalance(await marketplace.getAddress());
      await marketplace.connect(owner).withdrawBalance();
      const balanceAfter =  await ethers.provider.getBalance(await marketplace.getAddress());
      expect(balanceAfter).to.be.lt(balanceBefore);
    });

    it("Cannot withdraw locked fees", async function () {
      const nftAddr = await nft.getAddress();
      await nft.connect(seller).approve(await marketplace.getAddress(), 1);
      await marketplace.connect(seller).createMarketItem(
        nftAddr, 1, NFT_PRICE, { value: LISTING_FEE }
      );

      await expect(marketplace.connect(owner).withdrawBalance())
        .to.be.revertedWith("No withdrawable funds");
    });
  });

  describe("Fetch Queries", function () {
    it("Should return listed items", async function () {
      const nftAddr = await nft.getAddress();
      await nft.connect(seller).approve(await marketplace.getAddress(), 1);
      await marketplace.connect(seller).createMarketItem(
        nftAddr, 1, NFT_PRICE, { value: LISTING_FEE }
      );

      const items = await marketplace.fetchListedMarketItems();
      expect(items.length).to.equal(1);
    });
  });
});