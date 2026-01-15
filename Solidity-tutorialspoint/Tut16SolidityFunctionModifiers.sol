// https://www.tutorialspoint.com/solidity/solidity_function_modifiers.htm
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Tut16SolidityFunctionModifiers {
    address public owner;
    
    // Custom errors for gas efficiency (optional improvement)
    error NotOwner();
    error ZeroValueNotAllowed();
    
    constructor() {
        owner = msg.sender;
    }
    
    // Using require (with error message)
    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }
    
    // Option 1: Using require
    modifier nonZero(uint b) {
        require(b > 0, "Value must be greater than zero");
        _;
    }
    
    // Option 2: Using custom error
    modifier nonZero2(uint b) {
        if (b == 0) {
            revert ZeroValueNotAllowed();
        }
        _;
    }
    
    // divide function with proper modifier calls
    function divide(uint a, uint b) public view onlyOwner() nonZero(b) returns(uint) {
        return a / b;
    }
    
    // Alternative divide function with proper modifier calls
    function divide2(uint a, uint b) public view onlyOwner() nonZero2(b) returns(uint) {
        return a / b;
    }
}