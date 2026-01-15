// https://www.tutorialspoint.com/solidity/solidity_comments.htm
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Tut02SolidityComments {
   constructor() {
   }
   function getResult() public pure returns(uint){
      // This is a comment. It is similar to comments in C++

      /*
         * This is a multi-line comment in solidity
         * It is very similar to comments in C Programming
      */
      uint a = 1;
      uint b = 2;
      uint result = a + b;
      return result;
   }
}