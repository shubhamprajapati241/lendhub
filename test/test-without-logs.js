const { expect } = require("chai");
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
  let lendingHelper;
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
  let DAI_ADDRESS = DAITokenAddress;
  let USDC_ADDRESS = USDCTokenAddress;
  let LINK_ADDRESS = LINKTokenAddress;

  // // constant pricefeed address
  // const ETH_USD_PF_ADDRESS = "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e";
  // const DAI_USD_PF_ADDRESS = "0x0d79df66BE487753B02D015Fb622DED7f0E9798d";
  // const USDC_USD_PF_ADDRESS = "0xAb5c49580294Aff77670F839ea425f5b78ab3Ae7";
  // const LINK_USD_PF_ADDRESS = "0x48731cF7e84dc94C5f84577882c14Be11a5B7456";

  before(async () => {
    /******** Deploy Contracts *********/
    const AddressToTokenMap = await ethers.getContractFactory(
      "AddressToTokenMap"
    );
    addressToTokenMap = await AddressToTokenMap.deploy();
    await addressToTokenMap.deployed();

    const LendingConfig = await ethers.getContractFactory("LendingConfig");
    lendingConfig = await LendingConfig.deploy(INTEREST_RATE, BORROW_RATE);
    await lendingConfig.deployed();

    const LendingHelper = await ethers.getContractFactory("LendingHelper");
    lendingHelper = await LendingHelper.deploy(
      addressToTokenMap.address,
      lendingConfig.address
    );
    await lendingHelper.deployed();

    const LendingPool = await ethers.getContractFactory("LendingPool");
    lendingPool = await LendingPool.deploy(
      addressToTokenMap.address,
      lendingConfig.address,
      lendingHelper.address
    );
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
    await addressToTokenMap
      .connect(deployerAddress)
      ._setAddress(ETH_ADDRESS, "ETH");
    await addressToTokenMap
      .connect(deployerAddress)
      ._setAddress(DAI_ADDRESS, "DAI");
    await addressToTokenMap
      .connect(deployerAddress)
      ._setAddress(USDC_ADDRESS, "USDC");
    await addressToTokenMap
      .connect(deployerAddress)
      ._setAddress(LINK_ADDRESS, "LINK");

    /****************** Adding PriceFeed ******************/
    await addressToTokenMap
      .connect(deployerAddress)
      ._setPriceFeedMap(DAI_ADDRESS, DAI_USD_PF_ADDRESS);
    await addressToTokenMap
      .connect(deployerAddress)
      ._setPriceFeedMap(USDC_ADDRESS, USDC_USD_PF_ADDRESS);
    await addressToTokenMap
      .connect(deployerAddress)
      ._setPriceFeedMap(LINK_ADDRESS, LINK_USD_PF_ADDRESS);
    await addressToTokenMap
      .connect(deployerAddress)
      ._setPriceFeedMap(ETH_ADDRESS, ETH_USD_PF_ADDRESS);
  });

  it("1. Should be able to retrieve all token symbols", async () => {
    let symbol = await addressToTokenMap.getSymbol(ETH_ADDRESS);
    expect(symbol).to.equal(ETH_SYMBOL);

    symbol = await addressToTokenMap.getSymbol(DAI_ADDRESS);
    expect(symbol).to.equal(DAI_SYMBOL);

    symbol = await addressToTokenMap.getSymbol(USDC_ADDRESS);
    expect(symbol).to.equal(USDC_SYMBOL);

    symbol = await addressToTokenMap.getSymbol(LINK_ADDRESS);
    expect(symbol).to.equal(LINK_SYMBOL);
  });

  it("2. Should be able retrieve all price feed", async () => {
    let feedAddress = await addressToTokenMap.getPriceFeedMap(ETH_ADDRESS);
    expect(feedAddress).to.be.equal(ETH_USD_PF_ADDRESS);

    feedAddress = await addressToTokenMap.getPriceFeedMap(DAI_ADDRESS);
    expect(feedAddress).to.be.equal(DAI_USD_PF_ADDRESS);

    feedAddress = await addressToTokenMap.getPriceFeedMap(USDC_ADDRESS);
    expect(feedAddress).to.be.equal(USDC_USD_PF_ADDRESS);

    feedAddress = await addressToTokenMap.getPriceFeedMap(LINK_ADDRESS);
    expect(feedAddress).to.be.equal(LINK_USD_PF_ADDRESS);
  });

  it("3. Lender Should be able to add assets", async () => {
    await lendingConfig
      .connect(lender1)
      .addAsset(DAI_ADDRESS, true, false, false, true, DAI_SYMBOL, 18, 80, 10);
  });

  it("4. DAI Token should be in assets", async () => {
    const result = await lendingConfig.isTokenInAssets(DAI_ADDRESS);
    expect(result).to.be.equal(true);
  });

  it("5. USDC Token should not be in assets", async () => {
    const result = await lendingConfig.isTokenInAssets(USDC_ADDRESS);
    expect(result).to.be.equal(false);
  });

  it("6. Should be able to return symbol by passing address", async () => {
    const asset = await lendingConfig.getAssetByTokenAddress(DAI_ADDRESS);
    expect(asset.symbol).to.be.equal(DAI_SYMBOL);
  });

  it("7. Should be able to return address by passing symbol", async () => {
    const asset = await lendingConfig.getAssetByTokenSymbol(DAI_SYMBOL);
    expect(asset.token).to.be.equal(DAI_ADDRESS.toString());
  });

  it("8. Is Borrowing Enabled", async () => {
    const result = await lendingConfig.isBorrowingEnabled(DAI_ADDRESS);
    expect(result).to.be.equal(true);
  });

  it("9. Lender should not be able to make assets inactive", async () => {
    await expect(
      lendingConfig.connect(lender1).makeAssetActiveInactive(DAI_ADDRESS, 1)
    ).to.be.reverted;
  });

  it("10. Only Deployer should be able to make assets inactive", async () => {
    await lendingConfig
      .connect(deployerAddress)
      .makeAssetActiveInactive(DAI_ADDRESS, 1);
  });

  it("11. Lender should not be able to freeze assets", async () => {
    await expect(
      lendingConfig.connect(lender1).freezeUnFreezeAsset(DAI_ADDRESS, 0)
    ).to.be.reverted;
  });

  it("12. Only Deployer should be able to freeze assets", async () => {
    await lendingConfig
      .connect(deployerAddress)
      .freezeUnFreezeAsset(DAI_ADDRESS, 0);
  });

  it("13. Lender1 Should be able to lend 10 ETH", async () => {
    const valueOption = { value: numberToEthers(10) };
    const amount = numberToEthers(10);
    const asset = ETH_ADDRESS;

    // Check the Contract Before ETH Balance
    const beforeContractETHBalance = await ethers.provider.getBalance(
      lendingPool.address
    );

    // Check the Lender1 Before ETH Balance
    const beforeLenderETHBalance = await ethers.provider.getBalance(
      lender1.address
    );

    // Lend ETH
    const tx = await lendingPool
      .connect(lender1)
      .lend(asset, amount, valueOption);
    await tx.wait();

    // Check the Contract After ETH Balance
    const afterContractETHBalance = await ethers.provider.getBalance(
      lendingPool.address
    );
    expect(afterContractETHBalance).to.equal(amount);
    expect(afterContractETHBalance).to.be.greaterThan(beforeContractETHBalance);

    // Check the Lender After ETH Balance
    const afterLenderETHBalance = await ethers.provider.getBalance(
      lender1.address
    );
    expect(afterLenderETHBalance).to.be.lessThan(beforeLenderETHBalance);

    // Check Reserves Qty
    let result = await lendingPool.reserves(asset);
    expect(result).to.be.equal(amount);

    // Check token is in assets or not
    result = await lendingConfig.isTokenInAssets(asset);
    expect(result).to.be.true;

    // Check lender ETH balance
    result = await lendingPool.getLenderAssetQty(lender1.address, asset);
    expect(result).to.be.equal(amount);
  });

  it("14. Lender1 lendQty Should be able to update with 10 more ETH", async () => {
    const valueOption = { value: numberToEthers(10) };
    const amount = numberToEthers(10);
    const asset = ETH_ADDRESS;

    // Check the Contract Before ETH Balance
    const beforeContractETHBalance = await ethers.provider.getBalance(
      lendingPool.address
    );

    // Check the Lender1 Before ETH Balance
    const beforeLenderETHBalance = await ethers.provider.getBalance(
      lender1.address
    );

    // Lend ETH
    const tx = await lendingPool
      .connect(lender1)
      .lend(asset, amount, valueOption);
    await tx.wait();

    // Check the Contract After ETH Balance
    const afterContractETHBalance = await ethers.provider.getBalance(
      lendingPool.address
    );
    expect(afterContractETHBalance).to.greaterThan(amount);
    expect(afterContractETHBalance).to.be.greaterThan(beforeContractETHBalance);

    // Check the Lender After ETH Balance
    const afterLenderETHBalance = await ethers.provider.getBalance(
      lender1.address
    );
    expect(afterLenderETHBalance).to.be.lessThan(beforeLenderETHBalance);

    // Check Reserves Qty
    let result = await lendingPool.reserves(asset);
    expect(result).to.be.greaterThan(amount);

    // Check token is in assets or not
    result = await lendingConfig.isTokenInAssets(asset);
    expect(result).to.be.true;

    // Check lender ETH balance
    result = await lendingPool.getLenderAssetQty(lender1.address, asset);
    expect(result).to.be.greaterThan(amount);
  });

  it("15. Lender1 Should be able to lend 1000 DAI", async () => {
    const amount = numberToEthers(2500);
    const asset = DAI_ADDRESS;

    // Get before Contract DAI balance
    const beforeContractBalance = await lendingHelper.getTokenBalance(
      lendingPool.address,
      DAI_ADDRESS
    );

    // Get Before Lender DAI balance
    const beforeLenderBalance = await lendingHelper.getTokenBalance(
      lender1.address,
      DAI_ADDRESS
    );

    // Approve and lend
    await daiToken.connect(lender1).approve(lendingPool.address, amount);
    const tx = await lendingPool.connect(lender1).lend(asset, amount);
    await tx.wait();

    // Get After Contract DAI balance
    const afterContractBalance = await lendingHelper.getTokenBalance(
      lendingPool.address,
      DAI_ADDRESS
    );
    expect(afterContractBalance).to.be.greaterThan(beforeContractBalance);

    // Get After Lender DAI balance
    const afterLenderBalance = await lendingHelper.getTokenBalance(
      lender1.address,
      DAI_ADDRESS
    );
    expect(afterLenderBalance).to.be.lessThan(beforeLenderBalance);

    // checking Reserves
    let result = await lendingPool.reserves(asset);
    expect(result).to.be.equal(amount);

    // checking assets is in reserve array or not
    result = await lendingPool.isTokenInReserve(asset);
    expect(result).to.be.true;

    // checking token is in assets or not
    result = await lendingConfig.isTokenInAssets(asset);
    expect(result).to.be.true;

    // hecking lender Assets
    result = await lendingPool.getLenderAssets(lender1.address);
    expect(result[1].token).to.be.equal(asset);

    // 6. checking lender lentQty
    result = await lendingPool.getLenderAssets(lender1.address);
    expect(result[1].lentQty).to.be.equal(amount);
  });

  it("16. Not lend user should not be able to withdraw ETH", async () => {
    const amount = numberToEthers(5);
    const asset = ETH_ADDRESS;
    await expect(lendingPool.connect(lender2).withdraw(asset, amount)).to.be
      .reverted;
  });

  it("17. Not lend user should not be able to withdraw DAI", async () => {
    const amount = numberToEthers(5);
    const asset = DAI_ADDRESS;
    await expect(lendingPool.connect(lender2).withdraw(asset, amount)).to.be
      .reverted;
  });

  it("18. Lender1 Should be able to withdraw ETH assets", async () => {
    const amount = numberToEthers(10);
    const asset = ETH_ADDRESS;

    let beforeContractETHBalance = await ethers.provider.getBalance(
      lendingPool.address
    );

    let beforeLenderETHWalletBalance = await ethers.provider.getBalance(
      lender1.address
    );

    const beforeReserveBalance = await lendingPool.reserves(asset);

    const beforeLenderEthBalance = await lendingPool.getLenderAssetQty(
      lender1.address,
      asset
    );

    const tx = await lendingPool.connect(lender1).withdraw(asset, amount);
    await tx.wait();

    const afterContractETHBalance = await ethers.provider.getBalance(
      lendingPool.address
    );
    expect(afterContractETHBalance).to.be.lessThan(beforeContractETHBalance);

    const afterLenderETHBalance = await lendingPool.getLenderAssetQty(
      lender1.address,
      asset
    );
    expect(afterLenderETHBalance).to.be.lessThan(beforeLenderEthBalance);

    const afterLenderETHWalletBalance = await ethers.provider.getBalance(
      lender1.address
    );
    expect(afterLenderETHWalletBalance).to.be.greaterThan(
      beforeLenderETHWalletBalance
    );

    const afterReserveBalance = await lendingPool.reserves(asset);
    expect(afterReserveBalance).to.be.lessThan(beforeReserveBalance);
  });

  it("19. Lender1 Should be able to withdraw DAI", async () => {
    const amount = numberToEthers(100);
    const asset = DAI_ADDRESS;

    const beforeDAIBalanceInLenderWallet = await lendingHelper.getTokenBalance(
      lender1.address,
      DAI_ADDRESS
    );

    const beforeDAIBalanceInContract = await lendingHelper.getTokenBalance(
      lendingPool.address,
      DAI_ADDRESS
    );

    const beforeDAIBalanceInReserve = await lendingPool.reserves(asset);

    const tx = await lendingPool.connect(lender1).withdraw(asset, amount);
    await tx.wait();

    const afterDAIBalanceInLenderWallet = await lendingHelper.getTokenBalance(
      lender1.address,
      DAI_ADDRESS
    );
    expect(afterDAIBalanceInLenderWallet).to.be.greaterThan(
      beforeDAIBalanceInLenderWallet
    );

    const afterDAIBalanceInContract = await lendingHelper.getTokenBalance(
      lendingPool.address,
      DAI_ADDRESS
    );
    expect(afterDAIBalanceInContract).to.be.lessThan(
      beforeDAIBalanceInContract
    );

    const afterDAIBalanceInReserve = await lendingPool.reserves(asset);
    expect(afterDAIBalanceInReserve).to.be.lessThan(beforeDAIBalanceInReserve);
  });

  it("20. Lender2 Should be able to lend 5 ETH", async () => {
    const amount = numberToEthers(5);
    const valueOption = { value: amount };
    const asset = ETH_ADDRESS;

    // Check the Contract Before ETH Balance
    const beforeContractETHBalance = await ethers.provider.getBalance(
      lendingPool.address
    );

    // Check the Lender2 Before ETH Balance
    const beforeLenderETHBalance = await ethers.provider.getBalance(
      lender2.address
    );

    // Lend ETH
    const tx = await lendingPool
      .connect(lender2)
      .lend(asset, amount, valueOption);
    await tx.wait();

    // Check the Contract After ETH Balance
    const afterContractETHBalance = await ethers.provider.getBalance(
      lendingPool.address
    );
    expect(afterContractETHBalance).to.greaterThan(amount);
    expect(afterContractETHBalance).to.be.greaterThan(beforeContractETHBalance);

    // Check the Lender After ETH Balance
    const afterLenderETHBalance = await ethers.provider.getBalance(
      lender2.address
    );
    expect(afterLenderETHBalance).to.be.lessThan(beforeLenderETHBalance);

    // Check Reserves Qty
    let result = await lendingPool.reserves(asset);
    expect(result).to.be.greaterThan(amount);

    // Check token is in assets or not
    result = await lendingConfig.isTokenInAssets(asset);
    expect(result).to.be.true;

    // Check lender ETH balance in lending pool
    result = await lendingPool.getLenderAssetQty(lender2.address, asset);
    expect(result).to.be.equal(amount);
  });

  it("21. Borrower2 Should be able to borrow 100 DAI", async () => {
    const borrowAmount = numberToEthers(100);
    const asset = DAI_ADDRESS;
    const user = borrower2;

    const assetsToborrow = await lendingPool.getAssetsToBorrow(user.address);
    const assetQty = assetsToborrow.find((el) => el.token == asset);

    const beforeReserveAmount = await lendingPool.reserves(asset);

    let beforeLenderAssetAmount = await lendingPool.getBorrowerAssetQty(
      user.address,
      asset
    );

    const beforeContractAmount = await lendingHelper.getTokenBalance(
      lendingPool.address,
      asset
    );

    let beforeLenderAmount = await lendingHelper.getTokenBalance(
      user.address,
      asset
    );

    await lendingPool.connect(user).borrow(asset, borrowAmount);

    const afterReserveAmount = await lendingPool.reserves(asset);
    expect(afterReserveAmount).to.be.lessThan(beforeReserveAmount);

    let afterLenderAssetAmount = await lendingPool.getBorrowerAssetQty(
      user.address,
      asset
    );
    expect(afterLenderAssetAmount).to.be.greaterThan(beforeLenderAssetAmount);

    const afterContractAmount = await lendingHelper.getTokenBalance(
      lendingPool.address,
      asset
    );
    expect(afterContractAmount).to.be.lessThan(beforeContractAmount);

    const afterLenderAmount = await lendingHelper.getTokenBalance(
      user.address,
      asset
    );
    expect(afterLenderAmount).to.be.greaterThan(beforeLenderAmount);
  });

  it("22. Borrower2 Should not be able to borrow more than 80% of his supplied", async () => {
    const asset = DAI_ADDRESS;
    const assets = await lendingPool.getAssetsToBorrow(borrower2.address);
    const assetQty = assets.find((el) => el.token == asset);

    borrowAmount = numberToEthers(assetQty.borrowQty);
    //Increase the borrow amount to simulate excess borrow
    borrowAmount += 100;
    await expect(lendingPool.connect(borrower2).borrow(asset, borrowAmount)).to
      .be.reverted;
  });

  it("23. Borrower2 Should not be able to borrow more than reserve qty", async () => {
    const asset = DAI_ADDRESS;
    const reserveAmount = await lendingPool.reserves(asset);
    borrowAmount = numberToEthers(reserveAmount);
    //Increase the borrow amount to simulate excess borrow
    borrowAmount += 100;

    await expect(lendingPool.connect(borrower2).borrow(asset, borrowAmount)).to
      .be.reverted;
  });

  it("24. Borrower2 Should be able to borrow 100 DAI again", async () => {
    const borrowAmount = numberToEthers(100);
    const asset = DAI_ADDRESS;
    const user = borrower2;

    const assetsToborrow = await lendingPool.getAssetsToBorrow(user.address);
    const assetQty = assetsToborrow.find((el) => el.token == asset);

    const beforeReserveAmount = await lendingPool.reserves(asset);

    let beforeLenderAssetAmount = await lendingPool.getBorrowerAssetQty(
      user.address,
      asset
    );

    const beforeContractAmount = await lendingHelper.getTokenBalance(
      lendingPool.address,
      asset
    );

    let beforeLenderAmount = await lendingHelper.getTokenBalance(
      user.address,
      asset
    );

    await lendingPool.connect(user).borrow(asset, borrowAmount);

    const afterReserveAmount = await lendingPool.reserves(asset);
    expect(afterReserveAmount).to.be.lessThan(beforeReserveAmount);

    let afterLenderAssetAmount = await lendingPool.getBorrowerAssetQty(
      user.address,
      asset
    );
    expect(afterLenderAssetAmount).to.be.greaterThan(beforeLenderAssetAmount);

    const afterContractAmount = await lendingHelper.getTokenBalance(
      lendingPool.address,
      asset
    );
    expect(afterContractAmount).to.be.lessThan(beforeContractAmount);

    const afterLenderAmount = await lendingHelper.getTokenBalance(
      user.address,
      asset
    );
    expect(afterLenderAmount).to.be.greaterThan(beforeLenderAmount);
  });

  it("25. Borrower2 Should be able to repay", async () => {
    const repayAmount = numberToEthers(100);
    const asset = DAI_ADDRESS;

    const beforeReserveAmount = await lendingPool.reserves(asset);

    const beforeBorrowerAssetAmount = await lendingPool.getBorrowerAssetQty(
      lender2.address,
      asset
    );

    const beforeContractAmount = await lendingHelper.getTokenBalance(
      lendingPool.address,
      asset
    );

    const beforeBorrowerAmount = await lendingHelper.getTokenBalance(
      lender2.address,
      asset
    );

    await daiToken.connect(lender2).approve(lendingPool.address, repayAmount);
    await lendingPool.connect(lender2).repay(asset, repayAmount);

    const afterReserveAmount = await lendingPool.reserves(asset);
    expect(afterReserveAmount).to.be.greaterThan(beforeReserveAmount);

    const afterBorrowerAssetAmount = await lendingPool.getBorrowerAssetQty(
      lender2.address,
      asset
    );
    expect(afterBorrowerAssetAmount).to.be.lessThan(beforeBorrowerAssetAmount);

    const afterContractAmount = await lendingHelper.getTokenBalance(
      lendingPool.address,
      asset
    );
    expect(afterContractAmount).to.be.greaterThan(beforeContractAmount);

    const afterBorrowerAmount = await lendingHelper.getTokenBalance(
      lender2.address,
      asset
    );
    expect(afterBorrowerAmount).to.be.lessThan(beforeBorrowerAmount);
  });
});
