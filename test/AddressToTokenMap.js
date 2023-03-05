const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Test Address Token Map", async () => {
  before(async () => {
    const AddressTokenMap = await ethers.getContractFactory(
      "AddressToTokenMap"
    );
    addressTokenMap = await AddressTokenMap.deploy();
    await addressTokenMap.deployed();
    console.log("Address of AddressTokenMap : ", addressTokenMap.address);
  });

  const GOERLI_DAI_ADDRESS = "0xdc31ee1784292379fbb2964b3b9c4124d8f89c60";
  const GOERLI_DAI_USD_PF_ADDRESS =
    "0x0d79df66BE487753B02D015Fb622DED7f0E9798d";

  it("Should be able to add token address to symbol mapping", async () => {
    await addressTokenMap._setAddress(GOERLI_DAI_ADDRESS, "DAI");
    expect(await addressTokenMap.getAddress(GOERLI_DAI_ADDRESS)).to.equal(
      "DAI"
    );
  });

  it("Should be able to add and retrieve price feed mapping", async () => {
    await addressTokenMap._setPriceFeedMap(
      GOERLI_DAI_ADDRESS,
      GOERLI_DAI_USD_PF_ADDRESS
    );
    expect(await addressTokenMap.getPriceFeedMap(GOERLI_DAI_ADDRESS)).to.equal(
      GOERLI_DAI_USD_PF_ADDRESS
    );
  });
});

// Chainlink pricefeed
// ETH / USD  => 0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e
// DAI / USD  => 0x0d79df66BE487753B02D015Fb622DED7f0E9798d
// USDC / USD => 0xAb5c49580294Aff77670F839ea425f5b78ab3Ae7
// LINK / USD => 0x48731cF7e84dc94C5f84577882c14Be11a5B7456

// Metamask Wallet Token Addresses
// DAI  - 0xdc31Ee1784292379Fbb2964b3B9C4124D8F89C60 - confirmed Uniswap and wallet
// LINK - 0x326C977E6efc84E512bB9C30f76E30c160eD06FB - confirmed Uniswap and wallet
// USDC - 0x07865c6E87B9F70255377e024ace6630C1Eaa37F
