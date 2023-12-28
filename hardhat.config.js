require("@nomiclabs/hardhat-waffle")
require("@nomicfoundation/hardhat-verify")
require("hardhat-deploy")
require("solidity-coverage")
require("hardhat-gas-reporter")
require("hardhat-contract-sizer")
require("dotenv").config()


const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_NETWORK;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
      blockConfirmations: 1,
    },
    // gasReporter: {
    //   enabled: false,
    //   currency: "USD",
    //   outputFile: "gas-reporter.txt",
    //   noColors: true,
    // },
    localhost: {
      chainId: 31337,
    },
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY],
      saveDeployments: true,
      chainId: 11155111,
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
    customChains: [],
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    player: {
      default: 1
    },

  }
};
