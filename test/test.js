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

  // constant symbols
  const DAI_SYMBOL = "DAI";
  const USDC_SYMBOL = "USDC";
  const ETH_SYMBOL = "ETH";
  const LINK_SYMBOL = "LINK";

  // constant address
  const GOERLI_ETH_ADDRESS = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6";
  const GOERLI_DAI_ADDRESS = "0xdc31Ee1784292379Fbb2964b3B9C4124D8F89C60";
  const GOERLI_USDC_ADDRESS = "0x07865c6E87B9F70255377e024ace6630C1Eaa37F";
  const GOERLI_LINK_ADDRESS = "0x48731cF7e84dc94C5f84577882c14Be11a5B7456";

  // constant pricefeed address
  const GEORLI_ETH_USD_PF_ADDRESS =
    "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e";
  const GOERLI_DAI_USD_PF_ADDRESS =
    "0x0d79df66BE487753B02D015Fb622DED7f0E9798d";
  const GOERLI_USDC_USD_PF_ADDRESS =
    "0xAb5c49580294Aff77670F839ea425f5b78ab3Ae7";
  const GOERLI_LINK_USD_PF_ADDRESS =
    "0x48731cF7e84dc94C5f84577882c14Be11a5B7456";

  let lendingPoolAddress;
  let deployerAddress;
  let otherAddress;

  before(async () => {
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

    /******** Transfer inital ETH ********/
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

  // describe("AddressStorage Tests", async () => {
  //   it("Should be able to Set & Get address (Symbol => Address) mapping", async () => {
  //     await addressStorage._setAddress("DAI", GOERLI_DAI_ADDRESS);
  //     const address = await addressStorage.getAddress("DAI");
  //     expect(address).to.equal(GOERLI_DAI_ADDRESS);
  //   });
  // });

  describe("AddressToTokenMap Tests", async () => {
    before(async () => {
      await addressToTokenMap._setAddress(GOERLI_ETH_ADDRESS, "ETH");
      await addressToTokenMap._setAddress(GOERLI_DAI_ADDRESS, "DAI");
      await addressToTokenMap._setAddress(GOERLI_USDC_ADDRESS, "USDC");
      await addressToTokenMap._setPriceFeedMap(
        GOERLI_DAI_ADDRESS,
        GOERLI_DAI_USD_PF_ADDRESS
      );
      await addressToTokenMap._setPriceFeedMap(
        GOERLI_USDC_ADDRESS,
        GOERLI_USDC_USD_PF_ADDRESS
      );

      await addressToTokenMap._setPriceFeedMap(
        GOERLI_ETH_ADDRESS,
        GEORLI_ETH_USD_PF_ADDRESS
      );
    });

    it("Should be able to retrieve DAI symbol", async () => {
      const symbol = await addressToTokenMap.getAddress(GOERLI_DAI_ADDRESS);
      expect(symbol).to.equal("DAI");
    });

    it("Should be able retrieve DAI-USD price feed", async () => {
      expect(
        await addressToTokenMap.getPriceFeedMap(GOERLI_DAI_ADDRESS)
      ).to.equal(GOERLI_DAI_USD_PF_ADDRESS);
    });

    describe("LendingConfig Tests", async () => {
      before(async () => {
        await lendingPoolAddressProvider
          .connect(deployerAddress)
          .setLendingPool(lendingPool.address);
        lendingPoolAddress = await lendingPoolAddressProvider
          .connect(deployerAddress)
          .getLendingPool();
        expect(lendingPoolAddress).to.equal(lendingPool.address);

        /****** otherAddress can't add the Assets ******/
        // await expect(
        //   lendingConfig
        //     .connect(otherAddress)
        //     .addAsset(
        //       GOERLI_DAI_ADDRESS,
        //       true,
        //       false,
        //       false,
        //       true,
        //       DAI_SYMBOL,
        //       18,
        //       80,
        //       10
        //     )
        // ).to.be.reverted;

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

        //after transaction balance
        const lendingPoolContractBalanceAfter =
          await lendingPool.getContractBalance();
        console.log(lendingPoolContractBalanceAfter);
      });

      it("DAI Token should be in assets", async () => {
        const result = await lendingConfig.isTokenInAssets(GOERLI_DAI_ADDRESS);
        expect(result).to.be.equal(true);
      });

      it("USDC Token should not be in assets", async () => {
        const result = await lendingConfig.isTokenInAssets(GOERLI_USDC_ADDRESS);
        expect(result).to.be.equal(false);
      });

      // ! Should return bool value but returning transactions
      // it("Should make token active", async () => {
      //   const result = await lendingConfig.makeAssetActiveInactive(
      //     GOERLI_USDC_ADDRESS,
      //     0
      //   );
      //   expect(result).to.be.equal(true);
      // });

      // ! Should return bool value but returning transactions
      // it("Should freeze the Asset", async () => {
      //   const result = await lendingConfig.freezeUnFreezeAsset(
      //     GOERLI_DAI_ADDRESS,
      //     0
      //   );

      //   console.log(result);
      // });

      it("Should be able to return symbol by passing address", async () => {
        const asset = await lendingConfig.getAssetByTokenAddress(
          GOERLI_DAI_ADDRESS
        );
        expect(asset.symbol).to.be.equal(DAI_SYMBOL);
      });

      it("Should be able to return address by passing symbol", async () => {
        const asset = await lendingConfig.getAssetByTokenSymbol(DAI_SYMBOL);
        expect(asset.token).to.be.equal(GOERLI_DAI_ADDRESS.toString());
      });

      it("Is collateral Enabled", async () => {
        const result = await lendingConfig.isCollateralEnable(
          GOERLI_DAI_ADDRESS
        );
        expect(result).to.be.equal(false);
      });

      it("Is Borrowing Enabled", async () => {
        const result = await lendingConfig.isBorrowingEnable(
          GOERLI_DAI_ADDRESS
        );
        expect(result).to.be.equal(true);
      });
    });

    /********** LendingPool **************/
    describe("LendingPool Tests", async () => {
      before(async () => {
        await lendingPoolAddressProvider
          .connect(deployerAddress)
          .setLendingPool(lendingPool.address);
        lendingPoolAddress = await lendingPoolAddressProvider
          .connect(deployerAddress)
          .getLendingPool();
        expect(lendingPoolAddress).to.equal(lendingPool.address);

        await helpers.impersonateAccount(lendingPool.address);
        const secondAddressSigner = await ethers.getSigner(lendingPool.address);

        await lendingConfig
          .connect(secondAddressSigner)
          .addAsset(
            GOERLI_USDC_ADDRESS,
            true,
            false,
            false,
            true,
            "USDC",
            18,
            80,
            10
          );

        await lendingConfig
          .connect(secondAddressSigner)
          .addAsset(
            GOERLI_ETH_ADDRESS,
            true,
            false,
            false,
            true,
            "ETH",
            18,
            80,
            10
          );
      });

      it("Get token symbol", async () => {
        await addressToTokenMap.getAddress;
        const result = await addressToTokenMap.getAddress(GOERLI_ETH_ADDRESS);
        expect(result).to.be.equal(ETH_SYMBOL);
      });

      it("Should be able to return address by passing symbol", async () => {
        const asset = await lendingConfig.getAssetByTokenSymbol(ETH_SYMBOL);
        expect(asset.token).to.be.equal(GOERLI_ETH_ADDRESS);
      });

      it("Should has INTEREST RATE", async () => {
        const result = await lendingPool.INTEREST_RATE();
        expect(result).to.be.equal(INTEREST_RATE);
      });

      it("Should has BORROW RATE", async () => {
        const result = await lendingPool.BORROW_RATE();
        expect(result).to.be.equal(BORROW_RATE);
      });

      // TODO: LEND FUNCTIONALITY
      it("Should lend the assets", async () => {
        await lendingPool.lend(GOERLI_ETH_ADDRESS, 1);
        const result = lendingPool.reserves(GOERLI_ETH_ADDRESS);
        console.log(result);
      });

      // it("Should has lend ETH balance", async () => {
      //   const result = lendingPool.lenderETHBalance();
      //   console.log(result);
      // });
    });
  });
});
