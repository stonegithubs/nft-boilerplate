require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-watcher");
require("./tasks/faucet");

require("dotenv").config({ path: ".env.local" });

const contractAddresses = require("./contracts/contract-address.json");
const contractMeta = require("./contracts/Daydreams.json");

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

task("set-merkle-root", "Sets merkle root").setAction(async () => {
  const [signer, ...other] = await hre.ethers.getSigners();
  const contract = new hre.ethers.Contract(
    contractAddresses.Daydreams,
    contractMeta.abi
  );

  const leafNodes = wl.map(keccak256);
  const tree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });
  const root = tree.getRoot();
  const tx = await contract.connect(signer).setMerkleRoot(tree.getHexRoot());
  await tx.wait();
});

task("set-merkle-root", "Sets merkle root").setAction(async () => {
  const wl = require("./public/whitelist.json");
  const keccak256 = require("keccak256");
  const contract = new hre.ethers.Contract(
    contractAddresses.Daydreams,
    contractMeta.abi
  );

  const { MerkleTree } = require("merkletreejs");
  const leafNodes = wl.map(keccak256);
  const tree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });

  const [signer] = await hre.ethers.getSigners();
  const tx = await contract.connect(signer).setMerkleRoot(tree.getHexRoot());

  await tx.wait();
});

task("set-mint-phase", "sets mint phase")
  .addPositionalParam("phase", "The mint phase")
  .setAction(async ({ phase }) => {
    const contract = new hre.ethers.Contract(
      contractAddresses.Daydreams,
      contractMeta.abi
    );
    const [signer] = await hre.ethers.getSigners();
    const tx = await contract.connect(signer).setPhase(parseInt(phase));
    await tx.wait();
  });

module.exports = {
  ...config,
};
