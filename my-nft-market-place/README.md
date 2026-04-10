# NFT and Marketplace Smart Contract Project

This project consists of two core Solidity smart contracts designed to enable the creation, management, and trading of Non-Fungible Tokens (NFTs) on the Ethereum blockchain.

https://github.com/Markkop/nft-marketplace

## Project Overview

The contracts work together to provide a complete NFT ecosystem, allowing users to mint unique NFTs and trade them via a dedicated marketplace.

## Contract Files

- MyNFT.sol: A contract for creating and managing NFTs, including minting, updating token metadata, and tracking token creators and owners. It inherits from standard OpenZeppelin contracts to ensure security and compatibility.

- MyNFTMarketPlace.sol: A marketplace contract that facilitates the listing, buying, canceling, and relisting of NFTs. It includes features for fee management, secure transactions, and easy retrieval of market items.

## Core Functionality

- Mint and manage unique NFTs with customizable metadata

- List NFTs for sale, purchase listed items, and cancel listings

- Track NFT ownership, creation, and marketplace activity

- Secure fee collection and withdrawal for marketplace operations

## Prerequisites

- Solidity ^0.8.28

- OpenZeppelin Contracts ^5.6.0

- Hardhat or similar Ethereum development environment

## Installation Steps

1. Clone the project repository to your local machine.

2. Navigate to the project directory and install dependencies using `npm install`.

3. Ensure all prerequisites are installed and configured correctly.

4. Compile the smart contracts using your preferred Ethereum development tool (e.g., `npx hardhat compile`).


