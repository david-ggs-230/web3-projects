// https://www.tutorialspoint.com/solidity/solidity_interfaces.htm
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Define an interface for basic arithmetic operations
interface ICalculator {
    // Function declarations (no implementation)
    function add(uint256 a, uint256 b) external pure returns (uint256);
    function multiply(uint256 a, uint256 b) external pure returns (uint256);
}

// Implementation contract
contract Tut21SolidityInterfaces is ICalculator {
    // Implement the add function
    function add(uint256 a, uint256 b) external pure override returns (uint256) {
        return a + b;
    }
    
    // Implement the multiply function
    function multiply(uint256 a, uint256 b) external pure override returns (uint256) {
        return a * b;
    }
}