// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

contract AddressToTokenMap{
    address owner;
    // token address => Symbol for Symbol retrieval
    mapping(address => string) private addresses;
    // token address => tokenToUSD pair PriceFeed Address
    mapping(address => address) private priceFeedMap;

    constructor(){
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(owner == msg.sender, "Not Owner, cannot add mapping");
        _;
    }
    
    /* 
    * @dev : retrieves the symbol or a token's address - used when adding assets
    *        and in determining if the symbol is ETH for eth vs token transfers
    * @params : token address 
    * @returns : symbol string
    */
    function getSymbol(address _key) public view returns (string memory) {
        return addresses[_key];
    }

    /* 
    * @dev : maps token address to symbol
    * @params : token address , symbol string
    */
    function _setAddress(address _key, string memory _value) public onlyOwner {
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

    /* 
    * @dev : returns the price feed address for a token's address - chainlink price oracle
    * @params : token address 
    * @returns : price feed address
    */
    function getPriceFeedMap(address _tokenAddress) public view returns(address) {
        return priceFeedMap[_tokenAddress];
    }

    /* 
    * @dev : maps token address to sepolia/mainnet chainlink price feed address
    * @params : token address , price feed address
    */
    function _setPriceFeedMap(address _tokenAddress, address _pairAddress) public onlyOwner{
        if (priceFeedMap[_tokenAddress] != _pairAddress) {
            priceFeedMap[_tokenAddress] = _pairAddress;
        }
    }

    /* 
    * @dev : returns true fif the address's symbol is ETH
    * @params : token address
    * returns : boolean 
    */
    function isETH(address _token) public view returns(bool) {
        return keccak256(abi.encodePacked(getSymbol(_token))) == keccak256(abi.encodePacked("ETH"));
    }
}
