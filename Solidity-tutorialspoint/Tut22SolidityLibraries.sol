// https://www.tutorialspoint.com/solidity/solidity_libraries.htm
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library Search {
    function indexOf(
        uint[] storage self,
        uint value
    ) public view returns (uint) {
        for (uint i = 0; i < self.length; i++) {
            if (self[i] == value) return i;
        }
        return type(uint).max;
    }
}
library Math {
    function add(uint a, uint b) internal pure returns (uint) {
        return a + b;
    }
}
// Implementation contract
contract Tut22SolidityLibraries {
    uint[] data;
    constructor() {
        data.push(1);
        data.push(2);
        data.push(3);
        data.push(4);
        data.push(5);
    }

    // direct library call
    function findValue(
        uint value
    ) external view returns (bool found, uint position) {
        //search if value is present in the array using direct library call
        uint index = Search.indexOf(data, value); // Explicit library call
        return (index != type(uint).max, index);
    }

    // Using For: The directive using A for B; can be used to attach library
    // functions of library A to a given type B.
    using Search for uint[];
    using Math for uint;
    function findValue2(
        uint value
    ) external view returns (bool found, uint position) {
        //Now data is representing the Library
        uint index = data.indexOf(value);
        return (index != type(uint).max, index);
    }
    function calculate(uint x, uint y) external pure returns (uint) {
        return x.add(y); // x now has .add() method
    }
}
