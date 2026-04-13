// SPDX-License-Identifier: MIT

// Compatible with OpenZeppelin Contracts ^5.6.0
pragma solidity ^0.8.28;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract MyNFT is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    address private marketplaceAddress;
    // track token creator
    mapping(uint256 => address) private _creators;
    // track tokens created by each address
    mapping(address => uint256[]) private _tokensByCreator;

    event TokenMinted(
        uint256 indexed tokenId,
        string tokenURI,
        address indexed marketplaceAddress
    );
    event MarketplaceUpdated(address indexed oldMarketplace, address indexed newMarketplace);
    
    // fixed market place for the NFT token 
    constructor(address _marketplaceAddress) ERC721("MyNFT", "NFTK") Ownable(msg.sender) {
        require(_marketplaceAddress != address(0), "Marketplace address invalid");
        marketplaceAddress = _marketplaceAddress;
        // Start token IDs from 1
        _nextTokenId = 1;
        
        // Set approval once during deployment
        setApprovalForAll(marketplaceAddress, true);
    }
    
    function setMarketplaceAddress(address _marketplaceAddress) external onlyOwner {
        require(_marketplaceAddress != address(0), "Cannot set to zero address");
        require(_marketplaceAddress != marketplaceAddress, "Cannot set to same address");
        address oldMarketplace = marketplaceAddress;
        // Revoke old approval
        if (marketplaceAddress != address(0)) {
            setApprovalForAll(marketplaceAddress, false);
        }
        
        marketplaceAddress = _marketplaceAddress;
        // Set new approval
        setApprovalForAll(marketplaceAddress, true);
        
        emit MarketplaceUpdated(oldMarketplace, marketplaceAddress);
    }

    // mint tokenURI
    function safeMint(string memory uri) public returns (uint256) {
        require(bytes(uri).length > 0, "URI cannot be empty");
        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        _creators[tokenId] = msg.sender;
        _tokensByCreator[msg.sender].push(tokenId);
        _setTokenURI(tokenId, uri);

        // Give the marketplace approval to transact NFTs between users
        // Each mint calls setApprovalForAll(marketplaceAddress, true), which is redundant and wastes gas
        // Set approval once, typically in constructor or on marketplace change:
        // setApprovalForAll(marketplaceAddress, true);

        emit TokenMinted(tokenId, uri, marketplaceAddress);

        return tokenId;
    }
    
    //Token URI Update Function 
    function updateTokenURI(uint256 tokenId, string memory newURI) external {
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        require(_creators[tokenId] == msg.sender, "Only creator can update URI");
        require(bytes(newURI).length > 0, "New URI cannot be empty");
        _setTokenURI(tokenId, newURI);
    }
    
    function getTokensOwned() public view returns (uint256[] memory) {
        uint256 numberOfTokensOwned = balanceOf(msg.sender);
        uint256[] memory ownedTokenIds = new uint256[](numberOfTokensOwned);

        for (uint256 i = 0; i < numberOfTokensOwned; i++) {
            ownedTokenIds[i] =  tokenOfOwnerByIndex(msg.sender, i);
        }
        return ownedTokenIds;
    }

    function getTokenCreatorById(
        uint256 tokenId
    ) public view returns (address) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return _creators[tokenId];
    }

    function getTokensCreated() public view returns (uint256[] memory) {
        return _tokensByCreator[msg.sender];
    }
    
    // Helper function to check if a token ID is valid (not zero)
    function isValidTokenId(uint256 tokenId) public view returns (bool) {
        return (_ownerOf(tokenId) != address(0));
    }
    
    // The following functions are overrides required by Solidity.

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721, ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(
        address account,
        uint128 value
    ) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
