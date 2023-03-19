// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./AddressStorage.sol";

contract LendingPoolAddressProvider is Ownable, AddressStorage {
    bytes32 private constant LENDING_POOL = "LENDING_POOL";
    bytes32 private constant DATA_PROVIDER = "DATA_PROVIDER";

    // bytes32 private constant ETHEREUM_ADDRESS = "ETHEREUM_ADDRESS";
    // bytes32 private constant PRICE_ORACLE = "PRICE_ORACLE";

    function setLendingPool(address _lendingPool) public onlyOwner {
        _setAddress(LENDING_POOL, _lendingPool);
        // emit LendingPool(_lendingPool);
    }

    /**
    * @dev returns the address of the LendingPool 
    * @return the lending pool address
    **/
    function getLendingPool() public view returns (address) {
        return getAddress(LENDING_POOL);
    }

    function getLendingPoolDataProvider(address _dataProvider) public onlyOwner {
        _setAddress(DATA_PROVIDER, _dataProvider);
        // emit LendingPoolDataProvider(_lendingPool);
    }

    /**
    * @dev returns the address of the LendingPoolDataProvider
    * @return the lending pool data provider address
     */
    function getLendingPoolDataProvider() public view returns (address) {
        return getAddress(DATA_PROVIDER);
    }
}