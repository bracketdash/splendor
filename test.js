import Game from "./class.Game.js";
import Player from "./class.Player.js";

import splendorbotStable from "./splendorbot.stable.js";
import splendorbotBeta from "./splendorbot.beta.js";
import splendorbotCanary from "./splendorbot.canary.js";
import splendorbotRandom from "./splendorbot.random.js";

const singleTestNumGames = 100;

// up to 4 players
const players = [
  new Player("Canary", splendorbotCanary),
  new Player("Beta", splendorbotBeta),
  // new Player("Stable", splendorbotStable),
  new Player("Random", splendorbotRandom),
];

let winTally = Array(players.length).fill(0);

let currentGameNum = 1;

const endGameCallback = function (gameState, playerStats) {
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
      winTally
        .map((wins, playerIndex) => `${wins} ${playerStats[playerIndex].name}`)
        .join(" | ")
    );
    return;
  }
  players.forEach((player) => {
    player.reset();
  });
  new Game(players, endGameCallback).start();
  currentGameNum++;
};

new Game(players, endGameCallback).start();
