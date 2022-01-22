const { expect } = require("chai");

const { FakeContract, smock } = require("@defi-wonderland/smock");
const nullAddr = "0x0000000000000000000000000000000000000000";

// `describe` is a Mocha function that allows you to organize your tests. It's
// not actually needed, but having your tests organized makes debugging them
// easier. All Mocha functions are available in the global scope.

// `describe` recieves the name of a section of your test suite, and a callback.
// The callback must define the tests of that section. This callback can't be
// an async function.
describe("Medallions contract", function () {
  let Medallions;
  let medallions;
  let testRenderer;

  let fake;

  let owner;
  let foundry;
  let runnersOg;
  let proxy;
  let addr1;
  let addr2;
  let addrs;

  // `beforeEach` will run before each test, re-deploying the contract every
  // time. It receives a callback, which can be async.
  beforeEach(async function () {
    [owner, addr1, addr2, runnersOg, foundry, proxy, ...addrs] =
      await ethers.getSigners();
    let inst = await hre.ethers.getContractFactory("ChainRunners");
    fake = await smock.fake(inst, {
      address: runnersOg.address,
    });

    let TestRenderer = await ethers.getContractFactory("TestRenderer");
    testRenderer = await TestRenderer.deploy();

    Medallions = await ethers.getContractFactory("Medallions");
    medallions = await Medallions.deploy(
      foundry.address,
      runnersOg.address,
      proxy.address,
      10
    );
  });

  const toWei = (num) => hre.ethers.utils.parseEther(num);

  describe("Transactions", function () {
    describe("mint", function () {
      it("should not allow if minting disabled", async () => {
        await expect(medallions.mintWithRunners([1])).to.be.revertedWith(
          "Mint not active"
        );
      });

      it("should not allow if allow renegades is enabled", async () => {
        await medallions.setMintPhase(2);
        await expect(medallions.mintWithRunners([1])).to.be.revertedWith(
          "Mint not active"
        );
      });

      it("should prevent max mints per tx", async () => {
        await medallions.setMintPhase(2);

        await expect(
          medallions.mint(10, {
            value: toWei("0.2"),
          })
        ).to.be.revertedWith("Minting too many");
      });

      it("should not allow if eth is wrong", async () => {
        await medallions.setMintPhase(2);

        await expect(
          medallions.mint(4, {
            value: toWei("0.2"),
          })
        ).to.be.revertedWith("Invalid funds");
      });

      it("should mint one", async () => {
        await medallions.setMintPhase(2);

        await expect(
          medallions.connect(addr1).mint(1, {
            value: toWei("0.015"),
          })
        )
          .to.emit(medallions, "Transfer")
          .withArgs(nullAddr, addr1.address, 1);

        expect(await medallions.totalSupply()).to.equal(1);
        expect(await medallions.ownerOf(1)).to.equal(addr1.address);
        expect(await medallions.balanceOf(addr1.address)).to.equal(1);
      });

      it("should mint many", async () => {
        await medallions.setMintPhase(2);

        await expect(
          medallions.connect(addr1).mint(3, {
            value: toWei("0.045"),
          })
        )
          .to.emit(medallions, "Transfer")
          .withArgs(nullAddr, addr1.address, 1)
          .to.emit(medallions, "Transfer")
          .withArgs(nullAddr, addr1.address, 2)
          .to.emit(medallions, "Transfer")
          .withArgs(nullAddr, addr1.address, 3);

        expect(await medallions.totalSupply()).to.equal(3);
        expect(await medallions.ownerOf(1)).to.equal(addr1.address);
        expect(await medallions.ownerOf(2)).to.equal(addr1.address);
        expect(await medallions.ownerOf(3)).to.equal(addr1.address);
        expect(await medallions.balanceOf(addr1.address)).to.equal(3);
      });

      it("should prevent minting over supply", async () => {
        await medallions.setMintPhase(2);

        await medallions.connect(addr1).mint(6, {
          value: toWei("0.09"),
        });

        expect(await medallions.totalSupply()).to.equal(6);

        await expect(
          medallions.connect(addr1).mint(6, {
            value: toWei("0.09"),
          })
        ).to.be.revertedWith("Minting exceeds total");

        await medallions.connect(addr1).mint(4, {
          value: toWei("0.06"),
        });

        expect(await medallions.totalSupply()).to.equal(10);
        expect(await medallions.balanceOf(addr1.address)).to.equal(10);
        for (let i = 0; i < 10; i++) {
          expect(
            await medallions.tokenOfOwnerByIndex(addr1.address, i)
          ).to.equal(i + 1);
        }
        await expect(medallions.tokenOfOwnerByIndex(addr1.address, 10)).to.be
          .reverted;

        await expect(
          medallions.connect(addr1).mint(1, {
            value: toWei("0.015"),
          })
        ).to.be.revertedWith("Minting exceeds total");
      });
    });

    describe("mintWithRunners", function () {
      it("should not allow if minting disabled", async () => {
        await expect(medallions.mintWithRunners([1])).to.be.revertedWith(
          "Mint not active"
        );
      });

      it("should not allow if public", async () => {
        await medallions.setMintPhase(2);
        await expect(medallions.mintWithRunners([1])).to.be.revertedWith(
          "Mint not active"
        );
      });

      it("should not allow if wrong amount of eth", async () => {
        await medallions.setMintPhase(1);

        await expect(
          medallions.mintWithRunners([1], {
            value: toWei("1"),
          })
        ).to.be.revertedWith("Invalid funds");

        await expect(
          medallions.mintWithRunners([1], {
            value: toWei("0.001"),
          })
        ).to.be.revertedWith("Invalid funds");
      });

      it("should mint one medallion", async () => {
        fake.ownerOf.whenCalledWith(3).returns(addr1.address);

        await medallions.setMintPhase(1);
        await expect(
          medallions
            .connect(addr1)
            .mintWithRunners([3], { value: toWei("0.01") })
        )
          .to.emit(medallions, "MintWithRunner")
          .withArgs(3, 1)
          .to.emit(medallions, "Transfer")
          .withArgs(nullAddr, addr1.address, 1);

        expect(await medallions.totalSupply()).to.equal(1);
        expect(await medallions.ownerOf(1)).to.equal(addr1.address);
        expect(await medallions.balanceOf(addr1.address)).to.equal(1);
      });

      it("should mint multiple medallions", async () => {
        fake.ownerOf.whenCalledWith(3).returns(addr1.address);
        fake.ownerOf.whenCalledWith(5).returns(addr1.address);

        await medallions.setMintPhase(1);
        await expect(
          medallions
            .connect(addr1)
            .mintWithRunners([3, 5], { value: toWei("0.02") })
        )
          .to.emit(medallions, "Transfer")
          .withArgs(nullAddr, addr1.address, 1)
          .to.emit(medallions, "Transfer")
          .withArgs(nullAddr, addr1.address, 2)
          .to.emit(medallions, "MintWithRunner")
          .withArgs(3, 1)
          .to.emit(medallions, "MintWithRunner")
          .withArgs(5, 2);

        expect(await medallions.totalSupply()).to.equal(2);
        expect(await medallions.ownerOf(1)).to.equal(addr1.address);
        expect(await medallions.ownerOf(2)).to.equal(addr1.address);
        expect(await medallions.balanceOf(addr1.address)).to.equal(2);
      });

      it("should revert if not owner", async () => {
        fake.ownerOf.whenCalledWith(1).returns(addr1.address);
        fake.ownerOf.whenCalledWith(5).returns(addr2.address);

        await medallions.setMintPhase(1);
        await expect(
          medallions
            .connect(addr1)
            .mintWithRunners([1, 5], { value: toWei("0.02") })
        ).to.be.revertedWith("Must own all runners");

        expect(await medallions.totalSupply()).to.equal(0);
      });

      it("should revert if already own", async () => {
        fake.ownerOf.whenCalledWith(2).returns(addr1.address);
        fake.ownerOf.whenCalledWith(5).returns(addr1.address);

        await medallions.setMintPhase(1);
        await expect(
          medallions
            .connect(addr1)
            .mintWithRunners([2], { value: toWei("0.01") })
        )
          .to.emit(medallions, "Transfer")
          .withArgs(nullAddr, addr1.address, 1);

        expect(await medallions.totalSupply()).to.equal(1);

        await expect(
          medallions
            .connect(addr1)
            .mintWithRunners([2], { value: toWei("0.01") })
        ).to.be.revertedWith("Medallion already owned");
      });

      it("should prevent minting over supply", async () => {
        fake.ownerOf.returns(addr1.address);

        await medallions.setMintPhase(1);

        await medallions.connect(addr1).mintWithRunners([1, 2, 3, 4, 5, 6], {
          value: toWei("0.06"),
        });

        expect(await medallions.totalSupply()).to.equal(6);

        await expect(
          medallions.connect(addr1).mintWithRunners([7, 8, 9, 10, 11], {
            value: toWei("0.05"),
          })
        ).to.be.revertedWith("Minting exceeds total");

        await medallions.connect(addr1).mintWithRunners([7, 8, 9, 10], {
          value: toWei("0.04"),
        });

        expect(await medallions.totalSupply()).to.equal(10);

        await expect(
          medallions.connect(addr1).mintWithRunners([11], {
            value: toWei("0.01"),
          })
        ).to.be.revertedWith("Minting exceeds total");
      });
    });

    describe("tokenOfOwnerByIndex", () => {
      it("should return token id", async () => {
        fake.ownerOf.whenCalledWith(1).returns(addr1.address);

        await medallions.setMintPhase(1);
        await medallions.connect(addr1).mintWithRunners([1], {
          value: toWei("0.01"),
        });

        expect(await medallions.balanceOf(addr1.address)).to.equal(1);
        expect(await medallions.tokenOfOwnerByIndex(addr1.address, 0)).to.equal(
          1
        );
      });
    });

    describe("tokenUri", function () {
      it("should use renderer if available", async () => {
        fake.ownerOf.whenCalledWith(1).returns(addr1.address);

        await medallions.setBaseURI("http://mega.com/");
        await medallions.setMintPhase(1);
        await medallions.connect(addr1).mintWithRunners([1], {
          value: toWei("0.01"),
        });

        expect(await medallions.totalSupply()).to.equal(1);
        expect(await medallions.tokenURI(1)).to.equal("http://mega.com/1");
        await expect(medallions.tokenURI(0)).to.be.reverted;
        await expect(medallions.tokenURI(2)).to.be.reverted;

        await medallions.setRenderingContractAddress(testRenderer.address);
        expect(await medallions.tokenURI(1)).to.equal("http://test.com/");
      });
    });

    describe("withdraw", function () {
      it("dispers withdrawals correctly", async () => {
        expect(await medallions.getBalance()).to.equal(toWei("0"));

        await expect(
          await addr1.sendTransaction({
            from: addr1.address,
            to: medallions.address,
            value: toWei("1"),
          })
        );

        expect(await medallions.getBalance()).to.equal(toWei("1"));
        await expect(medallions.connect(addr1).withdraw()).to.be.revertedWith(
          "Not allowed to withdraw"
        );
        await medallions.connect(foundry).withdraw();
        expect(await medallions.getBalance()).to.equal(toWei("0.1"));

        // try again
        await expect(medallions.connect(foundry).withdraw()).to.be.revertedWith(
          "Amount must be positive"
        );
        expect(await medallions.getBalance()).to.equal(toWei("0.1"));
      });
    });
  });
});
