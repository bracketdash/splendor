import createGame from "../createGame.js";
import createPlayer from "../createPlayer.js";

import getOptionScore from "../getOptionScore.development.js";
import getOptionScoreBaseline from "../getOptionScore.baseline.js";

const DEV_INDEX = 1; // 0 to have bot go first
const GAMES_PER_WEIGHT_SET = 5;
const INCREMENT_AMOUNT = 0.5;
const MAX_WEIGHT = 2;
const MIN_RECORDING_SCORE = 4;

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

// game runner and weightset win tracker

const weightComboWins = {};

let currentGameNum = 1;
let game;
let winTally = Array(players.length).fill(0);

function handleEngGame(playerStats) {
  winTally.forEach((_, index) => {
    winTally[index] += playerStats[index].winner ? 1 : 0;
  });

  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write(
    `${Object.values(global.WEIGHTS).join(",")} -- ${
      winTally[DEV_INDEX]
    }/${currentGameNum}/${GAMES_PER_WEIGHT_SET}`
  );

  if (currentGameNum === GAMES_PER_WEIGHT_SET - 1) {
    currentGameNum = 0;
    if (winTally[DEV_INDEX] > MIN_RECORDING_SCORE) {
      weightComboWins[JSON.stringify(global.WEIGHTS)] = winTally[DEV_INDEX];
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      console.log(
        `${Object.values(global.WEIGHTS).join(",")} -- ${
          winTally[DEV_INDEX]
        }/${GAMES_PER_WEIGHT_SET}`
      );
    }

    winTally = Array(players.length).fill(0);

    if (tryIncrementWeights()) {
      players.forEach((player) => {
        player.reset();
      });

      game = createGame(players);
      game.makeMove(game.getState().options[0]).then((state) => {
        continueGame(state.options[0]);
      });

      return;
    }

    console.log("Training complete. Winners below:");
    console.log(weightComboWins);

    return;
  }

  currentGameNum++;
  players.forEach((player) => {
    player.reset();
  });

  game = createGame(players);
  game.makeMove(game.getState().options[0]).then((state) => {
    continueGame(state.options[0]);
  });
}

function continueGame(decision) {
  game.makeMove(decision).then((state) => {
    if (state.playerStats) {
      handleEngGame(state.playerStats);
    } else {
      continueGame(state.options[0]);
    }
  });
}

game = createGame(players);
game.makeMove(game.getState().options[0]).then((state) => {
  continueGame(state.options[0]);
});
