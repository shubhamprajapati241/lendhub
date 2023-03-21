## DeFi-Lending-and-Borrowing DApp

DeFi Lending platform which lets you lend, borrow crypto assets and helps you earn some passive income as interest on your deposits.

A full stack, fully-onchain DeFi app that enables users to supply coin (ETH) / tokens to the contract and get the rewards based on the amount of token they supply and also allows users to borrow tokens from it.

It is deployed on the **Ethereum Sepolia Testnet.**

### Technology used

- Nextjs
- Tailwind CSS
- Ethereum
- Solidity
- Openzeppelin
- ERC20
- Chainlink
- Hardhat
- Etherjs

### Instructions Steps for the Sepolia Testnet

1. Create a new .env file into root directory
2. Add the Infura / Alchemy API key and your metmask accounts private key into .env file

![env](https://user-images.githubusercontent.com/61042463/226642196-965329ef-6c17-43ab-9268-a243f9f04728.png)

2. Deploy on the Sepolia Testnet

```shell
npx hardhat run scripts/deploy-sepolia.js --network sepolia
```

3.  Add the sepolia deploy addresses into address.js file

![addresses-sepolia](https://user-images.githubusercontent.com/61042463/226643306-69d6d9cc-67d7-4b2a-9c8a-694a23501260.png)

4. Start the Nextjs Server

```shell
npm run dev
```

### Instructions Steps for the Hardhat localhost

1.  Compile, Test and Run the hardhat node

```shell
 npx hardhat compile
 npx hardhat test
 npx hardhat node
```

2.  Deploy on the Hardhat localhost

```shell
npx hardhat run scripts/deploy.js --network localhost
```

3. Add the localhost deploy addresses into address.js file

![addresses](https://user-images.githubusercontent.com/61042463/226641194-637954ff-8230-4e41-82f0-3e42bb5dbdfe.png)

4. Start the Nextjs Server

```shell
npm run dev
```
