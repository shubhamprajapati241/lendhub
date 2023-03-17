// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./AddressToTokenMap.sol";
import "./LendingConfig.sol";
import "./AggregatorV3Interface.sol";


contract LendingPool is ReentrancyGuard {

    AddressToTokenMap addressToTokenMap;
    LendingConfig lendingConfig;

    event TransferAsset(address lender, address _token, uint _amount);

    address deployer;
    uint256 public INTEREST_RATE;
    uint256 public BORROW_RATE;
    uint256 public constant DECIMALS = 18;
    uint256 public constant BORROW_THRESHOLD = 80;
    uint256 public constant LIQUIDATION_THRESHOLD = 120;
    uint32 public constant BORROW_DURATION_30 = 30 days;
    uint32 public constant BORROW_DURATION_60 = 60 days;
    uint32 public constant BORROW_DURATION_90 = 90 days;

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

    error CannotBorrowAmount(); 

    modifier onlyAmountGreaterThanZero(uint256 amount) {
        require(amount > 0, "Greater than zero");
        _; 
    }

    // This function will be called internally but will be called by the Web3 App so make it public 
    function updateEarnedInterest(address _lender) public {
        uint lenderAssetLength = lenderAssets[_lender].length;
        for (uint i = 0; i < lenderAssetLength; i++) {
                lenderAssets[_lender][i].lentQty += //Principal + 
                (
                    ((block.timestamp - lenderAssets[_lender][i].lendStartTimeStamp)//Time
                    /86400
                    * INTEREST_RATE //Interest Rate 
                    * 1e18 //Account for Decimals // TODO: Should we even include this?
                    )/100
                );
                lenderAssets[_lender][i].lendStartTimeStamp = block.timestamp;
        }
    }

    // This function will be called internally but will be called by the Web3 App so make it public 
    function updateAccruedInterestOnBorrow(address _borrower) internal {
        uint borrowerAssetLength = borrowerAssets[_borrower].length;
        for (uint i = 0; i < borrowerAssetLength; i++) {
                borrowerAssets[_borrower][i].borrowQty += //Principal + 
                (
                    ((block.timestamp - borrowerAssets[_borrower][i].borrowStartTimeStamp)  //Time
                    /86400
                    * BORROW_RATE //Interest Rate 
                    * 1e18 //Account for Decimals
                    )/100
                );
                borrowerAssets[_borrower][i].borrowStartTimeStamp = block.timestamp;
        }
    }


    constructor(AddressToTokenMap _addressToTokenMapAddress, LendingConfig _lendingConfigAddress, uint256 _interestRate, uint256 _borrowRate) {
        addressToTokenMap = _addressToTokenMapAddress;
        lendingConfig = _lendingConfigAddress;
        INTEREST_RATE  = _interestRate;
        BORROW_RATE = _borrowRate;
        deployer = msg.sender;
    }

    function getContractETHBalance() public view returns(uint){
        return address(this).balance;
    }

    function getTokenBalance(address _address, address _token) public view returns(uint) {
        return IERC20(_token).balanceOf(_address);
    }

    function isLenderTokenOwner(address _token) internal view returns(bool) {
        uint256 lenderAssetCount = lenderAssets[msg.sender].length;
        for (uint i = 0; i < lenderAssetCount; i++) {
            if (lenderAssets[msg.sender][i].user == msg.sender 
                && lenderAssets[msg.sender][i].token == _token){
                return true;
            }
        }
        return false;
    }

    function isBorrowerTokenOwner(address _token) internal view returns(bool) {
        uint256 borroweAssetCount = borrowerAssets[msg.sender].length;
        for (uint i = 0; i < borroweAssetCount; i++) {
            if (borrowerAssets[msg.sender][i].user == msg.sender 
                && borrowerAssets[msg.sender][i].token == _token){
                return true;
            }
        }
        return false;
    }


    function isTokenInReserve(address _token) public view returns(bool) {
        uint reservesAssetsLength = reserveAssets.length;
        for(uint i=0; i < reservesAssetsLength; i++) {
            if(reserveAssets[i] == _token) {
                return true;
            }
        }
        return false;
    } 

    function getBalance(address _address) public view returns(uint) {
        return _address.balance;
    }

    function getSymbol(address _token) public view returns(string memory) {
        return addressToTokenMap.getAddress(_token);
    }

    function isETH(address _token) public view returns(bool) {
        if (keccak256(abi.encodePacked(getSymbol(_token))) == keccak256(abi.encodePacked("ETH"))) {
            return true;
        }
        return false;
    }

   /************* Lender functions ************************/
    receive() external payable {}

    function lend(address _token, uint256 _amount) public payable {
        address lender = msg.sender;

        bool _usageAsCollateralEnabled = isETH(_token) ? true: false;
        bool _usageAsBorrowEnabled = isETH(_token) ? false: true;
        
        if(!lendingConfig.isTokenInAssets(_token)) {
            lendingConfig.addAsset(
                _token,
                _usageAsBorrowEnabled, 
                _usageAsCollateralEnabled,
                false, 
                true,
                getSymbol(_token),
                DECIMALS,
                BORROW_THRESHOLD,
                LIQUIDATION_THRESHOLD 
            );
        }

        if(isETH(_token)) {
            (bool success, ) = address(this).call{value : msg.value}("");
            require(success, "Deposit failed");
        }else {
            IERC20(_token).transferFrom(lender,address(this),_amount);
        }

        reserves[_token] += _amount;

        if(!isTokenInReserve(_token)) {
            reserveAssets.push(_token);
        }

        uint lenderAssetLength = lenderAssets[lender].length;
        if(!isLenderTokenOwner(_token)) { 
            UserAsset memory userAsset = UserAsset({
                user: lender,
                token: _token,
                lentQty: _amount,
                borrowQty: 0,
                lentApy: INTEREST_RATE,
                borrowApy: 0,
                lendStartTimeStamp: block.timestamp,
                borrowStartTimeStamp:0
            });
            lenderAssets[lender].push(userAsset);
        }else {
              // If lender already lent the token and is lending again, update interest earned before updating lentQty
              updateEarnedInterest(lender);

              for (uint i = 0; i < lenderAssetLength; i++) {
                if(lenderAssets[lender][i].token == _token) {
                    lenderAssets[lender][i].lentQty += _amount;
                    lenderAssets[lender][i].lentApy = INTEREST_RATE;
                    lenderAssets[lender][i].lendStartTimeStamp = block.timestamp;
                }
            }
        }
    }
    
    function withdraw(address _token, uint256 _amount) external payable returns(bool) {
        address lender  = msg.sender;
    
        require(isLenderTokenOwner(_token), "Not token owner");
       
        // we update the earned rewwards before the lender can withdraw
        updateEarnedInterest(lender);

        // amountAvailableToWithdraw must be set on the front-end (modal) to during withdrawl 
        // TODO: Use total USD for all lends instead of just ETH and the token
        uint amountAvailableToWithdraw = getLenderAssetQty(lender, _token) - getBorrowerAssetQty(lender, _token);
        // uint amountAvailableToWithdraw = LendUSD - BorrowUSD;
        // USDToBorrowbaleQty(amountAvailableToWithdraw)
        require(amountAvailableToWithdraw >= _amount,"Cannot withdraw more than balance");

        // Reserve must have enough withdrawl qty 
        require (reserves[_token] >= _amount, "Not enough qty in reserve pool to withdraw");
        reserves[_token] -= _amount;
       
        uint lenderAssetLength = lenderAssets[lender].length;
        for (uint i = 0; i < lenderAssetLength; i++) {
            if(lenderAssets[lender][i].token == _token) {
                lenderAssets[lender][i].lentQty -= _amount;
                lenderAssets[lender][i].lendStartTimeStamp = block.timestamp;
            }
        }

        if(isETH(_token)) {
            (bool success, ) = payable(lender).call{value: _amount}("");
            // Instead of using require, use if and Custom error so that above ops can be reversed
            require (success,"Transfer to Lender wallet not successful");
            emit TransferAsset(lender, _token, _amount);
        }else {
            IERC20(_token).transfer(lender, _amount);
        }
        return true;
    }

    /********************* BORROW FUNCTIONS ******************/
    function getAssetsToBorrow(address _borrower) public view returns(BorrowAsset[] memory) {
        uint maxAmountToBorrowInUSD = (getUserTotalAmountAvailableForBorrowInUSD(_borrower) * BORROW_THRESHOLD)/ 100; 
        
        uint length = reserveAssets.length;

        BorrowAsset[] memory borrowAsset = new BorrowAsset[](length - 1);
        
        uint borrowAssetsCount = 0;
        for(uint i = 0; i < length; i++) { 
            address token = reserveAssets[i];
            if(lendingConfig.isBorrowingEnable(token)) {
                uint borrowQty = getReserveTokenQtyToBorrow(token, maxAmountToBorrowInUSD);
                borrowAsset[borrowAssetsCount] = BorrowAsset(token, borrowQty, BORROW_RATE);
                borrowAssetsCount++;
            }
        }
        return borrowAsset;
    }


    function getReserveTokenQtyToBorrow(address _token, uint _maxAmountInUSD) public view returns(uint) {
        uint lenderTokenQty = _maxAmountInUSD / (getCurrentTokenPrice(_token));
        return lenderTokenQty < reserves[_token] ? lenderTokenQty : reserves[_token];
    }

    function borrow(address _token, uint256 _amount) public 
    nonReentrant 
    onlyAmountGreaterThanZero(_amount) 
    returns(bool) {
        
        address borrower = msg.sender;
        uint256 borrowAmountInUSD = getAmountInUSD(_token, _amount);

        uint256 maxAmountToBorrowInUSD = (getUserTotalAmountAvailableForBorrowInUSD(borrower) * BORROW_THRESHOLD)/ 100;
        require(borrowAmountInUSD <= maxAmountToBorrowInUSD, "Not enough balance to borrow");

        require(_amount <= reserves[_token], "Not enough qty in the reserve pool to borrow");
        

        updateAccruedInterestOnBorrow(borrower);

        if(!isBorrowerTokenOwner(_token)) { 
             UserAsset memory userAsset = UserAsset({
                    user: borrower,
                    token: _token,
                    lentQty: 0,
                    borrowQty: _amount,
                    lentApy: 0,
                    borrowApy: BORROW_RATE,
                    lendStartTimeStamp: 0,
                    borrowStartTimeStamp: block.timestamp
                });
                borrowerAssets[borrower].push(userAsset);
        }else {
            uint256 borrowerAssetsLength =  borrowerAssets[borrower].length;
            for (uint256 i=0 ; i < borrowerAssetsLength; i++) {
                if(borrowerAssets[borrower][i].token == _token) {
                    borrowerAssets[borrower][i].borrowQty += _amount;
                    borrowerAssets[borrower][i].borrowApy = BORROW_RATE;
                    borrowerAssets[borrower][i].borrowStartTimeStamp = block.timestamp;
                }
            }
        }
        reserves[_token] -= _amount;
        bool success = IERC20(_token).transfer(borrower, _amount);
        require(success, "Tranfer to user's wallet not successful");
        return true;
    } 

    function repay(address _token, uint256 _amount) public 
    nonReentrant 
    onlyAmountGreaterThanZero(_amount){

        address borrower = msg.sender;

        // checking require conditions
        require(isTokenBorrowed(borrower, _token), "Token was not borrowed, Can't Repay");
        require(_amount <= getBorrowerAssetQty(borrower, _token), "Repay Amount should less than borrowed amount");
        // Calculate the interest accrued on borrow
        updateAccruedInterestOnBorrow(borrower);

        // 1. Transfer token from User to SC


        // TODO : token balance reduce from contract => EOA
        // TODO:  token convert into ETH and add it into user ETH account ??
        bool success = IERC20(_token).transfer(borrower, _amount);
        require(success, "Transfer to user's wallet not succcessful");
        // 2. Update Token in Reserve
        reserves[_token] += _amount;

        // 4. Update BorrowAssets
        uint assetsLen = borrowerAssets[borrower].length;
        for (uint i = 0; i < assetsLen; i++) {
            if(borrowerAssets[borrower][i].token == _token) {
                borrowerAssets[borrower][i].borrowQty -= _amount;
                borrowerAssets[borrower][i].borrowStartTimeStamp = block.timestamp;
            }

            if(borrowerAssets[borrower][i].borrowQty == 0) {
                delete borrowerAssets[borrower][i];
                borrowerAssets[borrower][i] = borrowerAssets[borrower][assetsLen - 1];
                borrowerAssets[borrower].pop();
            }
        }
    }

    /*************************** HELPER FUNCTIONS ***************************************/
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
        uint lenderAssetLength = lenderAssets[_lender].length;
        for (uint i = 0; i < lenderAssetLength; i++) {
            if(lenderAssets[_lender][i].token == _token) {
                return lenderAssets[_lender][i].lentQty;
            }
        }
        return 0;
    }

    function getBorrowerAssetQty(address _borrower, address _token) public view returns(uint256){
        uint borrowerAssetLength = borrowerAssets[_borrower].length;
        for (uint i = 0; i < borrowerAssetLength; i++) {
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

    function getCurrentTokenPrice(address _tokenAddress) public view returns(uint)  {

        // This does not work for Hardhat, chainlink Price Feed is only on Goerli Network
        // AggregatorV3Interface priceFeed;
        // address priceFeedAddress = getPriceFeedMap(_tokenAddress);
        // priceFeed = AggregatorV3Interface(priceFeedAddress);
        // (,int price,,,) = priceFeed.latestRoundData();
        // uint256 decimal = priceFeed.decimals();
        // uint currentPrice = uint(price) / (10 ** decimal);
        // return currentPrice;

        if(isETH(_tokenAddress)) {
            return 1467;
        }
        else if(keccak256(abi.encodePacked(getSymbol(_tokenAddress))) == keccak256(abi.encodePacked('DAI'))) {
            return 1;
        }
        else if(keccak256(abi.encodePacked(getSymbol(_tokenAddress))) == keccak256(abi.encodePacked('USDC'))) {
            return  1;
        }
        else if(keccak256(abi.encodePacked(getSymbol(_tokenAddress))) == keccak256(abi.encodePacked('LINK'))) {
            return 6;
        }
        return 1;
    }

    function getAmountInUSD(address _token, uint256 _amount) public view returns(uint) {
        uint totalAmountInDollars = uint(getCurrentTokenPrice(_token)) * (_amount / 1e18 );
        return totalAmountInDollars;
    }

    function getUserTotalAmountAvailableForBorrowInUSD(address _user) public view returns(uint256) {
        uint256 userTotalLentUSDBalance;
        uint256 userTotalBorrowAmountInUSD;

        uint256 lenderAssetLength = lenderAssets[_user].length;
        for(uint256 i =0; i < lenderAssetLength; i++) {
            // userTotalLentUSDBalance - USD Balance for all tokens lent by the user
            userTotalLentUSDBalance += getAmountInUSD(lenderAssets[_user][i].token, lenderAssets[_user][i].lentQty);
        }
        // userTotalETHLendAmoutInUSD = getAmountInUSD(ethAddress, totalLendETH);
        uint256 borrowerAssetsLength = borrowerAssets[_user].length;
        for(uint256 i =0; i < borrowerAssetsLength; i++) {
            userTotalBorrowAmountInUSD += getAmountInUSD(borrowerAssets[_user][i].token, borrowerAssets[_user][i].borrowQty);
        }
        return userTotalLentUSDBalance - userTotalBorrowAmountInUSD;
    }


}
