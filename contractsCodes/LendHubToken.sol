// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.6;

// // import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";
// import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// import "./LendingPoolCore.sol";

// contract LHToken is ERC20{
//     uint public LHTPrice;
//     address contractOwner;
//     LendingPoolCore private pool;

//     constructor(uint initialSupply) public ERC20("LendHub Token", "LHT") {
//         LHTPrice = 0.0001 ether;
//         contractOwner = msg.sender;
//         _mint(contractOwner, initialSupply);
//         pool = LendingPoolCore(msg.sender);
//     }

//     modifier onlyLendingPoolCore() {
//         require(msg.sender == pool, "Only Lending Pool Core Can set");
//         _;
//     }

//     function getLHTokenPrice() external view returns(uint){
//         return LHTPrice;
//     }

//     function mintOnDeposit(address _account, uint _value) external onlyLendingPoolCore {
//         _mint(_account, _value);
//     }

//     function burnOnWithdrawlOrLiquidation(address _account, uint _value) external onlyLendingPoolCore {
//         _burn(_account, _value);
//     }

// }