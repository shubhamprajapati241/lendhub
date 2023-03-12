const { expect } = require("chai");
const { ethers } = require("hardhat");
const helpers = require("@nomicfoundation/hardhat-network-helpers");

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
  const GOERLI_ETH_ADDRESS = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6";
  let GOERLI_DAI_ADDRESS = "0xdc31Ee1784292379Fbb2964b3B9C4124D8F89C60";
  let GOERLI_USDC_ADDRESS = "0x07865c6E87B9F70255377e024ace6630C1Eaa37F";
  let GOERLI_LINK_ADDRESS = "0x48731cF7e84dc94C5f84577882c14Be11a5B7456";

  // constant pricefeed address
  const GEORLI_ETH_USD_PF_ADDRESS =
    "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e";
  const GOERLI_DAI_USD_PF_ADDRESS =
    "0x0d79df66BE487753B02D015Fb622DED7f0E9798d";
  const GOERLI_USDC_USD_PF_ADDRESS =
    "0xAb5c49580294Aff77670F839ea425f5b78ab3Ae7";
  const GOERLI_LINK_USD_PF_ADDRESS =
    "0x48731cF7e84dc94C5f84577882c14Be11a5B7456";

  before(async () => {
    /******** Deploy LendingPool *********/
    const LendingPool = await ethers.getContractFactory("LendingPool");
    lendingPool = await LendingPool.deploy(INTEREST_RATE, BORROW_RATE);
    await lendingPool.deployed();

    /******** Setting Signer Addresses ********/
    const accounts = await ethers.getSigners();
    deployerAddress = accounts[0];
    lender1 = accounts[1];
    lender2 = accounts[2];
    borrower1 = accounts[3];
    borrower2 = accounts[2];
    borrower3 = accounts[4];

    // Depoying DAI Token
    const DAIToken = await ethers.getContractFactory("DAIToken");
    daiToken = await DAIToken.deploy();
    await daiToken.deployed();
    GOERLI_DAI_ADDRESS = daiToken.address;
    console.log("GOERLI_DAI_ADDRESS : " + GOERLI_DAI_ADDRESS);

    // Depoying USDC Token
    const USDCToken = await ethers.getContractFactory("USDCToken");
    usdcToken = await USDCToken.deploy();
    await usdcToken.deployed();
    GOERLI_USDC_ADDRESS = usdcToken.address;
    console.log("GOERLI_USDC_ADDRESS : " + GOERLI_USDC_ADDRESS);

    // Depoying LINK Token
    const LinkToken = await ethers.getContractFactory("LinkToken");
    linkToken = await LinkToken.deploy();
    await linkToken.deployed();
    GOERLI_LINK_ADDRESS = linkToken.address;
    console.log("GOERLI_LINK_ADDRESS : " + GOERLI_LINK_ADDRESS);

    await daiToken.transfer(lender1.address, 2000);
    await usdcToken.transfer(lender2.address, 5000);
    await linkToken.transfer(borrower1.address, 3000);

    /******************* Adding Assets ******************/
    await lendingPool._setAddress(GOERLI_ETH_ADDRESS, "ETH");
    await lendingPool._setAddress(GOERLI_DAI_ADDRESS, "DAI");
    await lendingPool._setAddress(GOERLI_USDC_ADDRESS, "USDC");

    await lendingPool._setPriceFeedMap(
      GOERLI_DAI_ADDRESS,
      GOERLI_DAI_USD_PF_ADDRESS
    );
    await lendingPool._setPriceFeedMap(
      GOERLI_USDC_ADDRESS,
      GOERLI_USDC_USD_PF_ADDRESS
    );

    await lendingPool._setPriceFeedMap(
      GOERLI_ETH_ADDRESS,
      GEORLI_ETH_USD_PF_ADDRESS
    );
  });

  it("1. Should be able to retrieve DAI symbol", async () => {
    const symbol = await lendingPool.getAddress(GOERLI_DAI_ADDRESS);
    expect(symbol).to.equal("DAI");
  });

  it("2. Should be able retrieve DAI-USD price feed", async () => {
    expect(await lendingPool.getPriceFeedMap(GOERLI_DAI_ADDRESS)).to.equal(
      GOERLI_DAI_USD_PF_ADDRESS
    );
  });

  //   it("3. OtherAddress can't add assets", async () => {
  //     await expect(
  //       lendingPool
  //         .connect(otherAddress)
  //         .addAsset(
  //           GOERLI_DAI_ADDRESS,
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
  //       GOERLI_DAI_ADDRESS,
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
  //   const result = await lendingPool.isTokenInAssets(GOERLI_DAI_ADDRESS);
  //   expect(result).to.be.equal(true);
  // });

  // it("6. USDC Token should not be in assets", async () => {
  //   const result = await lendingPool.isTokenInAssets(GOERLI_USDC_ADDRESS);
  //   expect(result).to.be.equal(false);
  // });

  // it("7. Should be able to return symbol by passing address", async () => {
  //   const asset = await lendingPool.getAssetByTokenAddress(GOERLI_DAI_ADDRESS);
  //   expect(asset.symbol).to.be.equal(DAI_SYMBOL);
  // });

  // it("8. Should be able to return address by passing symbol", async () => {
  //   const asset = await lendingPool.getAssetByTokenSymbol(DAI_SYMBOL);
  //   expect(asset.token).to.be.equal(GOERLI_DAI_ADDRESS.toString());
  // });

  // it("9. Is collateral Enabled", async () => {
  //   const result = await lendingPool.isCollateralEnable(GOERLI_DAI_ADDRESS);
  //   expect(result).to.be.equal(false);
  // });

  // it("10. Is Borrowing Enabled", async () => {
  //   const result = await lendingPool.isBorrowingEnable(GOERLI_DAI_ADDRESS);
  //   expect(result).to.be.equal(true);
  // });

  /******************** LEND FUNCTIONALIY ***************************/

  it("11. Should lend 10 ETH", async () => {
    const valueOption = { value: numberToEthers(10) };
    const amount = numberToEthers(10);
    const asset = GOERLI_ETH_ADDRESS;

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
    const asset = GOERLI_ETH_ADDRESS;

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

  it("13. Should lend 100 DAI Assets", async () => {
    // await ethers.connect(lender1);

    const amount = 100;
    const allowanceAmount = 1000;
    const asset = GOERLI_DAI_ADDRESS;

    await daiToken
      .connect(lender1)
      .approve(lendingPool.address, allowanceAmount);

    // 1. Lending
    const tx = await lendingPool.connect(lender1).lend(asset, amount);
    await tx.wait();

    // 2. Checking contract ETH balance
    const afterBalance = await lendingPool.getcontractTokenBalance(
      GOERLI_DAI_ADDRESS
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

  it("Lender Should be able to withdraw ETH assets", async () => {
    const valueOption = { value: numberToEthers(5) };
    const amount = numberToEthers(5);
    const asset = GOERLI_ETH_ADDRESS;

    // 1. lending the ETH
    const beforeBalance = await lendingPool.getContractETHBalance();

    console.log("beforeBalance : " + beforeBalance);

    const beforeLenderBalance = await lendingPool.getBalance(lender1.address);
    console.log("lender1.balance : " + beforeLenderBalance);

    const tx = await lendingPool
      .connect(lender1)
      .withdraw(lender1.address, asset, amount, valueOption);

    await tx.wait();

    // 2. Checking contract ETH balance
    const afterBalance = await lendingPool.getContractETHBalance();
    // expect(afterBalance).to.be.equal(beforeBalance - amount);
    console.log("afterBalance : " + afterBalance);

    const afterLenderBalance = await lendingPool.getBalance(lender1.address);
    console.log("after lender1.balance : " + afterLenderBalance);

    // // 3. checking Reserves
    // let result = await lendingPool.reserves(asset);
    // console.log("reserves : " + result);
    // expect(result).to.be.greaterThan(amount);

    // // // 5. checking lender ETH balance
    result = await lendingPool.getLenderETHBalance(lender1.address);
    console.log("LenderETHBalance : " + result);
    // expect(result).to.be.lessThan(amount);

    // // // // 6. checking lender Assets
    // result = await lendingPool.getLenderAssets(lender1.address);
    // console.log(result);
    // expect(result[0].token).to.be.equal(asset);
  });
});
