const { expect } = require("chai");
const { ethers } = require("hardhat");

// converting number into ETHERS
const numberToEthers = (number) => {
  return ethers.utils.parseEther(number.toString());
};

const SECONDS_IN_A_DAY = 86400;

async function moveTime(amount) {
  console.log("Moving time...");
  await network.provider.send("evm_increaseTime", [amount]);
  console.log(`Moved forward in time ${amount} seconds.`);
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
  const ETH_ADDRESS = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6";
  let DAI_ADDRESS = "0xdc31Ee1784292379Fbb2964b3B9C4124D8F89C60";
  let USDC_ADDRESS = "0x07865c6E87B9F70255377e024ace6630C1Eaa37F";
  let LINK_ADDRESS = "0x48731cF7e84dc94C5f84577882c14Be11a5B7456";

  // constant pricefeed address
  const ETH_USD_PF_ADDRESS = "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e";
  const DAI_USD_PF_ADDRESS = "0x0d79df66BE487753B02D015Fb622DED7f0E9798d";
  const USDC_USD_PF_ADDRESS = "0xAb5c49580294Aff77670F839ea425f5b78ab3Ae7";
  const LINK_USD_PF_ADDRESS = "0x48731cF7e84dc94C5f84577882c14Be11a5B7456";

  before(async () => {
    /******** Deploy Contracts *********/
    const AddressToTokenMap = await ethers.getContractFactory(
      "AddressToTokenMap"
    );
    addressToTokenMap = await AddressToTokenMap.deploy();
    await addressToTokenMap.deployed();

    const LendingConfig = await ethers.getContractFactory("LendingConfig");
    lendingConfig = await LendingConfig.deploy();
    await lendingConfig.deployed();

    const LendingPool = await ethers.getContractFactory("LendingPool");
    lendingPool = await LendingPool.deploy(
      addressToTokenMap.address,
      lendingConfig.address,
      INTEREST_RATE,
      BORROW_RATE
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
    await addressToTokenMap._setAddress(ETH_ADDRESS, "ETH");
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
    await addressToTokenMap._setPriceFeedMap(DAI_ADDRESS, DAI_USD_PF_ADDRESS);
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

  it("1. Should be able to retrieve all token symbol", async () => {
    let symbol = await addressToTokenMap.getAddress(ETH_ADDRESS);
    expect(symbol).to.equal(ETH_SYMBOL);

    symbol = await addressToTokenMap.getAddress(DAI_ADDRESS);
    expect(symbol).to.equal(DAI_SYMBOL);

    symbol = await addressToTokenMap.getAddress(USDC_ADDRESS);
    expect(symbol).to.equal(USDC_SYMBOL);

    symbol = await addressToTokenMap.getAddress(LINK_ADDRESS);
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

  it("3. Lender1 should be able to lend 100 ETH ", async () => {
    const lendAmount = numberToEthers(100);
    const valueOption = { value: lendAmount };
    const asset = ETH_ADDRESS;
    const user = lender1;

    console.log("************** BEFORE ETH LEND **************");
    console.log("1. Qty to be lend : " + lendAmount / 1e18);

    const beforeReserveAmount = await lendingPool.reserves(asset);
    console.log("2. Reserves: " + beforeReserveAmount / 1e18);

    let beforeLenderAssetAmount = await lendingPool.getLenderAssetQty(
      user.address,
      asset
    );
    console.log("3. Lender lent balance : " + beforeLenderAssetAmount / 1e18);

    const beforeContractAmount = await lendingPool.getContractETHBalance();
    console.log("4. Contract ETH Balance : " + beforeContractAmount / 1e18);
    console.log("=====================================================");

    const tx = await lendingPool
      .connect(user)
      .lend(asset, lendAmount, valueOption);
    await tx.wait();

    console.log("************** AFTER ETH LEND **************");
    console.log("1. Qty to be lend : " + lendAmount / 1e18);

    // await moveTime(30 * SECONDS_IN_A_DAY);
    const afterReserveAmount = await lendingPool.reserves(asset);
    console.log("2. Reserves: " + afterReserveAmount / 1e18);
    expect(afterReserveAmount).to.be.greaterThan(beforeReserveAmount);

    let afterLenderAssetAmount = await lendingPool.getLenderAssetQty(
      user.address,
      asset
    );
    console.log("3. Lender lent balance : " + afterLenderAssetAmount / 1e18);
    expect(afterLenderAssetAmount).to.be.greaterThan(beforeLenderAssetAmount);

    const afterContractAmount = await lendingPool.getContractETHBalance();
    console.log("4. Contract ETH Balance : " + afterContractAmount / 1e18);
    expect(afterContractAmount).to.be.greaterThan(beforeContractAmount);

    let result = await lendingConfig.isTokenInAssets(asset);
    expect(result).to.be.true;

    result = await lendingPool.getLenderAssetQty(user.address, asset);
    expect(result).to.be.equal(lendAmount);

    console.log("#####################################################");
  });

  // it("4. Lender1 should be able to lend more 100 ETH INTEREST CALCULATE", async () => {
  //   const lendAmount = numberToEthers(100);
  //   const valueOption = { value: lendAmount };
  //   const asset = ETH_ADDRESS;
  //   const user = lender1;

  //   console.log("************** BEFORE ETH LEND **************");
  //   console.log("1. Qty to be lend : " + lendAmount / 1e18);

  //   const beforeReserveAmount = await lendingPool.reserves(asset);
  //   console.log("2. Reserves: " + beforeReserveAmount / 1e18);

  //   let beforeLenderAssetAmount = await lendingPool.getLenderAssetQty(
  //     user.address,
  //     asset
  //   );
  //   console.log("3. Lender lent balance : " + beforeLenderAssetAmount / 1e18);

  //   const beforeContractAmount = await lendingPool.getContractETHBalance();
  //   console.log("4. Contract ETH Balance : " + beforeContractAmount / 1e18);
  //   console.log("=====================================================");

  //   const tx = await lendingPool
  //     .connect(user)
  //     .lend(asset, lendAmount, valueOption);
  //   await tx.wait();

  //   console.log("************** AFTER ETH LEND **************");
  //   console.log("1. Qty to be lend : " + lendAmount / 1e18);
  //   // await moveTime(30 * SECONDS_IN_A_DAY);
  //   const afterReserveAmount = await lendingPool.reserves(asset);
  //   console.log("2. Reserves: " + afterReserveAmount / 1e18);
  //   // expect(afterReserveAmount).to.be.greaterThan(beforeReserveAmount);

  //   let afterLenderAssetAmount = await lendingPool.getLenderAssetQty(
  //     user.address,
  //     asset
  //   );
  //   console.log("3. Lender lent balance : " + afterLenderAssetAmount / 1e18);
  //   // expect(afterLenderAssetAmount).to.be.greaterThan(beforeLenderAssetAmount);

  //   const afterContractAmount = await lendingPool.getContractETHBalance();
  //   console.log("4. Contract ETH Balance : " + afterContractAmount / 1e18);
  //   // expect(afterContractAmount).to.be.greaterThan(beforeContractAmount);

  //   let result = await lendingConfig.isTokenInAssets(asset);
  //   expect(result).to.be.true;

  //   result = await lendingPool.getLenderAssetQty(user.address, asset);
  //   // expect(result).to.be.equal(lendAmount);

  //   console.log("#####################################################");
  // });

  it("5. Lender1 Should be able to lend 10000 DAI", async () => {
    const amount = numberToEthers(10000);
    const asset = DAI_ADDRESS;
    const user = lender1;

    console.log("********** BEFORE TOKEN LEND **********");

    console.log("Token Amount lend :" + amount / 1e18);
    let beforeLenderAmount = await lendingPool.getTokenBalance(
      user.address,
      asset
    );
    console.log("Lender Token Balance : " + beforeLenderAmount / 1e18);

    const beforeContractAmount = await lendingPool.getTokenBalance(
      lendingPool.address,
      asset
    );
    console.log("Contract Token Balance : " + beforeContractAmount / 1e18);

    const beforeReserveAmount = await lendingPool.reserves(asset);
    console.log("Reserve Balance : " + beforeReserveAmount / 1e18);

    /********************** Lending **********************/
    await daiToken.connect(user).approve(lendingPool.address, amount);
    const tx = await lendingPool.connect(user).lend(asset, amount);
    await tx.wait();

    console.log("********** AFTER TOKEN LEND **********");

    // await moveTime(30 * SECONDS_IN_A_DAY);

    console.log("Token Amount lend :" + amount / 1e18);
    let afterLenderAmount = await lendingPool.getTokenBalance(
      user.address,
      asset
    );
    console.log("Lender Token Balance : " + afterLenderAmount / 1e18);

    const afterContractAmount = await lendingPool.getTokenBalance(
      lendingPool.address,
      asset
    );
    console.log("Contract Token Balance : " + afterContractAmount / 1e18);

    const afterReserveAmount = await lendingPool.reserves(asset);
    console.log("Reserve Balance : " + afterReserveAmount / 1e18);

    expect(afterLenderAmount).to.be.lessThan(beforeLenderAmount);
    expect(afterContractAmount).to.be.greaterThan(beforeContractAmount);
    expect(afterReserveAmount).to.be.greaterThan(beforeReserveAmount);

    let result = await lendingPool.isTokenInReserve(asset);
    expect(result).to.be.true;

    // checking token is in assets or not
    result = await lendingConfig.isTokenInAssets(asset);
    expect(result).to.be.true;

    // checking lender Assets
    result = await lendingPool.getLenderAssets(user.address);
    // console.log(result);
    expect(result[1].token).to.be.equal(asset);

    // checking lender lentQty
    result = await lendingPool.getLenderAssets(user.address);
    expect(result[1].lentQty).to.be.equal(amount);

    result = await lendingPool.getAmountInUSD(asset, amount);
    // console.log(result);
  });

  it("6. Lender1 should be able to withdraw 100 ETH ", async () => {
    const withdrawAmount = numberToEthers(100);
    const asset = ETH_ADDRESS;
    const user = lender1;

    let result2 = await lendingPool.getLenderAssets(user.address);
    console.log(result2);

    console.log("************** BEFORE ETH WITHDRAW **************");

    console.log("ETH_ADDRESS : " + asset);
    console.log("1. Qty to be withdraw : " + withdrawAmount / 1e18);

    const beforeReserveAmount = await lendingPool.reserves(asset);
    console.log("2. Reserves: " + beforeReserveAmount / 1e18);

    let beforeLenderAssetAmount = await lendingPool.getLenderAssetQty(
      user.address,
      asset
    );
    console.log("3. Lender lent balance : " + beforeLenderAssetAmount / 1e18);

    const beforeLenderBalance = await lendingPool.getBalance(lender1.address);
    console.log("4. Lender ETH Balance : " + beforeLenderBalance / 1e18);

    const beforeContractAmount = await lendingPool.getContractETHBalance();
    console.log("5. Contract ETH Balance : " + beforeContractAmount / 1e18);
    console.log("=====================================================");

    const tx = await lendingPool.connect(user).withdraw(asset, withdrawAmount);
    await tx.wait();

    console.log("************** AFTER ETH WITHDRAW **************");
    // await moveTime(30 * SECONDS_IN_A_DAY);
    const afterReserveAmount = await lendingPool.reserves(asset);
    console.log("2. Reserves: " + afterReserveAmount / 1e18);
    // expect(afterReserveAmount).to.be.greaterThan(beforeReserveAmount);

    let afterLenderAssetAmount = await lendingPool.getLenderAssetQty(
      user.address,
      asset
    );
    console.log("3. Lender lent balance : " + afterLenderAssetAmount / 1e18);
    // expect(afterLenderAssetAmount).to.be.greaterThan(beforeLenderAssetAmount);

    const afterLenderBalance = await lendingPool.getBalance(lender1.address);
    console.log("4. Lender ETH Balance : " + beforeLenderBalance / 1e18);

    const afterContractAmount = await lendingPool.getContractETHBalance();
    console.log("5. Contract ETH Balance : " + afterContractAmount / 1e18);
    // expect(afterContractAmount).to.be.greaterThan(beforeContractAmount);

    let result = await lendingConfig.isTokenInAssets(asset);
    expect(result).to.be.true;

    const _symbol = await addressToTokenMap.getAddress(asset);
    console.log(_symbol);

    // expect(result).to.be.equal(withdrawAmount);
    console.log("#####################################################");

    result = await lendingPool.getLenderAssets(user.address);
    console.log(result);
  });

  it("7. Lender1 Should be able to withdraw 1000 DAI", async () => {
    const amount = numberToEthers(1000);
    const asset = DAI_ADDRESS;
    const user = lender1;

    console.log("********** BEFORE TOKEN WITHDRAW **********");
    console.log("DAI_ADDRESS : " + asset);
    console.log("1. Token Amount withdraw :" + amount / 1e18);
    let beforeLenderAmount = await lendingPool.getTokenBalance(
      user.address,
      asset
    );
    console.log("2. Lender Token Balance : " + beforeLenderAmount / 1e18);

    const beforeContractAmount = await lendingPool.getTokenBalance(
      lendingPool.address,
      asset
    );
    console.log("3. Contract Token Balance : " + beforeContractAmount / 1e18);

    const beforeReserveAmount = await lendingPool.reserves(asset);
    console.log("4. Reserve Balance : " + beforeReserveAmount / 1e18);

    /********************** Lending **********************/
    const tx = await lendingPool.connect(user).withdraw(asset, amount);
    await tx.wait();

    console.log("********** AFTER TOKEN WITHDRAW **********");

    // await moveTime(30 * SECONDS_IN_A_DAY);

    let afterLenderAmount = await lendingPool.getTokenBalance(
      user.address,
      asset
    );
    console.log("1. Lender Token Balance : " + afterLenderAmount / 1e18);

    const afterContractAmount = await lendingPool.getTokenBalance(
      lendingPool.address,
      asset
    );
    console.log("2. Contract Token Balance : " + afterContractAmount / 1e18);

    const afterReserveAmount = await lendingPool.reserves(asset);
    console.log("3. Reserve Balance : " + afterReserveAmount / 1e18);

    // expect(afterLenderAmount).to.be.lessThan(beforeLenderAmount);
    // expect(afterContractAmount).to.be.greaterThan(beforeContractAmount);
    // expect(afterReserveAmount).to.be.greaterThan(beforeReserveAmount);

    let result = await lendingPool.isTokenInReserve(asset);
    expect(result).to.be.true;

    // checking token is in assets or not
    result = await lendingConfig.isTokenInAssets(asset);
    expect(result).to.be.true;

    // checking lender Assets
    result = await lendingPool.getLenderAssets(user.address);
    // expect(result[1].token).to.be.equal(asset);

    // checking lender lentQty
    result = await lendingPool.getLenderAssets(user.address);
    // expect(result[1].lentQty).to.be.equal(amount);
    console.log("#####################################################");
    result = await lendingPool.getLenderAssets(user.address);
  });

  it("8. Lender2 should lend 30 ETH", async () => {
    const lendAmount = numberToEthers(30);
    const valueOption = { value: lendAmount };
    const asset = ETH_ADDRESS;
    const user = lender2;

    console.log("************** BEFORE ETH LEND **************");
    console.log("1. Qty to be lend : " + lendAmount / 1e18);

    const beforeReserveAmount = await lendingPool.reserves(asset);
    console.log("2. Reserves: " + beforeReserveAmount / 1e18);

    let beforeLenderAssetAmount = await lendingPool.getLenderAssetQty(
      user.address,
      asset
    );
    console.log("3. Lender lent balance : " + beforeLenderAssetAmount / 1e18);

    const beforeContractAmount = await lendingPool.getContractETHBalance();
    console.log("4. Contract ETH Balance : " + beforeContractAmount / 1e18);
    console.log("=====================================================");

    const tx = await lendingPool
      .connect(user)
      .lend(asset, lendAmount, valueOption);
    await tx.wait();

    console.log("************** AFTER ETH LEND **************");
    // await moveTime(30 * SECONDS_IN_A_DAY);
    const afterReserveAmount = await lendingPool.reserves(asset);
    console.log("2. Reserves: " + afterReserveAmount / 1e18);
    expect(afterReserveAmount).to.be.greaterThan(beforeReserveAmount);

    let afterLenderAssetAmount = await lendingPool.getLenderAssetQty(
      user.address,
      asset
    );
    console.log("3. Lender lent balance : " + afterLenderAssetAmount / 1e18);
    expect(afterLenderAssetAmount).to.be.greaterThan(beforeLenderAssetAmount);

    const afterContractAmount = await lendingPool.getContractETHBalance();
    console.log("4. Contract ETH Balance : " + afterContractAmount / 1e18);
    expect(afterContractAmount).to.be.greaterThan(beforeContractAmount);

    let result = await lendingConfig.isTokenInAssets(asset);

    expect(result).to.be.true;

    result = await lendingPool.getLenderAssetQty(user.address, asset);
    expect(result).to.be.equal(lendAmount);

    console.log("#####################################################");

    result = await lendingPool.getLenderAssets(user.address);
  });

  it("9. Lender2 Should be able to lend 8000 USDC", async () => {
    const amount = numberToEthers(8000);
    const asset = USDC_ADDRESS;
    const user = lender2;

    console.log("********** BEFORE TOKEN LEND **********");

    console.log("Token Amount lend :" + amount / 1e18);
    let beforeLenderAmount = await lendingPool.getTokenBalance(
      user.address,
      asset
    );
    console.log("Lender Token Balance : " + beforeLenderAmount / 1e18);

    const beforeContractAmount = await lendingPool.getTokenBalance(
      lendingPool.address,
      asset
    );
    console.log("Contract Token Balance : " + beforeContractAmount / 1e18);

    const beforeReserveAmount = await lendingPool.reserves(asset);
    console.log("Reserve Balance : " + beforeReserveAmount / 1e18);

    /********************** Lending **********************/
    await usdcToken.connect(user).approve(lendingPool.address, amount);
    const tx = await lendingPool.connect(user).lend(asset, amount);
    await tx.wait();

    console.log("********** AFTER TOKEN LEND **********");

    // await moveTime(30 * SECONDS_IN_A_DAY);

    console.log("Token Amount lend :" + amount / 1e18);
    let afterLenderAmount = await lendingPool.getTokenBalance(
      user.address,
      asset
    );
    console.log("Lender Token Balance : " + afterLenderAmount / 1e18);

    const afterContractAmount = await lendingPool.getTokenBalance(
      lendingPool.address,
      asset
    );
    console.log("Contract Token Balance : " + afterContractAmount / 1e18);

    const afterReserveAmount = await lendingPool.reserves(asset);
    console.log("Reserve Balance : " + afterReserveAmount / 1e18);

    expect(afterLenderAmount).to.be.lessThan(beforeLenderAmount);
    expect(afterContractAmount).to.be.greaterThan(beforeContractAmount);
    expect(afterReserveAmount).to.be.greaterThan(beforeReserveAmount);

    let result = await lendingPool.isTokenInReserve(asset);
    expect(result).to.be.true;

    // checking token is in assets or not
    result = await lendingConfig.isTokenInAssets(asset);
    expect(result).to.be.true;

    // checking lender Assets
    result = await lendingPool.getLenderAssets(user.address);
    expect(result[1].token).to.be.equal(asset);

    // checking lender lentQty
    result = await lendingPool.getLenderAssets(user.address);
    expect(result[1].lentQty).to.be.equal(amount);
  });

  it("10. lender2 Should be able to borrow 2000 DAI", async () => {
    const borrowAmount = numberToEthers(2000);
    const asset = DAI_ADDRESS;
    const user = lender2;

    console.log("********** BEFORE BORROW **********");

    const assets = await lendingPool.getAssetsToBorrow(user.address);
    // console.log("assets : " + JSON.stringify(assets));
    const assetQty = assets.find((el) => el.token == asset);
    console.log("1. Max qty available to Borrow : " + assetQty.assetQty);
    console.log("2. Qty to be borrowed : " + borrowAmount / 1e18);

    const beforeReserveAmount = await lendingPool.reserves(asset);
    console.log("3. Reserves: " + beforeReserveAmount / 1e18);

    let beforeLenderAssetAmount = await lendingPool.getBorrowerAssetQty(
      user.address,
      asset
    );
    console.log(
      "3. Borrower borrow balance : " + beforeLenderAssetAmount / 1e18
    );

    const beforeContractAmount = await lendingPool.getTokenBalance(
      lendingPool.address,
      asset
    );
    console.log("4. Contract Token Balance : " + beforeContractAmount / 1e18);

    let beforeLenderAmount = await lendingPool.getTokenBalance(
      user.address,
      asset
    );
    console.log("5. Borrower Wallet Balance : " + beforeLenderAmount / 1e18);

    console.log("==============================================");

    await lendingPool.connect(user).borrow(asset, borrowAmount);

    // await moveTime(30 * SECONDS_IN_A_DAY);

    console.log("********** After BORROW **********");

    const afterReserveAmount = await lendingPool.reserves(asset);

    console.log("3. Reserves: " + afterReserveAmount / 1e18);

    let afterLenderAssetAmount = await lendingPool.getBorrowerAssetQty(
      user.address,
      asset
    );
    console.log(
      "3. Borrower borrow balance : " + afterLenderAssetAmount / 1e18
    );

    const afterContractAmount = await lendingPool.getTokenBalance(
      lendingPool.address,
      asset
    );
    console.log("4. Contract Token Balance : " + afterContractAmount / 1e18);

    let afterLenderAmount = await lendingPool.getTokenBalance(
      user.address,
      asset
    );
    console.log("5. Lender Wallet Balance : " + afterLenderAmount / 1e18);

    // console.log("******************* BORROWER ASSETS ******************");
    let borrowerAssets = await lendingPool.getBorrowerAssets(lender2.address);
    // console.log(borrowerAssets);

    console.log("#####################################################");
  });

  it("Total Reserve Token", async () => {
    let reserveAssets = await lendingPool.getReserveAssets();
    const array = [];
    for (let i = 0; i < reserveAssets.length; i++) {
      const token = reserveAssets[i];
      const symbol = await addressToTokenMap.getAddress(token);
<<<<<<< Updated upstream
      const amount = await lendingPool.getTotalSupplyOfToken(token);
=======
      const amount = (await lendingPool.getTotalSupplyOfToken(token)) / 1e18;
>>>>>>> Stashed changes
      array.push({
        token: token,
        symbol: symbol,
        amount: amount,
      });
    }
    console.log("************* Reserve Arrray");
    console.log(array);
  });

  it("Getting lender assets to borrow for lender2", async () => {
    const user = lender2;

    let result = await lendingPool.getLenderAssets(user.address);

    console.log("**********getLenderAssets*************");
    // console.log(result);

    console.log("**********getBorrowerAssets*************");
    result = await lendingPool.getBorrowerAssets(user.address);
    // console.log(result); // total => 2000 USD

    // supplies 30 ETH* 1725  = 51750 + 8000 USDC = 59750 => 80% = 47800 - 2000 DAI borrowed = 45800
    console.log("**********getAssetsToBorrow*************");
    const assets = await lendingPool.getAssetsToBorrow(user.address);
    console.log(assets); //  36320;

<<<<<<< Updated upstream
    result = await lendingPool._min(45800);
    console.log(result);
=======
>>>>>>> Stashed changes
    // user supply = 45800
  });

  // it("Getting lender assets to borrow for lender3", async () => {
  //   const user = lender3;

  //   let result = await lendingPool.getLenderAssets(user.address);

  //   console.log("**********getLenderAssets*************");
  //   console.log(result);

  //   console.log("**********getBorrowerAssets*************");
  //   result = await lendingPool.getBorrowerAssets(user.address);
  //   console.log(result); // total => 2000 USD

  //   // 30 * 1725  = 51750 + 4000 = 55750 => 80% = 44600 supplied - 2000
  //   console.log("**********getAssetsToBorrow*************");
  //   const assets = await lendingPool.getAssetsToBorrow(user.address);
  //   console.log(assets); //  36320;
  // });

  // it("11. lender2 Should be able to borrow more 100 DAI INTEREST Calculated", async () => {
  //   const borrowAmount = numberToEthers(100);
  //   const asset = DAI_ADDRESS;
  //   const user = lender2;

  //   console.log("********** BEFORE BORROW **********");

  //   const assets = await lendingPool.getAssetsToBorrow(user.address);
  //   // console.log("assets : " + JSON.stringify(assets));
  //   const assetQty = assets.find((el) => el.token == asset);
  //   console.log("1. Max qty available to Borrow : " + assetQty.borrowQty);
  //   console.log("2. Qty to be borrowed : " + borrowAmount / 1e18);

  //   const beforeReserveAmount = await lendingPool.reserves(asset);
  //   console.log("3. Reserves: " + beforeReserveAmount / 1e18);

  //   let beforeLenderAssetAmount = await lendingPool.getBorrowerAssetQty(
  //     user.address,
  //     asset
  //   );
  //   console.log(
  //     "3. Borrower borrow balance : " + beforeLenderAssetAmount / 1e18
  //   );

  //   const beforeContractAmount = await lendingPool.getTokenBalance(
  //     lendingPool.address,
  //     asset
  //   );
  //   console.log("4. Contract Token Balance : " + beforeContractAmount / 1e18);

  //   let beforeLenderAmount = await lendingPool.getTokenBalance(
  //     user.address,
  //     asset
  //   );
  //   console.log("5. Borrower Wallet Balance : " + beforeLenderAmount / 1e18);

  //   console.log("==============================================");

  //   await lendingPool.connect(user).borrow(asset, borrowAmount);

  //   // await moveTime(30 * SECONDS_IN_A_DAY);

  //   console.log("********** After BORROW **********");

  //   const afterReserveAmount = await lendingPool.reserves(asset);

  //   console.log("3. Reserves: " + afterReserveAmount / 1e18);

  //   let afterLenderAssetAmount = await lendingPool.getBorrowerAssetQty(
  //     user.address,
  //     asset
  //   );
  //   console.log(
  //     "3. Borrower borrow balance : " + afterLenderAssetAmount / 1e18
  //   );

  //   const afterContractAmount = await lendingPool.getTokenBalance(
  //     lendingPool.address,
  //     asset
  //   );
  //   console.log("4. Contract Token Balance : " + afterContractAmount / 1e18);

  //   let afterLenderAmount = await lendingPool.getTokenBalance(
  //     user.address,
  //     asset
  //   );
  //   console.log("5. Lender Wallet Balance : " + afterLenderAmount / 1e18);

  //   // console.log("******************* BORROWER ASSETS ******************");
  //   let borrowerAssets = await lendingPool.getBorrowerAssets(lender2.address);
  //   // console.log(borrowerAssets);

  //   console.log("#####################################################");
  // });

  // it("12. Lender2 Should be able to repay 10 DAI", async () => {
  //   const repayAmount = numberToEthers(10);
  //   const asset = DAI_ADDRESS;

  //   console.log("********** BEFORE REPAY **********");

  //   console.log("1. Qty to be repay : " + repayAmount / 1e18);

  //   const beforeReserveAmount = await lendingPool.reserves(asset);
  //   console.log("2. Reserves amount : " + beforeReserveAmount / 1e18);

  //   let beforeBorrowerAssetAmount = await lendingPool.getBorrowerAssetQty(
  //     lender2.address,
  //     asset
  //   );
  //   console.log(
  //     "4. Borrower 2 borrowed Qty : " + beforeBorrowerAssetAmount / 1e18
  //   );

  //   const beforeContractAmount = await lendingPool.getTokenBalance(
  //     lendingPool.address,
  //     asset
  //   );
  //   console.log("5. Contract Token Balance : " + beforeContractAmount / 1e18);

  //   let beforeBorrowerAmount = await lendingPool.getTokenBalance(
  //     lender2.address,
  //     asset
  //   );
  //   console.log(
  //     "6. Borrower 2 Wallet Balance : " + beforeBorrowerAmount / 1e18
  //   );

  //   console.log("+++++++++++++++++++++++++++++++++++++++++++++++++");

  //   // await moveTime(30 * SECONDS_IN_A_DAY);

  //   await daiToken.connect(lender2).approve(lendingPool.address, repayAmount);
  //   await lendingPool.connect(lender2).repay(asset, repayAmount);

  //   console.log("********** AFTER REPAY **********");

  //   const afterReserveAmount = await lendingPool.reserves(asset);
  //   expect(afterReserveAmount).to.be.greaterThan(beforeReserveAmount);
  //   console.log("2. Reserves amount : " + afterReserveAmount / 1e18);

  //   let afterBorrowerAssetAmount = await lendingPool.getBorrowerAssetQty(
  //     lender2.address,
  //     asset
  //   );
  //   // expect(afterBorrowerAssetAmount).to.be.lessThan(beforeBorrowerAssetAmount);
  //   console.log(
  //     "4. Borrower 2 borrowed Qty : " + afterBorrowerAssetAmount / 1e18
  //   );

  //   const afterContractAmount = await lendingPool.getTokenBalance(
  //     lendingPool.address,
  //     asset
  //   );
  //   // expect(afterContractAmount).to.be.greaterThan(beforeContractAmount);
  //   console.log("5. Contract Token Balance : " + afterContractAmount / 1e18);

  //   let afterBorrowerAmount = await lendingPool.getTokenBalance(
  //     lender2.address,
  //     asset
  //   );
  //   // expect(afterBorrowerAmount).to.be.lessThan(beforeBorrowerAmount);
  //   console.log("6. Borrower 2 Wallet Balance : " + afterBorrowerAmount / 1e18);
  //   console.log("#####################################################");
  // });
});
