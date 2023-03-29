//SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./AggregatorV3Interface.sol";
import "./AddressToTokenMap.sol";
import "./LendingConfig.sol";

contract LendingHelper {

    AddressToTokenMap addressToTokenMap;
    LendingConfig lendingConfig;
    constructor(address _addressToTokenMap, address _lendingConfig) {
        addressToTokenMap = AddressToTokenMap(_addressToTokenMap);
        lendingConfig = LendingConfig(_lendingConfig);
    }

    /* 
    * @dev : returns the token balance of an account
    * @params : account address, token address
    * @returns: uint balance of the account and token
    */
    function getTokenBalance(address _address, address _token) public view returns(uint) {
        return IERC20(_token).balanceOf(_address);
    }

    /* 
    * @dev : spits out min of two integers
    * @params : uint x , uint y 
    * @returns : uint 
    */
    function min(uint x, uint y) public pure returns (uint) {
        return x <= y ? x : y;
    }

    /* 
    * @dev : spits out max of two integers
    * @params : uint x , uint y 
    * @returns : uint 
    */
    function max(uint x, uint y) public pure returns (uint) {
        return x >= y ? x : y;
    }

    /* 
    * @dev : Calculates the rewards per token based on the start time and the current supply
    * @params : uint startTimestamp, uint totalSupply
    * @returns: uint reward per holding
    */
    function rewardPerToken(uint startTimeStamp, uint totalTokenSupply) public view returns (uint) {
        if (totalTokenSupply == 0) {
            return 0;
        }
        uint timeElapsed = block.timestamp - startTimeStamp;
        uint interestRate = lendingConfig.INTEREST_RATE();
        return timeElapsed * interestRate * 1e18 / totalTokenSupply;
    }

    /* 
    * @dev : returns the current trading price of the token
    * @params : token address
    * @returns: uint price
    */
    function getCurrentTokenPrice(address _tokenAddress) public view returns (uint) {
        // AggregatorV3Interface priceFeed = AggregatorV3Interface(addressToTokenMap.getPriceFeedMap(_tokenAddress));
        // (, int price, , , ) = priceFeed.latestRoundData();
        // uint8 decimal = priceFeed.decimals();
        // return uint(price) / (10 ** decimal);
        // --------------------------------------------------
        bytes32 symbol = getKeccackHash(addressToTokenMap.getSymbol(_tokenAddress));
        if(symbol == getKeccackHash('ETH')) {
            return 1725;
        }
        else if(symbol == getKeccackHash('DAI')) {
            return 1;
        }
        else if(symbol == getKeccackHash('USDC')) {
            return  1;
        }
        else if(symbol == getKeccackHash('LINK')) {
            return 6;
        }
        return 1;
    }

    /* 
    * @dev : returns the keccack256 bytes32 equivalent of the symbol
    * @params : string symbol
    * @returns: bytes32 hash
    */
    function getKeccackHash(string memory symbol) public pure returns(bytes32){
        return keccak256(bytes(symbol));
    }

    /* 
    * @dev : Calculates USD amount of the token of certain quantity
    * @params : token address , uint qty
    * @returns: uint USD amount 
    */
   function getAmountInUSD(address _token, uint256 _amount) public view returns(uint) {
        uint totalAmountInDollars = uint(getCurrentTokenPrice(_token)) * (_amount / 1e18 );
        return totalAmountInDollars;
    }

    /* 
    * @dev : returns the qty of tokens that can be obtained with a certain USD
    * @params : token address, usd amount
    * @returns: uint qty
    */
    function getTokensPerUSDAmount(address _token, uint _usdAmount) public view returns(uint) {
        return _usdAmount / getCurrentTokenPrice(_token);
    }

}
