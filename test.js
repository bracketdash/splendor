import Game from "./class.Game.js";
import Player from "./class.Player.js";

import splendorbotStable from "./splendorbot.stable.js";
import splendorbotBeta from "./splendorbot.beta.js";
import splendorbotCanary from "./splendorbot.canary.js";
import splendorbotRandom from "./splendorbot.random.js";

global.weights = [0, 0, 0];
const maxWeight = 10;
const singleTestNumGames = 100;
const weightScores = {};

// up to 4 players
const players = [
  new Player("Canary", splendorbotCanary),
  new Player("Beta", splendorbotBeta),
  // new Player("Stable", splendorbotStable),
  // new Player("Random", splendorbotRandom),
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
    console.log(global.weights);
    console.log(
      winTally
        .map((wins, playerIndex) => `${wins} ${playerStats[playerIndex].name}`)
        .join(" | ")
    );
    if (
      global.weights[0] >= maxWeight &&
      global.weights[1] >= maxWeight &&
      global.weights[2] >= maxWeight
    ) {
      console.timeEnd("Test duration");
      console.log(JSON.stringify(weightScores));
      return;
    }
    const weightString = global.weights
      .map((n) => n.toString(maxWeight + 1))
      .join("");
    weightScores[weightString] = winTally[0];
    winTally = Array(players.length).fill(0);
    global.weights = (parseInt(weightString, maxWeight + 1) + 1)
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
