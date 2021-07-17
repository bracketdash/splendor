import createGame from "../createGame.js";
import createPlayer from "../createPlayer.js";

import getOptionScore from "../getOptionScore.development.js";
import getOptionScoreBaseline from "../getOptionScore.baseline.js";

// 0 to have bot go first, 1 to have bot go second
// it is typically harder to win as the second player
const DEV_INDEX = 1;

// how many games to run:
// higher means more confidence in the weights you end up with, but takes longer to run
// lower run quickly, but provides less confidence
const GAMES_PER_WEIGHT_SET = 10;

// if too many wins are being recorded, make this closer to GAMES_PER_WEIGHT_SET
const MIN_RECORDING_SCORE = 9;

// if you are running this on a high-end rig, you can adjust these values to find potentially smarter bots
const INCREMENT_AMOUNT = 0.5;
const MAX_WEIGHT = 2;

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
  affordapointsDiff: 0,
  avengersTags: 0,
  cardPoints: 0,
  mult2same: 0,
  mult3diff: 0,
  multRecruit: 0,
  multReserve: 0,
  wouldBeFirstOfColor: 0,
  wouldGetLocation: 0,
  wouldGetTimeStone: 0,
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
