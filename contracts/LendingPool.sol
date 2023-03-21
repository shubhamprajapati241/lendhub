// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./AddressToTokenMap.sol";
import "./LendingConfig.sol";
import "./LendingHelper.sol";

contract LendingPool is ReentrancyGuard {

    AddressToTokenMap addressToTokenMap;
    LendingConfig lendingConfig;
    LendingHelper lendingHelper;

    enum TxMode { BORROW, WITHDRAW}
    event TransferAsset(address lender, address _token, uint _amount);
    event Lend(address indexed lender, address indexed _token, uint indexed _amount);
    event Withdraw(address  indexed lender, address indexed  _token, uint indexed  _amount);
    event Borrow(address  indexed borrower, address  indexed _token, uint indexed  _amount);
    event Repay(address  indexed borrower, address  indexed _token, uint  indexed _amount);
    // TODO: Emit the events above

    // address deployer;

    mapping (address => uint) public reserves;
    address[] public reserveAssets; 
    mapping(address => UserAsset[]) public lenderAssets;
    mapping(address => UserAsset[]) public borrowerAssets;
    
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

    // modifier onlyAmountGreaterThanZero(uint256 amount) {
    //     require(amount > 0, "Amount must be greater than zero");
    //     _; 
    // }

    modifier updateEarnedInterestOnLend(address _lender, address _token){
        uint lenderAssetLength = lenderAssets[_lender].length;
        for (uint i = 0; i < lenderAssetLength; i++) {
            lenderAssets[_lender][i].lentQty += interestEarned(_lender, _token, lenderAssets[_lender][i].lendStartTimeStamp);
            lenderAssets[_lender][i].lendStartTimeStamp = block.timestamp;
        }
        _;
    }

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
        // deployer = msg.sender;
    }

    function interestEarned(address _lender, address _token, uint lendStartTimeStamp) public view returns (uint) {
        return getLenderAssetQty(_lender,_token) * lendingHelper.rewardPerToken(lendStartTimeStamp, reserves[_token]) / 1e18;
    }

    function interestAccrued(address _borrower, address _token, uint borrowStartTimeStamp) public view returns (uint) {
        return getBorrowerAssetQty(_borrower,_token) * lendingHelper.rewardPerToken(borrowStartTimeStamp, reserves[_token]) / 1e18;
    }

    function isLenderTokenOwner(address _token) internal view returns(bool) {
        uint256 laLen = lenderAssets[msg.sender].length;
        for (uint i = 0; i < laLen; i++) {
            if (lenderAssets[msg.sender][i].user == msg.sender 
                && lenderAssets[msg.sender][i].token == _token){
                return true;
            }
        }
        return false;
    }

    function isBorrowerTokenOwner(address _token) internal view returns(bool) {
        uint256 baLen = borrowerAssets[msg.sender].length;
        for (uint i = 0; i < baLen; i++) {
            if (borrowerAssets[msg.sender][i].user == msg.sender 
                && borrowerAssets[msg.sender][i].token == _token){
                return true;
            }
        }
        return false;
    }

    // Using this function for testing
    // function getBalance(address _address) public view returns(uint) {
    //     return _address.balance;
    // }

    function getTotalTokenSupplyInReserves(address _token) public view returns (uint){
        return reserves[_token];
    }

   /************* Lender functions ************************/
    receive() external payable {}

    function lend(address _token, uint256 _amount) public 
    nonReentrant
    updateEarnedInterestOnLend(msg.sender, _token)
    payable 
    {
        address lender = msg.sender;
        bool _usageAsCollateralEnabled = addressToTokenMap.isETH(_token) ? true: false;
        bool _usageAsBorrowEnabled = addressToTokenMap.isETH(_token) ? false: true;
        // bool _usageAsCollateralEnabled = true;
        // bool _usageAsBorrowEnabled = true;
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
            (bool success, ) = address(this).call{value : msg.value}("");
            require(success, "Deposit failed");
        }else {
            bool success = IERC20(_token).transferFrom(lender,address(this),_amount);
            require(success, "Transfer from user wallet not succcessful");
        }

        reserves[_token] += _amount;

        // if(!lendingHepler.isTokenInReserve(_token, reserveAssets)) {
        if(!isTokenInReserve(_token)) {
            reserveAssets.push(_token);
        }

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
            // If lender already lent the token and is lending again, update interest earned before updating lentQty
            for (uint i = 0; i < laLen; i++) {
                if(lenderAssets[lender][i].token == _token) {
                    lenderAssets[lender][i].lentQty += _amount;
                    lenderAssets[lender][i].lentApy = lendingConfig.INTEREST_RATE();
                    lenderAssets[lender][i].lendStartTimeStamp = block.timestamp;
                }
            }
        }
    }
    
    function withdraw(address _token, uint256 _amount) external 
    nonReentrant
    updateEarnedInterestOnLend(msg.sender, _token)
    payable returns(bool) {
        address lender  = msg.sender;
    
        require(isLenderTokenOwner(_token), "Not token owner");
       
        // amountAvailableToWithdraw must be set on the front-end (modal) to during withdrawl 
        // uint amountAvailableToWithdraw = getLenderAssetQty(lender, _token) - getBorrowerAssetQty(lender, _token);
        uint maxWithdrawQty = lendingHelper.getTokensPerUSDAmount(_token,getUserTotalAvailableBalanceInUSD(lender, TxMode.WITHDRAW)) * 1e18;
        require(maxWithdrawQty >= _amount,"Cannot withdraw more than balance");
        // Reserve must have enough withdrawl qty - this must always be true, so not sure why to code it
        require (reserves[_token] >= _amount, "Not enough qty in reserve pool to withdraw");
        reserves[_token] -= _amount;
       
        uint laLen = lenderAssets[lender].length;
        for (uint i = 0; i < laLen; i++) {
            if(lenderAssets[lender][i].token == _token) {
                lenderAssets[lender][i].lentQty -= _amount;
                lenderAssets[lender][i].lendStartTimeStamp = block.timestamp;
            }

             // TODO : commented because of the file size issue
             if(lenderAssets[lender][i].lentQty == 0) {
                delete lenderAssets[lender][i];
                lenderAssets[lender][i] = lenderAssets[lender][laLen - 1];
                lenderAssets[lender].pop();
                laLen -= 1;
            }
        }

        if(addressToTokenMap.isETH(_token)) {
            (bool success, ) = payable(lender).call{value: _amount}("");
            // Instead of using require, use if and Custom error so that above ops can be reversed
            require (success,"Transfer to Lender wallet not successful");
            emit Withdraw(lender, _token, _amount);
        }else {
            IERC20(_token).transfer(lender, _amount);
            // SafeERC20.safeTransfer(IERC20(_token), msg.sender, _amount);
        }

        return true;
    }

    /********************* BORROW FUNCTIONS ******************/
    function getAssetsToBorrow(address _borrower) public view returns(BorrowAsset[] memory) {
        
        uint maxAmountToBorrowInUSD = getUserTotalAvailableBalanceInUSD(_borrower, TxMode.BORROW); 
        uint length = reserveAssets.length;
        BorrowAsset[] memory borrowAsset = new BorrowAsset[](length);
        uint borrowAssetsCount;
        for(uint i = 0; i < length; i++) { 
            address token = reserveAssets[i];
            if(lendingConfig.isBorrowingEnabled(token)) {
                // uint borrowQty = getTokenQtyForUSDAmount(token, maxAmountToBorrowInUSD);
                // borrow qty is either tokens per max borrowbale USD amount or the ones in reserves of that token
                uint borrowQty = lendingHelper.min(lendingHelper.getTokensPerUSDAmount(token,maxAmountToBorrowInUSD), reserves[token]/1e18);
                borrowAsset[borrowAssetsCount] = BorrowAsset(token, borrowQty, lendingConfig.BORROW_RATE());
                borrowAssetsCount++;
            }
        }
        return borrowAsset;
    }


    function borrow(address _token, uint256 _borrowQty) public 
    nonReentrant
    updateEarnedInterestOnLend(msg.sender, _token)
    updateAccruedInterestOnBorrow(msg.sender, _token)
    returns(bool) {
        
        address borrower = msg.sender;
        uint256 borrowAmountInUSD = lendingHelper.getAmountInUSD(_token, _borrowQty);
        // This returns Total Lent USD * BORROW_THRESHOLD% - Total Borrowed USD by the borrower
        uint256 maxAmountToBorrowInUSD = getUserTotalAvailableBalanceInUSD(borrower, TxMode.BORROW);
        require(borrowAmountInUSD <= maxAmountToBorrowInUSD, "Not enough balance to borrow");
        require(_borrowQty <= reserves[_token], "Not enough qty in the reserve pool to borrow");
        // uint maxBorrowQty = getTokensPerUSDAmount(_token, maxAmountToBorrowInUSD);
        // _borrowQty = min(maxBorrowQty, _borrowQty);
        // require(maxBorrowQty > 0, "Borrow limit reached");
        require (borrower != address(0), "Transfer Not Possible");
        
        if(!isBorrowerTokenOwner(_token)) { 
             UserAsset memory userAsset = UserAsset({
                    user: borrower,
                    token: _token,
                    lentQty: 0,
                    borrowQty: _borrowQty,
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
                    borrowerAssets[borrower][i].borrowQty += _borrowQty;
                    borrowerAssets[borrower][i].borrowApy = lendingConfig.BORROW_RATE();
                    borrowerAssets[borrower][i].borrowStartTimeStamp = block.timestamp;
                }
            }
        }
        reserves[_token] -= _borrowQty;
        bool success = IERC20(_token).transfer(borrower, _borrowQty);
        require(success, "Tranfer to user's wallet not successful");
        return true;
    } 

    function repay(address _token, uint256 _amount) public 
    nonReentrant 
    updateEarnedInterestOnLend(msg.sender, _token)
    updateAccruedInterestOnBorrow(msg.sender, _token)
    {
        address borrower = msg.sender;
        // checking require conditions
        require(isTokenBorrowed(borrower, _token), "Token was not borrowed, Can't Repay");
        require(_amount <= getBorrowerAssetQty(borrower, _token), "Repay Amount should less than borrowed amount");

        // bool success = IERC20(_token).transfer(address(this), _amount);
        bool success = IERC20(_token).transferFrom(borrower, address(this), _amount);
        require(success, "Transfer from user wallet not succcessful");
        // 2. Update Token in Reserve
        reserves[_token] += _amount;

        // 4. Update BorrowAssets
        uint assetsLen = borrowerAssets[borrower].length;
        for (uint i = 0; i < assetsLen; i++) {
            if(borrowerAssets[borrower][i].token == _token) {
                borrowerAssets[borrower][i].borrowQty -= _amount;
                borrowerAssets[borrower][i].borrowStartTimeStamp = block.timestamp;
            }
            // TODO: Remove
            if(borrowerAssets[borrower][i].borrowQty == 0) {
                delete borrowerAssets[borrower][i];
                borrowerAssets[borrower][i] = borrowerAssets[borrower][assetsLen - 1];
                borrowerAssets[borrower].pop();
                assetsLen -= 1;
            }
        }
    }

    /*************************** HELPER FUNCTIONS ***************************************/

    function isTokenInReserve(address _token) public view returns(bool) {
        uint reservesAssetsLength = reserveAssets.length;
        for(uint i=0; i < reservesAssetsLength; i++) {
            if(reserveAssets[i] == _token) {
                return true;
            }
        }
        return false;
    } 

    function isTokenBorrowed(address _borrower, address _token) public view returns(bool) {
        uint256 assetLen = borrowerAssets[_borrower].length;
        for(uint256 i=0; i < assetLen; i++) {
            if(borrowerAssets[_borrower][i].token == _token) {
                return true;
            }
        }
        return false;
    }
    
    function getLenderAssetQty(address _lender, address _token) public view returns(uint256){
        uint laLen = lenderAssets[_lender].length;
        for (uint i = 0; i < laLen; i++) {
            if(lenderAssets[_lender][i].token == _token) {
                return lenderAssets[_lender][i].lentQty;
            }
        }
        return 0;
    }

    function getBorrowerAssetQty(address _borrower, address _token) public view returns(uint256){
        uint baLen = borrowerAssets[_borrower].length;
        for (uint i = 0; i < baLen; i++) {
            if(borrowerAssets[_borrower][i].token == _token) {
                return borrowerAssets[_borrower][i].borrowQty;
            }
        }
        return 0;
    }

    function getLenderAssets(address _lender) public view returns (UserAsset[] memory) {
        return lenderAssets[_lender];
    }

    function getBorrowerAssets(address _borrower) public view returns (UserAsset[] memory) {
        return borrowerAssets[_borrower];
    }

    function getUserTotalAvailableBalanceInUSD(address _user, TxMode _txmode) public view returns(uint256) {
        uint256 userTotalLentUSDBalance;
        uint256 userTotalBorrowAmountInUSD;

        uint256 laLen = lenderAssets[_user].length;
        for(uint256 i =0; i < laLen; i++) {
            // userTotalLentUSDBalance - USD Balance for all tokens lent by the user
            userTotalLentUSDBalance += lendingHelper.getAmountInUSD(lenderAssets[_user][i].token, lenderAssets[_user][i].lentQty);
        }
        
        uint256 borrowerAssetsLength = borrowerAssets[_user].length;
        for(uint256 i =0; i < borrowerAssetsLength; i++) {
            userTotalBorrowAmountInUSD += lendingHelper.getAmountInUSD(borrowerAssets[_user][i].token, borrowerAssets[_user][i].borrowQty);
        }
        if (_txmode == TxMode.BORROW) {
            return ((userTotalLentUSDBalance * lendingConfig.BORROW_THRESHOLD()/100) - userTotalBorrowAmountInUSD);
        }
        return userTotalLentUSDBalance - userTotalBorrowAmountInUSD;
    }


}