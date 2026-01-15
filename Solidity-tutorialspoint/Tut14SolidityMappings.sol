// https://www.tutorialspoint.com/solidity/solidity_mappings.htm
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Tut14SolidityMappings {
    // Mapping from address to uint256 balance
    mapping(address => uint256) public balances;
    
    // Get balance of an address
    function getBalance(address account) public view returns (uint256) {
        return balances[account];
    }
    
    // Set balance for an address
    function setBalance(address account, uint256 amount) public {
        balances[account] = amount;
    }
    
    // Increment balance
    function incrementBalance(address account, uint256 amount) public {
        balances[account] += amount;
    }
}