import Game from "../class.Game.js";
import Player from "../class.Player.js";

import splendorbotStable from "../splendorbot.stable.js";
import splendorbotBeta from "../splendorbot.beta.js";
import splendorbotCanary from "../splendorbot.canary.js";
import splendorbotRandom from "../splendorbot.random.js";

// REMEMBER: update playerIndex for testing the right player!
const playerIndex = 1;
const players = [
  new Player("Beta", splendorbotBeta),
  new Player("Canary", splendorbotCanary),
  // new Player("Stable", splendorbotStable),
  // new Player("Random", splendorbotRandom),
];

const singleTestNumGames = 200;
const minScore = 3;

global.weights = [0.9, 0.9, 1.5, 1.8, 1.2, 1.2, 0.3, 2.1, 1.2];

let incrementIndex = 0;
const increments = [
  [0.9, 0.9, 1.5, 1.8, 1.2, 1.2, 0.3, 2.1, 1.2],
  [1.2, 0.6, 1.2, 0.9, 1.2, 1.2, 0.3, 2.1, 1.2],
  [1.2, 0.9, 0.9, 1.2, 1.2, 1.2, 0.3, 2.1, 1.2],
];

function tryIncrementWeights() {
  if (incrementIndex === increments.length - 1) {
    return false;
  }
  incrementIndex += 1;
  global.weights = increments[incrementIndex];
  return true;
}

const weightComboWins = {};

let winTally = Array(players.length).fill(0);
let currentGameNum = 1;

const endGameCallback = function (_, playerStats) {
  winTally.forEach((_, index) => {
    winTally[index] += playerStats[index].winner ? 1 : 0;
  });

  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write(
    `${JSON.stringify(global.weights)} -- ${
      winTally[playerIndex]
    }/${currentGameNum}/${singleTestNumGames}`
  );

  if (currentGameNum === singleTestNumGames - 1) {
    currentGameNum = 0;
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    if (winTally[playerIndex] > minScore) {
      weightComboWins[JSON.stringify(global.weights)] = winTally[playerIndex];
      console.log(
        `${JSON.stringify(global.weights)} -- won ${
          winTally[playerIndex]
        } / ${singleTestNumGames}`
      );
    }

    winTally = Array(players.length).fill(0);

    if (tryIncrementWeights()) {
      players.forEach((player) => {
        player.reset();
      });
      new Game(players, endGameCallback).start();
      return;
    }

    console.log("Leg day complete.");
    console.log(weightComboWins);

    return;
  }

  currentGameNum++;
  players.forEach((player) => {
    player.reset();
  });
  new Game(players, endGameCallback).start();
};

new Game(players, endGameCallback).start();
