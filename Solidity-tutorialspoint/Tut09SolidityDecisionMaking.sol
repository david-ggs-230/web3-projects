// https://www.tutorialspoint.com/solidity/solidity_decision_making.htm
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Tut09SolidityDecisionMaking {
    function getIfElseResult(uint i) public pure returns (uint) {
      uint a = 1; 
      uint b = 2;
      uint result;
      if( i < 10) {   // if else statement
         result = a*i;
      } else {
         result = b*i;
      } 
        return result;
    }
    
    function getIfElseIfResult(uint i) public pure returns (uint) {
      uint a = 1; 
      uint b = 2;
      uint c = 3;
      uint result;
      if( i < 10 ) {   // if else statement
         result = a*i;
      } else if (i <20 ){
         result = b*i;
      } else {
        result =c*i;
      }
        return result;
    }
}