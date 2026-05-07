# MyNFT Design Document

## Contract Overview
`MyNFT` is a production-grade ERC721 NFT contract with creator tracking, enumerable support, metadata management, and built-in marketplace integration. It is fully compatible with OpenZeppelin 5.x and optimized for gas efficiency and security.

Core Features:
- Secure NFT minting with unique token IDs
- Automatic approval for designated NFT marketplace
- Creator tracking for each NFT
- Query owned NFTs and created NFTs
- Update token URI by original creator (owner-only)
- Admin control to update marketplace address
- Full ERC721 + Enumerable + URIStorage compliance

---

## 1. Constructor
### 1.1 Inputs
- `address _marketplaceAddress` – Official NFT marketplace contract address

### 1.2 Process
1. Initialize ERC721 token with name "MyNFT" and symbol "NFTK"
2. Set contract deployer as owner
3. Validate marketplace address is not zero address
4. Set initial token ID to 1
5. Grant full approval to the marketplace for all NFTs
6. Initialize creator-tracking mappings

### 1.3 Behavior
Deploys the NFT contract and pre-authorizes the marketplace to manage user NFTs.

---

## 2. setMarketplaceAddress()
### 2.1 Inputs
- `address _marketplaceAddress` – New marketplace address

### 2.2 Permissions
Only contract owner

### 2.3 Process
1. Validate new address is not zero address
2. Revoke approval for the old marketplace
3. Update marketplace address
4. Grant approval to the new marketplace
5. Emit `MarketplaceUpdated` event

### 2.4 Behavior
Allows the owner to safely switch the authorized marketplace.

---

## 3. safeMint()
### 3.1 Inputs
- `string memory uri` – Token metadata URI (IPFS or HTTP)

### 3.2 Process
1. Validate URI is not empty
2. Generate new token ID sequentially
3. Safely mint NFT to the caller
4. Record the caller as the token creator
5. Store token ID in creator’s list
6. Set token metadata URI
7. Emit `TokenMinted` event
8. Return new token ID

### 3.3 Behavior
Public mint function that creates a new NFT and tracks its creator.

---

## 4. updateTokenURI()
### 4.1 Inputs
- `uint256 tokenId` – NFT token ID
- `string memory newURI` – New metadata URI

### 4.2 Permissions
Caller must be:
- Current owner of the token
- **AND** original creator of the token

### 4.3 Process
1. Validate caller is token owner
2. Validate caller is original creator
3. Validate new URI is not empty
4. Update token URI
5. No event required (handled by ERC721 standard)

### 4.4 Behavior
Allows creators to update metadata only if they still own the NFT.

---

## 5. getTokensOwned()
### 5.1 Purpose
Returns an array of all token IDs owned by the caller.

### 5.2 Process
1. Get balance of caller
2. Initialize fixed-size array
3. Use `tokenOfOwnerByIndex` (gas-efficient enumerable)
4. Return list of owned token IDs

### 5.3 Behavior
Efficiently lists user-owned NFTs.

---

## 6. getTokenCreatorById()
### 6.1 Inputs
- `uint256 tokenId`

### 6.2 Process
1. Validate token exists
2. Return original creator address

### 6.3 Behavior
Used by marketplace to track original creators.

---

## 7. getTokensCreated()
### 7.1 Purpose
Returns all token IDs created by the caller.

### 7.2 Behavior
Directly returns from mapping for high efficiency.

---

## 8. isValidTokenId()
### 8.1 Inputs
- `uint256 tokenId`

### 8.2 Behavior
Returns `true` if token exists, using internal `_exists()` check.

---

## Data Structures & Mappings

### Private Mappings
```solidity
mapping(uint256 => address) private _creators;
mapping(address => uint256[]) private _tokensByCreator;