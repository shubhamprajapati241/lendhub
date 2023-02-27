// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./LendingPoolAddressProvider.sol";
// Should we make it so that we can only LendingPoolV2 can add the assets when someone lends?
// address(LendingPoolV2)

contract LendingConfig {

    address owner;

    enum Freeze { FREEZE, UNFREEZE}
    enum AssetStatus { ACTIVE, INACTIVE }

    event AddAsset(address token, string symbol, uint borrowThreshold, uint liquidationThreshold);
    event UpdateAssetStatus(address token, AssetStatus isActive);
    event UpdateAssetFrozen(address token, Freeze isfrozen);

    LendingPoolAddressProvider addressesProvider;

    modifier onlyOwner() {
        require(owner == msg.sender, "Not Owner, cannot perfrm OP");
        _;
    }
    
    /**
    * @dev only lending pools configurator can use functions affected by this modifier
    **/
    modifier onlyLendingPool {
        require(
            addressesProvider.getLendingPool() == msg.sender,
            "The caller must be a lending pool configurator contract"
        );
        _;
    }

    constructor(){
        owner = msg.sender;
    }

    struct Asset {
        address token;
        string symbol;
        uint256 decimals;
        uint borrowThreshold;
        uint liquidationThreshold;
        uint lastUpdateTimestamp;
        bool borrowingEnabled;
        bool usageAsCollateralEnabled;
        bool isfrozen;
        bool isActive;
    }
    Asset[] internal assets;

    function addAsset(
        address _token, 
        bool _borrowingEnabled,
        bool _usageAsCollateralEnabled,
        bool _isfrozen,
        bool _isActive,
        string memory _symbol, 
        uint256 _decimals,
        uint256 _borrowThreshold,
        uint256 _liquidationThreshold
    ) external onlyOwner onlyLendingPool returns (bool){ //TODO: Remove onlyOwner later

        assets.push(
            Asset({
                token: _token,
                symbol: _symbol,
                decimals: _decimals,
                borrowThreshold: _borrowThreshold, 
                liquidationThreshold: _liquidationThreshold,
                lastUpdateTimestamp: block.timestamp,
                borrowingEnabled: _borrowingEnabled,
                usageAsCollateralEnabled: _usageAsCollateralEnabled,
                isfrozen: _isfrozen,
                isActive: _isActive
            })
        );

        emit AddAsset(_token, _symbol, _borrowThreshold, _liquidationThreshold);
        return true;
    }

    function isTokenInAssets(address _token) internal view returns(bool){
        uint256 assetCount = assets.length;
        for (uint i = 0; i < assetCount; i++) {
            if (assets[i].token == _token){
                return true;
            }
        }
        return false;
    }
    function makeAssetActiveInactive(address _token, AssetStatus _choice) external onlyOwner returns(bool){
        uint256 assetsLen = assets.length;
        for (uint i = 0; i < assetsLen; i++) {
            if (assets[i].token == _token){
                if (_choice == AssetStatus.ACTIVE){
                    assets[i].isActive = true;    
                }
                else {
                    assets[i].isActive = false;
                }
                assets[i].lastUpdateTimestamp = block.timestamp;
                return true;
            }
        }
        emit UpdateAssetStatus(_token, _choice);        
        return false;
    }

    function freezeUnFreezeAsset(address _token, Freeze _choice) public returns(bool){
        uint256 assetsLen = assets.length;
        for (uint i = 0; i < assetsLen; i++) {
            if (assets[i].token == _token){
                if (_choice == Freeze.FREEZE){
                    assets[i].isfrozen = true;    
                }
                else {
                    assets[i].isfrozen = false;
                }
                assets[i].lastUpdateTimestamp = block.timestamp;
                return true;
            }
        }
        emit UpdateAssetFrozen(_token, _choice);
        return false;
    }

    function getAssetByTokenAddress(address _token) public view returns(Asset memory) {
        uint256 assetsLen = assets.length;
        for (uint i = 0; i < assetsLen; i++) {
            if (assets[i].token == _token){
                return assets[i];
            }
        }
        revert("Asset not found");
    }

    function getAssetByTokenSymbol(string memory _symbol) public view returns(Asset memory) {
        uint256 assetsLen = assets.length;
        for (uint i = 0; i < assetsLen; i++) {
            if (keccak256(abi.encodePacked(assets[i].symbol)) == keccak256(abi.encodePacked(_symbol))){
                return assets[i];
            }
        }
        revert("Asset not found");
    }
}


// 0x5B38Da6a701c568545dCfcB03FcB875f56beddC4  - owner

// 0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2 - lender
// 0x17F6AD8Ef982297579C203069C1DbfFE4348c372 - lender

// Chainlink - https://docs.chain.link/data-feeds/price-feeds/addresses/

// 0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e - ETH - 3
// 0x0d79df66BE487753B02D015Fb622DED7f0E9798d - DAI - 33
// 0xAb5c49580294Aff77670F839ea425f5b78ab3Ae7 - USDC - 13
// 0x48731cF7e84dc94C5f84577882c14Be11a5B7456 - LINK - 23

/*
BTC / USD 0xA39434A63A52E749F02807ae27335515BA4b07F7 - 8
DAI / USD 0x0d79df66BE487753B02D015Fb622DED7f0E9798d- 8
ETH / USD 0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e- 8
LINK / USD 0x48731cF7e84dc94C5f84577882c14Be11a5B7456 - 8
USDC / USD 0xAb5c49580294Aff77670F839ea425f5b78ab3Ae7- 8
*/
