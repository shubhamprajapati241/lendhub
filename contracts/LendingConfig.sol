// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

// import "./LendingPoolAddressProvider.sol";

contract LendingConfig {

    // LendingPoolAddressProvider addressesProvider;
    address owner;
    enum Freeze { FREEZE, UNFREEZE}
    enum AssetStatus { ACTIVE, INACTIVE }

    uint256 public INTEREST_RATE;
    uint256 public BORROW_RATE;
    uint256 public constant REWARD_RATE_PER_SECS=12;
    uint256 public constant DECIMALS = 18;
    uint256 public constant BORROW_THRESHOLD = 80;
    uint256 public constant LIQUIDATION_THRESHOLD = 120;
    // uint32 public constant BORROW_DURATION_30 = 30 days;
    // uint32 public constant BORROW_DURATION_60 = 60 days;
    // uint32 public constant BORROW_DURATION_90 = 90 days;
    uint256 public constant SECONDS_IN_A_DAY=86400;

    event AddAsset(address token, string symbol, uint borrowThreshold, uint liquidationThreshold);
    event UpdateAssetStatus(address token, AssetStatus isActive);
    event UpdateAssetFrozen(address token, Freeze isfrozen);

    modifier onlyOwner() {
        require(owner == msg.sender, "Not Owner, cannot perfrm OP");
        _;
    }

    /**
    * @dev only lending pools configurator can use functions affected by this modifier
    **/
    // modifier onlyLendingPool {
    //     require(
    //         addressesProvider.getLendingPool() == msg.sender,
    //         "The caller must be a lending pool configurator contract"
    //     );
    //     _;
    // }

    constructor(uint256 _interestRate, uint256 _borrowRate){
        owner = msg.sender;
        INTEREST_RATE  = _interestRate;
        BORROW_RATE = _borrowRate;
    }
    // constructor(address _lendingPoolAddressProvider){
    //     owner = msg.sender;
    //     addressesProvider = LendingPoolAddressProvider(_lendingPoolAddressProvider);
    // }

    function updateInterestRate(uint256 _interestRate) public{
        INTEREST_RATE = _interestRate;
    }

    function updateBorrowRate(uint256 _borrowRate) public{
        BORROW_RATE = _borrowRate;
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
        string calldata _symbol, 
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

    function getAssets() public view returns(Asset[] memory) {
        return assets;
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

    function isBorrowingEnabled(address _token) public view returns(bool) {
        uint256 assetsLen = assets.length;
        for(uint i=0; i < assetsLen; i++) {
            if(assets[i].token == _token) {
                return assets[i].borrowingEnabled;
            }
        }
        return false;
    } 
}
