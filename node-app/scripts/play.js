// node scripts/play n
// n: number of games you would like to run

import Game from "../class.Game.js";
import Player from "../class.Player.js";

import splendorbotStable from "../splendorbot.stable.js";
import splendorbotBeta from "../splendorbot.beta.js";
import splendorbotCanary from "../splendorbot.canary.js";
import splendorbotRandom from "../splendorbot.random.js";

const players = [
  new Player("Beta", splendorbotBeta),
  new Player("Canary", splendorbotCanary),
  // new Player("Stable", splendorbotStable),
  // new Player("Random", splendorbotRandom),
];

const singleTestNumGames = process.argv[2];

let winTally = Array(players.length).fill(0);
let currentGameNum = 1;

const endGameCallback = function (_, playerStats) {
  winTally.forEach((_, index) => {
    winTally[index] += playerStats[index].winner ? 1 : 0;
  });

  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write(`Game ${currentGameNum} in progress...`);

  if (currentGameNum === singleTestNumGames - 1) {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);

    console.log(
      "\nResults -- " +
        winTally
          .map(
            (wins, playerIndex) => `${playerStats[playerIndex].name}: ${wins}`
          )
          .join("   ") +
        "\n"
    );

    return;
  }

  currentGameNum++;
  players.forEach((player) => {
    player.reset();
  });
  new Game(players, endGameCallback).start();
};

new Game(players, endGameCallback).start();
