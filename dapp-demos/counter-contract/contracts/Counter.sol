// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract Counter {
    uint256 public count;
    address public immutable owner;

    error NotOwner();

    event CountChanged(uint256 newCount, address changedBy);

    constructor() {
        owner = msg.sender;
    }

    function increment() external {
        count += 1;
        emit CountChanged(count, msg.sender);
    }

    function incrementBy(uint256 amount) external {
        require(amount > 0, "amount must be positive");
        count += amount;
        emit CountChanged(count, msg.sender);
    }

    function reset() external {
        if (msg.sender != owner) revert NotOwner();
        count = 0;
        emit CountChanged(count, msg.sender);
    }
}