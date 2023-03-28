//SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./AggregatorV3Interface.sol";
import "./AddressToTokenMap.sol";
import "./LendingConfig.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract LendingHelper {

    AddressToTokenMap addressToTokenMap;
    LendingConfig lendingConfig;
    using Address for address;
    constructor(address _addressToTokenMap, address _lendingConfig) {
        addressToTokenMap = AddressToTokenMap(_addressToTokenMap);
        lendingConfig = LendingConfig(_lendingConfig);
    }

    function getTokenBalance(address _address, address _token) public view returns(uint) {
        return IERC20(_token).balanceOf(_address);
    }

    function checkAddress(address _address) public view returns (bool) {
        return _address.isContract();
    }
    /* 
    * @dev : spits out min of tow integers
    * @params : integer 1, integer 2
    * @returns
    */
    function min(uint x, uint y) public pure returns (uint) {
        return x <= y ? x : y;
    }

    /* 
    * @dev : spits out max of tow integers
    * @params : integer 1, integer 2
    * @returns : uint
    */
    function max(uint x, uint y) public pure returns (uint) {
        return x >= y ? x : y;
    }

    function rewardPerToken(uint startTimeStamp, uint totalTokenSupply) public view returns (uint) {
        if (totalTokenSupply == 0) {
            return 0;
        }
        uint timeElapsed = block.timestamp - startTimeStamp;
        uint interestRate = lendingConfig.INTEREST_RATE();
        return timeElapsed * interestRate * 1e18 / totalTokenSupply;
    }

    function getCurrentTokenPrice(address _tokenAddress) public view returns (uint) {
        // AggregatorV3Interface priceFeed = AggregatorV3Interface(addressToTokenMap.getPriceFeedMap(_tokenAddress));
        // (, int price, , , ) = priceFeed.latestRoundData();
        // uint8 decimal = priceFeed.decimals();
        // return uint(price) / (10 ** decimal);
        // --------------------------------------------------
        if(addressToTokenMap.isETH(_tokenAddress)) {
            return 1725;
        }
        else if(keccak256(bytes(addressToTokenMap.getSymbol(_tokenAddress))) == keccak256(bytes('DAI'))) {
            return 1;
        }
        else if(keccak256(bytes(addressToTokenMap.getSymbol(_tokenAddress))) == keccak256(bytes('USDC'))) {
            return  1;
        }
        else if(keccak256(bytes(addressToTokenMap.getSymbol(_tokenAddress))) == keccak256(bytes('LINK'))) {
            return 6;
        }
        return 1;
    }

    function getAmountInUSD(address _token, uint256 _amount) public view returns(uint) {
        uint totalAmountInDollars = uint(getCurrentTokenPrice(_token)) * (_amount / 1e18 );
        return totalAmountInDollars;
    }

    function getTokensPerUSDAmount(address _token, uint _usdAmount) public view returns(uint) {
        return _usdAmount / getCurrentTokenPrice(_token);
    }

}