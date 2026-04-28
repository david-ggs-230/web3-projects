// SPDX-License-Identifier: MIT

// Compatible with OpenZeppelin Contracts ^5.6.0
pragma solidity ^0.8.28;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {
    ERC721Enumerable
} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {
    ERC721URIStorage
} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract MyNFT is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    address private marketplaceAddress;
    // Store ALL old marketplaces in array for reference (optional)
    address[] private oldMarketplaces;
    // track token creator
    mapping(uint256 => address) private _creators;
    // track tokens created by each address
    mapping(address => uint256[]) private _tokensByCreator;

    event TokenMinted(
        uint256 indexed tokenId,
        string tokenURI,
        address indexed marketplaceAddress
    );
    event MarketplaceUpdated(
        address indexed oldMarketplace,
        address indexed newMarketplace
    );

    // fixed market place for the NFT token
    constructor(
        address _marketplaceAddress
    ) ERC721("MyNFT", "NFTK") Ownable(msg.sender) {
        require(
            _marketplaceAddress != address(0),
            "Marketplace address invalid"
        );
        marketplaceAddress = _marketplaceAddress;
        // Start token IDs from 1
        _nextTokenId = 1;
    }

    /**
     * @dev Owner: Update marketplace address and archive old one
     */
    function setMarketplaceAddress(
        address _marketplaceAddress
    ) external onlyOwner {
        require(
            _marketplaceAddress != address(0),
            "Cannot set to zero address"
        );
        require(
            _marketplaceAddress != marketplaceAddress,
            "Cannot set to same address"
        );
        address oldMarketplace = marketplaceAddress;
        // Save old marketplace to array
        oldMarketplaces.push(oldMarketplace);
        // Update to new marketplace
        marketplaceAddress = _marketplaceAddress;

        emit MarketplaceUpdated(oldMarketplace, marketplaceAddress);
    }

    /**
     * @dev Auto sync approvals: revoke old markets, approve new market
     * @notice CHECKS isApprovedForAll BEFORE calling setApprovalForAll
     */
    modifier autoSyncMarketplaceApproval() {
        // Revoke all previously approved old marketplaces
        uint256 length = oldMarketplaces.length;
        for (uint256 i = 0; i < length; i++) {
            address oldMarket = oldMarketplaces[i];

            if (isApprovedForAll(msg.sender, oldMarket)) {
                setApprovalForAll(oldMarket, false);
            }
        }

        // Approve current marketplace only if not already approved
        if (!isApprovedForAll(msg.sender, marketplaceAddress)) {
            setApprovalForAll(marketplaceAddress, true);
        }
        _;
    }

    // mint tokenURI WITH AUTO SYNC
    function safeMint(
        string memory uri
    ) public autoSyncMarketplaceApproval returns (uint256) {
        require(bytes(uri).length > 0, "URI cannot be empty");
        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        _creators[tokenId] = msg.sender;
        _tokensByCreator[msg.sender].push(tokenId);
        _setTokenURI(tokenId, uri);

        emit TokenMinted(tokenId, uri, marketplaceAddress);

        return tokenId;
    }

    //Token URI Update Function
    //AUTO SYNC ON USER ACTIONS
    function updateTokenURI(
        uint256 tokenId,
        string memory newURI
    ) external autoSyncMarketplaceApproval {
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        require(
            _creators[tokenId] == msg.sender,
            "Only creator can update URI"
        );
        require(bytes(newURI).length > 0, "New URI cannot be empty");
        _setTokenURI(tokenId, newURI);
    }

    // Manual 1-click approval sync for existing holders
    function syncMarketplaceApproval() external autoSyncMarketplaceApproval {}

    // VIEW: Get all old marketplaces (owner only)
    function getOldMarketplaces()
        external
        view
        onlyOwner
        returns (address[] memory)
    {
        return oldMarketplaces;
    }

    function getTokensOwned() public view returns (uint256[] memory) {
        uint256 numberOfTokensOwned = balanceOf(msg.sender);
        uint256[] memory ownedTokenIds = new uint256[](numberOfTokensOwned);

        for (uint256 i = 0; i < numberOfTokensOwned; i++) {
            ownedTokenIds[i] = tokenOfOwnerByIndex(msg.sender, i);
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
