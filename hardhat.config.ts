import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-gas-reporter"
import "solidity-coverage"
import "hardhat-deploy"
import "hardhat-contract-sizer"
import {COIN_MARKET_CAP_API_KEY, ETHERSCAN_API_KEY, GOERLI_PRIVATE_KEY, GOERLI_RPC_PROVIDER} from "./settings";

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    goerli: {
      url: GOERLI_RPC_PROVIDER,
      accounts: [
        GOERLI_PRIVATE_KEY
      ],
      chainId: 5
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
      chainId: 31337
    }
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY
  },
  gasReporter: {
    enabled: true,
    outputFile: "gas-report.txt",
    noColors: true,
    currency: "USD",
    coinmarketcap: COIN_MARKET_CAP_API_KEY
  },
  namedAccounts: {
    deployer: {
      default: 0
    },
    account_1: {
      default: 1
    }
  },
  mocha: {
    timeout: 100000000
  },
  solidity: "0.8.9",
};

export default config;
