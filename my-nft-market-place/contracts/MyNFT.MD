# MyNFT Smart Contract Documentation

## Overview

`MyNFT` is an ERC721-compliant non-fungible token (NFT) contract that integrates OpenZeppelin’s `ERC721Enumerable`, `ERC721URIStorage`, and `Ownable` extensions. It supports dynamic marketplace contract address management and automatically synchronizes user approvals (`setApprovalForAll`) with the marketplace, making it easy to interact with decentralized marketplaces.

## Features

- **NFT Minting**: Users can safely mint NFTs with metadata URIs.
- **Marketplace Address Management**: The contract owner can update the marketplace contract address; old addresses are archived.
- **Automatic Approval Sync**: When minting or updating a token URI, the contract automatically revokes approvals for all old marketplaces and approves the current marketplace – no manual approval needed.
- **Creator Tracking**: Records the creator of each NFT and maintains a list of token IDs created by each address.
- **Token Queries**: Users can query tokens they own, tokens they created, and other useful information.
- **URI Update**: Only the original creator can update the metadata URI of an NFT.

## Contract Structure

### Inheritance

- `ERC721` – Base NFT implementation.
- `ERC721Enumerable` – Supports token enumeration (e.g., `totalSupply`, `tokenOfOwnerByIndex`).
- `ERC721URIStorage` – Stores token URIs independently.
- `Ownable` – Access control; `onlyOwner` modifier for administrative functions.

### State Variables

| Variable | Type | Description |
|----------|------|-------------|
| `_nextTokenId` | `uint256` | Next token ID to be minted (starts at 1). |
| `marketplaceAddress` | `address` | Currently approved marketplace contract address. |
| `oldMarketplaces` | `address[]` | Array of historical marketplace addresses (for reference). |
| `_creators` | `mapping(uint256 => address)` | Token ID → creator address. |
| `_tokensByCreator` | `mapping(address => uint256[])` | Address → list of token IDs created by that address. |

### Events

- `TokenMinted(uint256 indexed tokenId, string tokenURI, address indexed marketplaceAddress)`  
  Emitted when a new token is successfully minted.
- `MarketplaceUpdated(address indexed oldMarketplace, address indexed newMarketplace)`  
  Emitted when the marketplace address is changed.

### Modifier

- `autoSyncMarketplaceApproval`  
  Before executing the target function:
  1. Iterates over all old marketplace addresses. If the caller has "approve for all" (`isApprovedForAll`) set for an old marketplace, it revokes it (sets to `false`).
  2. If the caller has not yet approved the current marketplace, it grants approval (sets to `true`).  
  This modifier ensures the caller’s approval status with the marketplace is always correct. It is applied to `safeMint`, `updateTokenURI`, and `syncMarketplaceApproval`.

## Functions

### Constructor

```solidity
constructor(address _marketplaceAddress) ERC721("MyNFT", "NFTK") Ownable(msg.sender)
```

- Sets token name to `"MyNFT"` and symbol to `"NFTK"`.
- Sets the initial marketplace address (must not be zero).
- Initializes `_nextTokenId` to 1 (token IDs start from 1).

### Administrative Functions

#### `setMarketplaceAddress(address _marketplaceAddress) external onlyOwner`

- Updates the current marketplace address.
- New address must be non-zero and different from the current one.
- Pushes the old address into the `oldMarketplaces` array.
- Emits a `MarketplaceUpdated` event.

### User Functions

#### `safeMint(string memory uri) public autoSyncMarketplaceApproval returns (uint256)`

- Mints a new NFT.
- URI cannot be empty.
- The caller becomes the owner of the new token.
- Records the creator and updates `_tokensByCreator`.
- Calls `_setTokenURI` to store the URI.
- Emits a `TokenMinted` event.
- Returns the newly minted token ID.

#### `updateTokenURI(uint256 tokenId, string memory newURI) external autoSyncMarketplaceApproval`

- Updates the URI of an existing token.
- Can only be called by the token’s **creator** (not necessarily the current owner).
- The new URI cannot be empty.
- Calls `_setTokenURI` internally.

#### `syncMarketplaceApproval() public autoSyncMarketplaceApproval`

- Manually triggers approval synchronization (revokes old marketplace approvals and approves the current marketplace).

### View Functions

#### `getOldMarketplaces() external view onlyOwner returns (address[] memory)`

- Returns the array of historical marketplace addresses (owner only).

#### `getTokensOwned() public view returns (uint256[] memory)`

- Returns the list of token IDs owned by `msg.sender`.

#### `getTokenCreatorById(uint256 tokenId) public view returns (address)`

- Returns the creator address for a given token ID.
- Requires the token to exist (`_ownerOf(tokenId) != address(0)`).

#### `getTokensCreated() public view returns (uint256[] memory)`

- Returns the list of token IDs created by `msg.sender`.

#### `isValidTokenId(uint256 tokenId) public view returns (bool)`

- Checks whether a token ID exists (i.e., has not been burned).

### Overrides

The contract overrides the following functions to support multiple inheritance correctly:

- `_update`
- `_increaseBalance`
- `tokenURI`
- `supportsInterface`

Each override uses `super` to call the appropriate parent contract logic, following OpenZeppelin’s guidelines.

## Usage Notes

1. **Automatic Marketplace Approval Sync**  
   The `autoSyncMarketplaceApproval` modifier is applied to minting, URI updates, and the manual sync function. Whenever a user performs these actions, the contract automatically revokes approvals for all old marketplaces and ensures the current marketplace is approved. If the marketplace address is changed, users do not need to manually adjust approvals – the next operation will sync automatically.

2. **Creator-Only URI Updates**  
   Only the original creator of an NFT can update its metadata URI, even if the token has been transferred to someone else. This ensures that the creator retains control over the token’s metadata.

3. **Token ID Start**  
   Token IDs start at 1 (not 0) to avoid ambiguity.

4. **Historical Marketplace Addresses**  
   Old marketplace addresses are stored only for the purpose of revoking approvals. The contract does not actively interact with them.

## Example Workflow

### Deployment & Setup

1. Deploy `MyNFT` contract, passing the marketplace contract address (e.g., `0xMarket...`) to the constructor.
2. If the marketplace needs to be changed, the owner calls `setMarketplaceAddress(0xNewMarket...)`.

### User Mints an NFT

1. User calls `safeMint("https://my-json-server/metadata/1")`.
2. The `autoSyncMarketplaceApproval` modifier:
   - Revokes any approvals for old marketplaces (if any).
   - Approves the current marketplace (if not already approved).
3. Token ID 1 is minted and assigned to the user.
4. Creator information is stored.

### User Updates URI

1. User calls `updateTokenURI(1, "https://new-uri/metadata/1")`.
2. The modifier syncs approvals again.
3. If the caller is the creator, the URI is updated; otherwise, the transaction reverts.

## Security Considerations

- The marketplace address can only be changed by the contract owner and cannot be set to the zero address.
- The auto‑sync logic revokes approvals for **all** previously used marketplace addresses, preventing outdated marketplaces from having operational permissions.
- URI updates are restricted to the original creator to prevent metadata tampering after a token has been transferred.

## License

```text
// SPDX-License-Identifier: MIT
```

---
