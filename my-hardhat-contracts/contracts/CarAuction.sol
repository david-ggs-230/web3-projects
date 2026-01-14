//https://github.com/PacktPublishing/Blockchain-By-Example/blob/master/chapter4/Car_Auction/auction.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Auction {
    address internal auction_owner;
    uint256 public auction_start;
    uint256 public auction_end;
    uint256 public highestBid;
    address public highestBidder;

    bool ended;

    enum auction_state {
        CANCELLED,
        STARTED,
        ENDED
    }

    struct car {
        string Brand;
        string Rnumber;
        address payable owner;
    }

    car public Mycar;
    address[] public bidders;

    mapping(address => uint) public bids;
    mapping(address => bool) public isBidder;

    auction_state public STATE;

    modifier an_ongoing_auction() {
        require(block.timestamp <= auction_end, "Auction ended");
        require(STATE == auction_state.STARTED, "Auction not active");
        _;
    }

    modifier only_owner() {
        require(msg.sender == auction_owner, "Not owner");
        _;
    }

    modifier auction_ended() {
        require(block.timestamp > auction_end, "Auction not ended");
        _;
    }

    function bid() public payable virtual returns (bool) {}
    function withdraw() public virtual returns (bool) {}
    function cancel_auction() external virtual returns (bool) {}
    function finalizeAuction() external virtual returns (bool) {}

    event BidEvent(address indexed highestBidder, uint256 highestBid);
    event WithdrawalEvent(address withdrawer, uint256 amount);
    event CanceledEvent(string message, uint256 time);
    event AuctionFinalized(address winner, uint256 amount, string carBrand);
}

contract CarAuction is Auction {
    constructor(
        uint _biddingTime,
        address _owner,
        string memory _brand,
        string memory _Rnumber
    ) {
        require(_biddingTime > 0, "Bidding time must be > 0");
        require(_owner != address(0), "Invalid owner address");

        auction_owner = _owner;
        auction_start = block.timestamp;
        auction_end = auction_start + (_biddingTime * 1 minutes);
        STATE = auction_state.STARTED;

        Mycar = car({Brand: _brand, Rnumber: _Rnumber, owner: payable(_owner)});
    }

    function bid() public payable override an_ongoing_auction returns (bool) {
        require(msg.value > 0, "Bid amount must be > 0");

        uint256 totalBid = bids[msg.sender] + msg.value;
        require(totalBid > highestBid, "Bid too low");

        highestBidder = msg.sender;
        highestBid = totalBid;

        bids[msg.sender] = totalBid;

        if (!isBidder[msg.sender]) {
            bidders.push(msg.sender);
            isBidder[msg.sender] = true;
        }

        emit BidEvent(highestBidder, highestBid);
        return true;
    }

    function cancel_auction()
        external
        override
        only_owner
        an_ongoing_auction
        returns (bool)
    {
        STATE = auction_state.CANCELLED;
        emit CanceledEvent("Auction Cancelled", block.timestamp);

        _refundAllBids();
        return true;
    }

    function finalizeAuction()
        external
        override
        only_owner
        auction_ended
        returns (bool)
    {
        require(!ended, "Auction already finalized");
        require(STATE == auction_state.STARTED, "Auction not active");
        require(highestBidder != address(0), "No bids received");

        ended = true;
        STATE = auction_state.ENDED;

        // 将最高出价支付给车主
        (bool success, ) = Mycar.owner.call{value: highestBid}("");
        require(success, "Payment to owner failed");

        // 转移车辆所有权（在真实场景中可能需要NFT转移）
        Mycar.owner = payable(highestBidder);

        emit AuctionFinalized(highestBidder, highestBid, Mycar.Brand);
        return true;
    }
    function withdraw() public override returns (bool) {
        require(STATE == auction_state.ENDED, "Auction not finalized");
        require(msg.sender != highestBidder, "Winner cannot withdraw");

        uint256 amount = bids[msg.sender];
        require(amount > 0, "No funds to withdraw");

        bids[msg.sender] = 0;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "ETH transfer failed");

        emit WithdrawalEvent(msg.sender, amount);
        return true;
    }

    // 内部函数：取消时退款
    function _refundAllBids() internal {
        for (uint256 i = 0; i < bidders.length; i++) {
            address bidder = bidders[i];
            uint256 amount = bids[bidder];

            if (amount > 0) {
                bids[bidder] = 0;
                (bool success, ) = payable(bidder).call{value: amount}("");
                if (!success) {
                    bids[bidder] = amount; // 恢复金额，允许手动提取
                }
            }
        }
    }
    function get_owner() public view returns (address) {
        return auction_owner;
    }

    function getAuctionStatus() public view returns (string memory) {
        if (STATE == auction_state.CANCELLED) return "CANCELLED";
        if (block.timestamp > auction_end) return "ENDED";
        if (STATE == auction_state.STARTED) return "ACTIVE";
        return "UNKNOWN";
    }

    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    // 接收ETH（备用）
    receive() external payable {
        revert("Direct ETH transfers not allowed. Use bid() function.");
    }
}
