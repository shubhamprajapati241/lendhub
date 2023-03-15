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
        uint256 borrowEndTimeStamp;
        uint256 maturityPeriod;  
    }

    struct BorrowAsset {
        address asset;
        uint256 qty;
        uint256 borrowApy;
    }

    error CannotBorrowAmount(); 

    modifier onlyAmountGreaterThanZero(uint256 amount) {
        require(amount > 0, "Greater than zero");
        _; 
    }

    // This function will be called internally but will be called by the Web3 App so make it public 
    modifier updateEarnedInterest(address _lender) {
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
        _;
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
        deployer = msg.sender;
        INTEREST_RATE  = _interestRate;
        BORROW_RATE = _borrowRate;
    }

    function getContractETHBalance() public view returns(uint){
        return address(this).balance;
    }

    function getTokenBalance(address _address, address _token) public view returns(uint) {
        return IERC20(_token).balanceOf(_address);
    }

    // TODO : make internal
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

   /************* Lender functions ************************/
    receive() external payable {}
    fallback() external payable {}

    function lend(address _token, uint256 _amount) public updateEarnedInterest(msg.sender) payable {
        address lender = msg.sender;
        string memory _symbol = addressToTokenMap.getAddress(_token);

        bool _usageAsCollateralEnabled = (keccak256(abi.encodePacked(_symbol)) == keccak256(abi.encodePacked("ETH"))) ? true: false;
        bool _usageAsBorrowEnabled = (keccak256(abi.encodePacked(_symbol)) == keccak256(abi.encodePacked("ETH"))) ? false: true;
        
        if(!lendingConfig.isTokenInAssets(_token)) {
            lendingConfig.addAsset(
                _token,
                _usageAsBorrowEnabled, 
                _usageAsCollateralEnabled,
                false, 
                true,
                _symbol,
                DECIMALS,
                BORROW_THRESHOLD,
                LIQUIDATION_THRESHOLD 
            );
        }

        if(keccak256(abi.encodePacked(_symbol)) == keccak256(abi.encodePacked("ETH"))) {
            (bool success, ) = address(this).call{value : msg.value}("");
            require(success, "Deposit failed");
        }else {
            IERC20(_token).transferFrom(lender,address(this),_amount);
        }

        reserves[_token] += _amount;

        if(!isTokenInReserve(_token)) {
            reserveAssets.push(_token);
        }

        
        // 1. Get the length on userasset array
        // 2. If no assets => create a asset struct => push
        // 3. If array not empty => check is token is in array or not 
        // 4. If token is in array => update values
        // 5. If token is not in array => create a asset struct => push

        uint lenderAssetLength = lenderAssets[lender].length;
        // token is not owned by lender so push into lender asset
        if(!isLenderTokenOwner(_token)) { 
            UserAsset memory userAsset = UserAsset({
                user: lender,
                token: _token,
                lentQty: _amount,
                borrowQty: 0,
                lentApy: INTEREST_RATE,
                borrowApy: 0,
                lendStartTimeStamp: block.timestamp,
                borrowStartTimeStamp:0,
                borrowEndTimeStamp : 0,
                maturityPeriod : 0
            });
            lenderAssets[lender].push(userAsset);
        }else {
            // If lender already lent the token and is lending again, update interest earned before updating lentQty
            //   updateEarnedInterest(lender);
              for (uint i = 0; i < lenderAssetLength; i++) {
                if(lenderAssets[lender][i].token == _token) {
                    lenderAssets[lender][i].lentApy = INTEREST_RATE;
                    lenderAssets[lender][i].lentQty += _amount;
                    lenderAssets[lender][i].lendStartTimeStamp = block.timestamp;
                }
              }
        }
    }
    
    function withdraw(address _token, uint256 _amount) external updateEarnedInterest(msg.sender) payable returns(bool) {
        address lender  = msg.sender;

        //TODO
        /* 
            1. withdraw amount = lent amount - borrow amount //? IMPLEMENTED
            Hold => V2: 2. lender can't withdraw before locking period expires
        */

        require(isLenderTokenOwner(_token), "Not token owner");
       
        // check if the owner has reserve
        // require(getLenderAssetQty(lender, _token) >= _amount,"Not enough balance to withdraw");

        // we update the earned rewwards before the lender can withdraw
        // updateEarnedInterest(lender); //100 + 0.00001 eth , 2 // TODO: implement 

        // amountAvailableToWithdraw must be set on the front-end (modal) to during withdrawl 
        // TODO: Use total USD for all lends instead of just ETH and the token
        uint amountAvailableToWithdraw = getLenderAssetQty(lender, _token) - getBorrowerAssetQty(lender, _token);
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

        string memory _symbol = addressToTokenMap.getAddress(_token);

        if(keccak256(abi.encodePacked(_symbol)) == keccak256(abi.encodePacked("ETH"))) {
            (bool success, ) = payable(lender).call{value: _amount}("");
            require (success,"Tranfer to user's wallet not successful");
        }else {
            IERC20(_token).transfer(lender,_amount);
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
        uint lenderTokenQty = _maxAmountInUSD / (oneTokenEqualToHowManyUSD(_token));
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
        uint256 borrowerAssetsLength =  borrowerAssets[borrower].length;

        updateAccruedInterestOnBorrow(borrower);

        if(borrowerAssetsLength == 0) {
             UserAsset memory userAsset = UserAsset({
                    user: borrower,
                    token: _token,
                    lentQty: 0,
                    borrowQty: _amount,
                    lentApy: 0,
                    borrowApy: BORROW_RATE,
                    lendStartTimeStamp: 0,
                    borrowStartTimeStamp: block.timestamp,
                    borrowEndTimeStamp : 0,
                    maturityPeriod : 0
                });
                borrowerAssets[borrower].push(userAsset);
        }else {
             for (uint256 i=0 ; i < borrowerAssetsLength; i++) {
                if(borrowerAssets[borrower][i].token == _token) {
                    uint256 borrowerTotalAmount = borrowerAssets[borrower][i].borrowQty + _amount;
                    borrowerAssets[borrower][i].borrowQty = borrowerTotalAmount;
                    borrowerAssets[borrower][i].borrowApy = BORROW_RATE;
                    borrowerAssets[borrower][i].borrowStartTimeStamp = block.timestamp;
                    borrowerAssets[borrower][i].borrowEndTimeStamp = 0;
                    borrowerAssets[borrower][i].maturityPeriod = 0;
                }else {
                    UserAsset memory userAsset = UserAsset({
                        user: borrower,
                        token: _token,
                        lentQty: 0,
                        borrowQty: _amount,
                        lentApy: 0,
                        borrowApy: BORROW_RATE,
                        lendStartTimeStamp: 0,
                        borrowStartTimeStamp: block.timestamp,
                        borrowEndTimeStamp : 0,
                        maturityPeriod : 0
                    });
                    borrowerAssets[borrower].push(userAsset);
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
        bool success = IERC20(_token).transferFrom(borrower, address(this), _amount);
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

    function oneTokenEqualToHowManyUSD(address _tokenAddress) public view returns(uint)  {

        if(keccak256(abi.encodePacked( addressToTokenMap.getAddress(_tokenAddress))) == keccak256(abi.encodePacked('ETH'))) {
            return 1467;
        }

        if(keccak256(abi.encodePacked( addressToTokenMap.getAddress(_tokenAddress))) == keccak256(abi.encodePacked('DAI'))) {
            return 1;
        }

        if(keccak256(abi.encodePacked( addressToTokenMap.getAddress(_tokenAddress))) == keccak256(abi.encodePacked('USDC'))) {
            return  1;
        }

        if(keccak256(abi.encodePacked( addressToTokenMap.getAddress(_tokenAddress))) == keccak256(abi.encodePacked('LINK'))) {
            return 6;
        }

        return 1;

        // AggregatorV3Interface priceFeed;
        // address tokenToUSDAddress = getPriceFeedMap(_tokenAddress);
        // priceFeed = AggregatorV3Interface(tokenToUSDAddress);
        // (,int price,,,) = priceFeed.latestRoundData();
        // uint256 decimal = priceFeed.decimals();
        // uint currentPrice = uint(price) / (10** decimal);
        // return currentPrice;
    }

    function getAmountInUSD(address _token, uint256 _amount) public view returns(uint) {
        uint totalAmountInDollars = uint(oneTokenEqualToHowManyUSD(_token)) * (_amount / 1e18 );
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
