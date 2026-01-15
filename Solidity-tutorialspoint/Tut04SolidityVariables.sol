// https://www.tutorialspoint.com/solidity/solidity_variables.htm
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Tut04SolidityVariables {
   uint storedData; // State variable
   constructor()  {
      storedData = 10;   
   }
   function getResult() public view returns(uint){
      uint a = 1; // local variable
      uint b = 2;
      uint result = a + b;
      return storedData + result; //access the state variable
   }
}