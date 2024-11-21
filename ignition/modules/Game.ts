import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

module.exports = buildModule("Game", (m: any) => {
  const Game = m.contract("Game", 
    [{
          "players": ["0x00019df0c775443c38aaece913b0e1310368efd4",
                      "0x0001cf5c3a00b4feb2cfef62f6051a4a21cd3eab",
                      "0x00017cafbd0b31745af594a0c448004fdba58513"]
      },
      {
          "players": ["0x00011427773b52c186a71c844c426b61c291b606",
                      "0x000107e757094b04728a774c508430ca7ed68b8a"]
      },
      100,
      600,
      "0x000128435607C6a0cad70EBbB0BcBE1F36a64ba6"
    ]
  );

  return { Game };
});
