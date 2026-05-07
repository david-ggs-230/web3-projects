//MyNFT.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyNFT", function () {
  let myNFT;
  let owner, marketplace1, marketplace2, marketplace3,user1, user2, nonOwner;

  //const INITIAL_MARKETPLACE = "marketplace1";
  //const NEW_MARKETPLACE = "marketplace2";
  const TOKEN_URI_1 = "ipfs://firstMeta";
  const TOKEN_URI_2 = "ipfs://updatedMeta";
  const TOKEN_URI_3 = "ipfs://finalMeta";
  const EMPTY_URI = "";

  beforeEach(async function () {
    // Get signers
    [owner, marketplace1, marketplace2, marketplace3,user1, user2, nonOwner] =
      await ethers.getSigners();

    // Deploy contract with initial marketplace address (marketplace1)
    const MyNFT = await ethers.getContractFactory("MyNFT");
    myNFT = await MyNFT.deploy(marketplace1.address);
    await myNFT.waitForDeployment();
  });

  describe("Deployment", function () {
    it("should set the correct name and symbol", async function () {
      expect(await myNFT.name()).to.equal("MyNFT");
      expect(await myNFT.symbol()).to.equal("NFTK");
    });

    it("should store the initial marketplace address (implicitly via minting approvals)", async function () {
      // Initially, no approvals should be set until minting occurs
      const isApproved = await myNFT.isApprovedForAll(
        user1.address,
        marketplace1.address,
      );
      expect(isApproved).to.be.false; 

        // Mint a token with user1 – should auto‑approve marketplace1
      await myNFT.connect(user1).safeMint(TOKEN_URI_1);
      expect(await myNFT.isApprovedForAll(user1.address, marketplace1.address)).to.be.true;
    });
  });

  describe("Minting", function () {
    it("should mint a new token, assign creator and tokenURI, emit event", async function () {
      const tx = await myNFT.connect(user1).safeMint(TOKEN_URI_1);
      //const receipt = 
      await tx.wait();
      const tokenId = 1; // first minted token

      // Check ownership and URI
      expect(await myNFT.ownerOf(tokenId)).to.equal(user1.address);
      expect(await myNFT.tokenURI(tokenId)).to.equal(TOKEN_URI_1);

      // Check creator mapping
      expect(await myNFT.getTokenCreatorById(tokenId)).to.equal(user1.address);

      // Check tokens created by user1
      const tokensCreated = await myNFT.connect(user1).getTokensCreated();
      expect(tokensCreated).to.deep.equal([BigInt(tokenId)]);

      // Check event
      await expect(tx)
        .to.emit(myNFT, "TokenMinted")
        .withArgs(tokenId, TOKEN_URI_1, marketplace1.address);
    });

    it("Should start token IDs from 1", async function () {
      // Mint first NFT and wait for transaction confirmation
      const tx1 = await myNFT.safeMint(TOKEN_URI_1);
      const receipt1 = await tx1.wait();

      // Get first token ID from the emitted event
      const mintEvent = receipt1.logs.find(
        (log) => log.fragment.name === "TokenMinted",
      );
      // Get token ID from the correct event
      const tokenId = mintEvent.args.tokenId;

      // Mint second NFT and wait for transaction confirmation
      const tx2 = await myNFT.safeMint(TOKEN_URI_2);
      const receipt2 = await tx2.wait();
      const mintEvent2 = receipt2.logs.find(
        (log) => log.fragment.name === "TokenMinted",
      );
      // Get second token ID from the emitted event
      const tokenId2 = mintEvent2.args.tokenId;

      // Verify the first token starts at 1
      expect(tokenId).to.equal(1n);
      // Verify token IDs increment correctly
      expect(tokenId2).to.equal(2n);
    });
    it("should automatically approve the current marketplace for the minter", async function () {
      await myNFT.connect(user1).safeMint(TOKEN_URI_1);
      expect(await myNFT.isApprovedForAll(user1.address, marketplace1.address)).to.be.true;
    });

    it("should NOT approve the marketplace again if already approved", async function () {
      // Manually approve first
      await myNFT.connect(user1).setApprovalForAll(marketplace1.address, true);
      await myNFT.connect(user1).safeMint(TOKEN_URI_1);
      // Still approved, no double approval needed (no revert)
      expect(await myNFT.isApprovedForAll(user1.address, marketplace1.address)).to.be.true;
    });

    it("should revert when minting with empty URI", async function () {
      await expect(myNFT.connect(user1).safeMint(EMPTY_URI)).to.be.revertedWith(
        "URI cannot be empty"
      );
    });

    it("should increment token IDs correctly", async function () {
      await myNFT.connect(user1).safeMint(TOKEN_URI_1);
      await myNFT.connect(user2).safeMint(TOKEN_URI_1);
      expect(await myNFT.ownerOf(1)).to.equal(user1.address);
      expect(await myNFT.ownerOf(2)).to.equal(user2.address);
    });
    
    it("Should handle minting many tokens", async function () {
      const mintCount = 100;
      for (let i = 0; i < mintCount; i++) {
        await myNFT.safeMint(`${TOKEN_URI_1}/${i}`);
      }

      const tokensOwned = await myNFT.getTokensOwned();
      expect(tokensOwned.length).to.equal(mintCount);

      for (let i = 0; i < mintCount; i++) {
        expect(tokensOwned[i]).to.equal(i + 1);
      }
    });
  });

  describe("Marketplace Update & Auto‑Sync Approval", function () {
    beforeEach(async function () {
      // Mint a token with user1 before marketplace update (so user1 has approval for marketplace1)
      await myNFT.connect(user1).safeMint(TOKEN_URI_1);
      expect(await myNFT.isApprovedForAll(user1.address, marketplace1.address)).to.be.true;
    });

    it("should allow only owner to update marketplace address", async function () {
      await expect(
        myNFT.connect(nonOwner).setMarketplaceAddress(marketplace2.address)
      ).to.be.revertedWithCustomError(myNFT, "OwnableUnauthorizedAccount");
    });

    it("should revert when setting marketplace to zero address or same address", async function () {
      await expect(
        myNFT.connect(owner).setMarketplaceAddress(ethers.ZeroAddress)
      ).to.be.revertedWith("Cannot set to zero address");
      await expect(
        myNFT.connect(owner).setMarketplaceAddress(marketplace1.address)
      ).to.be.revertedWith("Cannot set to same address");
    });

    it("should emit MarketplaceUpdated event and push old marketplace to array", async function () {
      const tx = await myNFT.connect(owner).setMarketplaceAddress(marketplace2.address);
      await expect(tx)
        .to.emit(myNFT, "MarketplaceUpdated")
        .withArgs(marketplace1.address, marketplace2.address);

      const oldMarketplaces = await myNFT.connect(owner).getOldMarketplaces();
      expect(oldMarketplaces).to.deep.equal([marketplace1.address]);
    });

    it("autoSync: when minting after marketplace update, revoke old marketplace approval and approve new one for the minter", async function () {
      // Owner updates marketplace
      await myNFT.connect(owner).setMarketplaceAddress(marketplace2.address);

      // User1 mints a second token -> modifier revokes marketplace1 and approves marketplace2
      await myNFT.connect(user1).safeMint(TOKEN_URI_1);

      expect(await myNFT.isApprovedForAll(user1.address, marketplace1.address)).to.be.false;
      expect(await myNFT.isApprovedForAll(user1.address, marketplace2.address)).to.be.true;
    });

    it("autoSync: when updating tokenURI, also sync approvals for the caller", async function () {
      await myNFT.connect(owner).setMarketplaceAddress(marketplace2.address);
      // user1 updates URI of token 1
      await myNFT.connect(user1).updateTokenURI(1, TOKEN_URI_2);
      expect(await myNFT.isApprovedForAll(user1.address, marketplace1.address)).to.be.false;
      expect(await myNFT.isApprovedForAll(user1.address, marketplace2.address)).to.be.true;
      expect(await myNFT.tokenURI(1)).to.equal(TOKEN_URI_2);
    });

    it("syncMarketplaceApproval: manually revokes old approvals and sets new marketplace approval", async function () {
      await myNFT.connect(owner).setMarketplaceAddress(marketplace2.address);
      // User1 still has approval for marketplace1, none for marketplace2
      expect(await myNFT.isApprovedForAll(user1.address, marketplace1.address)).to.be.true;
      expect(await myNFT.isApprovedForAll(user1.address, marketplace2.address)).to.be.false;

      await myNFT.connect(user1).syncMarketplaceApproval();

      expect(await myNFT.isApprovedForAll(user1.address, marketplace1.address)).to.be.false;
      expect(await myNFT.isApprovedForAll(user1.address, marketplace2.address)).to.be.true;
    });
    
    it("Should get the correct marketplace address", async function () {
      // Mint an NFT to emit the event containing marketplace address
      const tx = await myNFT.safeMint(TOKEN_URI_1);
      const receipt = await tx.wait();

      // Get marketplace address from emitted event
      // Find YOUR custom event (not the default Transfer event)
      //   const mintEvent = receipt.logs.find(log =>
      //     log.fragment.name === "TokenMinted"
      //   );
      //// Get marketplace address from the correct event
      //  const eventMarketplaceAddr = mintEvent.args.marketplaceAddress;

      // Loop through logs to find TokenMinted event
      let marketplaceAddress;
      for (const log of receipt.logs) {
        if (log.fragment && log.fragment.name === "TokenMinted") {
          marketplaceAddress = log.args.marketplaceAddress;
          break;
        }
      }

      // Verify it matches the expected address
      expect(marketplaceAddress).to.equal(marketplace1.address);
    });

    it("Should track address through events", async function () {
      // Capture event to verify the address
      await expect(myNFT.connect(owner).setMarketplaceAddress(marketplace2.address))
        .to.emit(myNFT, "MarketplaceUpdated")
        .withArgs(marketplace1.address, marketplace2.address);

      // The next update will show the previous address
      await expect(myNFT.connect(owner).setMarketplaceAddress(marketplace3.address))
        .to.emit(myNFT, "MarketplaceUpdated")
        .withArgs(marketplace2.address, marketplace3.address);
    });

  });

  describe("Token URI Update", function () {
    beforeEach(async function () {
      await myNFT.connect(user1).safeMint(TOKEN_URI_1);
    });

    it("should allow creator to update URI", async function () {
      await myNFT.connect(user1).updateTokenURI(1, TOKEN_URI_2);
      expect(await myNFT.tokenURI(1)).to.equal(TOKEN_URI_2);
    });

    it("should revert if caller is not token owner (or not creator)", async function () {
      await expect(
        myNFT.connect(user2).updateTokenURI(1, TOKEN_URI_2)
      ).to.be.revertedWith("Not token owner");
    });

    it("should revert if caller is owner but not creator (e.g., after transfer)", async function () {
      // Transfer token from user1 to user2
      await myNFT.connect(user1).transferFrom(user1.address, user2.address, 1);
      // user2 is owner but not creator
      await expect(
        myNFT.connect(user2).updateTokenURI(1, TOKEN_URI_2)
      ).to.be.revertedWith("Only creator can update URI");
    });

    it("should revert if new URI is empty", async function () {
      await expect(
        myNFT.connect(user1).updateTokenURI(1, EMPTY_URI)
      ).to.be.revertedWith("New URI cannot be empty");
    });

    it("Should get correct token URI after multiple updates", async function () {
     // Mint first NFT and wait for transaction confirmation
      const tx1 = await myNFT.safeMint(TOKEN_URI_1);
      const receipt1 = await tx1.wait();

      // Get the token ID from the emitted event
      const mintEvent = receipt1.logs.find(
        (log) => log.fragment.name === "TokenMinted",
      );
      
      // Get token ID from the correct event
      const tokenId = mintEvent.args.tokenId;
      await myNFT.updateTokenURI(tokenId, TOKEN_URI_2);
      await myNFT.updateTokenURI(tokenId, TOKEN_URI_3);

      expect(await myNFT.tokenURI(tokenId)).to.equal(TOKEN_URI_3);
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await myNFT.connect(user1).safeMint(TOKEN_URI_1); // tokenId 1
      await myNFT.connect(user1).safeMint(TOKEN_URI_1); // tokenId 2
      await myNFT.connect(user2).safeMint(TOKEN_URI_1); // tokenId 3
    });

    describe("getTokensOwned", function () {
      it("should return all token IDs owned by the caller", async function () {
        const owned = await myNFT.connect(user1).getTokensOwned();
        // user1 owns token 1 and 2
        expect(owned).to.deep.equal([BigInt(1), BigInt(2)]);
      });

      it("should return empty array if caller owns no tokens", async function () {
        const owned = await myNFT.connect(nonOwner).getTokensOwned();
        expect(owned).to.deep.equal([]);
      });
    });

    describe("getTokenCreatorById", function () {
      it("should return the creator address for a valid token", async function () {
        expect(await myNFT.getTokenCreatorById(1)).to.equal(user1.address);
        expect(await myNFT.getTokenCreatorById(3)).to.equal(user2.address);
      });

      it("should revert for non‑existent token", async function () {
        await expect(myNFT.getTokenCreatorById(999)).to.be.revertedWith(
          "Token does not exist"
        );
      });
    });

    describe("getTokensCreated", function () {
      it("should return token IDs minted by the caller", async function () {
        const createdByUser1 = await myNFT.connect(user1).getTokensCreated();
        expect(createdByUser1).to.deep.equal([BigInt(1), BigInt(2)]);
        const createdByUser2 = await myNFT.connect(user2).getTokensCreated();
        expect(createdByUser2).to.deep.equal([BigInt(3)]);
      });

      it("should return empty array if caller never minted", async function () {
        const createdByNonOwner = await myNFT.connect(nonOwner).getTokensCreated();
        expect(createdByNonOwner).to.deep.equal([]);
      });
    });

    describe("isValidTokenId", function () {
      it("should return true for minted tokens", async function () {
        expect(await myNFT.isValidTokenId(1)).to.be.true;
        expect(await myNFT.isValidTokenId(3)).to.be.true;
      });

      it("should return false for non‑existent tokens", async function () {
        expect(await myNFT.isValidTokenId(0)).to.be.false;
        expect(await myNFT.isValidTokenId(999)).to.be.false;
      });
    });

    describe("getOldMarketplaces", function () {
      it("should allow only owner to call", async function () {
        await expect(myNFT.connect(nonOwner).getOldMarketplaces()).to.be.revertedWithCustomError(
          myNFT,
          "OwnableUnauthorizedAccount"
        );
      });

      it("should return correct list after multiple updates", async function () {
        await myNFT.connect(owner).setMarketplaceAddress(marketplace2.address);
        // Set marketplace to a third address (e.g., owner.address as dummy)
        await myNFT.connect(owner).setMarketplaceAddress(owner.address);
        const old = await myNFT.connect(owner).getOldMarketplaces();
        expect(old).to.deep.equal([marketplace1.address, marketplace2.address]);
      });
    });
  });

  describe("ERC721Enumerable & Transfer Behaviour", function () {
    it("creator remains unchanged after transfer", async function () {
      await myNFT.connect(user1).safeMint(TOKEN_URI_1);
      expect(await myNFT.getTokenCreatorById(1)).to.equal(user1.address);
      await myNFT.connect(user1).transferFrom(user1.address, user2.address, 1);
      expect(await myNFT.getTokenCreatorById(1)).to.equal(user1.address);
    });

    it("getTokensOwned updates correctly after transfer", async function () {
      await myNFT.connect(user1).safeMint(TOKEN_URI_1); // token 1
      await myNFT.connect(user2).safeMint(TOKEN_URI_1); // token 2
      await myNFT.connect(user1).transferFrom(user1.address, user2.address, 1);

      const ownedByUser1 = await myNFT.connect(user1).getTokensOwned();
      expect(ownedByUser1).to.deep.equal([]);
      const ownedByUser2 = await myNFT.connect(user2).getTokensOwned();
      expect(ownedByUser2).to.deep.equal([BigInt(2), BigInt(1)]);
    });
  });

  describe("Token Transfers", function () {
    beforeEach(async function () {
      await myNFT.safeMint(TOKEN_URI_1); // tokenId 1 owned by owner
    });

    it("Should track creator correctly after transfer", async function () {
      // Transfer token from owner to user1
      await myNFT.transferFrom(owner.address, user1.address, 1);
      
      // Creator should still be original owner
      const creator = await myNFT.getTokenCreatorById(1);
      expect(creator).to.equal(owner.address);
      
      // New owner should be user1
      expect(await myNFT.ownerOf(1)).to.equal(user1.address);
    });

    it("Should update tokens owned after transfer", async function () {
      await myNFT.transferFrom(owner.address, user1.address, 1);
      
      const ownerTokens = await myNFT.getTokensOwned();
      const user1Tokens = await myNFT.connect(user1).getTokensOwned();
      
      expect(ownerTokens.length).to.equal(0);
      expect(user1Tokens.length).to.equal(1);
      expect(user1Tokens[0]).to.equal(1);
    });

    it("Should maintain creator mapping after multiple transfers", async function () {
      await myNFT.transferFrom(owner.address, user1.address, 1);
      await myNFT.connect(user1).transferFrom(user1.address, user2.address, 1);
      
      const creator = await myNFT.getTokenCreatorById(1);
      expect(creator).to.equal(owner.address);
      expect(await myNFT.ownerOf(1)).to.equal(user2.address);
    });
  });

  describe("Token Queries", function () {
    beforeEach(async function () {
      await myNFT.connect(user1).safeMint(TOKEN_URI_1);
      await myNFT.connect(user2).safeMint(TOKEN_URI_2);
      await myNFT.connect(user2).safeMint(TOKEN_URI_3);
    });

    it("Should get tokens owned by an address", async function () {
      const tokensOwned = await myNFT.connect(user1).getTokensOwned();
      expect(tokensOwned.length).to.equal(1);
      expect(tokensOwned[0]).to.equal(1);
      
      const addr1Tokens = await myNFT.connect(user2).getTokensOwned();
      expect(addr1Tokens.length).to.equal(2);
      expect(addr1Tokens[0]).to.equal(2);
      expect(addr1Tokens[1]).to.equal(3);
    });

    it("Should get token creator by ID", async function () {
      const creator1 = await myNFT.getTokenCreatorById(1);
      const creator2 = await myNFT.getTokenCreatorById(2);
      
      expect(creator1).to.equal(user1.address);
      expect(creator2).to.equal(user2.address);
    });

    it("Should revert when getting creator for non-existent token", async function () {
      await expect(
        myNFT.getTokenCreatorById(999)
      ).to.be.revertedWith("Token does not exist");
    });

    it("Should validate token IDs correctly", async function () {
      expect(await myNFT.connect(user1).isValidTokenId(1)).to.be.true;
      expect(await myNFT.connect(user2).isValidTokenId(2)).to.be.true;
      expect(await myNFT.connect(user1).isValidTokenId(999)).to.be.false;
    });

    it("Should get tokens created by caller", async function () {
      const tokensCreatedByOwner = await myNFT.getTokensCreated();
      expect(tokensCreatedByOwner.length).to.equal(0);
      
      const tokensCreatedByAddr1 = await myNFT.connect(user2).getTokensCreated();
      expect(tokensCreatedByAddr1.length).to.equal(2);
      expect(tokensCreatedByAddr1[0]).to.equal(2);
      expect(tokensCreatedByAddr1[1]).to.equal(3);
    });
  });
  describe("Interface Support", function () {
    it("should support ERC721, ERC721Enumerable, ERC721URIStorage interfaces", async function () {
      const ERC721_ID = "0x80ac58cd";
      const ERC721Enumerable_ID = "0x780e9d63";
      const ERC721Metadata_ID = "0x5b5e139f";
      expect(await myNFT.supportsInterface(ERC721_ID)).to.be.true;
      expect(await myNFT.supportsInterface(ERC721Enumerable_ID)).to.be.true;
      expect(await myNFT.supportsInterface(ERC721Metadata_ID)).to.be.true;
    });
  });
});