// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Donation {
    address public owner;
    mapping(address => uint256) public donations;

    event Donated(address indexed donor, uint256 amount);
    event Withdrawn(address indexed owner, uint256 amount);

    constructor() {
        owner = msg.sender; // Owner is the deployer
    }

    function donate() public payable {
        require(msg.value > 0, "Donation must be greater than 0");
        donations[msg.sender] += msg.value;
        emit Donated(msg.sender, msg.value);
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function withdraw() public {
        require(msg.sender == owner, "Only owner can withdraw funds");
        uint256 amount = address(this).balance;
        require(amount > 0, "No funds available");

        payable(owner).transfer(amount);
        emit Withdrawn(owner, amount);
    }
}
