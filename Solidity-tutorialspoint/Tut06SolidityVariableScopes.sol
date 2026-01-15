// https://www.tutorialspoint.com/solidity/solidity_variable_scope.htm
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
/**
 * Scope of local variables is limited to function in which they are defined 
 * but State variables can have three types of scopes.
 * 
 * Public − Public state variables can be accessed internally as well as via
 * messages. For a public state variable, an automatic getter function is generated.
 * 
 * Internal − Internal state variables can be accessed only internally from the 
 * current contract or contract deriving from it without using this.
 * 
 * Private − Private state variables can be accessed only internally from the current
 * contract they are defined not in the derived contract from it.
 */

contract Tut06SolidityVariableScopes_Base {
   uint public pData = 30;
   uint internal iData= 10;
   
   function getIdata() public returns (uint) {
      iData += 3; // internal access
      return iData;
   }
}
contract Tut06SolidityVariableScopes_Caller {
   Tut06SolidityVariableScopes_Base base = new Tut06SolidityVariableScopes_Base();
   function getPdata() public view returns (uint) {
      return base.pData(); //external access
   }
}
contract Tut06SolidityVariableScopes is Tut06SolidityVariableScopes_Base {
   uint myData=10;
   function getBaseIdata() public returns (uint) {
      iData = 3; // internal access
      return iData;
   }
   function getMyData() public view returns(uint){
      uint a = 1; // local variable
      return myData + a; //access the state variable
   }
}