// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

// import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./AggregatorV3Interface.sol";
/***
LendingPoolDataProvider contract - provides data for the LendingPoolCore
    * Price oracle - get latest price fom chainlink
    * Liquidation threshold - LQ
    * Calculations - AVL, ALR
    * Calculates the ETH equivalent of a user's balance to assess the borrow limit of a user and the health factor of their positions.
    * Aggregates data from LendingPoolCore to provide high level information to the LendingPool.
*/

contract LendingDataProvider {

  AggregatorV3Interface internal priceFeed;

  function getLatestPrice(address _tokenAddress) public returns (int) {
    priceFeed = AggregatorV3Interface(_tokenAddress);
    (,int price,,,) = priceFeed.latestRoundData();
    return price / 1e8; //1e8 as per 8 decimals in chainlink doc 
  }
}
