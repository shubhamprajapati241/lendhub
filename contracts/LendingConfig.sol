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

    mapping(string => uint256) private symbolToAssetIndex;

    event AddAsset(address token, string symbol, uint borrowThreshold, uint liquidationThreshold);
    event UpdateAssetStatus(address token, AssetStatus isActive);
    event UpdateAssetFrozen(address token, Freeze isfrozen);

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

    function updateInterestRate(uint256 _interestRate) public onlyOwner{
        if(INTEREST_RATE != _interestRate) {
            INTEREST_RATE = _interestRate;
        }
    }

    function updateBorrowRate(uint256 _borrowRate) public onlyOwner {
        if(BORROW_RATE != _borrowRate) {
            BORROW_RATE = _borrowRate;
        }
    }

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
    ) external returns (bool){ //TODO: Add only LendingPool

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

        symbolToAssetIndex[_symbol] = assets.length - 1;
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
        for (uint256 i = 0; i < assetsLen; i++) {
            Asset storage asset = assets[i];
            if (asset.token == _token){
                asset.isActive = (_choice == AssetStatus.ACTIVE);
                asset.lastUpdateTimestamp = block.timestamp;
                emit UpdateAssetStatus(_token, _choice); 
                return true;
            }
        }
        return false;
    }

    function freezeUnFreezeAsset(address _token, Freeze _choice) external onlyOwner returns (bool) {
        uint256 assetsLen = assets.length;
        for (uint i = 0; i < assetsLen; i++) {
            Asset storage asset = assets[i];
            if (asset.token == _token) {
                asset.isfrozen = (_choice == Freeze.FREEZE);
                asset.lastUpdateTimestamp = block.timestamp;
                emit UpdateAssetFrozen(_token, _choice);
                return true;
            }
        }
        return false;
    }
    function getAssetByTokenAddress(address _token) public view returns (Asset memory) {
        require(_token != address(0), "Invalid token address");
        uint256 assetsLen = assets.length;
        for (uint256 i = 0; i < assetsLen; i++) {
            if (assets[i].token == _token) {
                return assets[i];
            }
        }
        revert("Asset not found");
    }

    function getAssetByTokenSymbol(string memory _symbol) public view returns (Asset memory) {
        uint256 assetIndex = symbolToAssetIndex[_symbol];
        require(
            assetIndex < assets.length && 
            keccak256(bytes(assets[assetIndex].symbol)) == keccak256(bytes(_symbol)), 
            "Asset not found"
            );
        return assets[assetIndex];
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
