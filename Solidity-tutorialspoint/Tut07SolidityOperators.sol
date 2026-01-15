// https://www.tutorialspoint.com/solidity/solidity_operators.htm
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

//use arithmetic, comparison, logical and bitwise operators in Solidity
contract Tut07SolidityOperators {

   function getResult() public pure returns (string memory) {
      uint a = 1; // local variable
      uint b = 2;
      uint result = a + b; //arithmetic operation
      return integerToString(result);
   } 

   function integerToString(uint256 _i) internal pure returns (string memory) {
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
}