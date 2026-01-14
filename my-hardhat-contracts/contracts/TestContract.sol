// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.0;

contract TestContract {
    mapping(address => uint256) public balances;
    address public owner;

    constructor() {
        owner = msg.sender;
        balances[msg.sender] = 10000;
    }

    function transfer(address to, uint256 amount) public {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        balances[to] += amount;
    }
}