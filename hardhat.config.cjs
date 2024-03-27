/* eslint-disable no-undef */
require('@nomiclabs/hardhat-waffle')
require("@typechain/hardhat");
require("@typechain/ethers-v5");

module.exports = {
  defaultNetwork: 'ganache',
  networks: {
    hardhat: {},
    goerli: {
      url: 'https://rpc.ankr.com/eth_goerli',
      accounts:  ['0x5123877703f50e064e81ddd583b11bc16900cb747b4e3c7a605a461161d4580f'],
    },
    ganache: {
      url: 'http://127.0.0.1:8545',
    },
  },
  solidity: {
    version: '0.8.20',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  typechain: {
    outDir: 'typechain',
    target: 'ethers-v5',
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts'
  },
}
