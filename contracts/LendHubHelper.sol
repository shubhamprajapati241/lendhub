// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

contract LendHubHelper{

    function tokenToLHT(uint _lentTokenPrice, uint _mintTokenPrice) public pure returns (uint) {
        return _lentTokenPrice/_mintTokenPrice; //returns the number of LHTs to be minted per the tokens lent
    }
}