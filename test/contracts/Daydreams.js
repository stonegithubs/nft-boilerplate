const { expect } = require("chai");
const keccak256 = require("keccak256");
const { MerkleTree } = require("merkletreejs");

const { FakeContract, smock } = require("@defi-wonderland/smock");
const nullAddr = "0x0000000000000000000000000000000000000000";

// `describe` is a Mocha function that allows you to organize your tests. It's
// not actually needed, but having your tests organized makes debugging them
// easier. All Mocha functions are available in the global scope.

// `describe` recieves the name of a section of your test suite, and a callback.
// The callback must define the tests of that section. This callback can't be
// an async function.
describe("contract", function () {
  let NFT;
  let nft;
  let testRenderer;

  let fake;

  let owner;
  let treasury;
  let proxy;
  let addr1;
  let addr2;
  let addrs;
  let mintPrice = "0.06";
  let presaleMintPrice = "0.06";

  // `beforeEach` will run before each test, re-deploying the contract every
  // time. It receives a callback, which can be async.
  beforeEach(async function () {
    [owner, addr1, addr2, treasury, proxy, ...addrs] =
      await ethers.getSigners();

    NFT = await ethers.getContractFactory("Daydreams");
    nft = await NFT.deploy(treasury.address, proxy.address, 10);
  });

  describe("Transactions", function () {
    describe("mint", function () {
      it("should not allow if minting disabled", async () => {});

      it("should prevent max mints per tx", async () => {
        await nft.setPhase(2);

        await expect(
          nft.mint(10, {
            value: toWei("0.2"),
          })
        ).to.be.revertedWith("Minting too many");
      });

      it("should not allow if eth is wrong", async () => {
        await nft.setPhase(2);

        await expect(
          nft.mint(4, {
            value: toWei("0.2"),
          })
        ).to.be.revertedWith("Invalid funds");
      });

      it("should mint one", async () => {
        await nft.setPhase(2);

        await expect(
          nft.connect(addr1).mint(1, {
            value: toWei(mintPrice),
          })
        )
          .to.emit(nft, "Transfer")
          .withArgs(nullAddr, addr1.address, 0);

        expect(await nft.totalSupply()).to.equal(1);
        expect(await nft.ownerOf(0)).to.equal(addr1.address);
        expect(await nft.balanceOf(addr1.address)).to.equal(1);
      });

      it("should mint many", async () => {
        await nft.setPhase(2);

        await expect(
          nft.connect(addr1).mint(3, {
            value: toWei(String(mintPrice * 3)),
          })
        )
          .to.emit(nft, "Transfer")
          .withArgs(nullAddr, addr1.address, 0)
          .to.emit(nft, "Transfer")
          .withArgs(nullAddr, addr1.address, 1)
          .to.emit(nft, "Transfer")
          .withArgs(nullAddr, addr1.address, 2);

        expect(await nft.totalSupply()).to.equal(3);
        expect(await nft.ownerOf(0)).to.equal(addr1.address);
        expect(await nft.ownerOf(1)).to.equal(addr1.address);
        expect(await nft.ownerOf(2)).to.equal(addr1.address);
        expect(await nft.balanceOf(addr1.address)).to.equal(3);
      });

      it("should prevent minting over supply", async () => {
        await nft.setPhase(2);

        await nft.connect(addr1).mint(6, {
          value: toWei(String(mintPrice * 6)),
        });

        expect(await nft.totalSupply()).to.equal(6);

        await expect(
          nft.connect(addr1).mint(6, {
            value: toWei(String(mintPrice * 6)),
          })
        ).to.be.revertedWith("Minting exceeds total");

        await nft.connect(addr1).mint(4, {
          value: toWei(String(mintPrice * 4)),
        });

        expect(await nft.totalSupply()).to.equal(10);
        expect(await nft.balanceOf(addr1.address)).to.equal(10);
        for (let i = 0; i < 10; i++) {
          expect(await nft.tokenOfOwnerByIndex(addr1.address, i)).to.equal(i);
        }
        await expect(nft.tokenOfOwnerByIndex(addr1.address, 10)).to.be.reverted;

        await expect(
          nft.connect(addr1).mint(1, {
            value: toWei(mintPrice),
          })
        ).to.be.revertedWith("Minting exceeds total");
      });
    });

    describe("presaleMint", function () {
      it("should reject phase 0 and 2", async () => {
        await nft.setPhase(0);

        await expect(
          nft.connect(addr1).presaleMint(1, [], {
            value: toWei(mintPrice),
          })
        ).to.be.revertedWith("Mint not active");

        await nft.setPhase(2);

        await expect(
          nft.connect(addr1).presaleMint(1, [], {
            value: toWei(mintPrice),
          })
        ).to.be.revertedWith("Mint not active");
      });

      it("should allow only if on presale list", async () => {
        const leafs = [owner.address, addr1.address].map(keccak256);
        const tree = new MerkleTree(leafs, keccak256, { sortPairs: true });

        const leaf = keccak256(addr1.address);
        const proof = tree.getHexProof(leaf);
        expect(tree.verify(proof, leaf, tree.getHexRoot())).to.be.true;
        expect(await nft.connect(addr1).isOnPresaleList(proof)).to.be.false;

        await expect(
          nft.connect(addr1).presaleMint(1, proof, {
            value: toWei(mintPrice),
          })
        ).to.be.revertedWith("Not on the list");

        await nft.setMerkleRoot(tree.getHexRoot());
        expect(await nft.connect(addr1).isOnPresaleList(proof)).to.be.true;

        await expect(
          nft.connect(addr1).presaleMint(1, proof, {
            value: toWei(mintPrice),
          })
        ).to.emit(nft, "Transfer");

        await expect(
          nft.connect(addr1).presaleMint(1, proof, {
            value: toWei(mintPrice),
          })
        ).to.be.revertedWith("Already claimed");
      });

      it("should not allow if wrong amount of eth", async () => {});

      it("should mint one medallion", async () => {});

      it("should mint multiple medallions", async () => {});

      it("should revert if not owner", async () => {});

      it("should revert if already own", async () => {});

      it("should prevent minting over supply", async () => {});
    });

    describe("withdraw", function () {
      it("dispers withdrawals correctly", async () => {
        expect(await nft.getBalance()).to.equal(toWei("0"));
        await expect(
          await addr1.sendTransaction({
            from: addr1.address,
            to: nft.address,
            value: toWei("1"),
          })
        );

        expect(await nft.getBalance()).to.equal(toWei("1"));
        await expect(nft.connect(addr1).withdraw()).to.be.revertedWith(
          "Unauthorized"
        );

        await expect(nft.connect(owner).withdraw()).to.be.revertedWith(
          "Unauthorized"
        );

        await expect(
          await nft.connect(treasury).withdraw()
        ).to.changeEtherBalance(treasury, toWei("1"));
        expect(await nft.getBalance()).to.equal(toWei("0"));
      });
    });
  });
});

function toWei(num) {
  return hre.ethers.utils.parseEther(num);
}
