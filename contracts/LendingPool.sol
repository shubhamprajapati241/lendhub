// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./AddressToTokenMap.sol";
import "./LendingConfig.sol";
import "./LendingHelper.sol";

contract LendingPool is ReentrancyGuard {

    using SafeERC20 for IERC20;
    AddressToTokenMap addressToTokenMap;
    LendingConfig lendingConfig;
    LendingHelper lendingHelper;

    enum TxMode { BORROW, WITHDRAW}
    event TransferAsset(address lender, address _token, uint _amount);
    event Lend(address indexed lender, address indexed _token, uint indexed _amount);
    event Withdraw(address  indexed lender, address indexed  _token, uint indexed  _amount);
    event Borrow(address  indexed borrower, address  indexed _token, uint indexed  _amount);
    event Repay(address  indexed borrower, address  indexed _token, uint  indexed _amount);

    mapping (address => uint) public reserves;
    address[] public reserveAssets; 
    // mapping(address => bool) reserveAssets; //TODO: use mapping & an array
    mapping(address => UserAsset[]) public lenderAssets;
    mapping(address => UserAsset[]) public borrowerAssets;
    // TODO: Use these two variables in V2
    // TODO: use a mapping to keep track of which tokens the borrower owns
    // User -> token -> Qty Lent
    // mapping(address => mapping(address => uint)) public lenderBalances;
    // User -> token -> Qty Borrowed
    // mapping(address => mapping(address => uint)) public borrowerBalances;
    

    struct UserAsset {
        address user;
        address token;
        uint256 lentQty;
        uint256 borrowQty;
        uint256 lentApy;
        uint256 borrowApy;
        uint256 lendStartTimeStamp;
        uint256 borrowStartTimeStamp;
    }

    struct BorrowAsset {
        address token;
        uint256 borrowQty;
        uint256 borrowApy;
    }


    /*
    * @dev : update interest earned on the lent assets
    * @params : address lender, address token
    */
    modifier updateEarnedInterestOnLend(address _lender, address _token){
        uint lenderAssetLength = lenderAssets[_lender].length;
        for (uint i = 0; i < lenderAssetLength; i++) {
            lenderAssets[_lender][i].lentQty += interestEarned(_lender, _token, lenderAssets[_lender][i].lendStartTimeStamp);
            lenderAssets[_lender][i].lendStartTimeStamp = block.timestamp;
        }
        _;
    }

    /*
    * @dev : update interest earned on the borrowed assets
    * @params : address lender, address token
    */
    modifier updateAccruedInterestOnBorrow(address _borrower, address _token) {
        uint borrowerAssetLength = borrowerAssets[_borrower].length;
        for (uint i = 0; i < borrowerAssetLength; i++) {
            borrowerAssets[_borrower][i].borrowQty += interestAccrued(_borrower, _token, borrowerAssets[_borrower][i].borrowStartTimeStamp);
            borrowerAssets[_borrower][i].borrowStartTimeStamp = block.timestamp;
        }
        _;
    }

    constructor(
        address _addressToTokenMap, 
        address _lendingConfig, 
        address _lendingHelper
        ) {
        addressToTokenMap = AddressToTokenMap(_addressToTokenMap);
        lendingConfig = LendingConfig(_lendingConfig);
        lendingHelper = LendingHelper(_lendingHelper);
    }

   /************* Lender functions ************************/
    receive() external payable {}

    /*
    * @dev : this function allows a lender to lend assets to the Dapp
    * @params : address token, uint amount
    */
    function lend(address _token, uint256 _amount) public 
    nonReentrant
    updateEarnedInterestOnLend(msg.sender, _token)
    payable 
    {
        address lender = msg.sender;
        bool _usageAsCollateralEnabled = addressToTokenMap.isETH(_token) ? true: false;
        bool _usageAsBorrowEnabled = addressToTokenMap.isETH(_token) ? false: true;
        string memory _symbol = addressToTokenMap.getSymbol(_token);

        if(!lendingConfig.isTokenInAssets(_token)) {
            lendingConfig.addAsset(
                _token,
                _usageAsBorrowEnabled, 
                _usageAsCollateralEnabled,
                false, 
                true,
                _symbol,
                lendingConfig.DECIMALS(),
                lendingConfig.BORROW_THRESHOLD(),
                lendingConfig.LIQUIDATION_THRESHOLD() 
            );
        }

        if(addressToTokenMap.isETH(_token)) {
            // transfer ETH from lender to contract
            (bool success, ) = address(this).call{value : msg.value}("");
            if (!success){
                revert("Deposit failed");    
            }
        }else {
            // transfer tokens from lender to contract
            SafeERC20.safeTransferFrom(IERC20(_token), lender, address(this), _amount);
        }

        // update reserve balances
        reserves[_token] += _amount;

        uint laLen = lenderAssets[lender].length;
        if(!isLenderTokenOwner(_token)) { 
            UserAsset memory userAsset = UserAsset({
                user: lender,
                token: _token,
                lentQty: _amount,
                borrowQty: 0,
                lentApy: lendingConfig.INTEREST_RATE(),
                borrowApy: 0,
                lendStartTimeStamp: block.timestamp,
                borrowStartTimeStamp:0
            });
            lenderAssets[lender].push(userAsset);
        }else {
            // If lender already lent the token and is lending again, 
            // update interest earnt before updating lentQty
            for (uint i = 0; i < laLen; i++) {
                if(lenderAssets[lender][i].token == _token) {
                    lenderAssets[lender][i].lentQty += _amount;
                    lenderAssets[lender][i].lentApy = lendingConfig.INTEREST_RATE();
                    lenderAssets[lender][i].lendStartTimeStamp = block.timestamp;
                }
            }
        }

        // add the token to the reserveAssets array if not already there
        if (!isTokenInReserve(_token)) {
            reserveAssets.push(_token);
        }

        emit Lend(lender, _token, _amount);
    }
    
    /*
    * @dev : this function allows a lender to withdraw assets from the Dapp
    * @params : address token, uint amount
    */
    function withdraw(address _token, uint256 _amount) external 
    nonReentrant
    updateEarnedInterestOnLend(msg.sender, _token)
    payable returns(bool) {
        address lender  = msg.sender;

        require(isLenderTokenOwner(_token), "Not token owner");

        uint maxWithdrawQty = lendingHelper.getTokensPerUSDAmount(_token,getUserTotalAvailableBalanceInUSD(lender, TxMode.WITHDRAW)) * 1e18;
        require(maxWithdrawQty >= _amount,"Cannot withdraw more than balance");
        // Reserve must have enough withdrawl qty - this must always be true, so not sure why to code it
        require (reserves[_token] >= _amount, "Not enough qty to withdraw");
        reserves[_token] -= _amount;
       
        uint laLen = lenderAssets[lender].length;
        for (uint i = 0; i < laLen; i++) {
            if(lenderAssets[lender][i].token == _token) {
                lenderAssets[lender][i].lentQty -= _amount;
                lenderAssets[lender][i].lendStartTimeStamp = block.timestamp;
            }

            if(lenderAssets[lender][i].lentQty == 0) {
                delete lenderAssets[lender][i];
                lenderAssets[lender][i] = lenderAssets[lender][laLen - 1];
                lenderAssets[lender].pop();
                laLen -= 1;
            }
        }

        if(addressToTokenMap.isETH(_token)) {
            (bool success, ) = payable(lender).call{value: _amount}("");
            if (!success) {
                revert("Transfer to Lender wallet not successful");
            }
        }else {
            SafeERC20.safeTransfer(IERC20(_token), lender, _amount);
        }
        emit Withdraw(lender, _token, _amount);
        return true;
    }

    /********************* BORROW FUNCTIONS ******************/
    /*
    * @dev : Returns the assets lent by all lenders but only the qty allowed 
    * to be borrowed by the user
    * @params : address borrower
    * @returns : Array of structs of borrowable assets
    */
    function getAssetsToBorrow(address _borrower) public view returns(BorrowAsset[] memory) {
        require(_borrower != address(0), "Invalid address");
        uint maxAmountToBorrowInUSD = getUserTotalAvailableBalanceInUSD(_borrower, TxMode.BORROW); 
        uint length = reserveAssets.length;
        BorrowAsset[] memory borrowAsset = new BorrowAsset[](length);
        uint borrowAssetsCount;
        for(uint i = 0; i < length; i++) { 
            address token = reserveAssets[i];
            if(lendingConfig.isBorrowingEnabled(token)) {
                // borrow qty is either tokens per max borrowbale USD amount or the ones in reserves of that token
                uint borrowQty = lendingHelper.min(lendingHelper.getTokensPerUSDAmount(token,maxAmountToBorrowInUSD), reserves[token]/1e18);
                if (borrowQty > 0){
                    borrowAsset[borrowAssetsCount] = BorrowAsset(token, borrowQty, lendingConfig.BORROW_RATE());
                    borrowAssetsCount++;
                }
            }
        }
        return borrowAsset;
    }

    /*
    * @dev : Allows a user to borrow an asset
    * @params : address token, uint amount
    * @returns : bool - borrow success
    */
    function borrow(address _token, uint256 _amount) public 
    nonReentrant
    updateEarnedInterestOnLend(msg.sender, _token)
    updateAccruedInterestOnBorrow(msg.sender, _token)
    returns(bool) {
        
        address borrower = msg.sender;
        uint256 borrowAmountInUSD = lendingHelper.getAmountInUSD(_token, _amount);
        // This returns Total Lent USD * BORROW_THRESHOLD% - Total Borrowed USD by the borrower
        uint256 maxAmountToBorrowInUSD = getUserTotalAvailableBalanceInUSD(borrower, TxMode.BORROW);
        require(borrowAmountInUSD <= maxAmountToBorrowInUSD, "Not enough balance to borrow");
        require(_amount <= reserves[_token], "Not enough qty in the reserve pool to borrow");
        require (borrower != address(0), "Transfer Not Possible");
        
        if(!isBorrowerTokenOwner(_token)) { 
             UserAsset memory userAsset = UserAsset({
                    user: borrower,
                    token: _token,
                    lentQty: 0,
                    borrowQty: _amount,
                    lentApy: 0,
                    borrowApy: lendingConfig.BORROW_RATE(),
                    lendStartTimeStamp: 0,
                    borrowStartTimeStamp: block.timestamp
                });
                borrowerAssets[borrower].push(userAsset);
        }else {
            uint256 borrowerAssetsLength =  borrowerAssets[borrower].length;
            for (uint256 i=0 ; i < borrowerAssetsLength; i++) {
                if(borrowerAssets[borrower][i].token == _token) {
                    borrowerAssets[borrower][i].borrowQty += _amount;
                    borrowerAssets[borrower][i].borrowApy = lendingConfig.BORROW_RATE();
                    borrowerAssets[borrower][i].borrowStartTimeStamp = block.timestamp;
                }
            }
        }
        reserves[_token] -= _amount;
        SafeERC20.safeTransfer(IERC20(_token), borrower, _amount);
        emit Borrow(borrower, _token, _amount);
        return true;
    } 

    /*
    * @dev : Allows a user to repays a borrowed asset
    * @params : address token, uint amount
    */
    function repay(address _token, uint256 _amount) public 
    nonReentrant 
    updateEarnedInterestOnLend(msg.sender, _token)
    updateAccruedInterestOnBorrow(msg.sender, _token)
    {
        address borrower = msg.sender;

        require(isTokenBorrowed(borrower, _token), "Token was not borrowed, Can't Repay");
        require(_amount <= getBorrowerAssetQty(borrower, _token), "Repay Amount should less than borrowed amount");

        // transfer tokens from borrower to contract
        SafeERC20.safeTransferFrom(IERC20(_token), borrower, address(this), _amount);
        
        // update reserve balance
        reserves[_token] += _amount;

        // update borrower asset quantity and timestamp
        uint assetsLen = borrowerAssets[borrower].length;
        for (uint i = 0; i < assetsLen; i++) {
            if(borrowerAssets[borrower][i].token == _token) {
                borrowerAssets[borrower][i].borrowQty -= _amount;
                borrowerAssets[borrower][i].borrowStartTimeStamp = block.timestamp;
            }
            // remove asset from borrower asset array if borrowed amount is zero
            if(borrowerAssets[borrower][i].borrowQty == 0) {
                delete borrowerAssets[borrower][i];
                borrowerAssets[borrower][i] = borrowerAssets[borrower][assetsLen - 1];
                borrowerAssets[borrower].pop();
                assetsLen -= 1;
            }
        }
        emit Repay(borrower, _token, _amount);
    }

    /*************************** HELPER FUNCTIONS ***************************************/

    /*
    * @dev : calculates interest earnt on lent asset
    * @params : address lender, address token, uint lendStartTimeStamp
    * @returns : uint - interest
    */
    function interestEarned(address _lender, address _token, uint lendStartTimeStamp) public view returns (uint) {
        return getLenderAssetQty(_lender,_token) * lendingHelper.rewardPerToken(lendStartTimeStamp, reserves[_token]) / 1e18;
    }

    /*
    * @dev : calculates interest accrued on borrowed asset
    * @params : address borrower, address token, uint borrowStartTimeStamp
    * @returns : uint - interest
    */
    function interestAccrued(address _borrower, address _token, uint borrowStartTimeStamp) public view returns (uint) {
        uint qty = getBorrowerAssetQty(_borrower, _token);
        uint rewardPerToken = lendingHelper.rewardPerToken(borrowStartTimeStamp, reserves[_token]);
        return (qty * rewardPerToken) / 1e18;
    }

    /*
    * @dev : returns true if lender has lent this assets
    * @params : address token
    * @returns : bool
    */
    function isLenderTokenOwner(address _token) internal view returns(bool) {
        uint256 laLen = lenderAssets[msg.sender].length;
        for (uint i = 0; i < laLen; i++) {
            if (lenderAssets[msg.sender][i].token == _token){
                return true;
            }
        }
        return false;
    }

    /*
    * @dev : returns true if borrowe borrowed the asset
    * @params : address token
    * @returns : bool
    */
    function isBorrowerTokenOwner(address _token) internal view returns(bool) {
        uint256 baLen = borrowerAssets[msg.sender].length;
        for (uint i = 0; i < baLen; i++) {
            if (borrowerAssets[msg.sender][i].token == _token){
                return true;
            }
        }
        return false;
    }

    /*
    * @dev : returns the supply of an asset in Liquidity Reserve Pool
    * @params : address token
    * @returns : uint
    */
    function getTotalTokenSupplyInReserves(address _token) public view returns (uint){
        return reserves[_token];
    }
    
    /*
    * @dev : returns truw if the token is in the reserve
    * @params : address token
    * @returns : bool
    */
    function isTokenInReserve(address _token) public view returns(bool) {
        uint reservesAssetsLength = reserveAssets.length;
        for(uint i=0; i < reservesAssetsLength; i++) {
            if(reserveAssets[i] == _token) {
                return true;
            }
        }
        return false;
    } 

    /*
    * @dev : returns true if the token is in the reserve
    * @params : address token
    * @returns : bool
    */
    function isTokenBorrowed(address _borrower, address _token) public view returns(bool) {
        uint256 assetLen = borrowerAssets[_borrower].length;
        for(uint256 i=0; i < assetLen; i++) {
            if(borrowerAssets[_borrower][i].token == _token) {
                return true;
            }
        }
        return false;
    }
    
    /*
    * @dev : returns the lender's asset qty for his lent token
    * @params : address lender, address token
    * @returns : uint qty
    */
   function getLenderAssetQty(address _lender, address _token) public view returns(uint256){
        uint laLen = lenderAssets[_lender].length;
        for (uint i = 0; i < laLen; i++) {
            if(lenderAssets[_lender][i].token == _token) {
                return lenderAssets[_lender][i].lentQty;
            }
        }
        return 0;
    }

    /*
    * @dev : returns the borrower's asset qty for his borrowed token
    * @params : address token
    * @returns : bool
    */
    function getBorrowerAssetQty(address _borrower, address _token) public view returns(uint256){
        uint baLen = borrowerAssets[_borrower].length;
        for (uint i = 0; i < baLen; i++) {
            if(borrowerAssets[_borrower][i].token == _token) {
                return borrowerAssets[_borrower][i].borrowQty;
            }
        }
        return 0;
    }

    /*
    * @dev : returns all the lent assets of the lender
    * @params : address lender
    * @returns : Array of UserAsset[] struct
    */
    function getLenderAssets(address _lender) public view returns (UserAsset[] memory) {
        return lenderAssets[_lender];
    }

    /*
    * @dev : returns all the borrowed assets of the borrower
    * @params : address lender
    * @returns : Array of UserAsset[] struct
    */
    function getBorrowerAssets(address _borrower) public view returns (UserAsset[] memory) {
        return borrowerAssets[_borrower];
    }

    /*
    * @dev : returns the total available USD balance (lent - borrwed) of a user 
    * @params : address user, enum borrow/withdraw
    * @returns : uint balance
    */
    function getUserTotalAvailableBalanceInUSD(address _user, TxMode _txmode) public view returns(uint256) {
        uint256 userTotalLentUSDBalance;
        uint256 userTotalBorrowAmountInUSD;

        uint256 laLen = lenderAssets[_user].length;
        for(uint256 i =0; i < laLen; i++) {
            // userTotalLentUSDBalance - USD Balance for all tokens lent by the user
            userTotalLentUSDBalance += lendingHelper.getAmountInUSD(lenderAssets[_user][i].token, lenderAssets[_user][i].lentQty);
        }
        
        uint256 baLen = borrowerAssets[_user].length;
        for(uint256 i =0; i < baLen; i++) {
            userTotalBorrowAmountInUSD += lendingHelper.getAmountInUSD(borrowerAssets[_user][i].token, borrowerAssets[_user][i].borrowQty);
        }
        if (_txmode == TxMode.BORROW) {
            return ((userTotalLentUSDBalance * lendingConfig.BORROW_THRESHOLD()/100) - userTotalBorrowAmountInUSD);
        }
        return userTotalLentUSDBalance - userTotalBorrowAmountInUSD;
    }
}