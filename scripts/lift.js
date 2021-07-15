import Game from "../class.Game.js";
import Player from "../class.Player.js";

import splendorbotStable from "../splendorbot.stable.js";
import splendorbotBeta from "../splendorbot.beta.js";
import splendorbotCanary from "../splendorbot.canary.js";
import splendorbotRandom from "../splendorbot.random.js";

const players = [
  new Player("Canary", splendorbotCanary),
  new Player("Beta", splendorbotBeta),
  new Player("Stable", splendorbotStable),
  // new Player("Random", splendorbotRandom),
];

const singleTestNumGames = 10;

global.weights = [0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2];

const incrementIndex = [0, 0, 0, 0, 0, 0, 0, 0, 0];
const increments = [
  0, 0.2, 0.4, 0.6, 0.8, 1.2, 1.4, 1.6, 1.8, 2.4, 2.8, 3.6, 4.4,
];

function tryIncrementWeights() {
  const looper = function (place) {
    if (place < 0) {
      return false;
    }
    if (incrementIndex[place] === increments.length - 1) {
      incrementIndex[place] = 0;
      return looper(place - 1);
    }
    incrementIndex[place] += 1;
    return true;
  };

  return looper(8);
}

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
    currentGameNum = 0;
    process.stdout.clearLine();
    process.stdout.cursorTo(0);

    console.log(
      JSON.stringify(global.weights) +
        "  --  " +
        winTally
          .map(
            (wins, playerIndex) => `${playerStats[playerIndex].name}: ${wins}`
          )
          .join("   ")
    );

    if (tryIncrementWeights()) {
      players.forEach((player) => {
        player.reset();
      });
      new Game(players, endGameCallback).start();
      return;
    }

    console.log("Weight-lifting complete.");

    return;
  }

  currentGameNum++;
  players.forEach((player) => {
    player.reset();
  });
  new Game(players, endGameCallback).start();
};

new Game(players, endGameCallback).start();
