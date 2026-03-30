// SPDX-License-Identifier: MIT
// https://www.wtf.academy/en/course/solidity103/Faucet

pragma solidity ^0.8.27;

import {MyToken, ERC20} from "MyToken.sol";

contract MyTokenFaucet {

    uint256 public amountAllowed = 100; // 100
    address public tokenContract;   // token contract address
    mapping(address => bool) public requestedAddress;   

    // SendToken event  
    event SendToken(address indexed Receiver, uint256 indexed Amount); 

    // ERC20 token address
    constructor(address _tokenContract) {
        tokenContract = _tokenContract; // set token contract
    }

    // 
    function requestTokens() external {
        require(!requestedAddress[msg.sender], "Can't Request Multiple Times!"); // once per address
        ERC20 token = ERC20(tokenContract); // ERC20
        require(token.balanceOf(address(this)) >= amountAllowed, "Faucet Empty!"); 

        token.transfer(msg.sender, amountAllowed); // send token
        requestedAddress[msg.sender] = true; // record 
        
        emit SendToken(msg.sender, amountAllowed); // SendToken Event
    }
}