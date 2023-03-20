/********* TOKEN ADDRESSES ***********/
// npx hardhat run scripts/deploy.js --network localhost
const ETHAddress = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6";
const DAITokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const LINKTokenAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const USDCTokenAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

/********* SMART CONTRACT ADDRESSES ***********/
const AddressToTokenMapAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
const LendingConfigAddress = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";
const LendingPoolAddress = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";

/********* PRICE FEED ADDRESSES ***********/
// Sepolia PF addresses https://docs.chain.link/data-feeds/price-feeds/addresses/#Sepolia%20Testnet
const ETH_USD_PF_ADDRESS = "0x694AA1769357215DE4FAC081bf1f309aDC325306";
const DAI_USD_PF_ADDRESS = "0x14866185B1962B63C3Ea9E03Bc1da838bab34C19";
const USDC_USD_PF_ADDRESS = "0xA2F78ab2355fe2f984D808B5CeE7FD0A93D5270E";
const LINK_USD_PF_ADDRESS = "0xc59E3633BAAC79493d908e63626716e204A45EdF";

// shubham wallet addresses
// const account1 = "0x4644933680922aE17748753ae20264436ca616cc";
// const account2 = "0x021edEFA528293eB8ad9A2d9e0d71011f6297601";
// const account3 = "0xc1f33e8c427fd4126A23A4a9B721BD97Fb11dDe6";

// sasi wallet addresses
// const account4 = "0x315F60449DaB3D321aF75821b576E7F436308635";
// const account5 = "0x4B40f99E93A8814be7fDe5F6AaFA5e9823E13728";
// const account6 = "0x3f39Ae58Cb1148ec1Ad903648319359Cfdc34a02";

// npx hardhat run scripts/deploy.js --network mumbai
// export const DAITokenAddress = "0xf9e4302807674051bc1776915fdc5e902fb8b91a";
// export const LINKTokenAddress = "0xa6423f899e11db249271faddc94b11523b7d242c";
// export const USDCTokenAddress = "0xcdf2b66ae55cb956398142a898f8a6ca5c0dc576";
// export const AddressToTokenMap = "0xf526b0e808f91f352602333d85ed90f10aa5ff33";
// export const LendingConfig = "0xfad72d31068ad2d1f941bb4b3e7d9c0d2026f0e9";
// export const LendingPool = "0x81edaae214d5a628b2b164cca5b42813b0329944";

// export const AddressStorage = "0xc52DD5479516c332e45Ede69cA198d1773585473";
// export const LendingPoolAddressProvider =
//   "0x2F1bd3AE5247C8FF898e2995F505aFFCf4F022f6";

module.exports = {
  ETHAddress,
  DAITokenAddress,
  LINKTokenAddress,
  USDCTokenAddress,
  AddressToTokenMapAddress,
  LendingConfigAddress,
  LendingPoolAddress,
  ETH_USD_PF_ADDRESS,
  DAI_USD_PF_ADDRESS,
  USDC_USD_PF_ADDRESS,
  LINK_USD_PF_ADDRESS,
};
