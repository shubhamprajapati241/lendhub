// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/access/Ownable.sol";

contract AddressToTokenMap is Ownable {
    mapping(address => string) private addresses;

    // tokenAddress => tokenToUSD pair PriceFeed Address
    mapping(address => address) private priceFeedMap;

    function getAddress(address _key) public view returns (string memory) {
        return addresses[_key];
    }

    function _setAddress(address _key, string memory _value) public onlyOwner {
        addresses[_key] = _value;
    }

   function getPriceFeedMap(address _tokenAddress) public view returns(address) {
    return priceFeedMap[_tokenAddress];
   }

   function _setPriceFeedMap(address _tokenAddress, address _pairAddress) public onlyOwner {
        priceFeedMap[_tokenAddress] = _pairAddress;
   }
}
