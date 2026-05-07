// SPDX-License-Identifier: MIT

// Overview of the Contract
// Listing NFTs for Sale - Users can list their NFTs with a specified price, which gets stored securely in the contract.
// Buying NFTs - Buyers can purchase listed NFTs by sending the required Ether, ensuring proper value exchange.
// Delisting NFTs - NFT owners can delist their tokens and return them to their wallets.

pragma solidity ^0.8.28;

import "./MyNFT.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/interfaces/IERC165.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
//import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuardTransient.sol";

contract MyNFTMarketplace is ReentrancyGuardTransient, ERC721Holder {
    uint256 private _nextMarketItemId;

    address payable private immutable owner;
    uint256 private listingFee = 0.0015 ether;
    uint256 private _lockedFees;

    // MarketItemId => MarketItem
    mapping(uint256 => MarketItem) private marketItemIdToMarketItem;
    // NFT Contract => Token ID => MarketItemId
    mapping(address => mapping(uint256 => uint256))
        public tokenIdToLatestMarketItemId;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only marketplace owner can call this");
        _;
    }

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

    // Events for transparency
    event ListingFeeUpdated(
        uint256 oldPrice,
        uint256 newPrice,
        address updatedBy
    );

    event MarketItemCreated(
        uint256 indexed marketItemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address creator,
        address seller,
        address owner,
        uint256 price,
        uint256 listingfee,
        bool sold,
        bool canceled
    );

    event MarketItemCanceled(
        uint256 indexed marketItemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller
    );

    event MarketItemSold(
        uint256 indexed marketItemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address buyer,
        uint256 price,
        uint256 listingFee
    );

    event MarketItemRelisted(
        uint256 indexed marketItemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address creator,
        address seller,
        address owner,
        uint256 price,
        uint256 listingfee,
        bool sold,
        bool canceled
    );

    event OwnerDeposited(address indexed owner, uint256 amount);

    constructor() {
        owner = payable(msg.sender);
        _nextMarketItemId = 1; // Start IDs from 1
    }

    /**
     * @dev Updates the marketplace listing fee
     * @param _newPrice The new listing price in wei
     * Requirements:
     * - Only callable by contract owner
     * - New price must be greater than 0
     */
    function updateListingFee(uint256 _newPrice) public onlyOwner {
        require(_newPrice > 0, "Listing price must be greater than 0");
        require(_newPrice != listingFee, "New price same as current");

        uint256 oldPrice = listingFee;
        listingFee = _newPrice;

        emit ListingFeeUpdated(oldPrice, _newPrice, msg.sender);
    }

    function getListingFee() public view returns (uint256) {
        return listingFee;
    }

    /**
     * @dev Creates a market item listing, requiring a listing fee and transfering the NFT token from
     * msg.sender to the marketplace contract.
     */
    function createMarketItem(
        address nftContractAddress,
        uint256 tokenId,
        uint256 price
    ) public payable nonReentrant returns (uint256) {
        // Validations
        require(price > 0, "Price must be at least 1 wei");
        require(msg.value == listingFee, "Incorrect listing fee amount");

        // Verify NFT contract supports ERC721
        // require(
        //     IERC165(nftContractAddress).supportsInterface(0x80ac58cd),
        //     "Contract must be ERC721"
        // );
        // Use standard ERC721 interface ID instead of hardcoded bytes
        require(
            IERC165(nftContractAddress).supportsInterface(
                type(IERC721).interfaceId
            ),
            "Contract must be ERC721"
        );
        // Verify caller owns the NFT
        require(
            IERC721(nftContractAddress).ownerOf(tokenId) == msg.sender,
            "Only token owner can list"
        );

        //get market item ID for the new listing and increment the counter for the next listing
        uint256 marketItemId = _nextMarketItemId;
        _nextMarketItemId++;

        address creator = MyNFT(nftContractAddress).getTokenCreatorById(
            tokenId
        );

        // Store market item
        marketItemIdToMarketItem[marketItemId] = MarketItem(
            marketItemId,
            nftContractAddress,
            tokenId,
            payable(creator),
            payable(msg.sender),
            payable(address(0)),
            price,
            listingFee,
            false,
            false
        );

        // Update the mapping with the latest market item ID for this NFT
        tokenIdToLatestMarketItemId[nftContractAddress][tokenId] = marketItemId;

        _lockedFees += listingFee;
        // Transfer NFT to marketplace
        IERC721(nftContractAddress).safeTransferFrom(
            msg.sender,
            address(this),
            tokenId
        );
        emit MarketItemCreated(
            marketItemId,
            nftContractAddress,
            tokenId,
            payable(creator),
            payable(msg.sender),
            payable(address(0)),
            price,
            listingFee,
            false,
            false
        );

        return marketItemId;
    }

    /**
     * @dev Cancel a market item listing
     * @param marketItemId The ID of the market item to cancel
     */
    function cancelMarketItem(uint256 marketItemId) public nonReentrant {
        // 1. VALIDATION CHECKS
        // marketItemId should be valid and exist
        require(
            marketItemId > 0 && marketItemId < _nextMarketItemId,
            "Market item does not exist"
        );

        MarketItem storage item = marketItemIdToMarketItem[marketItemId];

        require(item.seller == msg.sender, "Only the seller can cancel");
        require(!item.sold, "Cannot cancel a sold item");
        require(!item.canceled, "Item already canceled");
        require(item.owner == address(0), "Item not currently listed");

        // 2. EFFECTS (Update state first)
        item.canceled = true;
        item.owner = payable(msg.sender);

        // 3. INTERACTIONS (External calls last)

        _lockedFees -= item.listingfee;
        // Return NFT to seller
        IERC721(item.nftContractAddress).safeTransferFrom(
            address(this),
            msg.sender,
            item.tokenId
        );
        // Transfer listing fee to marketplace owner OR refund listing fee to seller if possible
        // Transfer listing fee to marketplace owner
        (bool feeTransfer, ) = owner.call{value: item.listingfee}("");
        require(feeTransfer, "Fee transfer failed");
        //  OR refund listing fee to seller
        // (bool feeRefund, ) = payable(msg.sender).call{value: item.listingfee}("");
        // require(feeRefund, "Fee refund failed");

        // 4. EMIT EVENT
        emit MarketItemCanceled(
            marketItemId,
            item.nftContractAddress,
            item.tokenId,
            msg.sender
        );
    }

    /**
     * @dev Get Latest Market Item by the token id
     */
    function getLatestMarketItemByTokenId(
        address nftContractAddress,
        uint256 tokenId
    ) public view returns (MarketItem memory, bool) {
        uint256 marketItemId = tokenIdToLatestMarketItemId[nftContractAddress][
            tokenId
        ];

        // marketItemId should be valid and exist
        if (marketItemId > 0 && marketItemId < _nextMarketItemId) {
            return (marketItemIdToMarketItem[marketItemId], true);
        }

        // What is the best practice for returning a "null" value in solidity?
        // Reverting does't seem to be the best approach as it would throw an error on frontend
        return (
            MarketItem(
                0,
                address(0),
                0,
                payable(address(0)),
                payable(address(0)),
                payable(address(0)),
                0,
                0,
                false,
                false
            ),
            false
        );
    }

    /**
     * @dev Creates a market sale by transfering msg.sender money to the seller and NFT token from the
     * marketplace to the msg.sender.
     */
    function createMarketSale(
        uint256 marketItemId
    ) public payable nonReentrant {
        // 1. VALIDATION CHECKS
        // marketItemId should be valid and exist
        require(
            marketItemId > 0 && marketItemId < _nextMarketItemId,
            "Market item does not exist"
        );

        MarketItem storage item = marketItemIdToMarketItem[marketItemId];

        require(item.seller != msg.sender, "Cannot buy your own item");
        require(!item.sold, "Item already sold");
        require(!item.canceled, "Item was canceled");
        require(item.owner == address(0), "Item not currently listed");
        require(msg.value == item.price, "Incorrect payment amount");

        // 2. EFFECTS (Update state FIRST)
        address payable seller = item.seller;
        address nftContract = item.nftContractAddress;
        uint256 tokenId = item.tokenId;
        uint256 price = item.price;

        item.sold = true;
        item.owner = payable(msg.sender);
        item.seller = payable(msg.sender); // Update seller to buyer
        _lockedFees -= item.listingfee;
        // 3. INTERACTIONS (External calls LAST)
        // Transfer NFT to buyer
        IERC721(nftContract).safeTransferFrom(
            address(this),
            msg.sender,
            tokenId
        );
        // Transfer sale proceeds to seller
        (bool sellerTransfer, ) = seller.call{value: price}("");
        require(sellerTransfer, "Seller payment failed");
        // Transfer listing fee to marketplace owner
        (bool feeTransfer, ) = owner.call{value: item.listingfee}("");
        require(feeTransfer, "Fee transfer failed");

        // 4. EMIT EVENT
        emit MarketItemSold(
            marketItemId,
            nftContract,
            tokenId,
            seller,
            msg.sender,
            price,
            item.listingfee
        );
    }

    /**
     * @dev allows someone to resell a NFT market item they have purchased.
     */
    function relistMarketItem(
        uint256 marketItemId,
        uint256 price
    ) public payable nonReentrant {
        // 1. VALIDATION CHECKS
        require(price > 0, "Price must be greater than 0");
        require(msg.value == listingFee, "Incorrect listing fee amount");
        // marketItemId should be valid and exist
        require(
            marketItemId > 0 && marketItemId < _nextMarketItemId,
            "Market item does not exist"
        );

        MarketItem storage item = marketItemIdToMarketItem[marketItemId];

        require(
            item.owner == msg.sender,
            "Only item owner can perform this operation"
        );

        // Verify caller owns the NFT
        require(
            IERC721(item.nftContractAddress).ownerOf(item.tokenId) ==
                msg.sender,
            "Only token owner can list"
        );

        require(
            item.sold == true || item.canceled == true,
            "Item must be purchased or canceled before relisting"
        );
        // 2. EFFECTS (Update state FIRST)

        // Update market item
        item.seller = payable(msg.sender);
        item.owner = payable(address(0)); // No owner yet
        item.price = price;
        item.listingfee = listingFee;
        item.sold = false; // Actually, better to mark it as "relisted"
        item.canceled = false; // Or add a new status like "replaced"

        // 3. INTERACTIONS (External calls LAST)

        _lockedFees += listingFee;

        // Transfer NFT from seller back to marketplace
        IERC721(item.nftContractAddress).safeTransferFrom(
            msg.sender,
            address(this),
            item.tokenId
        );
        // 4. EMIT EVENT
        emit MarketItemRelisted(
            item.marketItemId,
            item.nftContractAddress,
            item.tokenId,
            item.creator,
            payable(msg.sender),
            payable(address(0)),
            price,
            listingFee,
            false,
            false
        );
    }
    /**
     * @dev Fetch non sold and non canceled market items
     */
    function fetchListedMarketItems()
        public
        view
        returns (MarketItem[] memory)
    {
        //total market items ever created (including sold and canceled)
        uint256 totalItemCount = _nextMarketItemId - 1;
        if (totalItemCount == 0) {
            return new MarketItem[](0);
        }
        MarketItem[] memory temp = new MarketItem[](totalItemCount);
        uint256 itemCount = 0;
        for (uint256 i = 1; i <= totalItemCount; i++) {
            MarketItem storage item = marketItemIdToMarketItem[i];
            if (!item.sold && !item.canceled && item.owner == address(0)) {
                temp[itemCount] = item;
                itemCount++;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint256 i = 0; i < itemCount; i++) {
            items[i] = temp[i];
        }

        return items;
    }

    /**
     * @dev Fetch market items that are owned by the user:
     * owner is msg.sender (for canceled item) OR address(0) (for list item with seller=msg.sender)
     */
    function fetchOwnedMarketItems() public view returns (MarketItem[] memory) {
        //uint256 totalItemCount = _nextMarketItemId.current();
        uint256 totalItemCount = _nextMarketItemId - 1;

        // early return for empty marketplace to save gas
        if (totalItemCount == 0) {
            return new MarketItem[](0);
        }

        uint256 itemCount = 0;
        MarketItem[] memory temp = new MarketItem[](totalItemCount);

        // Single pass: collect matching items
        for (uint256 i = 1; i <= totalItemCount; i++) {
            MarketItem storage item = marketItemIdToMarketItem[i];
            if (
                (item.owner == address(0) && item.seller == msg.sender) ||
                (item.canceled && item.owner == msg.sender)
            ) {
                temp[itemCount++] = item;
            }
        }

        // Second pass: Resize to exact size
        MarketItem[] memory items = new MarketItem[](itemCount);

        for (uint256 i = 0; i < itemCount; i++) {
            items[i] = temp[i];
        }

        return items;
    }

    /**
     * @dev Fetch market items that are being listed by the seller(msg.sender)
     */
    function fetchOwnSellingMarketItems()
        public
        view
        returns (MarketItem[] memory)
    {
        //total market items ever created (including sold and canceled)
        uint256 totalItemCount = _nextMarketItemId - 1;

        if (totalItemCount == 0) {
            return new MarketItem[](0);
        }

        MarketItem[] memory temp = new MarketItem[](totalItemCount);
        uint256 itemCount = 0;
        for (uint256 i = 1; i <= totalItemCount; i++) {
            MarketItem storage item = marketItemIdToMarketItem[i];
            if (item.seller == msg.sender && item.owner == address(0)) {
                temp[itemCount] = item;
                itemCount++;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint256 i = 0; i < itemCount; i++) {
            items[i] = temp[i];
        }

        return items;
    }

    /**
     * @dev Fetch market items that are being purchased by the user(msg.sender)
     */
    function fetchOwnPurchasedMarketItems()
        public
        view
        returns (MarketItem[] memory)
    {
        //total market items ever created (including sold and canceled)
        uint256 totalItemCount = _nextMarketItemId - 1;
        if (totalItemCount == 0) {
            return new MarketItem[](0);
        }
        // Count and collect in one pass with temp array
        MarketItem[] memory temp = new MarketItem[](totalItemCount);
        uint256 itemCount = 0;

        for (uint256 i = 1; i <= totalItemCount; i++) {
            MarketItem storage item = marketItemIdToMarketItem[i];
            if (item.owner == msg.sender && item.sold) {
                temp[itemCount] = item;
                itemCount++;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint256 i = 0; i < itemCount; i++) {
            items[i] = temp[i];
        }

        return items;
    }

    function getMarketItem(
        uint256 marketItemId
    ) public view returns (MarketItem memory) {
        require(
            marketItemId > 0 && marketItemId < _nextMarketItemId,
            "Invalid ID"
        );
        return marketItemIdToMarketItem[marketItemId];
    }

    /**
     * @dev Allows the owner to cancel a specific active listing and refund the listing fee to the seller.
     *      Only callable by the marketplace owner.
     */
    function cancelItemListingAndRefundByAdmin(
        uint256 marketItemId
    ) public onlyOwner nonReentrant {
        require(
            marketItemId > 0 && marketItemId < _nextMarketItemId,
            "Invalid ID"
        );
        MarketItem storage item = marketItemIdToMarketItem[marketItemId];
        require(
            !item.sold && !item.canceled && item.owner == address(0),
            "Inactive item cannot be canceled"
        );
        _cancelAndRefund(marketItemId);
    }
    // Only the owner can call this function and send ETH to the contract
    function deposit() external payable onlyOwner {
        // ETH is automatically transferred to the contract via msg.value
        require(msg.value > 0, "Must send some ETH");
        emit OwnerDeposited(msg.sender, msg.value);
    }
    /**
     * @dev Allows the owner to withdraw the contract’s ETH balance without touching any listings.
     *      Only callable by the marketplace owner.
     */
    function withdrawBalance() public onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > _lockedFees, "No withdrawable funds");
        uint256 withdrawable = balance - _lockedFees;
        (bool success, ) = owner.call{value: withdrawable}("");
        require(success, "Transfer failed");
    }
    /**
     * @dev Internal function to cancel a single active listing and refund the listing fee to the seller.
     *      Does not check `msg.sender` because it is only called from `withdrawAllFees`.
     * @param marketItemId The ID of the market item to cancel.
     */
    function _cancelAndRefund(uint256 marketItemId) internal {
        MarketItem storage item = marketItemIdToMarketItem[marketItemId];
        require(
            !item.sold && !item.canceled && item.owner == address(0),
            "Item not active"
        );

        address payable seller = item.seller;

        // Update state
        item.canceled = true;
        item.owner = seller; // The seller regains ownership in the contract's record

        _lockedFees -= item.listingfee;
        // Return NFT to seller
        IERC721(item.nftContractAddress).safeTransferFrom(
            address(this),
            seller,
            item.tokenId
        );
        // Refund listing fee to seller (not to the owner)
        (bool feeRefund, ) = seller.call{value: item.listingfee}("");
        require(feeRefund, "Fee refund failed");

        emit MarketItemCanceled(
            marketItemId,
            item.nftContractAddress,
            item.tokenId,
            seller
        );
    }
}
