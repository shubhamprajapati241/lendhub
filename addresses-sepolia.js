/********* TOKEN ADDRESSES ***********/
// npx hardhat run scripts/deploy.js --network sepolia
const ETHAddress = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6";
const DAITokenAddress = "0xC5Fdf0F392dBF8FF57CB43a9917990758c44577D";
const LINKTokenAddress = "0xA8c3fd4961557EE7A9Fe918AC97b0fE318E0BdCf";
const USDCTokenAddress = "0xB9e75160B67CD6e0647e7BaBCa96A613F1eE9815";

/********* SMART CONTRACT ADDRESSES ***********/
const BankContractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const AddressToTokenMapAddress = "0xaa979bF7649D0a45b82dAb3E7adB5c9D38e93519";
const LendingConfigAddress = "0x5119d61573eCc48bEb41A44f012139344aCbb671";
const LendingPoolAddress = "0x1296C6ab527878D8605bA8F5b87C77814D3cf713";

/********* PRICE FEED ADDRESSES ***********/
// Sepolia PF addresses
// https://docs.chain.link/data-feeds/price-feeds/addresses/#Sepolia%20Testnet
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

module.exports = {
  BankContractAddress,
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
