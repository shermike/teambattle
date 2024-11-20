import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

module.exports = buildModule("ChessGame", (m: any) => {
  const incrementer = m.contract("ChessGame");

  return { incrementer };
});
