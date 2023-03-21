const ETHAddress = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6";

/****************** LOCAL HOST **********************/
// npx hardhat run scripts/deploy.js --network localhost
// const DAITokenAddress = "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6";
// const LINKTokenAddress = "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318";
// const USDCTokenAddress = "0x610178dA211FEF7D417bC0e6FeD39F05609AD788";
// const AddressToTokenMapAddress = "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e";
// const LendingConfigAddress = "0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0";
// const LendingHelperAddress = "0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82";
// const LendingPoolAddress = "0x9A676e781A523b5d0C0e43731313A708CB607508";

/****************** SEPOLIA TESTNET **********************/

// npx hardhat run scripts/deploy.js --network sepolia
const DAITokenAddress = "0x4f26C7137292160ED5E80438A0B39FB45637907a";
const LINKTokenAddress = "0xCF594ab632f673EeF70800F8e7706c9a8CCCd81c";
const USDCTokenAddress = "0x768e29eEb5D2fEf6C2d772adc5fF232cA7D329a4";
const AddressToTokenMapAddress = "0xAf64AC74f0661CAb09cf7aBA77A37e586A142480";
const LendingConfigAddress = "0x9192A96B83C270788eC6C84Bf6C4A854eC97C519";
const LendingHelperAddress = "0x0C0EA14627E8CDB23587F5FE980cb24829b7b220";
const LendingPoolAddress = "0x1b24AAAd247fa171e7A64C809537cc4a02584CAb";

/********* PRICE FEED ADDRESSES ***********/
// Sepolia PF addresses
// https://docs.chain.link/data-feeds/price-feeds/addresses/#Sepolia%20Testnet
const ETH_USD_PF_ADDRESS = "0x694AA1769357215DE4FAC081bf1f309aDC325306";
const DAI_USD_PF_ADDRESS = "0x14866185B1962B63C3Ea9E03Bc1da838bab34C19";
const USDC_USD_PF_ADDRESS = "0xA2F78ab2355fe2f984D808B5CeE7FD0A93D5270E";
const LINK_USD_PF_ADDRESS = "0xc59E3633BAAC79493d908e63626716e204A45EdF";

// shubham wallet addresses
const account1 = "0x4644933680922aE17748753ae20264436ca616cc";
const account2 = "0x021edEFA528293eB8ad9A2d9e0d71011f6297601";
const account3 = "0xc1f33e8c427fd4126A23A4a9B721BD97Fb11dDe6";

// sasi wallet addresses
const account4 = "0x315F60449DaB3D321aF75821b576E7F436308635";
const account5 = "0x4B40f99E93A8814be7fDe5F6AaFA5e9823E13728";
const account6 = "0x3f39Ae58Cb1148ec1Ad903648319359Cfdc34a02";

module.exports = {
  ETHAddress,
  DAITokenAddress,
  LINKTokenAddress,
  USDCTokenAddress,
  AddressToTokenMapAddress,
  LendingConfigAddress,
  LendingHelperAddress,
  LendingPoolAddress,
  ETH_USD_PF_ADDRESS,
  DAI_USD_PF_ADDRESS,
  USDC_USD_PF_ADDRESS,
  LINK_USD_PF_ADDRESS,
  account1,
  account2,
  account3,
  account4,
  account5,
  account6,
};
