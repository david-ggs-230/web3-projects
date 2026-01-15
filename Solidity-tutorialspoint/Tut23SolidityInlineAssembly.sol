// https://www.tutorialspoint.com/solidity/solidity_assembly.htm
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library Sum {
    function sumUsingInlineAssembly(
        uint[] memory _data
    ) public pure returns (uint o_sum) {
        require(_data.length > 0, "Array must not be empty");

        for (uint i = 0; i < _data.length; ++i) {
            assembly {
                // Load array element from memory
                // _data points to memory location where array starts
                // First word (0x20 bytes) is array length
                // Elements start at _data + 0x20
                // Each element is 0x20 bytes (32 bytes)
                let elementPtr := add(add(_data, 0x20), mul(i, 0x20))
                let element := mload(elementPtr)
                o_sum := add(o_sum, element)
            }
        }
    }
}
// Implementation contract
contract Tut23SolidityInlineAssembly {
    uint[] data;
    constructor() {
        data.push(1);
        data.push(2);
        data.push(3);
        data.push(4);
        data.push(5);
    }

    function sum() external view returns (uint) {
        return Sum.sumUsingInlineAssembly(data);
    }
}