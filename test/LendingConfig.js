const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Test Lending Config", async () => {
  before(async () => {
    /******** AddressStorage *********/
    const AddressStorage = await ethers.getContractFactory("AddressStorage");
    addressStorage = await AddressStorage.deploy();
    await addressStorage.deployed();
    console.log("Address of AddressStorage : ", addressStorage.address);

    /******** LendingPool *********/
    const LendingPool = await ethers.getContractFactory("LendingPoolV2");
    lendingPool = await LendingPool.deploy(3, 4);
    await lendingPool.deployed();
    console.log("Address of LendingPool : ", lendingPool.address);
    /******** LendingPoolAddressProvider *********/
    const LendingPoolAddressProvider = await ethers.getContractFactory(
      "LendingPoolAddressProvider"
    );
    lendingPoolAddressProvider = await LendingPoolAddressProvider.deploy();
    await lendingPoolAddressProvider.deployed();
    console.log(
      "Address of LendingPoolAddressProvider : ",
      lendingPoolAddressProvider.address
    );

    /******** LendingConfig ********/
    const LendingConfig = await ethers.getContractFactory("LendingConfig");
    lendingConfig = await LendingConfig.deploy();
    await lendingConfig.deployed();
    const accounts = await ethers.getSigners();
    lendingConfigDeployerAddress = accounts[0];
    lendingPoolAddress = accounts[1];
    console.log("Address of LendingConfig : ", lendingConfig.address);
  });

  const GOERLI_DAI_ADDRESS = "0xdc31ee1784292379fbb2964b3b9c4124d8f89c60";
  const GOERLI_USDC_ADDRESS = "0x07865c6E87B9F70255377e024ace6630C1Eaa37F";

  it("Only LendingPool Should be able to add or change assets", async () => {
    const LENDING_POOL = "LENDING_POOL";
    // const DATA_PROVIDER = "DATA_PROVIDER";

    lendingPoolAddressProvider
      .connect(lendingPoolAddressProvider.address)
      .setLendingPool(LENDING_POOL, lendingPool.address);

    // expect(
    //   await lendingPoolAddressProvider
    //     .connect(lendingPoolAddressProvider.address)
    //     .getLendingPool()
    // ).to.equal(lendingPool.address);

    await expect(
      lendingConfig
        .connect(lendingConfigDeployerAddress)
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
        )
    ).to.be.reverted;
  });
});

// addAsset(
//         address _token,
//         bool _borrowingEnabled,
//         bool _usageAsCollateralEnabled,
//         bool _isfrozen,
//         bool _isActive,
//         string memory _symbol,
//         uint256 _decimals,
//         uint256 _borrowThreshold,
//         uint256 _liquidationThreshold
//     )
// isTokenInAssets(address _token)
// makeAssetActiveInactive(address _token, AssetStatus _choice)freezeUnFreezeAsset(address _token, Freeze _choice) public returns(bool)
// getAssetByTokenSymbol(string memory _symbol)
// isCollateralEnable(address _token)
// isBorrowingEnable(address _token)
