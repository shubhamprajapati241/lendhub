const { expect } = require("chai");
const { ethers } = require("hardhat");
const helpers = require("@nomicfoundation/hardhat-network-helpers");

// converting number into ETHERS
const numberToEthers = (number) => {
  return ethers.utils.parseUnits(number.toString(), "ether");
};

describe("LendHub Tests", async () => {
  // For contracts
  let addressStorage;
  let addressToTokenMap;
  let lendingPool;
  let lendingPoolAddressProvider;
  let lendingConfig;

  // constant variables
  const INTEREST_RATE = 3;
  const BORROW_RATE = 4;
  const LENDING_POOL = "LENDING_POOL";

  // constant addresses
  const DAI_SYMBOL = "DAI";
  const GOERLI_DAI_ADDRESS = "0xdc31ee1784292379fbb2964b3b9c4124d8f89c60";
  const GOERLI_USDC_ADDRESS = "0x07865c6E87B9F70255377e024ace6630C1Eaa37F";
  const GOERLI_DAI_USD_PF_ADDRESS =
    "0x0d79df66BE487753B02D015Fb622DED7f0E9798d";
  const GOERLI_USDC_USD_PF_ADDRESS =
    "0xAb5c49580294Aff77670F839ea425f5b78ab3Ae7";

  let lendingPoolAddress;
  let deployerAddress;
  let otherAddress;

  beforeEach(async () => {
    /******** Deploy  AddressStorage *********/
    const AddressStorage = await ethers.getContractFactory("AddressStorage");
    addressStorage = await AddressStorage.deploy();
    await addressStorage.deployed();

    /******** Deploy  AddressTokenMap *********/
    const AddressToTokenMap = await ethers.getContractFactory(
      "AddressToTokenMap"
    );
    addressToTokenMap = await AddressToTokenMap.deploy();
    await addressToTokenMap.deployed();

    /******** Deploy LendingPoolV2 *********/
    const LendingPool = await ethers.getContractFactory("LendingPoolV2");
    lendingPool = await LendingPool.deploy(INTEREST_RATE, BORROW_RATE);
    await lendingPool.deployed();

    /******** Deploy LendingPoolAddressProvider *********/
    const LendingPoolAddressProvider = await ethers.getContractFactory(
      "LendingPoolAddressProvider"
    );
    lendingPoolAddressProvider = await LendingPoolAddressProvider.deploy();
    await lendingPoolAddressProvider.deployed();

    /******** Deploy LendingConfig ********/
    const LendingConfig = await ethers.getContractFactory("LendingConfig");
    lendingConfig = await LendingConfig.deploy();
    await lendingConfig.deployed();

    /******** Setting Addresses ********/
    const accounts = await ethers.getSigners();
    deployerAddress = accounts[0];
    otherAddress = accounts[2];
  });

  //   describe("AddressStorage Tests", async () => {
  //     it("Should be able to Set & Get address (Symbol => Address) mapping", async () => {
  //       await addressStorage._setAddress("DAI", GOERLI_DAI_ADDRESS);
  //       const address = await addressStorage.getAddress("DAI");
  //       expect(address).to.equal(GOERLI_DAI_ADDRESS);
  //     });
  //   });

  //   describe("AddressToTokenMap Tests", async () => {
  //     it("Should be able to add token address to symbol mapping", async () => {
  //       await addressToTokenMap._setAddress(GOERLI_DAI_ADDRESS, "DAI");
  //       const symbol = await addressToTokenMap.getAddress(GOERLI_DAI_ADDRESS);
  //       expect(symbol).to.equal("DAI");
  //     });

  //     it("Should be able to add and retrieve price feed mapping", async () => {
  //       await addressToTokenMap._setPriceFeedMap(
  //         GOERLI_DAI_ADDRESS,
  //         GOERLI_DAI_USD_PF_ADDRESS
  //       );
  //       expect(
  //         await addressToTokenMap.getPriceFeedMap(GOERLI_DAI_ADDRESS)
  //       ).to.equal(GOERLI_DAI_USD_PF_ADDRESS);
  //     });
  //   });

  describe("LendingConfig Tests", async () => {
    beforeEach(async () => {
      const lendingPoolContractBalanceBefore =
        await lendingPool.getContractBalance();
      console.log(lendingPoolContractBalanceBefore);

      // transfering initial ETH to the LendingPool contract
      const valueOption = { value: numberToEthers(10) };
      await lendingPool.connect(deployerAddress).transfer(valueOption);

      const lendingPoolContractBalanceAfter =
        await lendingPool.getContractBalance();
      console.log(lendingPoolContractBalanceAfter);
    });

    it("Only LendingPool Should be able to add or change assets", async () => {
      // const DATA_PROVIDER = "DATA_PROVIDER";
      //   //   setting Adddress
      await lendingPoolAddressProvider
        .connect(deployerAddress)
        .setLendingPool(lendingPool.address);
      lendingPoolAddress = await lendingPoolAddressProvider
        .connect(deployerAddress)
        .getLendingPool();
      expect(lendingPoolAddress).to.equal(lendingPool.address);

      //   otherAddress can't add the Assets
      await expect(
        lendingConfig
          .connect(otherAddress)
          .addAsset(
            GOERLI_DAI_ADDRESS,
            true,
            false,
            false,
            true,
            DAI_SYMBOL,
            18,
            80,
            10
          )
      ).to.be.reverted;

      console.log(lendingPoolAddress);
      await helpers.impersonateAccount(lendingPool.address);
      const secondAddressSigner = await ethers.getSigner(lendingPool.address);

      await lendingConfig
        .connect(secondAddressSigner)
        .addAsset(
          GOERLI_DAI_ADDRESS,
          true,
          false,
          false,
          true,
          "DAI",
          18,
          80,
          10
        );
      const asset = await lendingConfig.getAssetByTokenAddress(
        GOERLI_DAI_ADDRESS
      );
      expect(asset.symbol).to.be.equal(DAI_SYMBOL);
    });
  });
});

//  when we able to call from lending pool add => assets
// re triveing adddress;

// checking
