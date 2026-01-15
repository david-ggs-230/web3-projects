// https://www.tutorialspoint.com/solidity/solidity_functions.htm
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Tut17SolidityFunctions {
    uint256 public counter;
    string public calledFallbackFun;
    string public calledReceiveFun;
    
    // State-modifying function (most expensive)
    function increment() public {
        counter++;
        // Cost: ~43,000 gas (writes to storage)
    }
    
    // view function (cheaper - reads storage)
    function getCounter() public view returns (uint256) {
        return counter;
        // Cost: ~2,300 gas (reads from storage)
    }
    
    // pure function (cheapest - no storage access)
    function addNumbers(uint256 a, uint256 b) public pure returns (uint256) {
        return a + b;
        // Cost: ~700 gas (only computation)
    }
    
    // fallback function - executed if none of the other functions match
    // the function identifier or no data was provided with the function call. 
    fallback() external payable{
        calledFallbackFun="Fallback function is executed!";
    }

    receive() external payable {
        // Automatically called when Ether is sent with empty data
        // e.g., send(1 ether) without calling any function
        calledReceiveFun="Receive function is executed!";
    }
}