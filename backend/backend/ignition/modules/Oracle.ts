import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

module.exports = buildModule("ChessOracle", (m: any) => {
  const ChessOracle = m.contract("ChessOracle");

  return { ChessOracle };
});
