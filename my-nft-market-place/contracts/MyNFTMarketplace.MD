# MyNFTMarketplace Smart Contract Documentation

## Overview

`MyNFTMarketplace` is a decentralized marketplace for ERC721 tokens, specifically designed to work seamlessly with the `MyNFT` contract. It allows users to list, buy, cancel, and relist NFTs. The marketplace charges a listing fee (configurable by the owner) and uses a non‑reentrant pattern to prevent reentrancy attacks.

The contract holds NFTs while they are listed, transfers them upon sale or cancellation, and manages fee collection and distribution.

## Features

- **List NFTs for Sale** – Sellers can list their NFTs with a fixed price by paying a listing fee.
- **Buy NFTs** – Buyers can purchase listed NFTs by sending exactly the listing price.
- **Cancel Listings** – Sellers can cancel their own active listings and get their NFT back (listing fee is not refunded in the standard flow).
- **Relist NFTs** – After a purchase or cancellation, the new owner can relist the same NFT with a new price by paying the listing fee again.
- **Admin Functions** – The marketplace owner can update the listing fee, cancel any listing (with refund to seller), deposit/withdraw contract funds, and manage the contract.
- **Transparent Events** – Every important action emits an event for off‑chain tracking.
- **ERC721Holder** – Inherits OpenZeppelin’s `ERC721Holder` to safely receive NFTs.

## Contract Structure

### Inheritance

- `ReentrancyGuardTransient` – Provides protection against reentrancy attacks using transient storage (cheaper than persistent storage).
- `ERC721Holder` – Required to receive ERC721 tokens via `safeTransferFrom`.

### State Variables

| Variable | Type | Description |
|----------|------|-------------|
| `_nextMarketItemId` | `uint256` | Next unique market item ID (starts at 1). |
| `owner` | `address payable` | Immutable marketplace owner address (set at construction). |
| `listingFee` | `uint256` | Fee (in wei) required to list an NFT. Default is `0.0015 ether`. |
| `_lockedFees` | `uint256` | Total listing fees currently locked in active listings (non‑withdrawable portion of contract balance). |
| `marketItemIdToMarketItem` | `mapping(uint256 => MarketItem)` | Market item ID → `MarketItem` struct. |
| `tokenIdToLatestMarketItemId` | `mapping(address => mapping(uint256 => uint256))` | NFT contract → token ID → latest market item ID. |

### Struct – `MarketItem`

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

| Field | Description |
|-------|-------------|
| `marketItemId` | Unique ID of this listing. |
| `nftContractAddress` | Address of the ERC721 contract. |
| `tokenId` | ID of the NFT. |
| `creator` | Original NFT creator (from `MyNFT` contract). |
| `seller` | Current seller (address that listed the item). |
| `owner` | Current owner – `address(0)` when listed, buyer or seller after sale/cancellation. |
| `price` | Sale price in wei. |
| `listingfee` | Listing fee paid (captured when created). |
| `sold` | Whether the item has been sold. |
| `canceled` | Whether the listing has been canceled. |

### Modifiers

- `onlyOwner` – Restricts access to the marketplace owner.

## Events

| Event | Description |
|-------|-------------|
| `ListingFeeUpdated(uint256 oldPrice, uint256 newPrice, address updatedBy)` | Emitted when the listing fee is changed. |
| `MarketItemCreated(uint256 marketItemId, address nftContract, uint256 tokenId, address creator, address seller, address owner, uint256 price, uint256 listingfee, bool sold, bool canceled)` | Emitted when a new listing is created. |
| `MarketItemCanceled(uint256 marketItemId, address nftContract, uint256 tokenId, address seller)` | Emitted when a listing is canceled (by seller or admin). |
| `MarketItemSold(uint256 marketItemId, address nftContract, uint256 tokenId, address seller, address buyer, uint256 price, uint256 listingFee)` | Emitted when an NFT is purchased. |
| `MarketItemRelisted(uint256 marketItemId, address nftContract, uint256 tokenId, address creator, address seller, address owner, uint256 price, uint256 listingfee, bool sold, bool canceled)` | Emitted when an existing market item is relisted. |
| `OwnerDeposited(address indexed owner, uint256 amount)` | Emitted when the owner deposits ETH into the contract. |

## Functions

### Constructor

```solidity
constructor()
```

- Sets the `owner` to `msg.sender`.
- Initializes `_nextMarketItemId` to 1 (IDs start from 1).

### Admin Functions

#### `updateListingFee(uint256 _newPrice) external onlyOwner`

- Updates the listing fee.
- Requirements: `_newPrice > 0` and different from current fee.
- Emits `ListingFeeUpdated`.

#### `deposit() external payable onlyOwner`

- Allows the owner to deposit ETH into the contract (e.g., to provide withdrawal liquidity). Emits `OwnerDeposited`.

#### `withdrawBalance() public onlyOwner nonReentrant`

- Withdraws the contract’s ETH balance that is **not** locked as listing fees (`address(this).balance - _lockedFees`).
- Safe transfer to owner.

#### `cancelItemListingAndRefundByAdmin(uint256 marketItemId) public onlyOwner nonReentrant`

- Admin‑only cancellation of an active listing.
- Refunds the listing fee to the seller and returns the NFT.
- Requirements: item must be active (`!sold && !canceled && owner == address(0)`).

### User Functions (Listing, Buying, Canceling, Relisting)

#### `createMarketItem(address nftContractAddress, uint256 tokenId, uint256 price) public payable nonReentrant returns (uint256)`

- Creates a new listing.
- Requirements:
  - `price > 0`
  - `msg.value == listingFee`
  - NFT contract supports ERC721 (via `supportsInterface`)
  - Caller owns the NFT (checked via `ownerOf`)
- Transfers the NFT from seller to marketplace.
- Stores the `MarketItem` and records the latest market item ID.
- Emits `MarketItemCreated`.
- Returns the new `marketItemId`.

#### `cancelMarketItem(uint256 marketItemId) public nonReentrant`

- Cancels a listing that the caller created.
- Requirements:
  - Item exists and is active (`!sold && !canceled && owner == address(0)`)
  - `msg.sender == item.seller`
- Effects:
  - Marks item as `canceled`, sets `owner` to seller.
  - Removes listing fee from `_lockedFees`.
- Interactions:
  - Returns NFT to seller.
  - Transfers listing fee to the marketplace **owner** (no refund to seller in this flow).
- Emits `MarketItemCanceled`.

#### `createMarketSale(uint256 marketItemId) public payable nonReentrant`

- Purchases a listed NFT.
- Requirements:
  - Item exists and is active (`!sold && !canceled && owner == address(0)`)
  - `msg.sender != item.seller`
  - `msg.value == item.price`
- Effects:
  - Marks item as `sold`, sets `owner` to buyer, updates `seller` to buyer.
  - Removes listing fee from `_lockedFees`.
- Interactions:
  - Transfers NFT from marketplace to buyer.
  - Transfers sale price to seller.
  - Transfers listing fee to marketplace owner.
- Emits `MarketItemSold`.

#### `relistMarketItem(uint256 marketItemId, uint256 price) public payable nonReentrant`

- Allows the current owner (who bought or canceled the item) to relist it for sale.
- Requirements:
  - `price > 0`, `msg.value == listingFee`
  - Item exists, `item.owner == msg.sender`
  - Caller still owns the NFT (`ownerOf(tokenId)`)
  - Item must have been sold or canceled before (`sold == true || canceled == true`)
- Effects:
  - Updates `seller` to caller, `owner` to `address(0)`, `price` to new price, `listingfee` to current fee, `sold = false`, `canceled = false`.
  - Adds listing fee to `_lockedFees`.
- Interactions:
  - Transfers NFT from caller back to marketplace.
- Emits `MarketItemRelisted`.

### View Functions

#### `getListingFee() public view returns (uint256)`

- Returns the current listing fee.

#### `getLatestMarketItemByTokenId(address nftContractAddress, uint256 tokenId) public view returns (MarketItem memory, bool)`

- Returns the most recent `MarketItem` for a given NFT and a boolean indicating whether it exists.
- If no valid listing is found, returns an empty struct and `false`.

#### `fetchListedMarketItems() public view returns (MarketItem[] memory)`

- Returns all **active** listings (`!sold && !canceled && owner == address(0)`).

#### `fetchOwnedMarketItems() public view returns (MarketItem[] memory)`

- Returns items that the caller “owns” in the marketplace context:
  - Active listings where caller is the seller (`owner == address(0) && seller == msg.sender`), or
  - Canceled items where caller is the `owner` (after cancellation).

#### `fetchOwnSellingMarketItems() public view returns (MarketItem[] memory)`

- Returns active listings where `seller == msg.sender`.

#### `fetchOwnPurchasedMarketItems() public view returns (MarketItem[] memory)`

- Returns items where `owner == msg.sender && sold == true` (items the caller has bought).

#### `getMarketItem(uint256 marketItemId) public view returns (MarketItem memory)`

- Returns the full `MarketItem` struct for a given ID (reverts if ID is invalid).

## Security Considerations

- **Reentrancy Protection** – All sensitive functions (`createMarketItem`, `cancelMarketItem`, `createMarketSale`, `relistMarketItem`, admin cancel, `withdrawBalance`) use the `nonReentrant` modifier.
- **Checks‑Effects‑Interactions Pattern** – Functions update state before making external calls (transfers, NFT transfers).
- **Immutability** – The `owner` address is immutable and set in the constructor.
- **Locked Fees** – `_lockedFees` tracks the sum of listing fees for active listings. Withdrawable balance is `address(this).balance - _lockedFees`, preventing the owner from draining fees that belong to active listings.
- **ERC721 Interface Check** – Ensures the NFT contract supports the required ERC721 interface before accepting a listing.

## Integration with MyNFT

The marketplace explicitly calls `MyNFT(nftContractAddress).getTokenCreatorById(tokenId)` to retrieve the original creator of each NFT. This information is stored in the `MarketItem` struct for reference but is not used for financial logic.

## Example Workflow

1. **Owner** deploys the `MyNFTMarketplace` contract.
2. **User A** mints an NFT via `MyNFT.safeMint()` – this automatically approves the marketplace (due to the NFT’s `autoSyncMarketplaceApproval` modifier).
3. **User A** calls `createMarketItem` with the NFT address, token ID, and price (plus listing fee). The NFT is transferred to the marketplace.
4. **User B** sees the listing and calls `createMarketSale` with the exact price. The NFT is transferred to User B, and User A receives the sale proceeds (minus the listing fee, which goes to the owner).
5. **User B** can later call `relistMarketItem` to put the same NFT up for sale again.

## License

```text
// SPDX-License-Identifier: MIT
```

---

