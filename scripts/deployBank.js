const { ethers } = require("hardhat");

async function main() {
  const Bank = await ethers.getContractFactory("Bank");
  const bank = await Bank.deploy();
  await bank.deployed();
  console.log("Address of Contract : ", bank.address);
}

main().catch((error) => {
  console.log(error);
  process.exitCode = 1;
});
