// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.0;

contract TodoList {
    struct Task {
        uint id;
        string content;
        bool completed;
        address owner;
        uint createdAt;
    }
    
    Task[] public tasks;
    mapping(uint => uint) public idToIndex;
    
    event TaskCreated(uint indexed id, address indexed owner, string content);
    event TaskCompleted(uint indexed id, bool completed);
    event TaskDeleted(uint indexed id);
    
    modifier validTask(uint _id) {
        require(_id < tasks.length && tasks[idToIndex[_id]].id == _id, "Invalid task");
        _;
    }
    
    function createTask(string memory _content) public {
        require(bytes(_content).length > 0, "Empty content");
        uint id = tasks.length;
        tasks.push(Task(id, _content, false, msg.sender, block.timestamp));
        idToIndex[id] = tasks.length - 1;
        emit TaskCreated(id, msg.sender, _content);
    }
    
    function toggleCompleted(uint _id) public validTask(_id) {
        uint index = idToIndex[_id];
        tasks[index].completed = !tasks[index].completed;
        emit TaskCompleted(_id, tasks[index].completed);
    }
    
    function getTaskCount() public view returns (uint) {
        return tasks.length;
    }
}