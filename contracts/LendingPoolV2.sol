// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

// import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "./LendingConfig.sol";
import "./AggregatorV3Interface.sol";
import "./AddressToTokenMap.sol";
contract LendingPoolV2 is ReentrancyGuard {
    using SafeMath for uint;

    //* 1. Declaring the variables
    address deployer;
    uint256 public INTEREST_RATE;
    uint256 public BORROW_RATE;
     uint256 public constant DECIMALS = 18;
    uint256 public constant BORROW_THRESHOLD = 80;
    uint256 public constant LIQUIDATION_THRESHOLD = 10;
    uint32 public constant BORROW_DURATION_30 = 30 days;
    uint32 public constant BORROW_DURATION_60 = 60 days;
    uint32 public constant BORROW_DURATION_90 = 90 days;

    LendingConfig lendingConfig;
    AddressToTokenMap addressToTokenMap;
   
    //* 2. Declaring the mapping
    // asset token => reserve qty
    mapping (address => uint) public reserves;
    // For iteration - Do we need this?
    address[] reserveAssets; 
    // mapping(address => mapping(address => uint)) lenderAssets;
    mapping(address => UserAsset[]) public lenderAssets;
    mapping(address => UserAsset[]) public borrowerAssets;

    // lenderAddress => ethqty : For ETH Lend - Borrow management
    mapping(address => uint) public lenderETHBalance;
    
    //* 3. Declaring the structs
    struct UserAsset {
        address user;
        address token;
        uint256 lentQty;
        uint256 borrowQty;
        uint256 lentApy;
        uint256 borrowApy;
        uint256 lendStartTimeStamp;
        uint256 borrowStartTimeStamp;
        uint256 borrowEndTimeStamp; // borrow maturity timestrap
        uint256 maturityPeriod;  
    }

    // UserAsset[] public userAssets;
    struct BorrowAsset {
        address asset;
        uint256 qty;
        uint256 apy;
    }

    // * Declare the events
    event Lend(address indexed lender, uint256 indexed amount, uint indexed reservesAmount, uint lenderETHBalance);

    event Withdraw(address indexed lender, uint256 indexed amount, uint indexed reservesAmount, uint lenderETHBalance);

    event Borrow(address indexed borrower, uint256 indexed amount, uint indexed reservesAmount, uint lenderETHBalance);

    event Repay(address indexed borrower, uint256 indexed amount, uint indexed reservesAmount, uint lenderETHBalance);

    constructor(uint256 _interestRate, uint256 _borrowRate) {
        deployer = msg.sender;
        // Use logic like REWARDS staking
        INTEREST_RATE  = _interestRate;
        // If interest rate is 3.5, pass 350, it will be converted to 3.5
        BORROW_RATE = _borrowRate;
    }

    //* 4. Declare modifiers
    modifier onlyLender(address _token) {
        require(isLenderTokenOwner(_token), "Not token owner");
        _;        
    }

    modifier onlyBorrower(address _token) {
        require(isBorrowerHasBorrow(_token), "Borrower haven't borrowed");
        _;
    }

    modifier onlyAmountGreaterThanZero(uint256 amount) {
        require(amount > 0, "Amount must be greater than zero");
        _; 
    }

    modifier onlyTokenInReserve(address _token) {
        require(isTokenInReserve(_token), "Token must be in reserve"); // checking token is in reserve or NOT
        _;
    }

    // To initially transfer some ETH 
    function transfer() public payable {
    }

    function getContractBalance() public view returns(uint){
        return address(this).balance;
    } 


    function isLenderTokenOwner(address _token) internal view returns(bool) {
        address lender = msg.sender; 
        uint256 lenderAssetCount = lenderAssets[lender].length;
        for (uint i = 0; i < lenderAssetCount; i++) {
            if (lenderAssets[lender][i].user == lender && lenderAssets[lender][i].token == _token){
                return true;
            }
        }
        return false;
    }

    function isBorrowerHasBorrow(address _token) internal view returns(bool) {
        address borrower = msg.sender; 
        uint256 totalLength = borrowerAssets[borrower].length;
        for (uint i = 0; i < totalLength; i++) {
            if (borrowerAssets[borrower][i].user == borrower && borrowerAssets[borrower][i].token == _token){
                return true;
            }
        }
        return false;
    }


    // function isTokenOwner(address _user, address _token) internal view returns(bool) {
    //     uint256 userAssetLength = userAssets.length;
    //     for (uint i = 0; i < userAssetLength; i++) {
    //         if (userAssets[i].user == _user && userAssets[i].token == _token){
    //             return true;
    //         }
    //     }
    //     return false;
    // }

    function isTokenInReserve(address _token) public view returns(bool) {
        uint reservesAssetsLength = reserveAssets.length;
        for(uint i=0; i < reservesAssetsLength; i++) {
            if(reserveAssets[i] == _token) {
                return true;
            }
        }
        return false;
    } 

   /************* Lender functions ************************/
    receive() external payable {}

    function lend(address _token, uint256 _amount) public payable {
        address lender = msg.sender;

        bool _usageAsCollateralEnabled = (keccak256(abi.encodePacked(_token)) == keccak256(abi.encodePacked("ETH"))) ? true: false;
        // Borrowing disabled for the ETH right
        bool _usageAsBorrowEnabled = (keccak256(abi.encodePacked(_token)) == keccak256(abi.encodePacked("ETH"))) ? false: true;
        
        string memory _symbol = addressToTokenMap.getAddress(_token);
        
        if(!lendingConfig.isTokenInAssets(_token)) {
            lendingConfig.addAsset(
                _token,
                _usageAsBorrowEnabled, 
                _usageAsCollateralEnabled,
                false, //_isfrozen
                true, //_isActive
                _symbol,
                DECIMALS,
                BORROW_THRESHOLD,
                LIQUIDATION_THRESHOLD 
            );
        }

        address ethAddress = lendingConfig.getAssetByTokenSymbol("ETH").token;

        // transfer from the lender's wallet to DeFi app or SC 
        if(_token == ethAddress) {
            // // Call for ETH : from lender's wallet to SC
            // (bool success, ) = payable(address(this)).call{value : _amount}("");
            // require(success, "Deposit failed");

            // * Borrow is against ETH Only => Balance of lentAssets is display only
            lenderETHBalance[lender] += _amount;
        }else {
            // //transfer token from the lender's wallet to DeFi app or SC 
            // IERC20(_token).transferFrom(lender,address(this),_amount);
        }

        // Add to Lending Pool a.k.a reserves
        // If using a struct, use a function getCurrentReserve() and add to the struct, that increases gas cost
        reserves[_token] += _amount;
        // Add to reserve assets for enabling iteration
        reserveAssets.push(_token);

        // Add to lenders assets with amount - Add to userAssets struct
        // can use the mapping instead of loop over struct array
        uint lenderAssetLength = lenderAssets[lender].length;
        for (uint i = 0; i < lenderAssetLength; i++) {
            if(lenderAssets[lender][i].token == _token) {
                // amount += lenderAssets[lender][i].lentQty;
                lenderAssets[lender][i].lentApy = INTEREST_RATE;
                lenderAssets[lender][i].lentQty += _amount;
                lenderAssets[lender][i].lendStartTimeStamp = block.timestamp;
            }else {
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
                // add to lender asset list
                lenderAssets[lender].push(userAsset);

                // Push to the struct array
                // userAssets.push(userAsset);                
            }
        }

        emit Lend(lender, _amount, reserves[_token], lenderETHBalance[lender]);

        // UserAsset memory userAsset = UserAsset({
        //     user: lender,
        //     token: _token,
        //     lentQty: amount,
        //     borrowQty: 0,
        //     apy: INTEREST_RATE,
        //     borrowRate: 0,
        //     lendStartTimeStamp: block.timestamp,
        //     borrowStartTimeStamp:0
        // });
        // add to lender asset list
        // lenderAssets[lender].push(userAsset);
    }


    function withdraw(address _token, uint256 _amount) external onlyLender(_token) payable returns(bool) {

        address lender  = msg.sender;
        // check if the owner has reserve
        require(getLenderAssetBal(lender, _token) >= _amount,"Not enough balance to withdraw");
        // we update the earned rewwards before the lender can withdraw
        //updateEarned(lender, _token); //100 + 0.00001 eth , 2 // TODO: implement 
        // Reserve must have enough withdrawl qty 
        require (reserves[_token] >= _amount, "Not enough qty in reserve pool to withdraw");
        // Remove from reserve
        reserves[_token] -= _amount;
        // Remove amount from lender assets
        uint lenderAssetLength = lenderAssets[lender].length;
        for (uint i = 0; i < lenderAssetLength; i++) {
            if(lenderAssets[lender][i].token == _token) {
                // subtract the quantity
                lenderAssets[lender][i].lentQty -= _amount;
                // Reset lender timestamp - this might cause an error
                lenderAssets[lender][i].lendStartTimeStamp = block.timestamp;
            }
        }

        // Updating lenderETHBalance
        address ethAddress = lendingConfig.getAssetByTokenSymbol("ETH").token;
        if(_token == ethAddress) {
            lenderETHBalance[lender] -= _amount;
        }

        // transfer from contract to lender's wallet - apprval not necessary
        // (bool success, ) = payable(lender).call{value: _amount}(""); //ETH Value
        bool success = IERC20(_token).transferFrom(address(this),lender,_amount);
        require (success,"Tranfer to user's wallet not successful");

        emit Withdraw(lender, _amount, reserves[_token], lenderETHBalance[lender]);
        // Emit withrawl event
        return true;
    }

    /********************* BORROW FUNCTIONS ******************/

    function getAssetsToBorrow(address _borrower) public view returns(BorrowAsset[] memory) {
        /* TODO : 
            1. Require ETH in collateral & Get user ETh balance in USD
            2. Calculate 80% of ETH balance
            3. Get total count of not collateral assets in the reserve
            4. Get assets to borrow from reserve
            5. Check reserve qty > borrow qty 
            6. Return BorrowAssetsArray
        */

        //  1. Require ETH in collateral & Get ETH balance in USD
        // uint ethBalance =  getLenderETHBalanceForBorrowInUSD(_borrower); // Short method
        uint ethBalance = getUserTotalAmountAvailableForBorrowInUSD(_borrower); // long method
        require(ethBalance > 0 , "First Deposit ETH as Collateral");

        // 2. Calculate 80% of ETH balance
        uint maxAmountToBorrowInUSD = (ethBalance * BORROW_THRESHOLD)/ 100; // Problem: Not getting the decimal value; 96 96.8
        
        // 3. Get total count of not collateral assets in the reserve
        uint length = reserveAssets.length;
        uint count = 0;
        for(uint i = 0 ; i< length; i++) {
            address token = reserveAssets[i];
            if(lendingConfig.isCollateralEnable(token)) {
                count = count + 1;
            }
        }

        // 4. Getting assets to borrow from reserve
        BorrowAsset[] memory borrowAsset = new BorrowAsset[](count);
        uint borrowAssetsCount = 0;
        for(uint i = 0; i < length; i++) {
            address token = reserveAssets[i];
            if(lendingConfig.isBorrowingEnable(token)) {
                // Get Token total amount from reserve
                uint reserveAmountInUSD = getAmountInUSD(token, reserves[token]);
                //  4. Check reserve qty > borrow qty 
                if(reserveAmountInUSD > maxAmountToBorrowInUSD) {
                    // TODO : ASK TO SASI => make a conversion of _maxAmountToBorrowInUSD on that paricular Token Qty
                    uint borrowQty = maxAmountToBorrowInUSD;
                    borrowAsset[borrowAssetsCount] = BorrowAsset(token, borrowQty, 3);
                    borrowAssetsCount++;
                }
            }
        }
        return borrowAsset;
    }

    function borrow(address _token, uint256 _amount, uint256 _borrowDuration) public nonReentrant onlyAmountGreaterThanZero(_amount) returns(bool) {
        /* TODO 
            1. Checking lenderETHAssets >= _amount 
            2. Checking reserve[_token] >= _amount & Updating Reserves
            3. Get Prev borrowAssetsLength
            4. If token exits => update borrowerAssets else push userAssets into borrowerAssets
            5. Updating lenderBalanceQty
            6. Token Transfer from SC to User : Add reentrancy
        */

        address borrower = msg.sender;

        // 1. Checking lenderETHAssets >= _amount 
        uint256 lendETHAmount = getLenderETHBalanceForBorrowInUSD(borrower);
        uint256 amountInDoller = getAmountInUSD(_token, _amount);

        // 2. Calculate 80% of ETH balance
        uint256 maxAmountToBorrowInUSD = (lendETHAmount * BORROW_THRESHOLD)/ 100; // Problem: Not getting the decimal value; 96 96.8

        // 3. check amount must be less than 80% of collateral
        require(amountInDoller <= maxAmountToBorrowInUSD, "Not enough balance to borrow");

        // 4. Checking reserve[_token] >= _amount
        require(_amount <= reserves[_token], "Not enough qty in the reserve pool to borrow");

        // 4. Get Previous borrowerAssetsLength
        uint256 borrowerAssetsLength =  borrowerAssets[borrower].length;
        
        // Set maturity duration & BorrowEndTimestamp of the borrower
        uint256 _maturityDuration = 0;
        uint256 _borrowEndTimeStamp = 0;
        if(_borrowDuration == 30) {
            _borrowEndTimeStamp = block.timestamp + BORROW_DURATION_30;
            _maturityDuration = BORROW_DURATION_30;

        }
        if(_borrowDuration == 60) {
            _borrowEndTimeStamp = block.timestamp + BORROW_DURATION_60;
            _maturityDuration = BORROW_DURATION_60;
        }
        if(_borrowDuration == 90) {
            _borrowEndTimeStamp = block.timestamp + BORROW_DURATION_90;
            _maturityDuration = BORROW_DURATION_90;
        }

        // 5. If token exits => update borrowerAssets 
        //    else push userAssets into borrowerAssets
        for (uint256 i=0 ; i < borrowerAssetsLength; i++) {
            if(borrowerAssets[borrower][i].token == _token) {
                // TODO: implement 
                // updateEarned(lender, _token); //100 + 0.00001 eth , 2 
                // TODO : ASK SASI : When are dealing with BORROW_DURATION so how we can update any borrowAssets
                uint256 borrowerTotalAmount = borrowerAssets[borrower][i].borrowQty + _amount;
                borrowerAssets[borrower][i].borrowQty = borrowerTotalAmount;
                borrowerAssets[borrower][i].borrowApy = BORROW_RATE;
                borrowerAssets[borrower][i].borrowStartTimeStamp = block.timestamp;
                borrowerAssets[borrower][i].borrowEndTimeStamp = _borrowEndTimeStamp;
                borrowerAssets[borrower][i].maturityPeriod = _maturityDuration;

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
                    borrowEndTimeStamp : _borrowEndTimeStamp,
                    maturityPeriod : _maturityDuration
                });
                borrowerAssets[borrower].push(userAsset);
            }
        }

        // 5. Updating lender ETH balance for Next Borrow
        lenderETHBalance[borrower] -= _amount;  // lendingLedger => lenderETHBalance

        // Updating reserves
        reserves[_token] -= _amount;
        // TODO updating reservepool

        emit Withdraw(borrower, _amount, reserves[_token], lenderETHBalance[borrower]);

        // 7. Token Transfer from SC to User
        // bool success = IERC20(_token).transfer(borrower, _amount);
        // require(success, "Tranfer to user's wallet not successful");
        return true;
    } 

    function repay(address _token, uint256 _amount) public onlyBorrower(msg.sender) onlyAmountGreaterThanZero(_amount) {
        /* TODO

        1. Transfer token from User to SC
        2. Update Reserve
        3. Update BorowerETHBalanceAmount
        4. Update BorrowAssets
        */
        address borrower = msg.sender;

        // checking require conditions
        require(isTokenBorrowed(borrower, _token), "Token haven't borrowed yet");

        uint totalBorrowAmount = getBorrowerAssetTotalBal(borrower, _token);
        require(_amount <= totalBorrowAmount, "Repay amount should be less than borrowed amount");

        // 1. Transfer token from User to SC
        bool success = IERC20(_token).transferFrom(borrower, address(this), _amount);
        require(success, "Transfer to user's wallet not succcessful");

        // 2. Update Token in Reserve
        reserves[_token] += _amount;

        // 3. Update BorowerETHBalanceAmount
        uint amountToUSD = getAmountInUSD(_token, _amount); 
        // TODO: : ASK to SASI : Convert USD TO ETH 
        uint amountToETH = amountToUSD;
        lenderETHBalance[borrower] += amountToETH;

        // 4. Update BorrowAssets 
        // TODO : ASK to SASI : When are dealing with BORROW_DURATION so how we can update any borrowAssetsTimestamp => Need borrowAssets ID
        uint assetsLen = borrowerAssets[borrower].length;
        for (uint i = 0; i < assetsLen; i++) {
            if(borrowerAssets[borrower][i].token == _token) {
                // subtract the quantity
                borrowerAssets[borrower][i].borrowQty -= _amount;
                borrowerAssets[borrower][i].lendStartTimeStamp = block.timestamp;
            }

            if(borrowerAssets[borrower][i].borrowQty == 0) {
                // TODO : Remove the assets from borrowerAssets
            }
        }

        emit Withdraw(borrower, _amount, reserves[_token], lenderETHBalance[borrower]);
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
    
    // Helper function - should actually be private but making it public for now to debug
    function getLenderAssetBal(address _lender, address _token) public view returns(uint256){
        uint lenderAssetLength = lenderAssets[_lender].length;
        for (uint i = 0; i < lenderAssetLength; i++) {
            if(lenderAssets[_lender][i].token == _token) {
                return lenderAssets[_lender][i].lentQty;
            }
        }
        return 0;
    }

    // Helper function - should actually be private but making it public for now to debug
    function getBorrowerAssetTotalBal(address _borrower, address _token) public view returns(uint256){
        uint borrowerAssetLength = borrowerAssets[_borrower].length;
        for (uint i = 0; i < borrowerAssetLength; i++) {
            if(borrowerAssets[_borrower][i].token == _token) {
                return lenderAssets[_borrower][i].borrowQty;
            }
        }
        return 0;
    }

    function getLenderBalanceUSD(address _lender) external view returns(uint256){
        uint256 totalBalance;
        uint lenderAssetLength = lenderAssets[_lender].length;
        for (uint i = 0; i < lenderAssetLength; i++) {
            uint256 tokenUSDBalance = getAmountInUSD(lenderAssets[_lender][i].token, lenderAssets[_lender][i].lentQty);
            totalBalance += tokenUSDBalance;
        }
        return totalBalance;
    }

    function getLenderAssets(address _lender) public view returns (UserAsset[] memory) {
        return lenderAssets[_lender];
    }

    function getBorrowerAssets(address _borrower) public view returns (UserAsset[] memory) {
        return borrowerAssets[_borrower];
    }

    // Sasi oneTokenEqualToHowManyUSD code
    // function oneTokenEqualToHowManyUSD(address _tokenAddress) public view returns (int) {
    //     AggregatorV3Interface priceFeed;
    //     priceFeed = AggregatorV3Interface(_tokenAddress);
    //     (,int price,,,) = priceFeed.latestRoundData();
    //     return price / 1e8; //1e8 as per 8 decimals in chainlink doc 
    // }

    function oneTokenEqualToHowManyUSD(address _tokenAddress) public view returns(uint)  {
        AggregatorV3Interface priceFeed;
        address tokenToUSDAddress = addressToTokenMap.getPriceFeedMap(_tokenAddress);
        priceFeed = AggregatorV3Interface(tokenToUSDAddress);
        (,int price,,,) = priceFeed.latestRoundData();
        uint256 decimal = priceFeed.decimals();
        uint currentPrice = uint(price) / (10** decimal);
        return currentPrice;
    }

    function getAmountInUSD(address _token, uint256 _amount) public view returns(uint) {
        uint totalAmountInDollars = uint(oneTokenEqualToHowManyUSD(_token)) * _amount;
        return totalAmountInDollars;
    }

    // Calculate the Assets to Borrow and return it

    // SHORT METHOD
    function getLenderETHBalanceForBorrowInUSD(address _lender) public view returns(uint256) {
        address token = lendingConfig.getAssetByTokenSymbol("ETH").token;
        uint256 tokenUSDBalance = getAmountInUSD(token, lenderETHBalance[_lender]);
        return tokenUSDBalance;
    }    

    // LONG METHOD
    function getUserTotalAmountAvailableForBorrowInUSD(address _user) public view returns(uint256) {
        uint256 userTotalETHLendAmoutInUSD = 0;
        uint256 userTotalBorrowAmountInUSD = 0;
        uint256 totalLendETH = 0;

        // 1. Getting ETH address from lendingConfig
        address ethAddress = lendingConfig.getAssetByTokenSymbol("ETH").token;
        
        // 2. Total lendETH in lenderAssets
        uint256 lenderAssetLength = lenderAssets[_user].length;
        for(uint256 i =0; i < lenderAssetLength; i++) {
            if(lenderAssets[_user][i].token == ethAddress) {
                totalLendETH += lenderAssets[_user][i].lentQty;
            }
        }

        // 3. Converting totalLendETH in USD
        userTotalETHLendAmoutInUSD = getAmountInUSD(ethAddress, totalLendETH);
        
        // 4. Total borrowassets in borrowerAssets
        uint256 borrowerAssetsLength = borrowerAssets[_user].length;
        for(uint256 i =0; i < borrowerAssetsLength; i++) {
            address borrowTokenAddress = borrowerAssets[_user][i].token;
            uint256 borrowAmount = borrowerAssets[_user][i].borrowQty;
            uint256 borrowAmountInUSD = getAmountInUSD(borrowTokenAddress, borrowAmount);
            userTotalBorrowAmountInUSD += borrowAmountInUSD;
        }
        // 5. Returns available amount for borrow in USD
        return userTotalETHLendAmoutInUSD - userTotalBorrowAmountInUSD;
    }
 

}

// for (uint i = 0; i < lenderAssetList[msg.sender].length; i++) {
//     if (lenderAssetList[msg.sender][i] == _token){
//         return true;
//     }
// }

// 0x5B38Da6a701c568545dCfcB03FcB875f56beddC4  - owner

// 0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2 - lender

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

      // LendingConfig lc;
        // lc.addAsset(
        //     _token, 
        //     true,
        //     false,
        //     false,
        //     true,
        //     "ETH",
        //     18,
        //     80,
        //     10
        // );

    // struct UserAsset{
    //     address user;
    //     address token;
    //     uint256 lentQty;
    //     uint256 borrowQty;
    //     uint256 interestRate;
    //     uint256 borrowRate;
    //     uint256 lendStartTimeStamp;
    //     uint256 borrowStartTimeStamp;
    // }

        // struct ReservePool {
    //     address token;
    //     uint amount;
    //     bool isfrozen;
    //     bool isActive;
    // }
    // ReservePool[] reservePool;
