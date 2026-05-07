# MyNFT & MyNFTMarketplace Contracts

This document provides a high‑level summary of two interconnected smart contracts: **MyNFT** (an ERC721 token contract) and **MyNFTMarketplace** (a marketplace for trading those tokens).

---

## 1. MyNFT Contract

### Purpose
A custom ERC721 NFT contract with built‑in marketplace approval management and creator tracking.

### Key Features
- **ERC721 with extensions** – Implements `ERC721Enumerable`, `ERC721URIStorage`, and `Ownable`.
- **Creator tracking** – Records the original creator of each token. Only the creator can update the token’s metadata URI.
- **Dynamic marketplace address** – The contract owner can update the trusted marketplace address. Old addresses are archived.
- **Automatic approval sync** – The modifier `autoSyncMarketplaceApproval` automatically:
  - Revokes “approve for all” for all old marketplaces.
  - Approves the current marketplace (if not already approved).
- **Minting** – `safeMint()` creates a new NFT, sets its URI, records the creator, and syncs marketplace approvals.
- **URI update** – `updateTokenURI()` only callable by the original creator.
- **Helper views** – Get tokens owned, tokens created, creator by token ID, etc.

### Integration with Marketplace
The contract is designed to work with `MyNFTMarketplace`. When a user mints an NFT, the marketplace is automatically approved, so the user can list the token without any additional approval step.

---

## 2. MyNFTMarketplace Contract

### Purpose
A decentralized marketplace that allows listing, buying, canceling, and relisting ERC721 tokens – specifically compatible with `MyNFT`.

### Key Features
- **Listing NFTs** – Sellers pay a listing fee (`listingFee`) and transfer the NFT to the marketplace.
- **Buying NFTs** – Buyers send the exact sale price; the marketplace forwards the payment to the seller and transfers the NFT.
- **Canceling listings** – Sellers can cancel their own active listings (listing fee is sent to the marketplace owner, not refunded). Admins can cancel any listing with a full fee refund.
- **Relisting** – After a sale or cancellation, the new owner can relist the same NFT by paying the listing fee again.
- **Fee management** – The marketplace owner can update the listing fee, deposit ETH, and withdraw unallocated contract balance (`balance - lockedFees`).
- **Reentrancy protection** – Uses `ReentrancyGuardTransient` on all state‑changing functions.
- **View functions** – Fetch active listings, owned items, user’s selling items, user’s purchased items, and the latest listing for a given NFT.

### Core Data Structure
```solidity
struct MarketItem {
    uint256 marketItemId;
    address nftContractAddress;
    uint256 tokenId;
    address payable creator;   // from MyNFT.getTokenCreatorById()
    address payable seller;
    address payable owner;     // address(0) when listed
    uint256 price;
    uint256 listingfee;
    bool sold;
    bool canceled;
}
```

---

## 3. How They Work Together

1. **User mints an NFT** using `MyNFT.safeMint()`.  
   - The NFT contract automatically approves `MyNFTMarketplace` (via `autoSyncMarketplaceApproval`).

2. **User lists the NFT** by calling `MyNFTMarketplace.createMarketItem()`.  
   - The marketplace verifies ownership and ERC721 support.  
   - The NFT is transferred to the marketplace.  
   - A `MarketItem` is created with `owner = address(0)` (active listing).

3. **Another user buys the NFT** via `createMarketSale()`.  
   - The marketplace transfers the NFT to the buyer.  
   - The sale price goes to the seller.  
   - The listing fee goes to the marketplace owner.

4. **The buyer can relist** using `relistMarketItem()`.  
   - The NFT is transferred back to the marketplace.  
   - A new listing fee is paid.  
   - The same `marketItemId` is reused (status updated).

5. **Cancellation** – If the seller cancels, the NFT is returned and the listing fee is sent to the owner. The admin can cancel any listing and refund the fee to the seller.

---

## 4. Security & Design Highlights

| Contract | Security Feature |
|----------|------------------|
| MyNFT | Auto‑approval sync prevents stale marketplace approvals; only creator can change URI. |
| MyNFTMarketplace | Checks‑effects‑interactions pattern; reentrancy guard; locked fees prevent owner from draining active listing fees. |

---

## 5. Deployment & Usage Flow

```text
[Deploy MyNFT] --> [Deploy MyNFTMarketplace] 
         |                    |
         +--> Set marketplace address in MyNFT constructor
         +--> (Optional) Owner updates listing fee in marketplace

User A: mint NFT (MyNFT.safeMint)
User A: list NFT (MyNFTMarketplace.createMarketItem)  [pays listing fee]
User B: buy NFT  (MyNFTMarketplace.createMarketSale)   [pays sale price]
User B: relist NFT (MyNFTMarketplace.relistMarketItem) [pays listing fee again]
```

---

## 6. License

Both contracts are released under the **MIT License**.

---
