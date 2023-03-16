const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Test Withdraw", async () => {
  before(async () => {
    const TestWithdraw = await ethers.getContractFactory("TestWithdraw");
    testWithdraw = await TestWithdraw.deploy();
    await testWithdraw.deployed();
  });
  it("Should be able to deposit ethers", async () => {
    testWithdraw.deposit({ value: ethers.utils.parseEther("3") });
    expect(await testWithdraw.getBalance()).to.equal(
      ethers.utils.parseEther("3")
    );
  });

  it("Should be able to withdraw ethers", async () => {
    // testWithdraw.withdraw(msg.sender, ethers.utils.parseEthers("2"), {value: ethers.utils.parseEthers("3")});

    const accounts = await ethers.getSigners();
    testWithdraw.withdraw(accounts[0].address, ethers.utils.parseEther("2"));
    expect(await testWithdraw.getBalance()).to.equal(
      ethers.utils.parseEther("1")
    );
  });
});
