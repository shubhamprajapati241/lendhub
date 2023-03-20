/********* TOKEN ADDRESSES ***********/
const ETHAddress = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6";
// npx hardhat run scripts/deploy.js --network sepolia
const DAITokenAddress = "0x07f084AEcf3B7471687CB99f665D24A0DB17e275";
const LINKTokenAddress = "0xf8A063287227F986a6c5ffAFD2201Bb9AB0d4703";
const USDCTokenAddress = "0x9ecB69907FbF7b3fA48bC36676397F1ee860E08e";

/********* SMART CONTRACT ADDRESSES ***********/
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
const ACCOUNT_1 = "0x4644933680922aE17748753ae20264436ca616cc";
const ACCOUNT_2 = "0x021edEFA528293eB8ad9A2d9e0d71011f6297601";
const ACCOUNT_3 = "0xc1f33e8c427fd4126A23A4a9B721BD97Fb11dDe6";

// sasi wallet addresses
const ACCOUNT_4 = "0x315F60449DaB3D321aF75821b576E7F436308635";
const ACCOUNT_5 = "0x4B40f99E93A8814be7fDe5F6AaFA5e9823E13728";
const ACCOUNT_6 = "0x3f39Ae58Cb1148ec1Ad903648319359Cfdc34a02";

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
  ACCOUNT_1,
  ACCOUNT_2,
  ACCOUNT_3,
  ACCOUNT_4,
  ACCOUNT_5,
  ACCOUNT_6,
};
