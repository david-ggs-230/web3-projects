// test/SimpleStorage.test.js
const { expect } = require("chai");

describe("SimpleStorage", function () {
  let simpleStorage;
  
  beforeEach(async function () {
    const SimpleStorage = await ethers.getContractFactory("SimpleStorage");
    simpleStorage = await SimpleStorage.deploy();
  });

  it("Should store and retrieve values", async function () {
    // Store value
    await simpleStorage.store(42);
    
    // Retrieve and verify
    expect(await simpleStorage.retrieve()).to.equal(42);
  });

  it("Should emit ValueChanged event", async function () {
    await expect(simpleStorage.store(100))
      .to.emit(simpleStorage, "ValueChanged")
      .withArgs(100);
  });
});
