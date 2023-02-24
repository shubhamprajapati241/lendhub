//SPDX-License-Identifier:MIT
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TokenTransfer {
    address public tokenAddress;
    IERC20 token;
    constructor(address _token) {
        tokenAddress = _token;
        token = IERC20(_token);
    }

    function checkAllowance() public view returns(uint amount) {
        return token.allowance(msg.sender, address(this));
    }

    function approveAmount(uint _amount) public {
        token.approve(address(this), _amount);
    } 

    function transferToken(uint _amount) public  {
        token.transferFrom(msg.sender, address(this), _amount);
    }

    function getSCBalance() public view returns(uint amount) {
        return token.balanceOf(address(this));
    }

    function getUserBalance() public view returns(uint amount) {
        return token.balanceOf(msg.sender);
    }
    
}
