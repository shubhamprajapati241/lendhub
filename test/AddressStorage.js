const { expect } = require("chai");
const { getAddress } = require("ethers/lib/utils");
const { ethers } = require("hardhat");

describe("Test Address Storage", async () => {
  before(async () => {
    const AddressTokenMap = await ethers.getContractFactory("AddressStorage");
    addressTokenMap = await AddressTokenMap.deploy();
    await addressTokenMap.deployed();
    console.log("Address of AddressStorage : ", addressTokenMap.address);

    const AddressStorage = await ethers.getContractFactory("AddressStorage");
    addressStorage = await AddressStorage.deploy();
    await addressStorage.deployed();
    console.log("Address of AddressStorage : ", addressStorage.address);
  });

  const GOERLI_DAI_ADDRESS = "0xdc31ee1784292379fbb2964b3b9c4124d8f89c60";
  const GOERLI_USDC_ADDRESS = "0x07865c6E87B9F70255377e024ace6630C1Eaa37F";
  const GOERLI_LINK_ADDRESS = "0x326C977E6efc84E512bB9C30f76E30c160eD06FB";

  it("Should be able to add mapping", async () => {
    await addressStorage._setAddress("DAI", GOERLI_DAI_ADDRESS);
    // const address = await addressStorage.getAddress("DAI");
    // console.log("DAI address" + address);
    await expect(addressStorage.getAddress("DAI")).to.equal(
      "0xdc31ee1784292379fbb2964b3b9c4124d8f89c60"
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
