// SPDX-License-Identifier: MIT
// https://theethereum.wiki/learn/erc20-token-standard/
// https://speedrunethereum.com/guides/how-to-create-erc20

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol"; // Optional: For owner-only functions like minting

/**
 * @title MyToken
 * @dev A simple ERC20 token with a fixed initial supply minted to the deployer.
 *      Optionally includes an owner-controlled minting function.
 */
contract MyToken is ERC20, Ownable {
    /**
     * @dev Constructor to set up the token.
     * @param name_ The name of the token (e.g., "My Token").
     * @param symbol_ The symbol of the token (e.g., "MTK").
     * @param initialSupply_ The total number of tokens to create initially (e.g., 1000000 for one million tokens).
     *        The deployer of the contract will receive all initial tokens.
     */
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 initialSupply_
    ) ERC20(name_, symbol_) Ownable(msg.sender) {
        // The ERC20 standard typically uses 'decimals' to represent token divisibility.
        // OpenZeppelin's ERC20 contract defaults to 18 decimals.
        // To mint 'initialSupply_' whole tokens, we multiply by 10 raised to the power of 'decimals()'.
        // Example: If initialSupply_ is 1000 and decimals() is 18, we mint 1000 * (10**18) base units.
        _mint(msg.sender, initialSupply_ * (10 ** decimals()));
    }

    /**
     * @notice OPTIONAL: Allows the contract owner to mint more tokens.
     * @dev If you want a fixed supply, remove this function and the Ownable inheritance/constructor argument.
     * @param to The address that will receive the new tokens.
     * @param amount The amount of new tokens to mint (in whole units).
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount * (10 ** decimals()));
    }
}
