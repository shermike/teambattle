import { task } from "hardhat/config";
import type { Game } from "../typechain-types";

task("game", "Retrieve currency name and ID")
  .addParam("command", "Command")
  .addParam("address", "The address of the deployed currency contract")
  .setAction(async (taskArgs, hre) => {
    const address = taskArgs.address;

    const Game = await hre.ethers.getContractFactory("Game");
    const game = Game.attach(address) as Game;

    if (taskArgs.command == "time") {
        const name = await game.getRemainingTime();
        console.log("Name: " + name);
    } else if (taskArgs.command == "moves") {
        const v = await game.getMoves();
        console.log("Moves: " + v);
    
    } else if (taskArgs.command == "team") {
        const team1 = await game.getTeam(0);
        const team2 = await game.getTeam(1);
        console.log("Team1: " + team1);
        console.log("Team2: " + team2);
    } else if (taskArgs.command == "info") {
        const tm = await game.getRemainingTime();
        console.log("Remaining: " + tm);
        const moves = await game.getMoves();
        console.log("Moves: " + moves);
        const round = await game.round();
        console.log("Round: " + round);
        const res = await game.round();
        console.log("Result: " + round);
    } else if (taskArgs.command == "vote") {
        // const m = ethers.utils.defaultAbiCoder.encode(["string"], "e2e4");
        await game.voteMove("e2e4");
    } else {
        console.log("Unkwnown command")
    }

    
  });