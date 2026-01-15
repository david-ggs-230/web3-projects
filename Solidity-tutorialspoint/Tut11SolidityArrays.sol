// https://www.tutorialspoint.com/solidity/solidity_arrays.htm
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Tut11SolidityArrays {
   function testArray() public pure returns(uint[] memory){
      uint len = 7; 
      
      //dynamic array
      uint[] memory a = new uint[](7);
      
      //bytes is same as byte[]
      bytes memory b = new bytes(len);
      
      assert(a.length == 7);
      assert(b.length == len);
      
      //access array variable
      a[6] = 8;
      
      //test array variable
      assert(a[6] == 8);
      
      //static array
      uint[3] memory c = [uint(1) , 2, 3];
      assert(c.length == 3);

      return a;
   }
}