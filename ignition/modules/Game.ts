import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

module.exports = buildModule("Game", (m: any) => {
  const Game = m.contract("GameBase");

  return { Game };
});
