// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/access/Ownable.sol";

contract AddressToTokenMap is Ownable {
    mapping(address => string) private addresses;

    function getAddress(address _key) public view returns (string memory) {
        return addresses[_key];
    }

    function _setAddress(address _key, string memory _value) public onlyOwner {
        addresses[_key] = _value;
    }
}
