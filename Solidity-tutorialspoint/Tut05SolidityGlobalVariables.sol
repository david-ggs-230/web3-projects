// https://www.tutorialspoint.com/solidity/solidity_variables.htm
// https://www.geeksforgeeks.org/solidity/solidity-global-variables/
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
/**
 *
 *  blockhash(uint blockNumber) returns (bytes32): Hash of the given block - only works for 256 most recent, excluding current, blocks
 * block.coinbase (address payable): Current block miner's address
 * block.difficulty (uint): Current block difficulty
 * block.gaslimit (uint): Current block gaslimit
 * block.number (uint): Current block number
 * block.timestamp (uint): Current block timestamp as seconds since unix epoch
 * gasleft() returns (uint256): Remaining gas
 * msg.data (bytes calldata): Complete calldata
 * msg.sender (address payable): Sender of the message (current caller)
 * msg.sig (bytes4): First four bytes of the calldata (function identifier)
 * msg.value (uint): Number of wei sent with the message
 * now (uint): Current block timestamp
 * tx.gasprice (uint): Gas price of the transaction
 * tx.origin (address payable): Sender of the transaction
 */
contract Tut05SolidityGlobalVariables {
   /* 
    * These are special variables which exist in global workspace and 
    * provide information about the blockchain and transaction properties.
    */
  address public owner;
  constructor() 
  {
    // set the contract owner to the address 
    // that deployed the contract
    owner = msg.sender; 
  }
  
  function getOwner() public view returns (address) 
  {
    // return the contract owner address
    return owner; 
  }
  
  function isOwner(address _address) public view returns (bool) 
  {
    // check if the provided address matches 
    // the contract owner
    return _address == owner; 
  }
  
  function sendEther(address payable _recipient) public payable 
  {
    // send ether to the specified recipient
    require(msg.sender == owner, 
            "Only the contract owner can send ether.");
    (bool success,) = _recipient.call{value:msg.value}(""); 
    require(success,"Transfer error!");
  }
  
  function getCurrentBlock() public view returns (uint, uint, address) 
  {
    // return the current block number, timestamp, 
    // and coinbase address
    return (block.number, block.timestamp, block.coinbase); 
  }
  
  function getCurrentBlockInfo1() public payable returns(bytes32,address payable,uint,uint){
    bytes32 prevblockhash=blockhash(block.number-1);
    return (prevblockhash, block.coinbase, block.gaslimit, block.number);
  }
  
  function getCurrentBlockInfo2() public payable returns(uint,uint,bytes calldata,address){
    return (block.timestamp, gasleft(),msg.data, msg.sender);
  }

  
  function getCurrentBlockInfo3() public payable returns(bytes4,uint,uint,uint,address){
    return (msg.sig, msg.value,block.timestamp,tx.gasprice,tx.origin); 
  }
}