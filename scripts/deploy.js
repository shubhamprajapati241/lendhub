const { ethers } = require("hardhat");
const {
  ETHAddress,
  DAITokenAddress,
  USDCTokenAddress,
  LINKTokenAddress,
  ETH_USD_PF_ADDRESS,
  DAI_USD_PF_ADDRESS,
  USDC_USD_PF_ADDRESS,
  LINK_USD_PF_ADDRESS,
} = require("../addresses");

const numberToEthers = (number) => {
  return ethers.utils.parseEther(number.toString());
};

async function main() {
  let LendingPoolAddress;
  const INTEREST_RATE = 3;
  const BORROW_RATE = 4;

  /********************** Deploy DAIToken *************************/
  const DAIToken = await ethers.getContractFactory("DAIToken");
  const daiToken = await DAIToken.deploy();
  await daiToken.deployed();
  const DAI_ADDRESS = daiToken.address;
  console.log('const DAITokenAddress = "' + DAI_ADDRESS + '"');

  /********************** Deploy DAIToken *************************/
  const LINKToken = await ethers.getContractFactory("LinkToken");
  const linkToken = await LINKToken.deploy();
  await linkToken.deployed();
  const LINK_ADDRESS = linkToken.address;
  console.log('const LINKTokenAddress = "' + LINK_ADDRESS + '"');

  /********************** Deploy DAIToken *************************/
  const USDCToken = await ethers.getContractFactory("USDCToken");
  const usdcToken = await USDCToken.deploy();
  await usdcToken.deployed();
  const USDC_ADDRESS = usdcToken.address;
  console.log('const USDCTokenAddress = "' + USDC_ADDRESS + '"');

  /********************** Deploy AddressToTokenMap *************************/
  const AddressToTokenMap = await ethers.getContractFactory(
    "AddressToTokenMap"
  );
  const addressToTokenMap = await AddressToTokenMap.deploy();
  await addressToTokenMap.deployed();
  console.log(
    'const AddressToTokenMapAddress = "' + addressToTokenMap.address + '"'
  );

  /********************** Deploy LendingConfig *************************/
  const LendingConfig = await ethers.getContractFactory("LendingConfig");
  const lendingConfig = await LendingConfig.deploy(INTEREST_RATE, BORROW_RATE);
  await lendingConfig.deployed();
  console.log('const LendingConfigAddress = "' + lendingConfig.address + '"');

  const LendingHelper = await ethers.getContractFactory("LendingHelper");
  const lendingHelper = await LendingHelper.deploy(
    addressToTokenMap.address,
    lendingConfig.address
  );
  await lendingHelper.deployed();
  console.log('const LendingHelperAddress = "' + lendingHelper.address + '"');

  /********************** Deploy LendingPoolV2 *************************/
  const LendingPool = await ethers.getContractFactory("LendingPool");
  const lendingPool = await LendingPool.deploy(
    addressToTokenMap.address,
    lendingConfig.address,
    lendingHelper.address
  );
  await lendingPool.deployed();
  LendingPoolAddress = lendingPool.address;
  console.log('const LendingPoolAddress = "' + lendingPool.address + '"');

  /******** Setting Signer Addresses ********/
  const accounts = await ethers.getSigners();
  const deployerAddress = accounts[0];

  const account1 = accounts[1];
  const account2 = accounts[2];
  const account3 = accounts[3];

  console.log("deployerAddress : " + deployerAddress.address);

  // transfering assets into account1

  console.log(" Transferring assets to account1");
  await daiToken.transfer(account1.address, numberToEthers(20000));
  // console.log(JSON.stringify(tx));
  await usdcToken.transfer(account1.address, numberToEthers(50000));
  await linkToken.transfer(account1.address, numberToEthers(30000));

  console.log("Transferring assets to account2");
  await daiToken.transfer(account2.address, numberToEthers(20000));
  await usdcToken.transfer(account2.address, numberToEthers(50000));
  await linkToken.transfer(account2.address, numberToEthers(30000));

  console.log("Transferring assets to account3");
  await daiToken.transfer(account3.address, numberToEthers(20000));
  await usdcToken.transfer(account3.address, numberToEthers(50000));
  await linkToken.transfer(account3.address, numberToEthers(30000));

  console.log("Transaction initial assets to lendingpool");
  // await daiToken.transfer(LendingPoolAddress, numberToEthers(50000));
  // await usdcToken.transfer(LendingPoolAddress, numberToEthers(50000));
  // await linkToken.transfer(LendingPoolAddress, numberToEthers(50000));
  // const valueOption = { value: ethers.utils.parseEther((100).toString()) };
  // await LendingPoolAddress.transfer(valueOption);

  console.log(" Transferring assets to account4");
  // await daiToken.transfer(account4, numberToEthers(20000));
  //  console.log(JSON.stringify(tx));
  // await usdcToken.transfer(account4, numberToEthers(50000));
  // await linkToken.transfer(account4, numberToEthers(30000));

  // console.log("Transfering assets to account5");
  // await daiToken.transfer(account5, numberToEthers(20000));
  // await usdcToken.transfer(account5, numberToEthers(50000));
  // await linkToken.transfer(account5, numberToEthers(30000));

  // console.log("Transfering assets to account6");
  // await daiToken.transfer(account6, numberToEthers(20000));
  // await usdcToken.transfer(account6, numberToEthers(50000));
  // await linkToken.transfer(account6, numberToEthers(30000));

  /****************** Adding Assets ******************/
  await addressToTokenMap._setAddress(ETHAddress, "ETH");
  await addressToTokenMap._setAddress(DAITokenAddress, "DAI");
  await addressToTokenMap._setAddress(USDCTokenAddress, "USDC");
  await addressToTokenMap._setAddress(LINKTokenAddress, "LINK");

  console.log("Token Address Set");

  /****************** Adding PriceFeed ******************/
  await addressToTokenMap._setPriceFeedMap(DAITokenAddress, DAI_USD_PF_ADDRESS);
  await addressToTokenMap._setPriceFeedMap(
    USDCTokenAddress,
    USDC_USD_PF_ADDRESS
  );
  await addressToTokenMap._setPriceFeedMap(
    LINKTokenAddress,
    LINK_USD_PF_ADDRESS
  );
  await addressToTokenMap._setPriceFeedMap(ETHAddress, ETH_USD_PF_ADDRESS);

  console.log("Pricefeed Address Set");

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
