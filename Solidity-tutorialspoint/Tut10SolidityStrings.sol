// https://www.tutorialspoint.com/solidity/solidity_strings.htm
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Tut10SolidityStrings {
    // String declaration and initialization
    string public greeting = "Hello, World!";
    string private emptyString = "";
    string internal defaultString; // empty string
    
    // String comparison using keccak256 hash
    function compareStrings(string memory a, string memory b) public pure returns (bool) {
        return keccak256(bytes(a)) == keccak256(bytes(b));
    }
    
    // String concatenation
    function concatenate(string memory a, string memory b) public pure returns (string memory) {
        return string(abi.encodePacked(a, b));
    }
    
    function concatenateWithSpace(string memory a, string memory b) public pure returns (string memory) {
        return string(abi.encodePacked(a, " ", b));
    }
    
    // String length
    function getLength(string memory str) public pure returns (uint) {
        return bytes(str).length;
    }
    
    // Check if string is empty
    function isEmpty(string memory str) public pure returns (bool) {
        return bytes(str).length == 0;
    }
    
    // Convert string to bytes
    function toBytes(string memory str) public pure returns (bytes memory) {
        return bytes(str);
    }
    
    // Convert bytes to string
    function bytesToString(bytes memory data) public pure returns (string memory) {
        return string(data);
    }
}