const { expect } = require("chai");
const { ethers } = require("hardhat");

// converting number into ETHERS
const numberToEthers = (number) => {
  return ethers.utils.parseEther(number.toString());
};

describe("LendHub Tests", async () => {
  // For contracts
  let lendingPool;
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
  const ETH_ADDRESS = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6";
  let DAI_ADDRESS = "0xdc31Ee1784292379Fbb2964b3B9C4124D8F89C60";
  let USDC_ADDRESS = "0x07865c6E87B9F70255377e024ace6630C1Eaa37F";
  let LINK_ADDRESS = "0x48731cF7e84dc94C5f84577882c14Be11a5B7456";

  // constant pricefeed address
  const ETH_USD_PF_ADDRESS = "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e";
  const GOERLI_DAI_USD_PF_ADDRESS =
    "0x0d79df66BE487753B02D015Fb622DED7f0E9798d";
  const USDC_USD_PF_ADDRESS = "0xAb5c49580294Aff77670F839ea425f5b78ab3Ae7";
  const LINK_USD_PF_ADDRESS = "0x48731cF7e84dc94C5f84577882c14Be11a5B7456";

  before(async () => {
    /******** Deploy Contracts *********/
    const LendingPool = await ethers.getContractFactory("LendingPool");
    lendingPool = await LendingPool.deploy(INTEREST_RATE, BORROW_RATE);
    await lendingPool.deployed();

    const DAIToken = await ethers.getContractFactory("DAIToken");
    daiToken = await DAIToken.deploy();
    await daiToken.deployed();
    DAI_ADDRESS = daiToken.address;

    const USDCToken = await ethers.getContractFactory("USDCToken");
    usdcToken = await USDCToken.deploy();
    await usdcToken.deployed();
    USDC_ADDRESS = usdcToken.address;

    const LinkToken = await ethers.getContractFactory("LinkToken");
    linkToken = await LinkToken.deploy();
    await linkToken.deployed();
    LINK_ADDRESS = linkToken.address;

    console.log("Lending Pool : " + lendingPool.address);
    console.log("DAI_ADDRESS : " + DAI_ADDRESS);
    console.log("USDC_ADDRESS : " + USDC_ADDRESS);
    console.log("LINK_ADDRESS : " + LINK_ADDRESS);

    /******** Setting Signer Addresses ********/
    const accounts = await ethers.getSigners();
    deployerAddress = accounts[0];
    lender1 = accounts[1];
    lender2 = accounts[2];
    lender3 = accounts[3];
    borrower1 = accounts[3];
    borrower2 = accounts[2];
    borrower3 = accounts[4];

    // transfering assets into account
    await daiToken.transfer(lender1.address, numberToEthers(20000));
    await usdcToken.transfer(lender2.address, numberToEthers(50000));
    await linkToken.transfer(lender3.address, numberToEthers(30000));

    /****************** Adding Assets ******************/
    await lendingPool._setAddress(ETH_ADDRESS, "ETH");
    await lendingPool._setAddress(DAI_ADDRESS, "DAI");
    await lendingPool._setAddress(USDC_ADDRESS, "USDC");
    await lendingPool._setAddress(LINK_ADDRESS, "LINK");

    /****************** Adding PriceFeed ******************/
    await lendingPool._setPriceFeedMap(DAI_ADDRESS, GOERLI_DAI_USD_PF_ADDRESS);
    await lendingPool._setPriceFeedMap(USDC_ADDRESS, USDC_USD_PF_ADDRESS);
    await lendingPool._setPriceFeedMap(LINK_ADDRESS, LINK_USD_PF_ADDRESS);
    await lendingPool._setPriceFeedMap(ETH_ADDRESS, ETH_USD_PF_ADDRESS);
  });

  it("1. Should be able to retrieve DAI symbol", async () => {
    const symbol = await lendingPool.getAddress(DAI_ADDRESS);
    expect(symbol).to.equal("DAI");
  });

  it("2. Should be able retrieve DAI-USD price feed", async () => {
    expect(await lendingPool.getPriceFeedMap(DAI_ADDRESS)).to.equal(
      GOERLI_DAI_USD_PF_ADDRESS
    );
  });

  //   it("3. OtherAddress can't add assets", async () => {
  //     await expect(
  //       lendingPool
  //         .connect(otherAddress)
  //         .addAsset(
  //           DAI_ADDRESS,
  //           true,
  //           false,
  //           false,
  //           true,
  //           DAI_SYMBOL,
  //           18,
  //           80,
  //           10
  //         )
  //     ).to.be.reverted;
  //   });

  // it("4. Anyone can add assets", async () => {
  //   await lendingPool
  //     .connect(deployerAddress)
  //     .addAsset(
  //       DAI_ADDRESS,
  //       true,
  //       false,
  //       false,
  //       true,
  //       DAI_SYMBOL,
  //       18,
  //       80,
  //       10
  //     );
  // });

  // it("5. DAI Token should be in assets", async () => {
  //   const result = await lendingPool.isTokenInAssets(DAI_ADDRESS);
  //   expect(result).to.be.equal(true);
  // });

  // it("6. USDC Token should not be in assets", async () => {
  //   const result = await lendingPool.isTokenInAssets(USDC_ADDRESS);
  //   expect(result).to.be.equal(false);
  // });

  // it("7. Should be able to return symbol by passing address", async () => {
  //   const asset = await lendingPool.getAssetByTokenAddress(DAI_ADDRESS);
  //   expect(asset.symbol).to.be.equal(DAI_SYMBOL);
  // });

  // it("8. Should be able to return address by passing symbol", async () => {
  //   const asset = await lendingPool.getAssetByTokenSymbol(DAI_SYMBOL);
  //   expect(asset.token).to.be.equal(DAI_ADDRESS.toString());
  // });

  // it("9. Is collateral Enabled", async () => {
  //   const result = await lendingPool.isCollateralEnable(DAI_ADDRESS);
  //   expect(result).to.be.equal(false);
  // });

  // it("10. Is Borrowing Enabled", async () => {
  //   const result = await lendingPool.isBorrowingEnable(DAI_ADDRESS);
  //   expect(result).to.be.equal(true);
  // });

  /******************** LEND FUNCTIONALIY ***************************/

  it("11. Should lend 10 ETH", async () => {
    const valueOption = { value: numberToEthers(10) };
    const amount = numberToEthers(10);
    const asset = ETH_ADDRESS;

    // 1. lending the ETH
    const beforeBalance = await lendingPool.getContractETHBalance();
    const tx = await lendingPool
      .connect(lender1)
      .lend(asset, amount, valueOption);
    await tx.wait();

    // 2. Checking contract ETH balance
    const afterBalance = await lendingPool.getContractETHBalance();
    expect(afterBalance).to.be.greaterThan(beforeBalance);
    console.log(afterBalance);

    // 3. checking Reserves
    let result = await lendingPool.reserves(asset);
    expect(result).to.be.equal(amount);

    // 4. checking token is in assets or not
    result = await lendingPool.isTokenInAssets(asset);
    expect(result).to.be.true;

    // 5. checking lender ETH balance
    result = await lendingPool.getLenderETHBalance(lender1.address);
    expect(result).to.be.equal(amount);

    // 6. checking lender Assets
    result = await lendingPool.getLenderAssets(lender1.address);
    expect(result[0].token).to.be.equal(asset);
  });

  it("12. Should be able to update lendQty with 10 more ETH", async () => {
    const valueOption = { value: numberToEthers(10) };
    const amount = numberToEthers(10);
    const asset = ETH_ADDRESS;

    // 1. lending the ETH
    const beforeBalance = await lendingPool.getContractETHBalance();
    const tx = await lendingPool
      .connect(lender1)
      .lend(asset, amount, valueOption);
    await tx.wait();

    // 2. Checking contract ETH balance
    const afterBalance = await lendingPool.getContractETHBalance();
    expect(afterBalance).to.be.greaterThan(beforeBalance);
    console.log(afterBalance);

    // 3. checking Reserves
    let result = await lendingPool.reserves(asset);
    expect(result).to.be.greaterThan(amount);

    // 4. checking token is in assets or not
    result = await lendingPool.isTokenInAssets(asset);
    expect(result).to.be.true;

    // 5. checking lender ETH balance
    result = await lendingPool.getLenderETHBalance(lender1.address);
    expect(result).to.be.greaterThan(amount);

    // 6. checking lender Assets
    result = await lendingPool.getLenderAssets(lender1.address);
    expect(result[0].token).to.be.equal(asset);
  });

  it("13. Should lend 1000 DAI", async () => {
    // await ethers.connect(lender1);

    const amount = numberToEthers(1000);
    const allowanceAmount = numberToEthers(1000);
    const asset = DAI_ADDRESS;

    await daiToken
      .connect(lender1)
      .approve(lendingPool.address, allowanceAmount);

    // 1. Lending
    const tx = await lendingPool.connect(lender1).lend(asset, amount);
    await tx.wait();

    // 2. Checking contract ETH balance
    const afterBalance = await lendingPool.getTokenBalance(
      lendingPool.address,
      DAI_ADDRESS
    );
    // expect(afterBalance).to.be.equal(beforeBalance);
    console.log("afterBalance : " + afterBalance);

    // 3. checking Reserves
    let result = await lendingPool.reserves(asset);
    expect(result).to.be.equal(amount);

    // 4. checking assets is in reserve array or not
    result = await lendingPool.isTokenInReserve(asset);
    expect(result).to.be.true;

    // 4. checking token is in assets or not
    result = await lendingPool.isTokenInAssets(asset);
    expect(result).to.be.true;

    // 5. checking lender Assets
    result = await lendingPool.getLenderAssets(lender1.address);
    expect(result[1].token).to.be.equal(asset);

    // 6. checking lender lentQty
    result = await lendingPool.getLenderAssets(lender1.address);
    expect(result[1].lentQty).to.be.equal(amount);
    console.log(result[0].lentQty);

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

    console.log("Amount witdrawn :" + amount);

    console.log("********** Before Withdraw **********");
    console.log("Token Amount withdrawn :" + amount);

    let beforeBalance = await lendingPool.getContractETHBalance();
    console.log("Contract ETH Balance : " + beforeBalance);

    const beforeLenderBalance = await lendingPool.getBalance(lender1.address);
    console.log("Lender ETH Balance : " + beforeLenderBalance);

    const beforeReserveBalance = await lendingPool.reserves(asset);
    console.log("Reserve Balance : " + beforeReserveBalance);

    const beforeLenderEthBalance = await lendingPool.getLenderETHBalance(
      lender1.address
    );
    console.log("LenderETHBalance : " + beforeLenderEthBalance);

    const tx = await lendingPool.connect(lender1).withdraw(asset, amount);
    await tx.wait();

    console.log("********** After Withdraw **********");
    console.log("Token Amount withdrawn :" + amount);

    const afterBalance = await lendingPool.getContractETHBalance();
    expect(afterBalance).to.be.lessThan(beforeBalance);
    console.log("Contract ETH Balance : " + afterBalance);

    const afterLenderBalance = await lendingPool.getBalance(lender1.address);
    expect(afterLenderBalance).to.be.greaterThan(beforeLenderBalance);
    console.log("Lender ETH Balance : " + afterLenderBalance);

    const afterReserveBalance = await lendingPool.reserves(asset);
    expect(afterReserveBalance).to.be.lessThan(beforeReserveBalance);
    console.log("Reserve Balance : " + afterReserveBalance);

    const afterLenderEthBalance = await lendingPool.getLenderETHBalance(
      lender1.address
    );
    expect(afterLenderEthBalance).to.be.lessThan(beforeLenderEthBalance);

    console.log("LenderETHBalance : " + afterLenderEthBalance);

    console.log("***************************");

    // 6. checking lender Assets
    result = await lendingPool.getLenderAssets(lender1.address);
    expect(result[0].token).to.be.equal(asset);
  });

  it("16. Lender Should be able to withdraw Token assets", async () => {
    const amount = numberToEthers(100);
    const asset = DAI_ADDRESS;

    console.log("********** Before Withdraw **********");
    console.log("Token Amount withdrawn :" + amount);
    let result = await lendingPool.getTokenBalance(
      lender1.address,
      DAI_ADDRESS
    );
    console.log("Lender Token Balance : " + result);

    result = await lendingPool.getTokenBalance(
      lendingPool.address,
      DAI_ADDRESS
    );
    console.log("Contract Token Balance : " + result);

    result = await lendingPool.reserves(asset);
    console.log("Reserve Balance : " + result);

    const tx = await lendingPool.connect(lender1).withdraw(asset, amount);
    await tx.wait();

    console.log("********** After Withdraw **********");
    result = await lendingPool.getTokenBalance(lender1.address, DAI_ADDRESS);
    console.log("Lender Token Balance : " + result);

    result = await lendingPool.getTokenBalance(
      lendingPool.address,
      DAI_ADDRESS
    );
    console.log("Contract Token Balance : " + result);
    result = await lendingPool.reserves(asset);
    console.log("Reserve Balance : " + result);
    console.log("***************************");

    result = await lendingPool.getLenderAssets(lender1.address);
    console.log(result);
  });

  // it("17. Your Assets : Get Lender Assets", async () => {
  //   const tx = await lendingPool.getLenderAssets(lender1.address);
  //   console.log(tx);
  // });

  // // "error": "Failed to decode output: Error: hex data is odd-length (argument="value", value="0x0", code=INVALID_ARGUMENT, version=bytes/5.5.0)"

  it("17. Should lend 2000 USDC", async () => {
    // await ethers.connect(lender1);

    const amount = numberToEthers(2000);
    const allowanceAmount = numberToEthers(3000);
    const asset = USDC_ADDRESS;

    console.log("********** BEFORE LEND **********");

    console.log("Token Amount lend :" + amount);
    let beforeLenderAmount = await lendingPool.getTokenBalance(
      lender2.address,
      asset
    );
    console.log("Lender Token Balance : " + beforeLenderAmount);

    const beforeContractAmount = await lendingPool.getTokenBalance(
      lendingPool.address,
      asset
    );
    console.log("Contract Token Balance : " + beforeContractAmount);

    const beforeReserveAmount = await lendingPool.reserves(asset);
    console.log("Reserve Balance : " + beforeReserveAmount);

    /********************** Lending **********************/
    await usdcToken.connect(lender2).approve(lendingPool.address, amount);
    const tx = await lendingPool.connect(lender2).lend(asset, amount);
    await tx.wait();

    console.log("********** AFTER LEND **********");

    console.log("Token Amount lend :" + amount);
    let afterLenderAmount = await lendingPool.getTokenBalance(
      lender2.address,
      asset
    );
    console.log("Lender Token Balance : " + afterLenderAmount);

    const afterContractAmount = await lendingPool.getTokenBalance(
      lendingPool.address,
      asset
    );
    console.log("Contract Token Balance : " + afterContractAmount);

    const afterReserveAmount = await lendingPool.reserves(asset);
    console.log("Reserve Balance : " + afterReserveAmount);

    expect(afterLenderAmount).to.be.lessThan(beforeLenderAmount);
    expect(afterContractAmount).to.be.greaterThan(beforeContractAmount);
    expect(afterReserveAmount).to.be.greaterThan(beforeReserveAmount);

    let result = await lendingPool.isTokenInReserve(asset);
    expect(result).to.be.true;

    // checking token is in assets or not
    result = await lendingPool.isTokenInAssets(asset);
    expect(result).to.be.true;

    // checking lender Assets
    result = await lendingPool.getLenderAssets(lender2.address);
    expect(result[0].token).to.be.equal(asset);

    // checking lender lentQty
    result = await lendingPool.getLenderAssets(lender2.address);
    expect(result[0].lentQty).to.be.equal(amount);
  });

  it("18. Should lend 3000 LINK", async () => {
    // await ethers.connect(lender1);

    const amount = numberToEthers(3000);
    const asset = LINK_ADDRESS;

    console.log("********** BEFORE LEND **********");

    console.log("Token Amount lend :" + amount);
    let beforeLenderAmount = await lendingPool.getTokenBalance(
      lender3.address,
      asset
    );
    console.log("Lender Token Balance : " + beforeLenderAmount);

    const beforeContractAmount = await lendingPool.getTokenBalance(
      lendingPool.address,
      asset
    );
    console.log("Contract Token Balance : " + beforeContractAmount);

    const beforeReserveAmount = await lendingPool.reserves(asset);
    console.log("Reserve Balance : " + beforeReserveAmount);

    /********************** Lending **********************/
    await linkToken.connect(lender3).approve(lendingPool.address, amount);
    const tx = await lendingPool.connect(lender3).lend(asset, amount);
    await tx.wait();

    console.log("********** AFTER LEND **********");

    console.log("Token Amount lend :" + amount);
    let afterLenderAmount = await lendingPool.getTokenBalance(
      lender3.address,
      asset
    );
    console.log("Lender Token Balance : " + afterLenderAmount);

    const afterContractAmount = await lendingPool.getTokenBalance(
      lendingPool.address,
      asset
    );
    console.log("Contract Token Balance : " + afterContractAmount);

    const afterReserveAmount = await lendingPool.reserves(asset);
    console.log("Reserve Balance : " + afterReserveAmount);

    expect(afterLenderAmount).to.be.lessThan(beforeLenderAmount);
    expect(afterContractAmount).to.be.greaterThan(beforeContractAmount);
    expect(afterReserveAmount).to.be.greaterThan(beforeReserveAmount);

    let result = await lendingPool.isTokenInReserve(asset);
    expect(result).to.be.true;

    // checking token is in assets or not
    result = await lendingPool.isTokenInAssets(asset);
    expect(result).to.be.true;

    // checking lender Assets
    result = await lendingPool.getLenderAssets(lender3.address);
    expect(result[0].token).to.be.equal(asset);

    // checking lender lentQty
    result = await lendingPool.getLenderAssets(lender3.address);
    expect(result[0].lentQty).to.be.equal(amount);
  });

  it("19. Get assets to borrow", async () => {
    // const result = await lendingPool.isBorrowingEnable(DAI_ADDRESS);
    // console.log(result);
    // const reserves = await lendingPool.getReserveArray();
    // console.log("***************** reserves assets ********************");
    // console.log(reserves);
    // const asset = await lendingPool.getAssets();
    // console.log("***************** Asset ********************");
    // console.log(asset);
    // const assets = await lendingPool.getAssetsToBorrow(lender1.address);
    // console.log("***************** AssetsToBorrow ********************");
    // console.log(assets);
    // const beforeReserveAmount = await lendingPool.reserves(LINK_ADDRESS);
    // console.log("Reserve Balance : " + beforeReserveAmount);
    // const lenderAssets = await lendingPool.getLenderAssets(lender1.address);
    // console.log(lenderAssets);
  });

  it("Should be able to borrow", async () => {
    const borrowDuration = 30;
    const borrowAmount = numberToEthers(10);
    const asset = DAI_ADDRESS;

    console.log("********** BEFORE BORROW **********");

    const assets = await lendingPool.getAssetsToBorrow(lender1.address);
    const assetQty = assets.find((el) => el.asset == asset);
    console.log("1. What is max qty available to Borrow : " + assetQty.qty);

    console.log("2. what is the qty to be borrowed : " + borrowAmount / 1e18);

    const beforeReserveAmount = await lendingPool.reserves(asset);
    console.log("3. What is the reserves: " + beforeReserveAmount / 1e18);

    let beforeLenderAssetAmount = await lendingPool.getLenderAssetBal(
      lender1.address,
      asset
    );
    console.log(
      "3. What is the lender lent balance : " + beforeLenderAssetAmount / 1e18
    );

    const beforeContractAmount = await lendingPool.getTokenBalance(
      lendingPool.address,
      asset
    );
    console.log(
      "4. What is Contract Token Balance : " + beforeContractAmount / 1e18
    );

    let beforeLenderAmount = await lendingPool.getTokenBalance(
      lender1.address,
      asset
    );
    console.log(
      "5. What is Lender Wallet Balance : " + beforeLenderAmount / 1e18
    );

    console.log("#####################################################");

    const borrowtransaction = await lendingPool
      .connect(lender1)
      .borrow(asset, borrowAmount, borrowDuration);

    console.log(borrowtransaction);

    // console.log("********** AFTER BORROW **********");

    // let afterLenderAmount = await lendingPool.getTokenBalance(
    //   lender1.address,
    //   asset
    // );
    // console.log("Lender Token Contract Balance : " + afterLenderAmount / 1e18);

    // let afterLenderAssetAmount = await lendingPool.getBorrowerAssetTotalBal(
    //   lender1.address,
    //   asset
    // );
    // console.log(
    //   "Lender Token Asset Balance : " + afterLenderAssetAmount / 1e18
    // );

    // const afterContractAmount = await lendingPool.getTokenBalance(
    //   lendingPool.address,
    //   asset
    // );
    // console.log("Contract Token Balance : " + afterContractAmount / 1e18);
    // const afterReserveAmount = await lendingPool.reserves(asset);
    // console.log("Reserve Balance : " + afterReserveAmount / 1e18);

    console.log("#####################################################");
    // console.log(borrowtransaction);
  });
});
