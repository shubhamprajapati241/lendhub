const ETHAddress = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6";

/****************** LOCAL HOST **********************/
// npx hardhat run scripts/deploy.js --network localhost
// const DAITokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
// const LINKTokenAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
// const USDCTokenAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
// const AddressToTokenMapAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
// const LendingConfigAddress = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";
// const LendingHelperAddress = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";
// const LendingPoolAddress = "0x0165878A594ca255338adfa4d48449f69242Eb8F";

/****************** SEPOLIA TESTNET **********************/

// npx hardhat run scripts/deploy.js --network sepolia
const DAITokenAddress = "0xB3F9eE656C083AEBE5a55ec1132160c9804BD29B";
const LINKTokenAddress = "0xE2d16613a3AC1bd4f8919823358f82aeDfa73b0e";
const USDCTokenAddress = "0x34fF2d449fBeD71d2A7E2D731264deE96AB196FD";
const AddressToTokenMapAddress = "0x3a219633d952a42320a84c919B3ef24E9a187B1B";
const LendingConfigAddress = "0xe699dC884F6893c9De88619CA1546764F4d088C3";
const LendingHelperAddress = "0x4DA1ad4Be0e167F738407Dc2fEE8BbBD8936D365";
const LendingPoolAddress = "0x3596433d421669373A5CC9655D9517A20BeA0b33";

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
