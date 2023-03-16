const { ethers } = require("hardhat");

async function codeSize() {
  //   new Web3(new Web3.providers.HttpProvider(""));
  const provider = new ethers.providers.JsonRpcProvider();
  const codeSize = await provider.getCode(
    "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
  );
  if (codeSize !== "0x") {
    console.log("Contract Account");
  } else {
    console.log("EOA");
  }
}

codeSize();
