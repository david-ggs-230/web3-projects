// https://www.tutorialspoint.com/solidity/solidity_functions.htm
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Tut15SolidityFunctions {
   function getResult() public pure returns(uint product, uint sum){
      uint a = 1; // local variable
      uint b = 2;
      product = a * b;
      sum = a + b;
  
      //alternative return statement to return 
      //multiple values
      //return(a*b, a+b);
   }
   
   function add(int a, int b) public pure returns(int sum){
      sum = a + b;
      
      //alternative return statement to return 
      //return a+b;
   }
}