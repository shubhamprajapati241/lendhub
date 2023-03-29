// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

contract LendingConfig {

    address owner;
    enum Freeze { FREEZE, UNFREEZE}
    enum AssetStatus { ACTIVE, INACTIVE }

    uint256 public INTEREST_RATE;
    uint256 public BORROW_RATE;
    uint256 public constant REWARD_RATE_PER_SECS=12;
    uint256 public constant DECIMALS = 18;
    uint256 public constant BORROW_THRESHOLD = 80;
    uint256 public constant LIQUIDATION_THRESHOLD = 120;
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

    /* 
    * @dev : updates the lending interest rate
    * @params : uint new interest rate
    */
    function updateInterestRate(uint256 _interestRate) public onlyOwner{
        if(INTEREST_RATE != _interestRate) {
            INTEREST_RATE = _interestRate;
        }
    }

    /* 
    * @dev : updates the borrowing interest rate
    * @params : uint _newBorrowRate
    */
    function updateBorrowRate(uint256 _borrowRate) public onlyOwner {
        if(BORROW_RATE != _borrowRate) {
            BORROW_RATE = _borrowRate;
        }
    }

    /* 
    * @dev : Adds assets on lend
    * @params : token attributes
    * @returns : bool - true is asset is added
    */
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

    /* 
    * @dev : Returns stored asset
    * @returns : All recorded assets - Array of the Asset struct
    */
    function getAssets() public view returns(Asset[] memory) {
        return assets;
    }

    /*
    * @dev : returns true if token is present in assets array
    * @params : token address
    * @returns : bool - true is asset is present in the array
    */
    function isTokenInAssets(address _token) public view returns(bool){
        uint256 assetCount = assets.length;
        for (uint i = 0; i < assetCount; i++) {
            if (assets[i].token == _token){
                return true;
            }
        }
        return false;
    }
    
    /*
    * @dev : Toggles active/inactive for an asset
    * @params : token address, status enum
    * @returns : bool
    */
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

    /*
    * @dev : Toggles freezing/unfreezing assets
    * @params : token address, status enum
    * @returns : bool
    */
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

    /*
    * @dev : returns asset from the asset array
    * @params : token address
    * @returns : Asset struct
    */
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

    /*
    * @dev : returns asset using symbol as input
    * @params : string symbol
    * @returns : Asset struct
    */
    function getAssetByTokenSymbol(string memory _symbol) public view returns (Asset memory) {
        uint256 assetIndex = symbolToAssetIndex[_symbol];
        require(
            assetIndex < assets.length && 
            keccak256(bytes(assets[assetIndex].symbol)) == keccak256(bytes(_symbol)), 
            "Asset not found"
            );
        return assets[assetIndex];
    }

    /*
    * @dev : returns true if the asset can be borrowed
    * @params : address token
    * @returns : bool
    */
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
