// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

contract LendingConfig {

    address owner;
    enum Freeze { FREEZE, UNFREEZE}
    enum AssetStatus { ACTIVE, INACTIVE }

    event AddAsset(address token, string symbol, uint borrowThreshold, uint liquidationThreshold);
    event UpdateAssetStatus(address token, AssetStatus isActive);
    event UpdateAssetFrozen(address token, Freeze isfrozen);

    modifier onlyOwner() {
        require(owner == msg.sender, "Not Owner, cannot perfrm OP");
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
    ) external returns (bool){ //TODO: Remove onlyOwner later

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

    function isTokenInAssets(address _token) public view returns(bool){
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

    function isBorrowingEnable(address _token) public view returns(bool) {
        uint256 assetsLen = assets.length;
        for(uint i=0; i < assetsLen; i++) {
            if(assets[i].token == _token && assets[i].borrowingEnabled) {
                return true;
            }
        }
        return false;
    } 
}
