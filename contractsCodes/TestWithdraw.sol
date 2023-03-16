// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6; 

contract TestWithdraw {

    address public owner;

    receive() external payable {}
    
    fallback() external payable {}

    constructor() {
        owner = msg.sender;
    }


    function deposit() public payable{
    }

    function getBalance() public view returns (uint){
        return address(this).balance;
    }

    function withdraw(address _addr, uint _amount) public payable returns(bool){
        // uint amount = _amount*10**18;
        (bool success,) = payable(_addr).call{value: _amount}("");
        require(success,"Failed to receive ether");
        return true;
    }
}
