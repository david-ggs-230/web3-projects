// https://www.tutorialspoint.com/solidity/solidity_first_application.htm
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Tut01SolidityTest {
   constructor() {
   }
   function getResult() public pure returns(uint){
      uint a = 1;
      uint b = 2;
      uint result = a + b;
      return result;
   }
}