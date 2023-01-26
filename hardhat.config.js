require("@nomicfoundation/hardhat-toolbox")
require("@nomiclabs/hardhat-ethers")
require("@nomiclabs/hardhat-etherscan")
require("dotenv").config()
require("solidity-coverage")
require("hardhat-deploy")

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL || "http://eth-goerli"
const GOERLI_PRIVATE_KEY = process.env.GOERLI_PRIVATE_KEY || "0xkey"
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "key"
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "key"

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    goerli: {
      url: GOERLI_RPC_URL,
      accounts: [GOERLI_PRIVATE_KEY],
      chainId: 5,
      blockConfirmations: 6,
    }
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: true,
    outputFile: "gas-report.txt",
    noColors: true,
    currency: "USD",
    // coinmarketcap: COINMARKETCAP_API_KEY,
    token: "ETH"
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    user: {
      default: 1,
    }
  },
  // solidity: "0.8.8",
  solidity: {
    compilers: [{version: "0.8.8"}, {version: "0.6.6"}]
  },
};