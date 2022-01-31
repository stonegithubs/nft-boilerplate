require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("./tasks/faucet");
require("hardhat-watcher");

// weird to require this since next sorta deos
// first case of conflation / redundancy between next/hardhat
require("dotenv").config({ path: ".env.local" });

// todo these should ideally be rpc url with tokens if
// client is leaking these keys
const {
  ETHERSCAN_KEY,
  DEPLOYER_PRIVATE_KEY,
  NEXT_PUBLIC_RPC_URL_1,
  NEXT_PUBLIC_RPC_URL_4,
} = process.env;

const config = {
  solidity: "0.8.7",
  defaultNetwork: "hardhat",
  watcher: {
    test: {
      tasks: [{ command: "test", params: { testFiles: ["{path}"] } }],
      files: ["./test/**/*"],
      verbose: true,
    },
  },
  networks: {
    hardhat: {},
    mainnet: {
      url: NEXT_PUBLIC_RPC_URL_1,
      chainId: 1,
      accounts: [`0x${DEPLOYER_PRIVATE_KEY}`],
    },
    rinkeby: {
      url: NEXT_PUBLIC_RPC_URL_4,
      chainId: 4,
      accounts: [`0x${DEPLOYER_PRIVATE_KEY}`],
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_KEY,
  },
};

module.exports = {
  ...config,
};
