import createGame from "../createGame.js";
import createPlayer from "../createPlayer.js";

import getOptionScore from "../getOptionScore.development.js";
import getOptionScoreBaseline from "../getOptionScore.baseline.js";

const DEV_INDEX = 1;
const GAMES_PER_WEIGHT_SET = 5;
const INCREMENT_AMOUNT = 0.5;
const MAX_WEIGHT = 2;
const MIN_RECORDING_SCORE = 2;

// create players

const players = [];
const baselinePlayer = createPlayer("Baseline", getOptionScoreBaseline);
const devPlayer = createPlayer("Dev", getOptionScore);
if (DEV_INDEX) {
  players.push(baselinePlayer);
  players.push(devPlayer);
} else {
  players.push(devPlayer);
  players.push(baselinePlayer);
}

// set up weights and increment function

global.WEIGHTS = {
  affordapointsDiff: 1.5,
  avengersTags: 0.9,
  cardPoints: 0.9,
  mult2same: 1.2,
  mult3diff: 2,
  multRecruit: 1.2,
  multReserve: 0,
  wouldBeFirstOfColor: 1.5,
  wouldGetLocation: 3,
  wouldGetTimeStone: 1.8,
};

const weightKeys = Object.keys(global.WEIGHTS);

function tryIncrementWeights() {
  const looper = function (place) {
    if (place < 0) {
      return false;
    }
    if (global.WEIGHTS[weightKeys[place]] === MAX_WEIGHT) {
      global.WEIGHTS[weightKeys[place]] = 0;
      return looper(place - 1);
    }
    global.WEIGHTS[weightKeys[place]] += INCREMENT_AMOUNT;
    return true;
  };
  return looper(weightKeys.length - 1);
}

// game runner and weight set win tracker

const game = createGame(players);
const weightComboWins = {};

let winTally = Array(players.length).fill(0);
let currentGameNum = 1;

// game.getState(); <-- get the initial state of the game
// game.makeMove(selectedOption, player).then((state) => {
//   data is the new game state with state.options, or the game over state with state.winners
// });

// TODO: continue refactor from here

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
    if (winTally[playerIndex] > minScore) {
      weightComboWins[JSON.stringify(global.weights)] = winTally[playerIndex];
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
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

    console.log("Weight-lifting complete.");
    console.log(weightComboWins);

    return;
  }

  currentGameNum++;
  players.forEach((player) => {
    player.reset();
  });
  new Game(players, endGameCallback).start();
};
