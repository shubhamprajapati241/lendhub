const { expect } = require("chai");
const { ethers } = require("hardhat");
require("dotenv").config();
const daiTokenAbi = require("../artifacts/contracts/DAIToken.sol/DAIToken.json");
const usdcTokenAbi = require("../artifacts/contracts/USDCToken.sol/USDCToken.json");
const linkTokenAbi = require("../artifacts/contracts/LINKToken.sol/LINKToken.json");
const addressToTokenMapAbi = require("../artifacts/contracts/AddressToTokenMap.sol/AddressToTokenMap.json");
const lendingConfigAbi = require("../artifacts/contracts/LendingConfig.sol/LendingConfig.json");
const lendingPoolAbi = require("../artifacts/contracts/LendingPool.sol/LendingPool.json");

const {
  ETHAddress,
  DAITokenAddress,
  USDCTokenAddress,
  LINKTokenAddress,
  ETH_USD_PF_ADDRESS,
  DAI_USD_PF_ADDRESS,
  USDC_USD_PF_ADDRESS,
  LINK_USD_PF_ADDRESS,
  AddressToTokenMapAddress,
  LendingConfigAddress,
  LendingPoolAddress,
  account1,
  account2,
  account3,
  account4,
  account5,
  account6,
} = require("../addresses");

// converting number into ETHERS
const numberToEthers = (number) => {
  return ethers.utils.parseEther(number.toString());
};

const SECONDS_IN_A_DAY = 86400;
const decimals = 1e18;

async function moveTime(amount) {
  // console.log("Moving time...");
  await network.provider.send("evm_increaseTime", [amount]);
  // console.log(`Moved forward in time ${amount} seconds.`);
}

describe("LendHub Tests", async () => {
  // For contracts
  let lendingPool;
  let addressToTokenMap;
  let lendingConfig;
  let daiToken;
  let usdcToken;
  let linkToken;

  // constant variables
  const INTEREST_RATE = 3;
  const BORROW_RATE = 4;

  // constant symbols
  const DAI_SYMBOL = "DAI";
  const USDC_SYMBOL = "USDC";
  const ETH_SYMBOL = "ETH";
  const LINK_SYMBOL = "LINK";

  // constant address
  const ETH_ADDRESS = ETHAddress;
  const DAI_ADDRESS = DAITokenAddress;
  const USDC_ADDRESS = USDCTokenAddress;
  const LINK_ADDRESS = LINKTokenAddress;

  before("Obtain connections", async () => {
    // const provider = new ethers.providers.JsonRpcProvider(
    //   process.env.INFURA_SEPOLIA_API_URL
    // );

    provider = new ethers.providers.InfuraProvider(
      "sepolia",
      process.env.INFURA_API_KEY
    );

    daiToken = new ethers.Contract(DAITokenAddress, daiTokenAbi.abi, provider);

    usdcToken = new ethers.Contract(
      USDCTokenAddress,
      usdcTokenAbi.abi,
      provider
    );
    linkToken = new ethers.Contract(
      LINKTokenAddress,
      linkTokenAbi.abi,
      provider
    );

    addressToTokenMap = new ethers.Contract(
      AddressToTokenMapAddress,
      addressToTokenMapAbi.abi,
      provider
    );

    lendingConfig = new ethers.Contract(
      LendingConfigAddress,
      lendingConfigAbi.abi,
      provider
    );
    lendingPool = new ethers.Contract(
      LendingPoolAddress,
      lendingPoolAbi.abi,
      provider
    );

    signer = new ethers.Wallet(process.env.MAIN_ACCOUNT, provider);

    /******** Setting Signer Addresses ********/
    lender1 = account1;
    lender2 = account2;
    lender3 = account3;
    lender4 = account4;
    borrower1 = account5;
    borrower2 = account6;
    // transferring assets into accounts
    //   await daiToken.connect(signer).transfer(lender1, numberToEthers(20000));
    // await usdcToken.connect(signer).transfer(lender2, numberToEthers(50000));
    // await linkToken.connect(signer).transfer(lender3, numberToEthers(30000));
    // await daiToken.connect(signer).transfer(lender4, numberToEthers(2500));
    // await usdcToken.connect(signer).transfer(lender4, numberToEthers(3500));
    // await linkToken.connect(signer).transfer(lender4, numberToEthers(4000));
  });

  it.only("1. Should be able to set and get Token & Price Feed address", async () => {
    /****************** Adding Assets ******************/
    await addressToTokenMap.connect(signer)._setAddress(ETH_ADDRESS, "ETH");
    await addressToTokenMap.connect(signer)._setAddress(DAI_ADDRESS, "DAI");
    await addressToTokenMap.connect(signer)._setAddress(USDC_ADDRESS, "USDC");
    await addressToTokenMap.connect(signer)._setAddress(LINK_ADDRESS, "LINK");

    expect(
      await addressToTokenMap.connect(signer).getAddress(ETH_ADDRESS)
    ).to.equal("ETH");
    expect(
      await addressToTokenMap.connect(signer).getAddress(DAI_ADDRESS)
    ).to.equal("DAI");
    expect(
      await addressToTokenMap.connect(signer).getAddress(USDC_ADDRESS)
    ).to.equal("USDC");
    expect(
      await addressToTokenMap.connect(signer).getAddress(LINK_ADDRESS)
    ).to.equal("LINK");

    /****************** Adding PriceFeed ******************/
    await addressToTokenMap
      .connect(signer)
      ._setPriceFeedMap(DAI_ADDRESS, DAI_USD_PF_ADDRESS);
    await addressToTokenMap
      .connect(signer)
      ._setPriceFeedMap(USDC_ADDRESS, USDC_USD_PF_ADDRESS);
    await addressToTokenMap
      .connect(signer)
      ._setPriceFeedMap(LINK_ADDRESS, LINK_USD_PF_ADDRESS);
    await addressToTokenMap
      .connect(signer)
      ._setPriceFeedMap(ETH_ADDRESS, ETH_USD_PF_ADDRESS);

    expect(
      await addressToTokenMap.connect(signer).getPriceFeedMap(ETH_ADDRESS)
    ).to.equal(ETH_USD_PF_ADDRESS);
    expect(
      await addressToTokenMap.connect(signer).getPriceFeedMap(DAI_ADDRESS)
    ).to.equal(DAI_USD_PF_ADDRESS);
    expect(
      await addressToTokenMap.connect(signer).getPriceFeedMap(USDC_ADDRESS)
    ).to.equal(USDC_USD_PF_ADDRESS);
    expect(
      await addressToTokenMap.connect(signer).getPriceFeedMap(LINK_ADDRESS)
    ).to.equal(LINK_USD_PF_ADDRESS);
  });

  // it("4. Lender 3 can add assets", async () => {
  //   await lendingPool
  //     .connect(deployer3)
  //     .addAsset(DAI_ADDRESS, true, false, false, true, DAI_SYMBOL, 18, 80, 10);
  // });

  // it("5. DAI Token should be in assets", async () => {
  //   const result = await lendingConfig.isTokenInAssets(DAI_ADDRESS);
  //   expect(result).to.be.equal(true);
  // });

  // it("6. USDC Token should not be in assets", async () => {
  //   const result = await lendingConfig.isTokenInAssets(USDC_ADDRESS);
  //   expect(result).to.be.equal(false);
  // });

  // it("7. Should be able to return symbol by passing address", async () => {
  //   const asset = await lendingConfig.getAssetByTokenAddress(DAI_ADDRESS);
  //   expect(asset.symbol).to.be.equal(DAI_SYMBOL);
  // });

  // it("8. Should be able to return address by passing symbol", async () => {
  //   const asset = await lendingConfig.getAssetByTokenSymbol(DAI_SYMBOL);
  //   expect(asset.token).to.be.equal(DAI_ADDRESS.toString());
  // });

  // it("9. Is collateral Enabled", async () => {
  //   const result = await lendingPool.isCollateralEnable(DAI_ADDRESS);
  //   expect(result).to.be.equal(false);
  // });

  // it("10. Is Borrowing Enabled", async () => {
  //   const result = await lendingConfig.isBorrowingEnable(DAI_ADDRESS);
  //   expect(result).to.be.equal(true);
  // });

  /******************** LEND FUNCTIONALITY ***************************/

  it.only("11. Should lend 10 ETH", async () => {
    console.log("#####################################################");
    console.log("*************** LEND ETH ********************");
    const amount = numberToEthers(0.2);
    const valueOption = { value: amount };
    const asset = ETH_ADDRESS;

    // 1. lending the ETH
    const beforeBalance = await lendingPool
      .connect(signer)
      .getContractETHBalance();
    const tx = await lendingPool
      .connect(signer)
      .lend(asset, amount, valueOption);
    await tx.wait();
    console.log(
      "contract ETH balance before lend :" + beforeBalance / decimals
    );

    // 2. Checking contract ETH balance
    const afterBalance = await lendingPool
      .connect(signer)
      .getContractETHBalance();
    expect(afterBalance).to.be.greaterThan(beforeBalance);
    console.log("contract ETH balance after lend :" + afterBalance / decimals);

    // 3. checking Reserves
    let result = await lendingPool.connect(signer).reserves(asset);
    expect(result).to.be.equal(amount);

    // 4. checking token is in assets or not
    result = await lendingConfig.connect(signer).isTokenInAssets(asset);
    expect(result).to.be.true;

    // 5. checking lender ETH balance
    result = await lendingPool.connect(signer).getLenderAssetQty(signer, asset);
    expect(result).to.be.equal(amount);

    // 6. checking lender Assets
    result = await lendingPool.connect(signer).getLenderAssets(lender1);
    expect(result[0].token).to.be.equal(asset);
  });

  it("12. Should be able to update lendQty when lending more ETH", async () => {
    const valueOption = { value: numberToEthers(10) };
    const amount = numberToEthers(10);
    const asset = ETH_ADDRESS;

    // 1. lending the ETH
    const beforeBalance = await lendingPool.getContractETHBalance();
    const tx = await lendingPool
      .connect(lender1)
      .lend(asset, amount, valueOption);
    await tx.wait();
    console.log(
      "Contract ETH balance before lending 10 more ETH :" +
        beforeBalance / decimals
    );

    // 2. Checking contract ETH balance
    const afterBalance = await lendingPool.getContractETHBalance();
    expect(afterBalance).to.be.greaterThan(beforeBalance);
    console.log(
      "Contract ETH balance after lending 10 more ETH :" +
        afterBalance / decimals
    );

    // 3. checking Reserves
    let result = await lendingPool.reserves(asset);
    expect(result).to.be.greaterThan(amount);

    // 4. checking token is in assets or not
    result = await lendingConfig.isTokenInAssets(asset);
    expect(result).to.be.true;

    // 5. checking lender ETH balance
    result = await lendingPool.getLenderAssetQty(lender1, asset);
    expect(result).to.be.greaterThan(amount);

    // 6. checking lender Assets
    result = await lendingPool.getLenderAssets(lender1);
    expect(result[0].token).to.be.equal(asset);
  });

  it("13. Should lend 1000 DAI", async () => {
    // await ethers.connect(lender1);

    console.log("************** LEND DAI **************");
    const amount = numberToEthers(2500);
    const allowanceAmount = numberToEthers(2500);
    const asset = DAI_ADDRESS;

    await daiToken
      .connect(lender1)
      .approve(lendingPool.address, allowanceAmount);

    const beforeBalance = await lendingPool.getTokenBalance(
      lendingPool.address,
      DAI_ADDRESS
    );
    console.log(
      "Contract DAI balance before lending : " + beforeBalance / decimals
    );

    // 2. Checking Lender DAI balance
    const beforeLenderBalance = await lendingPool.getTokenBalance(
      lender1,
      DAI_ADDRESS
    );

    console.log(
      "Lender DAI Balance Before Lending: " + beforeLenderBalance / decimals
    );

    // 1. Lending
    const tx = await lendingPool.connect(lender1).lend(asset, amount);
    await tx.wait();

    // 2. Checking contract DAI balance
    const afterBalance = await lendingPool.getTokenBalance(
      lendingPool.address,
      DAI_ADDRESS
    );
    // expect(afterBalance).to.be.equal(beforeBalance);
    console.log(
      "Contract DAI balance after lending : " + afterBalance / decimals
    );

    // 2. Checking Lender DAI balance
    const afterLenderBalance = await lendingPool.getTokenBalance(
      lender1,
      DAI_ADDRESS
    );

    console.log(
      "Lender DAI Balance After Lending: " + afterLenderBalance / decimals
    );

    // 3. checking Reserves
    let result = await lendingPool.reserves(asset);
    expect(result).to.be.equal(amount);

    // 4. checking assets is in reserve array or not
    result = await lendingPool.isTokenInReserve(asset);
    expect(result).to.be.true;

    // 4. checking token is in assets or not
    result = await lendingConfig.isTokenInAssets(asset);
    expect(result).to.be.true;

    // 5. checking lender Assets
    result = await lendingPool.getLenderAssets(lender1);
    expect(result[1].token).to.be.equal(asset);

    const beforeReserveBalance = await lendingPool.reserves(asset);
    console.log(
      "DAI Balance in the Reserves: " + beforeReserveBalance / decimals
    );

    // 6. checking lender lentQty
    result = await lendingPool.getLenderAssets(lender1);
    // expect(result[1].lentQty).to.be.equal(amount);
    console.log(
      "Lender DAI Qty is Lender Assets : " + result[1].lentQty / decimals
    );

    expect(result.length).to.be.equal(2);
  });

  it("14. Non lender should not be able to withdraw", async () => {
    const amount = numberToEthers(5);
    const asset = ETH_ADDRESS;
    await expect(lendingPool.connect(lender2).withdraw(asset, amount)).to.be
      .reverted;
  });

  it("15. Lender Should be able to withdraw ETH assets", async () => {
    const amount = numberToEthers(10);
    const valueOption = { value: amount };
    const asset = ETH_ADDRESS;
    console.log("#####################################################");

    console.log("********** BEFORE WITHDRAW - ETH **********");

    console.log(
      "withdrawQty =" +
        (await lendingPool.getTokensPerUSDAmount(
          ETH_ADDRESS,
          await lendingPool.getUserTotalAvailableBalanceInUSD(lender1)
        ))
    );
    console.log("ETH qty about to be withdrawn:" + amount / decimals);
    // console.log("Token Amount withdrawn :" + amount / decimals);

    let beforeBalance = await lendingPool.getContractETHBalance();
    console.log("Contract ETH Balance: " + beforeBalance / decimals);

    const beforeLenderBalance = await lendingPool.getBalance(lender1);
    console.log(
      "Lender ETH Balance in the Wallet: " + beforeLenderBalance / decimals
    );

    const symbol = await lendingPool.getSymbol(asset);
    const isETH = await lendingPool.isETH(asset);

    const beforeReserveBalance = await lendingPool.reserves(asset);
    console.log(
      "ETH Balance in the Reserves: " + beforeReserveBalance / decimals
    );

    const beforeLenderEthBalance = await lendingPool.getLenderAssetQty(
      lender1,
      asset
    );
    console.log(
      "Lender ETH Balance in the Contract : " +
        beforeLenderEthBalance / decimals
    );

    const tx = await lendingPool.connect(lender1).withdraw(asset, amount);
    await tx.wait();
    // console.log(tx);

    console.log("********** AFTER WITHDRAW - ETH **********");
    console.log("ETH withdraw qty:" + amount / decimals);

    const afterBalance = await lendingPool.getContractETHBalance();
    // expect(afterBalance).to.be.lessThan(beforeBalance);
    console.error("Contract ETH Balance : " + afterBalance / decimals);

    const afterLenderBalance = await lendingPool.getBalance(lender1);
    // expect(afterLenderBalance).to.be.greaterThan(beforeLenderBalance);
    console.error(
      "Lender ETH Balance in the Wallet: " + afterLenderBalance / decimals
    );

    const afterReserveBalance = await lendingPool.reserves(asset);
    // expect(afterReserveBalance).to.be.lessThan(beforeReserveBalance);
    console.log("ETH Balance in Reserve : " + afterReserveBalance / decimals);

    const afterLenderEthBalance = await lendingPool.getLenderAssetQty(
      lender1,
      asset
    );
    // expect(afterLenderEthBalance).to.be.lessThan(beforeLenderEthBalance);

    console.log(
      "Lender ETH Balance in the Contract : " + afterLenderEthBalance / decimals
    );

    console.log("#####################################################");

    // 6. checking lender Assets
    result = await lendingPool.getLenderAssets(lender1);
    expect(result[0].token).to.be.equal(asset);
  });

  it("16. Lender Should be able to withdraw DAI", async () => {
    const amount = numberToEthers(100);
    const asset = DAI_ADDRESS;

    console.log("********** BEFORE WITHDRAW - DAI **********");

    await moveTime(30 * SECONDS_IN_A_DAY);

    console.log("DAI Qty to be withdrawn :" + amount / decimals);
    let result = await lendingPool.getTokenBalance(lender1, DAI_ADDRESS);
    console.log("Lender DAI Balance in Wallet : " + result / decimals);

    result = await lendingPool.getTokenBalance(
      lendingPool.address,
      DAI_ADDRESS
    );
    console.log("Contract DAI Balance : " + result / decimals);

    result = await lendingPool.reserves(asset);
    console.log("DAI Balance in Reserve : " + result / decimals);

    const tx = await lendingPool.connect(lender1).withdraw(asset, amount);
    await tx.wait();

    console.log("********** AFTER WITHDRAW - DAI **********");
    result = await lendingPool.getTokenBalance(lender1, DAI_ADDRESS);
    console.log("Lender DAI Balance in Wallet : " + result / decimals);

    result = await lendingPool.getTokenBalance(
      lendingPool.address,
      DAI_ADDRESS
    );
    console.log("Contract DAI Balance : " + result / decimals);
    result = await lendingPool.reserves(asset);
    console.log("DAI Balance in Reserve : " + result / decimals);
    console.log("#####################################################");

    result = await lendingPool.getLenderAssets(lender1);
    // console.log(result);
  });

  // it("17. Your Assets : Get Lender Assets", async () => {
  //   const tx = await lendingPool.getLenderAssets(lender1);
  //   console.log(tx);
  // });

  // // "error": "Failed to decode output: Error: hex data is odd-length (argument="value", value="0x0", code=INVALID_ARGUMENT, version=bytes/5.5.0)"

  it("17. Should lend 2000 USDC", async () => {
    // await ethers.connect(lender1);

    const amount = numberToEthers(2000);
    const allowanceAmount = numberToEthers(3000);
    const asset = USDC_ADDRESS;
    console.log("#####################################################");

    console.log("********** BEFORE LEND - USDC **********");

    console.log("Token Amount lend :" + amount / decimals);
    let beforeLenderAmount = await lendingPool.getTokenBalance(lender2, asset);
    console.log(
      "Lender USDC Balance in Wallet : " + beforeLenderAmount / decimals
    );

    const beforeContractAmount = await lendingPool.getTokenBalance(
      lendingPool.address,
      asset
    );
    console.log("Contract USDC Balance : " + beforeContractAmount / decimals);

    const beforeReserveAmount = await lendingPool.reserves(asset);
    console.log("USDC Balance in Reserve : " + beforeReserveAmount / decimals);

    /********************** Lending **********************/
    await usdcToken.connect(lender2).approve(lendingPool.address, amount);
    const tx = await lendingPool.connect(lender2).lend(asset, amount);
    await tx.wait();

    console.log("********** AFTER LEND  - USDC **********");

    await moveTime(30 * SECONDS_IN_A_DAY);

    console.log("USDC  Qty Lent :" + amount / decimals);
    let afterLenderAmount = await lendingPool.getTokenBalance(lender2, asset);
    console.log(
      "Lender USDC Balance in Wallet : " + afterLenderAmount / decimals
    );

    const afterContractAmount = await lendingPool.getTokenBalance(
      lendingPool.address,
      asset
    );
    console.log("Contract USDC Balance : " + afterContractAmount / decimals);

    const afterReserveAmount = await lendingPool.reserves(asset);
    console.log("USDC Balance in Reserve  : " + afterReserveAmount / decimals);

    expect(afterLenderAmount).to.be.lessThan(beforeLenderAmount);
    expect(afterContractAmount).to.be.greaterThan(beforeContractAmount);
    expect(afterReserveAmount).to.be.greaterThan(beforeReserveAmount);

    let result = await lendingPool.isTokenInReserve(asset);
    expect(result).to.be.true;

    // checking token is in assets or not
    result = await lendingConfig.isTokenInAssets(asset);
    expect(result).to.be.true;

    // checking lender Assets
    result = await lendingPool.getLenderAssets(lender2);
    expect(result[0].token).to.be.equal(asset);

    // checking lender lentQty
    result = await lendingPool.getLenderAssets(lender2);
    // expect(result[0].lentQty).to.be.equal(amount);
  });

  it("18. Should lend 3000 LINK", async () => {
    // await ethers.connect(lender1);
    console.log("#####################################################");

    const amount = numberToEthers(3000);
    const asset = LINK_ADDRESS;

    console.log("********** BEFORE LEND - LINK **********");

    console.log("LINK Qty to be lent :" + amount / decimals);
    let beforeLenderAmount = await lendingPool.getTokenBalance(lender3, asset);
    console.log(
      "Lender LINK Balance in Wallet : " + beforeLenderAmount / decimals
    );

    const beforeContractAmount = await lendingPool.getTokenBalance(
      lendingPool.address,
      asset
    );
    console.log("Contract LINK Balance : " + beforeContractAmount / decimals);

    const beforeReserveAmount = await lendingPool.reserves(asset);
    console.log("LINK Balance in Reserve : " + beforeReserveAmount / decimals);

    /********************** Lending **********************/
    await linkToken.connect(lender3).approve(lendingPool.address, amount);
    const tx = await lendingPool.connect(lender3).lend(asset, amount);
    await tx.wait();

    console.log("********** AFTER LEND - LINK **********");

    await moveTime(30 * SECONDS_IN_A_DAY);

    console.log("LINK Qty Lent :" + amount / decimals);
    let afterLenderAmount = await lendingPool.getTokenBalance(lender3, asset);
    console.log(
      "Lender LINK Balance in Wallet : " + afterLenderAmount / decimals
    );

    const afterContractAmount = await lendingPool.getTokenBalance(
      lendingPool.address,
      asset
    );
    console.log("Contract LINK Balance : " + afterContractAmount / decimals);

    const afterReserveAmount = await lendingPool.reserves(asset);
    console.log("LINK Balance in Reserve  : " + afterReserveAmount / decimals);

    expect(afterLenderAmount).to.be.lessThan(beforeLenderAmount);
    expect(afterContractAmount).to.be.greaterThan(beforeContractAmount);
    expect(afterReserveAmount).to.be.greaterThan(beforeReserveAmount);

    let result = await lendingPool.isTokenInReserve(asset);
    expect(result).to.be.true;

    // checking token is in assets or not
    result = await lendingConfig.isTokenInAssets(asset);
    expect(result).to.be.true;

    // checking lender Assets
    result = await lendingPool.getLenderAssets(lender3);
    expect(result[0].token).to.be.equal(asset);

    // checking lender lentQty
    result = await lendingPool.getLenderAssets(lender3);
    // expect(result[0].lentQty).to.be.equal(amount);
  });

  it("19. Get assets to borrow", async () => {
    // const result = await lendingPool.isBorrowingEnable(DAI_ADDRESS);
    // console.log(result);
    // console.log("***************** Asset ********************");
    // console.log(asset);
    // const assets = await lendingPool.getAssetsToBorrow(lender1);
    // console.log("***************** AssetsToBorrow ********************");
    // console.log(assets);
    // const beforeReserveAmount = await lendingPool.reserves(LINK_ADDRESS);
    // console.log("Reserve Balance : " + beforeReserveAmount);
    // const lenderAssets = await lendingPool.getLenderAssets(lender1);
    // console.log(lenderAssets);
  });

  it("20. Lender2 should lend 10 ETH ", async () => {
    const valueOption = { value: numberToEthers(10) };
    const lendAmount = numberToEthers(10);
    const asset = ETH_ADDRESS;
    console.log("#####################################################");

    console.log("************** BEFORE LEND - ETH [Lender 2] **************");
    console.log("1. Qty to be lend : " + lendAmount / decimals);

    const beforeReserveAmount = await lendingPool.reserves(asset);
    console.log("2. Reserves: " + beforeReserveAmount / decimals);

    let beforeLenderAssetAmount = await lendingPool.getLenderAssetQty(
      lender1,
      asset
    );
    console.log(
      "3. Lender lent balance : " + beforeLenderAssetAmount / decimals
    );

    const beforeContractAmount = await lendingPool.getContractETHBalance();
    console.log("4. Contract ETH Balance : " + beforeContractAmount / decimals);

    const beforeBalance = await lendingPool.getContractETHBalance();
    const tx = await lendingPool
      .connect(lender2)
      .lend(asset, lendAmount, valueOption);
    await tx.wait();

    console.log("************** AFTER LEND - ETH [Lender 2] **************");

    const afterReserveAmount = await lendingPool.reserves(asset);
    console.log("2. Reserves: " + afterReserveAmount / decimals);
    expect(afterReserveAmount).to.be.greaterThan(beforeReserveAmount);

    let afterLenderAssetAmount = await lendingPool.getLenderAssetQty(
      lender1,
      asset
    );
    console.log(
      "3. Lender lent balance : " + afterLenderAssetAmount / decimals
    );
    expect(afterLenderAssetAmount).to.be.equal(beforeLenderAssetAmount);

    const afterContractAmount = await lendingPool.getContractETHBalance();
    console.log("4. Contract ETH Balance : " + afterContractAmount / decimals);
    expect(afterContractAmount).to.be.greaterThan(beforeContractAmount);

    let result = await lendingConfig.isTokenInAssets(asset);
    expect(result).to.be.true;

    result = await lendingPool.getLenderAssetQty(lender2, asset);
    expect(result).to.be.equal(lendAmount);

    console.log("#####################################################");
  });

  it("21. Borrower 2 Should be able to borrow DAI", async () => {
    const borrowDuration = 30;
    const borrowAmount = numberToEthers(100);
    const asset = DAI_ADDRESS;
    const user = borrower2;

    console.log("********** BEFORE BORROW - DAI - BORROWER 2  **********");

    const assets = await lendingPool.getAssetsToBorrow(user.address);
    // console.log("assets : " + JSON.stringify(assets));
    const assetQty = assets.find((el) => el.token == asset);
    console.log("1. Max qty available to Borrow : " + assetQty.borrowQty);
    console.log("2. Qty to be borrowed : " + borrowAmount / decimals);

    const beforeReserveAmount = await lendingPool.reserves(asset);
    console.log("3. Qty in Reserves: " + beforeReserveAmount / decimals);

    let beforeLenderAssetAmount = await lendingPool.getBorrowerAssetQty(
      user.address,
      asset
    );
    console.log("3. Borrower balance : " + beforeLenderAssetAmount / decimals);

    const beforeContractAmount = await lendingPool.getTokenBalance(
      lendingPool.address,
      asset
    );
    console.log(
      "4. Contract Token Balance : " + beforeContractAmount / decimals
    );

    let beforeLenderAmount = await lendingPool.getTokenBalance(
      user.address,
      asset
    );
    console.log(
      "5. Borrower Wallet Balance : " + beforeLenderAmount / decimals
    );

    await lendingPool.connect(user).borrow(asset, borrowAmount);

    console.log("********** AFTER BORROW - DAI - BORROWER 2 **********");

    await moveTime(30 * SECONDS_IN_A_DAY);

    const afterReserveAmount = await lendingPool.reserves(asset);
    console.log("3. Qty in Reserves: " + afterReserveAmount / decimals);

    let afterLenderAssetAmount = await lendingPool.getBorrowerAssetQty(
      user.address,
      asset
    );
    console.log("3. Borrower balance : " + afterLenderAssetAmount / decimals);

    const afterContractAmount = await lendingPool.getTokenBalance(
      lendingPool.address,
      asset
    );
    console.log(
      "4. Contract Token Balance : " + afterContractAmount / decimals
    );

    let afterLenderAmount = await lendingPool.getTokenBalance(
      user.address,
      asset
    );
    console.log("5. Lender Wallet Balance : " + afterLenderAmount / decimals);

    console.log("******************* BORROWER ASSETS ******************");
    let borrowerAssets = await lendingPool.getBorrowerAssets(lender2);
    console.log(borrowerAssets);

    console.log("#####################################################");
  });

  it("22. Should not be able to borrow above max available qty", async () => {
    const borrowDuration = 30;
    const asset = DAI_ADDRESS;

    const assets = await lendingPool.getAssetsToBorrow(lender1);
    const assetQty = assets.find((el) => el.token == asset);
    console.log("Qty being borrowed: " + assetQty.borrowQty);

    const borrowAmount = numberToEthers(assetQty.borrowQty);

    await expect(lendingPool.connect(lender1).borrow(asset, borrowAmount)).to.be
      .reverted;
  });

  it("23. Should not be able to borrow more than reserve qty", async () => {
    const borrowDuration = 30;
    const asset = DAI_ADDRESS;

    const reserveAmount = await lendingPool.reserves(asset);
    console.log("Qty being borrowed: " + reserveAmount / decimals);

    const borrowAmount = numberToEthers(reserveAmount);

    await expect(lendingPool.connect(lender1).borrow(asset, borrowAmount)).to.be
      .reverted;
  });

  it("24. Should be able to borrow again", async () => {
    const borrowDuration = 30;
    const borrowAmount = numberToEthers(110);
    const asset = DAI_ADDRESS;

    console.log("#####################################################");

    console.log("********** BEFORE BORROW AGAIN - DAI **********");

    await moveTime(30 * SECONDS_IN_A_DAY);

    const assets = await lendingPool.getAssetsToBorrow(lender1);
    const assetQty = assets.find((el) => el.token == asset);
    console.log(
      "1. What is max qty available to Borrow : " + assetQty.borrowQty
    );

    console.log(
      "2. what is the qty to be borrowed : " + borrowAmount / decimals
    );

    const beforeReserveAmount = await lendingPool.reserves(asset);
    console.log("3. What is the reserves: " + beforeReserveAmount / decimals);

    let beforeLenderAssetAmount = await lendingPool.getLenderAssetQty(
      lender1,
      asset
    );
    console.log(
      "4. What is the lender lent balance : " +
        beforeLenderAssetAmount / decimals
    );

    const beforeContractAmount = await lendingPool.getTokenBalance(
      lendingPool.address,
      asset
    );
    console.log(
      "5. What is Contract Token Balance : " + beforeContractAmount / decimals
    );

    let beforeLenderAmount = await lendingPool.getTokenBalance(lender1, asset);
    console.log(
      "6. What is Lender Wallet Balance : " + beforeLenderAmount / decimals
    );

    const borrowtransaction = await lendingPool
      .connect(lender1)
      .borrow(asset, borrowAmount);

    // console.log(borrowtransaction);

    console.log("********** After BORROW AGAIN **********");

    await moveTime(30 * SECONDS_IN_A_DAY);

    const afterReserveAmount = await lendingPool.reserves(asset);
    console.log("3. What is the reserves: " + afterReserveAmount / decimals);

    let afterLenderAssetAmount = await lendingPool.getBorrowerAssets(lender1);
    console.log(
      "4. lender borrowed balance : " +
        afterLenderAssetAmount[0].borrowQty / decimals
    );

    const afterContractAmount = await lendingPool.getTokenBalance(
      lendingPool.address,
      asset
    );
    console.log(
      "5. Contract Token Balance : " + afterContractAmount / decimals
    );

    let afterLenderAmount = await lendingPool.getTokenBalance(lender1, asset);
    console.log("6. Lender Wallet Balance : " + afterLenderAmount / decimals);

    console.log("#####################################################");
  });

  it("25. Lender2 Should be able to repay", async () => {
    const repayAmount = numberToEthers(100);
    const asset = DAI_ADDRESS;

    console.log("********** BEFORE REPAY - DAI **********");

    console.log("1. Qty to be repay : " + repayAmount / decimals);

    const beforeReserveAmount = await lendingPool.reserves(asset);
    console.log("2. Reserves amount : " + beforeReserveAmount / decimals);

    let beforeBorrowerAssetAmount = await lendingPool.getBorrowerAssetQty(
      lender2,
      asset
    );
    console.log(
      "4. Borrower 2 borrowed Qty : " + beforeBorrowerAssetAmount / decimals
    );

    const beforeContractAmount = await lendingPool.getTokenBalance(
      lendingPool.address,
      asset
    );
    console.log(
      "5. Contract Token Balance : " + beforeContractAmount / decimals
    );

    let beforeBorrowerAmount = await lendingPool.getTokenBalance(
      lender2,
      asset
    );
    console.log(
      "6. Borrower 2 Wallet Balance : " + beforeBorrowerAmount / decimals
    );

    console.log("+++++++++++++++++++++++++++++++++++++++++++++++++");

    await moveTime(30 * SECONDS_IN_A_DAY);

    await daiToken.connect(lender2).approve(lendingPool.address, repayAmount);
    await lendingPool.connect(lender2).repay(asset, repayAmount);

    console.log("********** AFTER REPAY - DAI **********");

    const afterReserveAmount = await lendingPool.reserves(asset);
    // expect(afterReserveAmount).to.be.greaterThan(beforeReserveAmount);
    console.log("2. Reserves amount : " + afterReserveAmount / decimals);

    let afterBorrowerAssetAmount = await lendingPool.getBorrowerAssetQty(
      lender2,
      asset
    );
    // expect(afterBorrowerAssetAmount).to.be.lessThan(beforeBorrowerAssetAmount);
    console.log(
      "4. Borrower 2 borrowed Qty : " + afterBorrowerAssetAmount / decimals
    );

    const afterContractAmount = await lendingPool.getTokenBalance(
      lendingPool.address,
      asset
    );
    // expect(afterContractAmount).to.be.greaterThan(beforeContractAmount);
    console.log(
      "5. Contract Token Balance : " + afterContractAmount / decimals
    );

    let afterBorrowerAmount = await lendingPool.getTokenBalance(lender2, asset);
    // expect(afterBorrowerAmount).to.be.lessThan(beforeBorrowerAmount);
    console.log(
      "6. Borrower 2 Wallet Balance : " + afterBorrowerAmount / decimals
    );

    console.log("#####################################################");
  });

  it("Should lend 1000 ETH", async () => {
    const valueOption = { value: numberToEthers(1000) };
    const lendAmount = numberToEthers(1000);
    const asset = ETH_ADDRESS;
    console.log("#####################################################");

    console.log("************** BEFORE LEND - ETH [Lender 2] **************");
    console.log("1. Qty to be lend : " + lendAmount / decimals);

    const beforeReserveAmount = await lendingPool.reserves(asset);
    console.log("2. Reserves: " + beforeReserveAmount / decimals);

    let beforeLenderAssetAmount = await lendingPool.getLenderAssetQty(
      lender3,
      asset
    );
    console.log(
      "3. Lender lent balance : " + beforeLenderAssetAmount / decimals
    );

    const beforeContractAmount = await lendingPool.getContractETHBalance();
    console.log("4. Contract ETH Balance : " + beforeContractAmount / decimals);

    const beforeBalance = await lendingPool.getContractETHBalance();
    const tx = await lendingPool
      .connect(lender3)
      .lend(asset, lendAmount, valueOption);
    await tx.wait();

    console.log("************** AFTER LEND - ETH [Lender 3] **************");

    const afterReserveAmount = await lendingPool.reserves(asset);
    console.log("2. Reserves: " + afterReserveAmount / decimals);
    expect(afterReserveAmount).to.be.greaterThan(beforeReserveAmount);

    let afterLenderAssetAmount = await lendingPool.getLenderAssetQty(
      lender3,
      asset
    );
    console.log(
      "3. Lender lent balance : " + afterLenderAssetAmount / decimals
    );
    // expect(afterLenderAssetAmount).to.be.equal(beforeLenderAssetAmount);

    const afterContractAmount = await lendingPool.getContractETHBalance();
    console.log("4. Contract ETH Balance : " + afterContractAmount / decimals);
    // expect(afterContractAmount).to.be.greaterThan(beforeContractAmount);

    let result = await lendingConfig.isTokenInAssets(asset);
    expect(result).to.be.true;

    result = await lendingPool.getLenderAssetQty(lender3, asset);
    // expect(result).to.be.equal(lendAmount);

    console.log("#####################################################");
  });

  it("27. Should return the lenderAssets with updated lendQty", async () => {
    console.log("+++++++++++++++++++++++++++++++++++++++++++++++++");
    let result = await lendingPool.getLenderAssets(lender3);
    console.log(result);

    await moveTime(365 * SECONDS_IN_A_DAY);
    // result = await lendingPool.getLenderAssets2(lender3);
    // console.log(result);
    reward = await lendingPool.rewardPerToken(ETH_ADDRESS, 1679105693);
    console.log("reward : " + reward);
    result = await lendingPool.interestEarned(lender3, ETH_ADDRESS, 1679105693);
    console.log("result : " + result);
    // 1679105693 = Mar 18 2023 => 1980
    // 1671100453 = Dec 15 2022 => 2854
    // 1601100453 = Sep 26 2020 => 10496
  });
});
