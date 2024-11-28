import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
import "@nilfoundation/hardhat-plugin";
import {getValue, NilHardhatUserConfig} from "@nilfoundation/hardhat-plugin";
import "./tasks/GameTask"

dotenv.config();
const endpoint = getValue("rpc_endpoint");
const walletAddress = getValue("address");
const privateKey = getValue("private_key");

const config: NilHardhatUserConfig = {
  solidity: "0.8.26",
  defaultNetwork: "nil",
  ignition: {
    requiredConfirmations: 1,
  },
  networks: {
    nil: {
      url: endpoint,
      accounts: privateKey ? [privateKey] : [],
    },
  },
  walletAddress: walletAddress,
  debug: true,
};
export default config;
