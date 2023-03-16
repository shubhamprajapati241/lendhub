const { ETHAddress, LINK_USD_PF_ADDRESS } = require("../addresses");

console.log("LINK_USD_PF_ADDRESS", LINK_USD_PF_ADDRESS);

// const { expect } = require("chai");
// const { ethers } = require("hardhat");

// describe("Test Calling Foo", function () {
//   before(async () => {
//     const Foo = await ethers.getContractFactory("Foo1");
//     foo = await Foo.deploy();
//     await foo.deployed();

//     const FooCaller = await ethers.getContractFactory("Foo1Caller");
//     fooCaller = await FooCaller.deploy(foo.address);
//     await fooCaller.deployed();

//     const Foo2Caller = await ethers.getContractFactory("Foo2Caller");
//     foo2Caller = await Foo2Caller.deploy();
//     await foo2Caller.deployed();
//   });

//   it("Foo Caller should be able to Call Foo.foo() ", async () => {
//     expect(await fooCaller.callFoo()).to.be.true;
//     expect(await foo2Caller.call2Foo(foo.address)).to.be.true;
//   });
// });

// const tokens = [
//   {
//     image: 10,
//     name: "ETH",
//     address: "0xba8dced3512925e52fe67b1b5329187589072a55",
//     decimal: "18",
//     apy: 3,
//     isCollateral: true,
//   },

//   {
//     image: 20,
//     name: "DAI",
//     address: "0xba8dced3512925e52fe67b1b5329187589072a55",
//     decimal: "18",
//     apy: 3,
//     isCollateral: false,
//   },
//   {
//     image: 30,
//     name: "USDC",
//     address: "0x65afadd39029741b3b8f0756952c74678c9cec93",
//     decimal: "18",
//     apy: 3,
//     isCollateral: false,
//   },
// ];

// const assets = [
//   {
//     address: "0x65afadd39029741b3b8f0756952c74678c9cec93",
//   },
//   {
//     address: "0xba8dced3512925e52fe67b1b5329187589072a55",
//   },
// ];

// console.log(assets[0]);

// arr = assets.filter((el) => !wordsToRemove.includes(el));
// console.log(arr);

// const tokens = [
//   {
//     image: 10,
//   },

//   {
//     image: 20,
//   },
//   {
//     image: 30,
//   },
// ];

// const sum = tokens.reduce((bal, prev) => {
//   return bal + prev.image;
// }, 0);

// console.log("sum : " + sum);
