# MyNFTMarketplace Design Document

## Contract Overview
The `MyNFTMarketplace` is a decentralized escrow-based NFT marketplace built on ERC721 standards. It enables users to securely list, buy, delist, and resell NFTs while tracking original creators and supporting platform fee management.

Core Features:
- List NFTs for sale with a required listing fee
- Purchase listed NFTs with native ETH
- Batch Buying for gas-efficient multi-NFT purchase
- Delist NFTs and return them to the original lister
- Relist purchased or canceled NFTs
- Query marketplace listings, user-owned items, selling items, and purchased items
- Admin controls for updating fees and withdrawing platform revenue
- Emergency cancel all listings with fee refund

---
## 1. createMarketItem()
### 1.1 Inputs
- `address nftContractAddress` – ERC721 NFT contract address
- `uint256 tokenId` – NFT token ID to list
- `uint256 price` – Sale price in wei
### 1.2 Process
1. Validate price > 0
2. Verify correct listing fee is included
3. Check that the contract implements ERC721 via ERC165
4. Confirm caller is the NFT owner
5. Generate new marketItemId using a counter
6. Fetch original NFT creator from MyNFT contract
7. Create and store a new MarketItem with listing fee
8. Map NFT (contract + tokenId) to the latest marketItemId
9. Transfer NFT from seller to marketplace escrow
10. Emit `MarketItemCreated` event
### 1.3 Behavior
Creates an active marketplace listing held in contract custody; listing fee is collected on creation.

---
## 2. cancelMarketItem()
### 2.1 Input
- `uint256 marketItemId` – ID of the listing to cancel
### 2.2 Process
1. Validate market item exists
2. Restrict access to the original seller
3. Ensure item is not sold, not canceled, and currently listed
4. Update state: `canceled = true`, `owner = msg.sender`
5. Transfer listing fee to marketplace owner
6. Return NFT from marketplace to seller
7. Emit `MarketItemCanceled` event
### 2.3 Behavior
Removes the NFT from sale and returns ownership to the lister; listing fee is sent to marketplace owner.

---
## 3. getLatestMarketItemByTokenId()
### 3.1 Inputs
- `address nftContractAddress`
- `uint256 tokenId`
### 3.2 Process
1. Look up the latest marketItemId for the given NFT
2. If not found, return `EMPTY_MARKET_ITEM` and `false`
3. Otherwise return the MarketItem and `true`
### 3.3 Behavior
Frontend-friendly view function that does not revert on missing listings.

---
## 4. createMarketSale()
### 4.1 Input
- `uint256 marketItemId` – ID of the NFT to purchase
### 4.2 Process
1. Validate market item exists
2. Prevent users from buying their own listings
3. Ensure item is active, unsold, and not canceled
4. Verify payment matches listing price
5. Mark item as sold and set new owner
6. Transfer sale funds to seller
7. Transfer listing fee to marketplace owner
8. Transfer NFT to buyer
9. Emit `MarketItemSold` event
### 4.3 Behavior
Completes a purchase and transfers both NFT and funds; listing fee is sent to marketplace owner.

---
## 5. relistMarketItem()
### 5.1 Inputs
- `uint256 marketItemId` – Existing market item ID
- `uint256 price` – New sale price
### 5.2 Process
1. Validate new price > 0
2. Require correct listing fee
3. Verify market item exists
4. Allow only the current owner to relist
5. Require item to be sold or previously canceled
6. Update market item status to active listing
7. Transfer NFT back into marketplace escrow
8. Emit `MarketItemRelisted` event
### 5.3 Behavior
Enables users to resell NFTs from their collection; charges a new listing fee.

---
## 6. fetchListedMarketItems()
### 6.1 Purpose
Returns all active, unsold, non-canceled marketplace listings.
### 6.2 Filters
- `sold == false`
- `canceled == false`
- `owner == address(0)`
### 6.3 Usage
Display public marketplace inventory.

---
## 7. fetchOwnedMarketItems()
### 7.1 Purpose
Returns items related to the caller: their active listings and canceled items.
### 7.2 Filters
- (Listed AND seller == msg.sender)
- OR (Canceled AND owner == msg.sender)
### 7.3 Usage
Display user’s related marketplace items.

---
## 8. fetchOwnSellingMarketItems()
### 8.1 Purpose
Returns only the user’s currently active selling listings.
### 8.2 Filters
- `seller == msg.sender`
- `owner == address(0)`
### 8.3 Usage
Display user’s active on-sale items.

---
## 9. fetchOwnPurchasedMarketItems()
### 9.1 Purpose
Returns all NFTs the user has purchased.
### 9.2 Filters
- `owner == msg.sender`
- `sold == true`
### 9.3 Usage
Display user’s purchased NFT collection.

---
## 10. updateListingFee()
### 10.1 Input
- `uint256 _newPrice` – New listing fee in wei
### 10.2 Permissions
Owner-only
### 10.3 Process
1. Require new price > 0 and different from current
2. Update listing fee
3. Emit `ListingFeeUpdated` event
### 10.4 Behavior
Updates platform listing fee.

---
## 11. getListingFee()
### 11.1 Output
- `uint256` – Current listing fee
### 11.2 Usage
Frontend display of required fee for listing.

---
## 12. withdrawAllFees()
### 12.1 Permissions
Owner-only
### 12.2 Process
1. Cancel all active listings via internal `_cancelAndRefund`
2. Refund listing fees to sellers and return NFTs
3. Withdraw remaining contract ETH balance to owner
### 12.3 Behavior
Emergency admin function to cancel all listings, refund fees, and withdraw platform revenue.

---
## 13. _cancelAndRefund()
### 13.1 Input
- `uint256 marketItemId` – ID of the listing to cancel and refund
### 13.2 Permissions
Internal only
### 13.3 Process
1. Validate item is active listing
2. Update state: `canceled = true`, `owner = seller`
3. Return NFT to seller
4. Refund listing fee to seller
5. Emit `MarketItemCanceled` event
### 13.4 Behavior
Internal helper for emergency cancel with fee refund.

---
## 14. getMarketItem()
### 14.1 Input
- `uint256 marketItemId` – Market item ID to query
### 14.2 Process
1. Validate market item ID is valid
2. Return corresponding MarketItem struct
### 14.3 Behavior
View function to fetch single market item details.

---
## Data Structure
### MarketItem Struct
```solidity
struct MarketItem {
    uint256 marketItemId;
    address nftContractAddress;
    uint256 tokenId;
    address payable creator;
    address payable seller;
    address payable owner;
    uint256 price;
    uint256 listingfee;
    bool sold;
    bool canceled;
}
```

---
## Security & Guardrails
- Inherits `ReentrancyGuardTransient` and `ERC721Holder`
- Checks-effects-interactions pattern applied
- ERC165 interface validation for ERC721
- Owner-only admin functions
- Non-reentrant modifiers on state-changing functions