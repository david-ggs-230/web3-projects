//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AggregatorV3Interface} from "@chainlink/contracts@1.5.0/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract FundMe {
    mapping(address => uint256) public addressToAmountFunded;
    address[] public funders;
    address public immutable owner;
    //USD (decimals: 18)
    uint256 public constant MINIMUM_USD = 50*10**18;
    AggregatorV3Interface internal priceFeed;

    error OracleStale();
    error OracleInvalid();
    error NotOwner();

    constructor() {
        owner = msg.sender;
        /**
         * Network: Sepolia
         * Data Feed: ETH/USD
         * Address: 0x694AA1769357215DE4FAC081bf1f309aDC325306
         */
        priceFeed = AggregatorV3Interface(
            0x694AA1769357215DE4FAC081bf1f309aDC325306
        );
    }
        
    function getVersion() public view returns (uint256){
        return priceFeed.version();
    }

    modifier onlyOwner {
        // require(msg.sender == owner);
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    // Returns price scaled to 18 decimals
    function getPrice() public view returns (uint256 p18) {
        //get price of ETH/USD
        //(, int256 answer, , , ) = priceFeed.latestRoundData();
        (
            uint80 roundId,
            int256 answer,
             /*uint256 startedAt*/,
            uint256 updatedAt,
            uint80 answeredInRound
        ) = priceFeed.latestRoundData();
        // Prevent invalid price data
        if (answer <= 0) revert OracleInvalid();
        // Prevent stale price data attacks
        if (updatedAt == 0 || answeredInRound < roundId) revert OracleStale();
        //decimals, ETH/USD default = 8
        uint8 d = priceFeed.decimals();
        if (d == 8) return uint256(answer) * 1e10;
        if (d == 18) return uint256(answer);
        if (d < 18) return uint256(answer) * (10 ** (18 - d));
        if (d > 18) return uint256(answer) / (10 ** (d - 18)); // potential precision loss when downscaling
    }

    // Converts ETH amount (wei, 1e18) to USD (decimals: 18) using the feed
    function getConversionRate(uint256 ethAmount) public view returns (uint256) {
        uint256 ethPrice = getPrice();
        uint256 ethAmountInUsd = (ethAmount * ethPrice) / 1e18;
        return ethAmountInUsd;
    }

    function fund() public payable {
        require(
            getConversionRate(msg.value) >= MINIMUM_USD,
            "You need to spend more ETH!"
        ); // at least minimum USD
        address sender = msg.sender; // Cache expensive storage read
        uint256 prevAmount = addressToAmountFunded[sender];
        addressToAmountFunded[sender] += msg.value;
        if (prevAmount == 0) funders.push(sender);
    }
    
    function withdraw() public onlyOwner  {
        for (uint256 funderIndex=0; funderIndex < funders.length; funderIndex++){
            address funder = funders[funderIndex];
            addressToAmountFunded[funder] = 0;
        }
        funders = new address[](0);
        //payable(owner).transfer(address(this).balance);
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Withdraw failed");
    }
    //
    function refund() public onlyOwner {
        for (uint256 i = 0; i < funders.length; i++) {
            address funder = funders[i];
            uint256 amount = addressToAmountFunded[funder];
            addressToAmountFunded[funder] = 0;
            (bool callSuccess, ) = payable(funder).call{
                value: amount
            }("");
            require(callSuccess, "Refund failed");
        }
        funders = new address[](0);
    }

    // Explainer from: https://solidity-by-example.org/fallback/
    // Ether is sent to contract
    //      is msg.data empty?
    //          /   \ 
    //         yes  no
    //         /     \
    //    receive()?  fallback() 
    //     /   \ 
    //   yes   no
    //  /        \
    //receive()  fallback()

    fallback() external payable {
        fund();
    }

    receive() external payable {
        fund();
    }
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
