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

    function getTokenBalance(address _address, address _token) public view returns(uint) {
        return IERC20(_token).balanceOf(_address);
    }

    /* 
    * @dev : spits out min of tow integers
    * @params : integer 1, integer 2
    * @returns
    */
    function min(uint x, uint y) public pure returns (uint) {
        return x <= y ? x : y;
    }

    function rewardPerToken(uint startTimeStamp, uint totalTokenSupply) public view returns (uint) {
        if(totalTokenSupply == 0 ) {
            return 0;
        }
        return ((block.timestamp - startTimeStamp) * lendingConfig.INTEREST_RATE() * 1e18 )/ totalTokenSupply;
    }

    function getCurrentTokenPrice(address _tokenAddress) public view returns(uint)  {

        // This does not work for Hardhat, chainlink Price Feed is only on Goerli Network
        // AggregatorV3Interface priceFeed;
        // address priceFeedAddress = getPriceFeedMap(_tokenAddress);
        // priceFeed = AggregatorV3Interface(priceFeedAddress);
        // (,int price,,,) = priceFeed.latestRoundData();
        // uint256 decimal = priceFeed.decimals();
        // uint currentPrice = uint(price) / (10 ** decimal);
        // return currentPrice;

        if(addressToTokenMap.isETH(_tokenAddress)) {
            return 1725;
        }
        else if(keccak256(abi.encodePacked(addressToTokenMap.getSymbol(_tokenAddress))) == keccak256(abi.encodePacked('DAI'))) {
            return 1;
        }
        else if(keccak256(abi.encodePacked(addressToTokenMap.getSymbol(_tokenAddress))) == keccak256(abi.encodePacked('USDC'))) {
            return  1;
        }
        else if(keccak256(abi.encodePacked(addressToTokenMap.getSymbol(_tokenAddress))) == keccak256(abi.encodePacked('LINK'))) {
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

    // function isTokenInReserve(address _token, address[] memory _reserveAssets) public pure returns(bool) {
    //     uint reservesAssetsLength = _reserveAssets.length;
    //     for(uint i=0; i < reservesAssetsLength; i++) {
    //         if(_reserveAssets[i] == _token) {
    //             return true;
    //         }
    //     }
    //     return false;
    // } 
}