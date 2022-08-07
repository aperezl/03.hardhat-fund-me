require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-gas-reporter");
require("hardhat-deploy");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  // solidity: '0.8.9',
  solidity: {
    compilers: [{ version: "0.8.9" }, { version: "0.6.6" }],
  },
  defaultNetwork: "hardhat",
  networks: {
    rinkeby: {
      url: process.env.RPC_URL_RINKEBY,
      accounts: [process.env.PRIVATE_KEY_RINKEBY],
      chainId: 4,
      blockConfirmations: 6,
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  etherscan: {
    apiKey: process.env.EHTERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: false,
    outputFile: "gas-report.txt",
    noColors: true,
    currency: "USD",
    // token: 'MATIC',
    token: "ETH",
    coinmarketcap: process.env.COINMARKET_API_KEY,
  },
};
