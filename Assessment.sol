// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;
    
    event Deposit(uint256 amount);
    
    // New variables to track medicine purchases
    uint256 public peracetamolBought = 0;
    uint256 public aspirinBought = 0;
    uint256 public penicillinBought = 0;
    uint256 public totalBought = 0;

    // Modifier to check if sender is owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the contract owner!");
        _;
    }

    constructor() {
        owner = payable(msg.sender);
    }

    // Function to buy Peracetamol
    function buyPeracetamol() public onlyOwner {
        // Logic to decide whether to buy Peracetamol
        // Add your custom logic here
        peracetamolBought += 1;
        totalBought += 1;
    }

    // Function to buy Aspirin
    function buyAspirin() public onlyOwner {
        // Logic to decide whether to buy Aspirin
        // Add your custom logic here
        aspirinBought += 1;
        totalBought += 1;
    }

    // Function to buy Penicillin
    function buyPenicillin() public onlyOwner {
        // Logic to decide whether to buy Penicillin
        // Add your custom logic here
        penicillinBought += 1;
        totalBought += 1;
    }

    // Function to return the total number of products bought
    function numberOfProducts() public view returns (uint256) {
        return totalBought;
    }
}
