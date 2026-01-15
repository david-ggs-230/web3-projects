// https://www.tutorialspoint.com/solidity/solidity_error_handling.htm
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Tut25SolidityErrorHandling {
    // 1. require() - Most common for input validation
    function checkRequire(uint256 amount) external pure returns (uint256) {
        // Basic validation
        require(amount > 0, "Amount must be greater than 0");

        // Multiple conditions
        require(
            amount > 0 && amount <= 1000,
            "Amount must be between 1 and 1000"
        );

        return amount * 2;
    }

    // 2. revert() - Unconditional revert
    function checkRevert(uint256 status) external pure returns (string memory) {
        if (status == 0) {
            revert("Status cannot be zero");
        }

        if (status > 100) {
            revert("Status too high: ");
        }

        return "Success";
    }

    // 3. assert() - For internal errors (should never fail)
    uint256 private total;

    function checkAssert(uint256 a, uint256 b) external {
        uint256 sum = a + b;

        // assert() is for invariants that should NEVER fail
        assert(sum >= a); // Overflow check

        total = sum;

        // Another invariant
        assert(total == sum);
    }
}
