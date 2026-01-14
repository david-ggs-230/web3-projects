// contracts/SimpleStorage.sol
// Personal note: Started with this after failing with complex DeFi contracts
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

contract SimpleStorage {
    uint256 private value;
    
    event ValueChanged(uint256 newValue);
    
    function store(uint256 newValue) public {
        value = newValue;
        emit ValueChanged(newValue);
    }
    
    function retrieve() public view returns (uint256) {
        return value;
    }
}

// Watch out: Solidity 0.8.24+ requires explicit function visibility
// "public" or "private" - no defaults
