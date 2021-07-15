import Game from "./class.Game.js";
import Player from "./class.Player.js";

import splendorbotStable from "./splendorbot.stable.js";
import splendorbotBeta from "./splendorbot.beta.js";
import splendorbotCanary from "./splendorbot.canary.js";
import splendorbotRandom from "./splendorbot.random.js";

global.weights = [0, 0, 0];
const maxWeight = 1;
const singleTestNumGames = 10;

// up to 4 players
const players = [
  new Player("Canary", splendorbotCanary),
  new Player("Beta", splendorbotBeta),
  // new Player("Stable", splendorbotStable),
  // new Player("Random", splendorbotRandom),
];

// TODO: there is a bug that happens much more often with all 4 players, related to lack of options
// This may be character cards actually running out, but we should check to see if they are maxed on tokens, etc., too
// Also check that location tiles are being assigned as players qualify

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
    console.log(global.weights);
    console.log(
      winTally
        .map((wins, playerIndex) => `${wins} ${playerStats[playerIndex].name}`)
        .join(" | ")
    );
    winTally = Array(players.length).fill(0);
    if (
      global.weights[0] >= maxWeight &&
      global.weights[1] >= maxWeight &&
      global.weights[2] >= maxWeight
    ) {
      console.timeEnd("Test duration");
      return;
    }
    global.weights = (
      parseInt(
        global.weights.map((n) => n.toString(maxWeight + 1)).join(""),
        maxWeight + 1
      ) + 1
    )
      .toString(maxWeight + 1)
      .padStart(3, "0")
      .split("")
      .map((s) => parseInt(s, maxWeight + 1));
    players.forEach((player) => {
      player.reset();
    });
    new Game(players, endGameCallback).start();
    currentGameNum = 0;
    return;
  }
  players.forEach((player) => {
    player.reset();
  });
  new Game(players, endGameCallback).start();
  currentGameNum++;
};

console.time("Test duration");
new Game(players, endGameCallback).start();
