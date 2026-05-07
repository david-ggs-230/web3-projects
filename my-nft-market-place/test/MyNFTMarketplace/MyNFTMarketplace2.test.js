const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyNFTMarketplace-test2", () => {
  let marketplace, marketplaceAddr;
  let nft;
  let owner;
  let seller;
  let buyer;

  const TEST_TOKEN_URI = "ipfs://test-metadata-uri";
  const LISTING_FEE = ethers.parseEther("0.0015");
  const TOKEN_PRICE = ethers.parseEther("0.1");

  before(async () => {
    [owner, seller, buyer, anotherUser] = await ethers.getSigners();
  });

  beforeEach(async () => {
    // Deploy Marketplace (fix ReentrancyGuard import first!)
    const MarketplaceFactory = await ethers.getContractFactory("MyNFTMarketplace");
    marketplace = await MarketplaceFactory.deploy();
    await marketplace.waitForDeployment();
    marketplaceAddr = await marketplace.getAddress();

    // Deploy NFT contract
    const NFTFactory = await ethers.getContractFactory("MyNFT");
    nft = await NFTFactory.deploy(marketplaceAddr);
    await nft.waitForDeployment();

    // Mint an NFT for seller: tokenId=1
    await nft.connect(seller).safeMint(TEST_TOKEN_URI);
  });

  describe("createMarketItem", () => {
    it("should allow a seller to list an NFT with correct fee", async () => {
      await nft.connect(seller).approve(await marketplace.getAddress(), 1);
      await expect(
        marketplace.connect(seller).createMarketItem(await nft.getAddress(), 1, TOKEN_PRICE, {
          value: LISTING_FEE,
        })
      )
        .to.emit(marketplace, "MarketItemCreated")
        .withArgs(1, await nft.getAddress(), 1, seller.address, seller.address, ethers.ZeroAddress, TOKEN_PRICE, LISTING_FEE, false, false);

      const item = await marketplace.getMarketItem(1);
      expect(item.price).to.equal(TOKEN_PRICE);
      expect(item.seller).to.equal(seller.address);
      expect(item.sold).to.be.false;
    });

    it("should revert if listing fee is incorrect", async () => {
      await nft.connect(seller).approve(await marketplace.getAddress(), 1);
      await expect(
        marketplace.connect(seller).createMarketItem(await nft.getAddress(), 1, TOKEN_PRICE, {
          value: LISTING_FEE - 1n, // Just 1 wei less than required fee
        })
      ).to.be.revertedWith("Incorrect listing fee amount");
    });

    it("should revert if price is zero", async () => {
      await nft.connect(seller).approve(await marketplace.getAddress(), 1);
      await expect(
        marketplace.connect(seller).createMarketItem(await nft.getAddress(), 1, 0, {
          value: LISTING_FEE,
        })
      ).to.be.revertedWith("Price must be at least 1 wei");
    });
  });

  describe("cancelMarketItem", () => {
    beforeEach(async () => {
      await nft.connect(seller).approve(await marketplace.getAddress(), 1);
      await marketplace.connect(seller).createMarketItem(await nft.getAddress(), 1, TOKEN_PRICE, {
        value: LISTING_FEE,
      });
    });

    it("should allow seller to cancel and get NFT back, fee sent to owner", async () => {
      const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);
      await expect(marketplace.connect(seller).cancelMarketItem(1))
        .to.emit(marketplace, "MarketItemCanceled")
        .withArgs(1, await nft.getAddress(), 1, seller.address);

      const item = await marketplace.getMarketItem(1);
      expect(item.canceled).to.be.true;
      expect(item.owner).to.equal(seller.address);

      // Check NFT ownership
      expect(await nft.ownerOf(1)).to.equal(seller.address);

      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
      expect(ownerBalanceAfter - ownerBalanceBefore).to.equal(LISTING_FEE);
    });

    it("should revert if non‑seller tries to cancel", async () => {
      await expect(marketplace.connect(buyer).cancelMarketItem(1)).to.be.revertedWith(
        "Only the seller can cancel"
      );
    });
  });

  describe("createMarketSale", () => {
    beforeEach(async () => {
      await nft.connect(seller).approve(await marketplace.getAddress(), 1);
      await marketplace.connect(seller).createMarketItem(await nft.getAddress(), 1, TOKEN_PRICE, {
        value: LISTING_FEE,
      });
    });

    it("should allow buyer to purchase the NFT", async () => {
      const sellerBalanceBefore = await ethers.provider.getBalance(seller.address);
      const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);

      await expect(
        marketplace.connect(buyer).createMarketSale(1, { value: TOKEN_PRICE })
      )
        .to.emit(marketplace, "MarketItemSold")
        .withArgs(1, await nft.getAddress(), 1, seller.address, buyer.address, TOKEN_PRICE, LISTING_FEE);

      const item = await marketplace.getMarketItem(1);
      expect(item.sold).to.be.true;
      expect(item.owner).to.equal(buyer.address);

      // NFT transferred to buyer
      expect(await nft.ownerOf(1)).to.equal(buyer.address);

      // Seller receives price, owner receives listing fee
      const sellerBalanceAfter = await ethers.provider.getBalance(seller.address);
      expect(sellerBalanceAfter - sellerBalanceBefore).to.equal(TOKEN_PRICE);
      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
      expect(ownerBalanceAfter - ownerBalanceBefore).to.equal(LISTING_FEE);
    });

    it("should revert if buyer tries to buy own item", async () => {
      await expect(
        marketplace.connect(seller).createMarketSale(1, { value: TOKEN_PRICE })
      ).to.be.revertedWith("Cannot buy your own item");
    });
  });

  describe("relistMarketItem", () => {
    const NEW_PRICE = ethers.parseEther("0.2");

    beforeEach(async () => {
      await nft.connect(seller).approve(await marketplace.getAddress(), 1);
      await marketplace.connect(seller).createMarketItem(await nft.getAddress(), 1, TOKEN_PRICE, {
        value: LISTING_FEE,
      });
      await marketplace.connect(buyer).createMarketSale(1, { value: TOKEN_PRICE });
    });

    it("should allow buyer to relist the purchased NFT", async () => {
      await nft.connect(buyer).approve(await marketplace.getAddress(), 1);
      await expect(
        marketplace.connect(buyer).relistMarketItem(1, NEW_PRICE, { value: LISTING_FEE })
      )
        .to.emit(marketplace, "MarketItemRelisted")
        .withArgs(1, await nft.getAddress(), 1, seller.address, buyer.address, ethers.ZeroAddress, NEW_PRICE, LISTING_FEE, false, false);

      const item = await marketplace.getMarketItem(1);
      expect(item.sold).to.be.false;
      expect(item.price).to.equal(NEW_PRICE);
      expect(item.seller).to.equal(buyer.address);
      expect(item.owner).to.equal(ethers.ZeroAddress);
      expect(await nft.ownerOf(1)).to.equal(await marketplace.getAddress());
    });
  });

  describe("Admin functions", () => {
    it("updateListingFee – only owner", async () => {
      const newFee = ethers.parseEther("0.002");
      await expect(marketplace.connect(owner).updateListingFee(newFee))
        .to.emit(marketplace, "ListingFeeUpdated")
        .withArgs(LISTING_FEE, newFee, owner.address);
      expect(await marketplace.getListingFee()).to.equal(newFee);
    });

    it("cancelItemListingAndRefundByAdmin – cancels active listing and refunds fee to seller", async () => {
      await nft.connect(seller).approve(await marketplace.getAddress(), 1);
      await marketplace.connect(seller).createMarketItem(await nft.getAddress(), 1, TOKEN_PRICE, {
        value: LISTING_FEE,
      });
      const sellerBalanceBefore = await ethers.provider.getBalance(seller.address);

      await expect(marketplace.connect(owner).cancelItemListingAndRefundByAdmin(1))
        .to.emit(marketplace, "MarketItemCanceled")
        .withArgs(1, await nft.getAddress(), 1, seller.address);

      const item = await marketplace.getMarketItem(1);
      expect(item.canceled).to.be.true;
      expect(await nft.ownerOf(1)).to.equal(seller.address);

      const sellerBalanceAfter = await ethers.provider.getBalance(seller.address);
      // Fee refunded to seller, not to owner
      expect(sellerBalanceAfter - sellerBalanceBefore).to.equal(LISTING_FEE);
    });

    it("deposit – owner can send ETH to marketplace", async () => {
      const depositAmount = ethers.parseEther("1");
      const marketBalanceBefore = await ethers.provider.getBalance(await marketplace.getAddress());
      await expect(marketplace.connect(owner).deposit({ value: depositAmount }))
        .to.emit(marketplace, "OwnerDeposited")
        .withArgs(owner.address, depositAmount);
      const marketBalanceAfter = await ethers.provider.getBalance(await marketplace.getAddress());
      expect(marketBalanceAfter - marketBalanceBefore).to.equal(depositAmount);
    });

    it("withdrawBalance – owner withdraws only excess ETH (not locked fees)", async () => {
      // Deposit some ETH
      await marketplace.connect(owner).deposit({ value: ethers.parseEther("1") });
      //const lockedFeesBefore = await marketplace._lockedFees(); // you may need to make it public or expose getter
      // But easier: create a listing => locks fee
      await nft.connect(seller).approve(await marketplace.getAddress(), 1);
      await marketplace.connect(seller).createMarketItem(await nft.getAddress(), 1, TOKEN_PRICE, {
        value: LISTING_FEE,
      });
      const balance = await ethers.provider.getBalance(await marketplace.getAddress());
      expect(balance).to.be.equal(ethers.parseEther("1")+LISTING_FEE);
  
      const withdrawable = balance - LISTING_FEE; // Assuming only 1 listing fee is locked
      await expect(marketplace.connect(owner).withdrawBalance())
        .to.changeEtherBalance(owner, withdrawable);
    });
  });

  describe("View functions", () => {
    beforeEach(async () => {
      await nft.connect(seller).approve(await marketplace.getAddress(), 1);
      await marketplace.connect(seller).createMarketItem(await nft.getAddress(), 1, TOKEN_PRICE, {
        value: LISTING_FEE,
      });
    });

    it("fetchListedMarketItems returns unsold, uncancelled, unowned items", async () => {
      const items = await marketplace.fetchListedMarketItems();
      expect(items.length).to.equal(1);
      expect(items[0].tokenId).to.equal(1);
    });

    it("fetchOwnedMarketItems returns items owned by user (listing owner or canceled owner)", async () => {
      let items = await marketplace.connect(seller).fetchOwnedMarketItems();
      // seller owns the listing (owner == address(0) and seller == msg.sender)
      expect(items.length).to.equal(1);

      await marketplace.connect(buyer).createMarketSale(1, { value: TOKEN_PRICE });
      // now buyer owns the item, but not listed, so fetchOwnedMarketItems should return empty for buyer
      // However, fetchOwnPurchasedMarketItems should return the item for buyer
      items = await marketplace.connect(buyer).fetchOwnedMarketItems();
      expect(items.length).to.equal(0);
      
      items = await marketplace.connect(buyer).fetchOwnPurchasedMarketItems();
      expect(items.length).to.equal(1);
    });
  });
});