# MyNFTMarketplace Design Document

## Contract Overview
The `MyNFTMarketplace` is a decentralized escrow-based NFT marketplace built on ERC721 standards. It enables users to securely list, buy, delist, and resell NFTs while tracking original creators and supporting platform fee management.

Core Features:
- List NFTs for sale with a required listing fee
- Purchase listed NFTs with native ETH
- Delist NFTs and return them to the original lister
- Relist purchased or canceled NFTs
- Query marketplace listings, user-owned items, selling items, and purchased items
- Admin controls for updating fees and withdrawing platform revenue

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
5. Transfer listing fee to marketplace owner
6. Generate new marketItemId using a counter
7. Fetch original NFT creator from MyNFT contract
8. Create and store a new MarketItem
9. Map NFT (contract + tokenId) to the latest marketItemId
10. Transfer NFT from seller to marketplace escrow
11. Emit `MarketItemCreated` event

### 1.3 Behavior
Creates an active marketplace listing held in contract custody.

---

## 2. cancelMarketItem()
### 2.1 Input
- `uint256 marketItemId` – ID of the listing to cancel

### 2.2 Process
1. Validate market item exists
2. Restrict access to the original seller
3. Ensure item is not sold, not canceled, and currently listed
4. Update state: `canceled = true`, `owner = msg.sender`
5. Return NFT from marketplace to seller
6. Emit `MarketItemCanceled` event

### 2.3 Behavior
Removes the NFT from sale and returns ownership to the lister.

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
6. Transfer NFT to buyer
7. Transfer sale funds to seller
8. Emit `MarketItemSold` event

### 4.3 Behavior
Completes a purchase and transfers both NFT and funds.

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
6. Transfer listing fee to owner
7. Reset market item status to active listing
8. Transfer NFT back into marketplace escrow
9. Emit `MarketItemRelisted` event

### 5.3 Behavior
Enables users to resell NFTs from their collection.

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

---

## 8. fetchOwnSellingMarketItems()
### 8.1 Purpose
Returns only the user’s currently active selling listings.

### 8.2 Filters
- `seller == msg.sender`
- `owner == address(0)`

---

## 9. fetchOwnPurchasedMarketItems()
### 9.1 Purpose
Returns all NFTs the user has purchased.

### 9.2 Filters
- `owner == msg.sender`
- `sold == true`

---

## 10. updateListingFee()
### 10.1 Input
- `uint256 _newPrice` – New listing fee in wei

### 10.2 Permissions
Owner-only

### 10.3 Behavior
Updates platform listing fee and emits `ListingFeeUpdated`.

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

### 12.2 Behavior
Withdraws the entire ETH balance of the marketplace contract to the owner.

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
    bool sold;
    bool canceled;
}