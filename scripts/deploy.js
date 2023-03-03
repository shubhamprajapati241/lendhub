const { ethers } = require("hardhat");

async function main() {
  /********************** Deploy AddressStorage *************************/
  const AddressStorage = await ethers.getContractFactory("AddressStorage");
  const addressStorage = await AddressStorage.deploy();
  await addressStorage.deployed();
  console.log("Address of AddressStorage : ", addressStorage.address);

  /********************** Deploy AddressToTokenMap *************************/
  const AddressToTokenMap = await ethers.getContractFactory(
    "AddressToTokenMap"
  );
  const addressToTokenMap = await AddressToTokenMap.deploy();
  await addressToTokenMap.deployed();
  console.log("Address of AddressToTokenMap : ", addressToTokenMap.address);

  /********************** Deploy LendingPoolV2 *************************/
  const LendingPoolV2 = await ethers.getContractFactory("LendingPoolV2");
  const lendingPoolV2 = await LendingPoolV2.deploy(3, 4);
  await lendingPoolV2.deployed();
  console.log("Address of LendingPoolV2 : ", lendingPoolV2.address);

  /********************** Deploy LendingPoolAddressProvider *************************/
  const LendingPoolAddressProvider = await ethers.getContractFactory(
    "LendingPoolAddressProvider"
  );
  const lendingPoolAddressProvider = await LendingPoolAddressProvider.deploy();
  await lendingPoolAddressProvider.deployed();
  console.log(
    "Address of LendingPoolAddressProvider : ",
    lendingPoolAddressProvider.address
  );
}

main().catch((error) => {
  console.log(error);
  process.exitCode = 1;
});
