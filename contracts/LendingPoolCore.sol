// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

/***
Application Requirements:
    ● Create an application to lend and borrow cryptocurrencies(Matic/Ether/etc.)
    ● The three important entities in this application are the Lender,Borrower and DeFi lending platform.
    ● The lender can deposit money in the platform(which will be some smart contracts) 
      similar to how people deposit money in their banks.
    ● The Borrower can deposit crypto assets(Ether/Matic..etc) as collateral and obtain cryptocurrency 
      loans(a stablecoin like USDT/Dai..etc) with a specified loan maturity period and interest rate.
    ● The borrower first deposits crypto collateral
    ● He receives a specified amount of loan after successful deposit of collateral
    ● He makes periodic payments to the platform ,which in turn pay the amount to the lender similar to how banks work.
    ● After successful payment of the loan, the borrower gets back his collateral and the lender 
      receives his investment amount with a certain interest.
**/

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";
// import "./LendingDataProvider.sol";
// , Ownable

contract LendingPoolCore is ReentrancyGuard {

    address deployer;
    uint256 public immutable interestRate=350;
    uint256 public immutable borrowRate=450;

    // asset token => reserve qty
    mapping (address => uint) public reserves;
    // asset exits - to check if an asset exists in the reserve Pool
    mapping (address => bool) public assetInPool;
    // user address => asset token address
    mapping(address => address) public lenderAssetList;
    // user address => asset token address => lent asset qty
    mapping(address => mapping(address => uint)) public lenderAssets;
    // user address => asset token address => borrowed asset qty
    mapping(address => mapping(address => uint)) public borrowedAssets;
    // user address => addresss of token lent => lent timestamp
    mapping(address => mapping(address => uint)) public lenderTimestamp;
    // user address => addresss of token borrowed => borrwed timestamp
    mapping(address => mapping(address => uint)) public borrowerTimestamp;
    // Token address => tokensymbol
    mapping(address => string) tokenMap;
    
    using SafeMath for uint;

    modifier onlyActiveReserve(address _token) {
        require(reserves[_token] > 0, "No Reserve for Asset");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner, cannot perform operation");
        _;
    }

    modifier updateRewardTokens(){
        tokenRewards=rewardPerToken();
        lastUpdateTime=block.timestamp;
        rewardEarned[msg.sender]=earned();
        _;
    }

    // modifier hasReserves(address _token, uint256 _amount) {
    //     require(reserves[_token] > _amount,"Not Enough Reserves to Borrow");
    //     _;
    // }


    modifier hasEnoughCollateral(address _token, uint256 _amount) {
        // ETHAddress - get ETH Address
        // uint eThPrice = uint(lendingDataProvider.getLatestPrice(ETHAddress)); 
        // uint eThPrice = uint(lendingDataProvider.getLatestPrice(_token)); 
        //Calculate the number of LHT tokens to be minted and awarded to Lender - as placeholders
        //This will be at the current token price and not the issue price
        // uint lhtTokens = tokenToLHT(tokenPrice,lHToken.getLHTokenPrice());

        require(lenderAssets[msg.sender][ETHAddress] >= _amount, "Not enough collateral to borrow");
        _;
    }

    constructor(uint256 _interestRate, uint256 _borrowRate) {
        deployer = msg.sender;
        // If interest rate is 3.5, pass 350, - this doesnt work as there is no fixed point representation in Solidity
        // Use logic like REWARDS staking
        interestRate  = _interestRate;
        // If interest rate is 3.5, pass 350, it will be converted to 3.5
        borrowRate = _borrowRate;
    } 

    /*
    * @dev : This function must only be called by the owner to update the interst Rate
    * @param _amount : Interest Rate in Basis Points, so divide it by 100
    */
    function updateInterestRate(uint _interestRate) external onlyOwner{
        // If interest rate is 3.5, pass 350, it will be converted to 3.5
        interestRate = _interestRate;
    }

    /*
    * @dev : This function must only be called by the owner to update the borrow fee
    * @param _borrowFee : upadate borrowRate 
    */
    function updateBorrowFee(uint _borrowRate) external onlyOwner{
        // The fee levied when someone borrows, pass 100, it will be converted to 1%
            borrowRate = _borrowRate;
    }
    
    // Is this necessary?
    function istokenInTheLendingPool(address _token) internal view returns(bool){
        return assetInPool[_token];
    }

    /************* Lender functions ************************/

    /*
    * @dev : This function is called when a Lender supplies assets to the Lending Pool
    * @param _token  : Address of the token lent
    * @param _amount : Amount of the token lent
    */
    function lend(address _token, uint256 _amount) public {
        // Add to Lender assets 
        lenderAssets[msg.sender][_token]=_amount;
        lenderAssetList[msg.sender]=_token;
        // Always add to the existing reserve
        reserves[_token] += _amount;
    }

    /*
    * @dev : This function is called when a Lender withdraws assets from the Lending Pool
    * @param _token  : Address of the token to borrow
    * @param _amount : Amount of the token to borrow
    */
    function withdraw(address _token, uint256 _amount) external nonReentrant updateRewardTokens onlyOwner returns(bool) {
        // Pay accrued interest - in lent token
        // payAccruedInterest(_token);
        lenderAssets[lender][_token] += _amount;
        require (reserves[_token] > 0, "Not enough qty to withdraw");
        // Remove from Reserves
        reserves[_token] -= _amount;
        // Remove from Lender assets
        lenderAssets[lender][_token] -= _amount;
        (bool success, ) = lender.call{value: lenderAssets[lender][_token]}("");
        require (success);
    }

    /*
    * @dev : This function is called when a Lender supplies assets to the Lending Pool
    * @param _lender : Address of the lender to caculate the reward tokens
    */

    //how much reward a token gets based on how long its been in the contract
    function calculateRewardTokens(address _token) public view returns(uint256){
        return lenderAssets[lender][_token]+(((block.timestamp-lenderTimestamp[lender][_token])*INTEREST_RATE*1e18)/reserves[_token]);
    }   

    function earned(address account) public view returns(uint256){
        return((s_balances[account]*(rewardPerToken()-s_userRewardPerTokenPaid[account]))/1e18)+s_rewards[account];
    }

    function getLenderAssets(address _lender) public view returns (address[] memory){
        address[] memory assetList;
        for (uint16 i =0; i < assetList.length; i = unchecked_inc(i)){
            assetList.push(lenderAssetList[lender]);
        }
        return assetList;
    }

    // unchecked skips the uint check and saves gas
    function unchecked_inc(uint i) internal returns(uint){
        unchecked {
            return i;
        }
    }

    /************* Borrower functions ************************/

    /*
    * @dev : This function is called when a Lender supplies assets to the Lending Pool
    * @param _token  : Address of the token to borrow
    * @param _amount : Amount of the token to borrow
    */
    function borrow(address _token, uint256 _amount) public hasEnoughCollateral(_token, _amount){
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

    function interestAccrualsOnBorrow() internal pure returns(uint){
        return 0;
    }
}
