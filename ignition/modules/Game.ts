import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

module.exports = buildModule("Game", (m: any) => {
  // const Game = m.contract("Game", 
  //   [{
  //         "players": ["0x00019df0c775443c38aaece913b0e1310368efd4",
  //                     "0x0001cf5c3a00b4feb2cfef62f6051a4a21cd3eab",
  //                     "0x00017cafbd0b31745af594a0c448004fdba58513"]
  //     },
  //     {
  //         "players": ["0x00011427773b52c186a71c844c426b61c291b606",
  //                     "0x000107e757094b04728a774c508430ca7ed68b8a"]
  //     },
  //     100,
  //     600,
  //     "0x000128435607C6a0cad70EBbB0BcBE1F36a64ba6"
  //   ]
  // );
  // const Game = m.contract("Game");

  const Game = m.contract("Game", 
    [{
          "players": ["0x0001afc512d27fe03103371dc6fd786093483008"]
      },
      {
          "players": ["0x0001c21dd5c9d139d1c6afd3f2af9857c1b3ff58"]
      },
      100,
      43200,
      "0x0001469126117fb447FA268Db8b497B267d0C828"
    ]
  );

  return { Game };
});
