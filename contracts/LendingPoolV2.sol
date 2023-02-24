// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

// import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "./LendingConfig.sol";

contract LendingPoolV2 is ReentrancyGuard {
    address deployer;
    using SafeMath for uint;

    uint256 public INTEREST_RATE;
    uint256 public BORROW_RATE;
    uint256 public constant BORROW_THRESHOLD = 80;

    // asset token => reserve qty
    mapping (address => uint) public reserves;
    // For iteration - Do we need this?
    address[] reverseAssets; 
    // mapping(address => UserAsset) lenderAssets;
    // mapping(address => mapping(address => uint)) lenderAssets;
    mapping(address => UserAsset[]) lenderAssets;
    mapping(address => UserAsset[]) borrowerAssets;

      struct UserAsset {
        address user;
        address token;
        uint256 lentQty;
        uint256 borrowQty;
        uint256 apy;
        uint256 borrowRate;
        uint256 lendStartTimeStamp;
        uint256 borrowStartTimeStamp;
    }
    UserAsset[] public userAssets;

    modifier onlyOwner(address _token) {
        require(isTokenOwner(msg.sender, _token), "Not Owner");
        _;        
    }

    constructor(uint256 _interestRate, uint256 _borrowRate) {
        deployer = msg.sender;
        // Use logic like REWARDS staking
        INTEREST_RATE  = _interestRate;
        // If interest rate is 3.5, pass 350, it will be converted to 3.5
        BORROW_RATE = _borrowRate;
    }

    function isTokenOwner(address _user, address _token) internal view returns(bool) {
        uint256 userAssetLength = userAssets.length;
        for (uint i = 0; i < userAssetLength; i++) {
            if (userAssets[i].user == _user && userAssets[i].token == _token){
                return true;
            }
        }
        return false;
    }

   /************* Lender functions ************************/

    function lend(address _token, uint256 _amount) public payable {
        address lender = msg.sender;

        // transfer from the lender's wallet to DeFi app or SC 
        IERC20(_token).transferFrom(lender,address(this),_amount);

        // Add to lenders assets with amount - Add to userAssets struct
        // can use the mapping instead of loop over struct array
        uint lenderAssetLength = lenderAssets[lender].length;
        uint256 amount = _amount;
        for (uint i = 0; i < lenderAssetLength; i++) {
            if(lenderAssets[lender][i].token == _token) {
                amount += lenderAssets[lender][i].lentQty;
            }
        }

        UserAsset memory userAsset = UserAsset({
            user: lender,
            token: _token,
            lentQty: amount,
            borrowQty: 0,
            apy: INTEREST_RATE,
            borrowRate: 0,
            lendStartTimeStamp: block.timestamp,
            borrowStartTimeStamp:0
        });

        // Push to the struct array
        userAssets.push(userAsset);
        // add to lender asset list
        lenderAssets[lender].push(userAsset);
        // Add to Lending Pool a.k.a reserves
        // If using a struct, use a function getCurrentReserve() and add to the struct, that increases gas cost
        reserves[_token] += _amount;
        // Add to reserve assets for enabling iteration
        reverseAssets.push(_token);
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
    function getBorrowerAssetBal(address _borrower, address _token) public view returns(uint256){
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
            totalBalance += lenderAssets[_lender][i].lentQty;
        }
        return totalBalance;
    }

    function getLenderAssets(address _lender) public view returns (UserAsset[] memory) {
        return lenderAssets[_lender];
    }

    function getBorrowerAssets(address _borrower) public view returns (UserAsset[] memory) {
        return borrowerAssets[_borrower];
    }


    function withdraw(address _token, uint256 _amount) external onlyOwner(_token) payable returns(bool) {

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
        // transfer from contract to lender's wallet - apprval not necessary
        // (bool success, ) = payable(lender).call{value: _amount}(""); //ETH Value
        bool success = IERC20(_token).transferFrom(address(this),lender,_amount);
        require (success,"Tranfer to user's wallet not successful");
        // Emit withrawl event
        return true;
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
