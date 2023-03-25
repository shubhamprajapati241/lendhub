// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

contract AddressToTokenMap {

    address deployer;
    // token address => Symbol for Symbol retrieval
    mapping(address => string) private addresses;
    // token address => tokenToUSD pair PriceFeed Address
    mapping(address => address) private priceFeedMap;

    constructor() {
        deployer = msg.sender;
    }

    function getSymbol(address _key) public view returns (string memory) {
        return addresses[_key];
    }

    function _setAddress(address _key, string memory _value) public {
        require(msg.sender == deployer, "Not owner");
        // Avoids updating addresses[_key] if the new value is the same as the current value
        bytes memory valueBytes = bytes(_value);
        bytes memory keyBytes = bytes(addresses[_key]);
        if (valueBytes.length != keyBytes.length) {
            addresses[_key] = _value;
        } else {
            for (uint i = 0; i < valueBytes.length; i++) {
                if (valueBytes[i] != keyBytes[i]) {
                    addresses[_key] = _value;
                    break;
                }
            }
        }
    }

    function getPriceFeedMap(address _tokenAddress) public view returns(address) {
        return priceFeedMap[_tokenAddress];
    }

    function _setPriceFeedMap(address _tokenAddress, address _pairAddress) public {
        require(msg.sender == deployer, "Not owner");
        if (priceFeedMap[_tokenAddress] != _pairAddress) {
            priceFeedMap[_tokenAddress] = _pairAddress;
        }
    }

    function isETH(address _token) public view returns(bool) {
        return keccak256(bytes(getSymbol(_token))) == keccak256(bytes("ETH"));
    }
}
