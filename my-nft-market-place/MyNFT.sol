// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.6.0
pragma solidity ^0.8.27;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract MyNFT is ERC721, ERC721Enumerable, ERC721URIStorage {
    uint256 private _nextTokenId;

    address private marketplaceAddress;
    // track token creator
    mapping(uint256 => address) private _creators;
    // track tokens created by each address
    mapping(address => uint256[]) private _tokensByCreator;

    event TokenMinted(
        uint256 indexed tokenId,
        string tokenURI,
        address marketplaceAddress
    );

    constructor(address _marketplaceAddress) ERC721("MyNFT", "NFTK") {
        marketplaceAddress = _marketplaceAddress;
    }

    // mint tokenURI
    function safeMint(string memory uri) public returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        _creators[tokenId] = msg.sender;
        _tokensByCreator[msg.sender].push(tokenId);
        _setTokenURI(tokenId, uri);

        // Give the marketplace approval to transact NFTs between users
        setApprovalForAll(marketplaceAddress, true);

        emit TokenMinted(tokenId, uri, marketplaceAddress);

        return tokenId;
    }

    function getTokensOwned() public view returns (uint256[] memory) {
        uint256 numberOfExistingTokens = totalSupply();
        uint256 numberOfTokensOwned = balanceOf(msg.sender);
        uint256[] memory ownedTokenIds = new uint256[](numberOfTokensOwned);

        uint256 currentIndex = 0;
        for (uint256 tokenId = 0; tokenId < numberOfExistingTokens; tokenId++) {
            if (ownerOf(tokenId) != msg.sender) continue;
            ownedTokenIds[currentIndex] = tokenId;
            currentIndex += 1;
        }

        return ownedTokenIds;
    }

    function getTokenCreatorById(
        uint256 tokenId
    ) public view returns (address) {
        return _creators[tokenId];
    }

    function getTokensCreated() public view returns (uint256[] memory) {
        return _tokensByCreator[msg.sender];
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
