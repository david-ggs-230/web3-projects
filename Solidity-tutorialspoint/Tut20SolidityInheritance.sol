// https://www.tutorialspoint.com/solidity/solidity_inheritance.htm
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Parent contract
contract Tut20_Parent {
    string public parentMessage = "Hello from Parent";
    
    function sayHello() public pure virtual returns (string memory) {
        return "Parent says hello!";
    }
}

// Child contract
contract Tut20_Child is Tut20_Parent {
    string public childMessage = "Hello from Child";
    
    // Override parent function
    function sayHello() public pure override virtual  returns (string memory) {
        return "Child says hello!";
    }
    
    // New function in child
    function sayGoodbye() public pure returns (string memory) {
        return "Child says goodbye!";
    }
}

// Grandchild contract
contract Tut20_Grandchild is Tut20_Child {
    // Override again
    function sayHello() public pure override returns (string memory) {
        return "Grandchild says hello!";
    }
    // Get all messages
    function getAllMessages() public pure returns (
        string memory,
        string memory,
        string memory
    ) {
        return (
            sayHello(),      // Grandchild's version
            sayGoodbye(),    // From Child
            "Hello from Parent"  // From Parent (state variable)
        );
    }
}

contract Tut20SolidityInheritance {
    Tut20_Grandchild public grandchildContract;
    
    // Deploy Tut20_Grandchild contracts
    constructor() {
        grandchildContract = new Tut20_Grandchild();
    }
    function testInheritance() public view returns (string memory, string memory, string memory) {
        return grandchildContract.getAllMessages();
    }
}