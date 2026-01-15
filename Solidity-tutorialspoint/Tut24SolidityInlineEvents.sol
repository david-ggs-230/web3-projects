// https://www.tutorialspoint.com/solidity/solidity_events.htm
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Tut24SolidityInlineEvents {
    // Event declaration
    event Transfer(address indexed from, address indexed to, uint256 value);

    // Simple event without indexed parameters
    event LogMessage(string message);

    // Event with timestamp
    event TimestampedEvent(uint256 timestamp, string action);

    function transfer(address to, uint256 amount) external {
        // Emit the event
        emit Transfer(msg.sender, to, amount);

        // Emit multiple events
        emit LogMessage("Transfer completed");
        emit TimestampedEvent(block.timestamp, "transfer");
    }
}