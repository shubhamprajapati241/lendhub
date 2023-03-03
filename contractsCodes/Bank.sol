// // SPDX-License-Identifier: MIT
// pragma solidity^0.8.8;

// contract Bank {
//     struct Asset {
//         string name;
//         uint balance;
//         uint timestamp;
//         address from; 
//     }   

//     Asset[] public assets;
//     address public owner;

//     constructor() {
//         owner = msg.sender;
//     }

//     // sending money to the contract
//     function depositAsset(string memory name) public payable {
//         require(msg.value > .01 ether, "Please deposit more than one");
//         assets.push(Asset(name, msg.value, block.timestamp, msg.sender));
//     }

//     function getContactBalance() view public returns(uint) {
//         return address(this).balance;
//     }

// }