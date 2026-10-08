import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.create();

describe("Counter", function () {
  it("starts at zero", async function () {
    const counter = await ethers.deployContract("Counter");
    expect(await counter.count()).to.equal(0n);
  });

  it("increments by one", async function () {
    const counter = await ethers.deployContract("Counter");
    await counter.increment();
    expect(await counter.count()).to.equal(1n);
  });

  it("increments by a custom amount", async function () {
    const counter = await ethers.deployContract("Counter");
    await counter.incrementBy(5);
    expect(await counter.count()).to.equal(5n);
  });

  it("only lets the owner reset the count", async function () {
    const [owner, other] = await ethers.getSigners();
    const counter = await ethers.deployContract("Counter");
    await counter.increment();

    await expect(
      counter.connect(other).reset()
    ).to.be.revertedWithCustomError(counter, "NotOwner");

    await counter.connect(owner).reset();
    expect(await counter.count()).to.equal(0n);
  });
});
