const { ethers } = require("hardhat");

async function main() {
  /********************** Deploy AddressStorage *************************/
  // const AddressStorage = await ethers.getContractFactory("AddressStorage");
  // const addressStorage = await AddressStorage.deploy();
  // await addressStorage.deployed();
  // console.log("Address of AddressStorage : ", addressStorage.address);

  /********************** Deploy DAIToken *************************/
  const DAIToken = await ethers.getContractFactory("DAIToken");
  const daiToken = await DAIToken.deploy();
  await daiToken.deployed();
  console.log("Address of DAIToken : ", daiToken.address);

  /********************** Deploy DAIToken *************************/
  const LINKToken = await ethers.getContractFactory("DAIToken");
  const linkToken = await LINKToken.deploy();
  await linkToken.deployed();
  console.log("Address of LINKToken : ", linkToken.address);

  /********************** Deploy DAIToken *************************/
  const USDCToken = await ethers.getContractFactory("DAIToken");
  const usdcToken = await USDCToken.deploy();
  await usdcToken.deployed();
  console.log("Address of USDCToken : ", usdcToken.address);

  /********************** Deploy AddressToTokenMap *************************/
  const AddressToTokenMap = await ethers.getContractFactory(
    "AddressToTokenMap"
  );
  const addressToTokenMap = await AddressToTokenMap.deploy();
  await addressToTokenMap.deployed();
  console.log("Address of AddressToTokenMap : ", addressToTokenMap.address);

  /********************** Deploy LendingConfig *************************/
  const LendingConfig = await ethers.getContractFactory("LendingConfig");
  const lendingConfig = await LendingConfig.deploy();
  await lendingConfig.deployed();
  console.log("Address of LendingConfig : ", lendingConfig.address);

  /********************** Deploy LendingPoolV2 *************************/
  const LendingPool = await ethers.getContractFactory("LendingPool");
  const lendingPool = await LendingPool.deploy(3, 4);
  await lendingPool.deployed();
  console.log("Address of LendingPool : ", lendingPool.address);

  //   /********************** Deploy LendingPoolAddressProvider *************************/
  //   const LendingPoolAddressProvider = await ethers.getContractFactory(
  //     "LendingPoolAddressProvider"
  //   );
  //   const lendingPoolAddressProvider = await LendingPoolAddressProvider.deploy();
  //   await lendingPoolAddressProvider.deployed();
  //   console.log(
  //     "Address of LendingPoolAddressProvider : ",
  //     lendingPoolAddressProvider.address
  //   );
}

main().catch((error) => {
  console.log(error);
  process.exitCode = 1;
});
