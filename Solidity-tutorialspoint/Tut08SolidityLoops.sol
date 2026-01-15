// https://www.tutorialspoint.com/solidity/solidity_loops.htm
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

//use arithmetic, comparison, logical and bitwise operators in Solidity
contract Tut08SolidityLoops {
   // while loops
    function uintToString01(uint256 _i) public pure returns (string memory) {
        // Handle zero case
        if (_i == 0) {
            return "0";
        }
        
        uint256 j = _i;
        uint256 length;
        
        // Calculate the length of the string
        while (j != 0) {
            length++;
            j /= 10;
        }
        
        // Allocate memory for the string
        bytes memory bstr = new bytes(length);
        uint256 k = length;
        
        // Build the string from right to left
        while (_i != 0) {
            k = k - 1;
            bstr[k] = bytes1(uint8(48 + (_i % 10)));
            _i /= 10;
        }
        
        return string(bstr);
    }
    
    // while and for loops
    function uintToString02(uint256 _value) public pure returns (string memory) {
        // Handle zero case
        if (_value == 0) {
            return "0";
        }
        
        // Maximum length of uint256 is 78 digits (2^256 is ~1.16e77)
        // Using fixed size buffer to reduce gas costs
        uint256 maxLength = 78;
        bytes memory reversed = new bytes(maxLength);
        uint256 i = 0;
        
        // Extract digits
        while (_value != 0) {
            uint256 remainder = _value % 10;
            _value = _value / 10;
            reversed[i++] = bytes1(uint8(48 + remainder));
        }
        
        // Allocate the actual string with correct length
        bytes memory s = new bytes(i);
        for (uint256 j = 0; j < i; j++) {
            s[j] = reversed[i - 1 - j]; // Reverse to get correct order
        }
        
        return string(s);
    }
}