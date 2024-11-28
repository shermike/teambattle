import { expect } from "chai";
import hre from "hardhat";
import "@nomicfoundation/hardhat-ethers";
import { deployNilContract } from "./deployUtil";


describe("Caller and Incrementer contract interaction", () => {
    let callerAddress: string;
    let incrementerAddress: string;

  it("Should deploy Caller with shardId 2, deploy Incrementer with shardId 1, and call incrementer from caller using await", async function() {
        this.timeout(120000);
  });
});