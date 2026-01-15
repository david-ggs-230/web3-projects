// https://www.tutorialspoint.com/solidity/solidity_cryptographic_functions.htm
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Tut19SolidityCryptographicFunctions {
    // keccak256 - Ethereum's main hash function
    function callKeccak256() public pure returns(bytes32 result){
      return keccak256("ABC");
    }  
    // ripemd160 - Used in Bitcoin addresses
    function callRipemd160() public pure returns(bytes32 result){
      return ripemd160("ABC");
    }  
    // sha256 - SHA-2 family
    function callSha256() public pure returns(bytes32 result){
      return sha256("ABC");
    }  
}