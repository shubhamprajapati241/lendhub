// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

/**
Smart Contract Modules for DeFi Lending Project
1. LendingPoolCore contract - Core Contract
    * Lending Pool Contract (Holds bunch of coins and/or Tokens) - Reserves
    * Deposit
    * Redeem
    * Borrow
    * Repay
    * Liquidation
    * tokenization
        * aTokens
        * tokens that map the liquidity deposited and accrue the interests of the deposited underlying assets
        * Atokens are minted upon deposit, their value increases until they are burned on redeem or liquidated

**/

/**
* Only Owner can mint LHT Tokens
* Lender should be able to add to supply Coins/Tokens
    * Supply must increase by the number of tokens added to the liquidity pools
    * Mint LHT on each coin lent
    * Lender’s supply must  be locked in for a pre-determined period
    * Lender’s accrual to start from the day of deposit -  set block.timestamp
* Lender must be able to withdraw his supply
    * Remove supply from the liquidity pool
    * Burn LHT on withdraw
* Borrower must be able to withdraw money
    * Lender’s interest accrual to start from the day of borrow -  set block.timestamp and calculate interest based on a predetermined interest rate
    * Lender’s accrual to start from the day of deposit -  set block.timestamp
*/

/***
Application Requirements
● Create an application to lend and borrow cryptocurrencies(Matic/Ether/etc.)
● The three important entities in this application are the Lender,Borrower and DeFi
lending platform.
● The lender can deposit money in the platform(which will be some smart contracts)
similar to how people deposit money in their banks.
● The Borrower can deposit crypto assets(Ether/Matic..etc) as collateral and obtain
cryptocurrency loans(a stablecoin like USDT/Dai..etc) with a specified loan maturity
period and interest rate.
● The borrower first deposits crypto collateral
● He receives a specified amount of loan after successful deposit of collateral
● He makes periodic payments to the platform ,which in turn pay the amount to the
lender similar to how banks work.
● After successful payment of the loan , the borrower gets back his collateral and the
lender receives his investment amount with a certain interest.
**/

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./LHToken.sol";
import "./LendingDataProvider.sol";
// import "./LendHubHelper.sol";

contract LendingPoolCore is ReentrancyGuard, Ownable {

    uint public borrowFee;
    uint public interestRate;
    address deployer;

    // using Counters for Counters.Counter;
    // Counters.Counter private depositId;

    // LendHubHelper lendHubHelper;
    LendingDataProvider lendingDataProvider;
    LHToken lHToken;

    // struct Lends {
    //     uint LendId;
    //     address lender;
    //     uint amount;
    //     uint interestRate;
    //     uint statkingDuration;
    //     uint maturityAmount;
    // }

    // Deposit[] private deposits;

    // asset => reserve qty
    mapping (address => uint) public reserves;
    // asset exits - to check if an asset exists in the reserve Pool
    mapping (address => bool) public assetsInPool;
    // lender => asset => balance
    mapping (address => mapping(address => uint)) public lenderAssets;
    // lender => asset => LHTokens
    mapping (address => mapping(address => uint)) public assetToLHTokens;
    // lender => asset => accrual start time
    mapping (address => mapping(address => uint)) public InterestAccrualStartTime;
    // lender => asset => interest charging start time
    mapping (address => mapping(address => uint)) public interestChargedOnBorrow;

    using SafeMath for uint;

    modifier onlyActiveReserve(address _token) {
        require(reserves[_token] > 0, "No Reserve fo Asset");
        _;
    }

    constructor(uint _interestRate, uint _borrowFee) {
        deployer = msg.sender;
        // If interest rate is 3.5, pass 350, it will be converted to 3.5
        interestRate  = _interestRate/100;
        // If interest rate is 3.5, pass 350, it will be converted to 3.5
        borrowFee = _borrowFee/100;
    } 

    /*
    * @dev : This function must only be called by the owner to update the interst Rate
    * @param _amount : Interest Rate in Basis Points, so divide it by 100
    */
    function updateInterestRate(uint _interestRate) external onlyOwner{
        // If interest rate is 3.5, pass 350, it will be converted to 3.5
        interestRate = _interestRate/100;
    }

    //Helper function 
    function tokenToLHT(uint _lentTokenPrice, uint _mintTokenPrice) internal pure returns (uint) {
        return _lentTokenPrice/_mintTokenPrice; //returns the number of LHTs to be minted per the tokens lent
    }

    /*
    * @dev : This function must only be called by the owner to update the borrow fee
    * @param _borrowFee : borrow 
    */
    function updateBorrowFee(uint _borrowFee) external onlyOwner{
        // The fee levied when someone borrows, pass 100, it will be converted to 1%
        borrowFee = _borrowFee/100;
    }

    function istokenInTheLendingPool(address _token) internal view returns(bool){
        return assetsInPool[_token];
    }

    function addToLenderAssets(address _token, uint256 _amount) internal {
        lenderAssets[msg.sender][_token]=_amount;
    }

    /************* Lender functions ************************/

    function addToReserve(address _token, uint _amount) public onlyActiveReserve(_token){
        reserves[_token] += _amount;
        assetsInPool[_token] = true;
    }

    function rewardToken(uint _amount, uint maturityTime) internal{
        // Calculte simple interest
        uint maturityAmount = 
            interestRate 
            * (block.timestamp - InterestAccrualStartTime[msg.sender][_token]) 
            * lenderAssets[msg.sender][_token];
        // Add the interest to lender assets
        lenderAssets[msg.sender][_token] += accruedInterest;
    }

    /*
    * @dev : This function is called when a Lender supplies assets to the Lending Pool
    * @param _token  : Address of the token lent
    * @param _amount : Amount of the token lent
    */
    function lend(address _token, uint256 _amount, uint statkingDuration) public {
        
        // depositId.increment();
        // Add to Lender assets 
        addToLenderAssets(_token, _amount);
        //Add the token reserve in the lending Pool
        addToReserve(_token, _amount);
        //Retrieve TWAP price from Chainlink Price Oracle
        uint tokenPrice = uint(lendingDataProvider.getLatestPrice(_token)); 
        //Calculate the number of LHT tokens to be minted and awarded to Lender - as placeholders
        uint lhtTokensToMint = tokenToLHT(tokenPrice,lHToken.getLHTokenPrice());
        //Mint as many LHT obtained by the exchange of tokens Lent on deposit
        lHToken.mintOnDeposit(msg.sender, lhtTokensToMint);
        //Set accrual start time for interest
        InterestAccrualStartTime[msg.sender][_token]=block.timestamp;
        // uint maturityAmount = calcMaturityAmount(_amount, maturityTime);
        // deposit = Deposit(depositId, msg.sender, _amount, interestRate, statkingDuration, maturityAmount);

    }

    function payAccruedInterest(address _token) internal{
        // Calculte simple interest
        uint accruedInterest = 
            interestRate 
            * (block.timestamp - InterestAccrualStartTime[msg.sender][_token]) 
            * lenderAssets[msg.sender][_token];
        // Add the interest to lender assets
        lenderAssets[msg.sender][_token] += accruedInterest;
    }

    /*
    * @dev : This function is called when a Lender withdraws assets from the Lending Pool
    * @param _token  : Address of the token to borrow
    * @param _amount : Amount of the token to borrow
    */
    function withdraw(address _token, uint256 _amount) external nonReentrant {
        address lender = msg.sender;
        // Pay accrued interest - in terms of USDC or lent token?
        payAccruedInterest(_token);
        // Remove from Reserves
        reserves[_token] -= _amount;
        // Remove from Lender assets
        lenderAssets[lender][_token] -= _amount;
        //Retrieve TWAP price from Chainlink Price Oracle
        uint tokenPrice = uint(lendingDataProvider.getLatestPrice(_token)); 
        //Calculate the number of LHT tokens to be minted and awarded to Lender - as placeholders
        //This will be at the current token price and not the issue price
        uint lhtTokensToBurn = tokenToLHT(tokenPrice,lHToken.getLHTokenPrice());
        //Mint lend hub tokens on on deposit
        lHToken.burnOnWithdrawlOrLiquidation(lender, lhtTokensToBurn);

        (bool success, ) = lender.call{value: lenderAssets[lender][_token]}("");
        require (success);
    }

    /************* Borrower functions ************************/


    modifier hasEnoughCollateral(_token) {
        // ETHAddress - get ETH Address
        uint eThPrice = uint(lendingDataProvider.getLatestPrice(ETHAddress)); 
        uint eThPrice = uint(lendingDataProvider.getLatestPrice(_token)); 
        //Calculate the number of LHT tokens to be minted and awarded to Lender - as placeholders
        //This will be at the current token price and not the issue price
        uint lhtTokens = tokenToLHT(tokenPrice,lHToken.getLHTokenPrice());


        require(lenderAssets[msg.sender][ETHAddress] > lenderAssets[msg.sender][ETHAddress])
        _;
    }

    modifier hasReserves(_token, _borrowAmount) {
        require(reserves[_token] > _borrowAmount,"Not Enough Reserves to Borrow")
        _;
    }

    /*
    * @dev : This function is called when a Lender supplies assets to the Lending Pool
    * @param _token  : Address of the token to borrow
    * @param _amount : Amount of the token to borrow
    */
    function borrow(address _token, uint256 _borrowAmount) public is hasReserves(_token, _borrowAmount) hasEnoughCollateral(_token){
        // Check if the borrower has enough collateral of ETH
        // Set accrual start time for interest charged
        interestChargedOnBorrow[msg.sender][_token]=block.timestamp;
        // Transfer from Lending Pool/reserves to the to Lender assets 
        transferFromReservesToBorrower(_token, _amount);
        // Add the token reserve in the lending Pool
        removeFromReserve(msg.sender, _token, _amount);
    }

    function removeFromReserve(string memory _token, uint _amount) public onlyOwner{
        require(reserves[_token] > 0, "No reserves for Token");
        reserves[_token] -= _amount;
    }

    /*
    * @dev : This function transfers assert from the Lending Pool to the borrower
    * @param _token  : Address of the token to borrow
    * @param _amount : Amount of the token to borrow
    */
    function transferFromReservesToBorrower(address _token, uint256 _amount) internal {
        // Remove the amount of token borrowed from reserves
        reserves[_token] -= _amount;
        // Remove the amount of token borrowed from reserves
        lenderAssets[msg.sender][_token] += _amount;
    }

    function interestAccrualsOnBorrow() internal returns(uint){
        return 0;
    }
    // // why would we have to delete from the Pool?
    // function deleteFromPool(string memory _token) public onlyOwner{
    //     require(lendingPool[_token] == 0, "Token has reserves, cannot delete");
    //     delete lendingPool[_token];
    //     delete tokens[_token];
    // }


    // function deposit(address _account, address _token, uint256 _amount, uint256 _timestamp) {

    // }

    // function redeem() {}
    // function borrow() {}
    // function repay() {}
    // function liquidation() {}

   

    // This seems to be redundant
    // function getTokenReserve(string memory _token) external view returns(uint) {
    //     if (lendingPool[_token] > 0) {
    //         return lendingPool[_token];
    //     }
    //     else {
    //         return 0;
    //     }
    // }

}



/***
1. What are we not doing?
2. We are not doing like pause contract and freeze asset.
3. user is redirecting his interest towards someone else
*/