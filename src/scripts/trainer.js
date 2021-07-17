import fs from "fs";

import createGame from "../createGame.js";
import createPlayer from "../createPlayer.js";

import getOptionScore from "../getOptionScore.development.js";
import getOptionScoreBaseline from "../getOptionScore.baseline.js";

global.WEIGHTS = {
  affordapointsDiff: 0.5,
  avengersTags: 0.5,
  cardPoints: 0.5,
  mult2same: 0.5,
  mult3diff: 0.5,
  multRecruit: 0.5,
  multReserve: 0.5,
  wouldBeFirstOfColor: 0.5,
  wouldGetLocation: 0.5,
  wouldGetTimeStone: 0.5,
};

// 0 to have bot go first, 1 to have bot go second
// it is typically harder to win as the second player
const DEV_INDEX = 1;

// how many games to run:
// higher means more confidence in the weights you end up with, but takes longer to run
// lower run quickly, but provides less confidence
const GAMES_PER_WEIGHT_SET = 2;

// if too many wins are being recorded, make this closer to GAMES_PER_WEIGHT_SET
const MIN_RECORDING_SCORE = 1;

// if you are running this on a high-end rig, you can adjust these values to find potentially smarter bots
const INCREMENT_AMOUNT = 0.5;
const MAX_WEIGHT = 1.5;
const MIN_WEIGHT = 0.5;

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

const weightKeys = Object.keys(global.WEIGHTS);

function tryIncrementWeights() {
  const looper = function (place) {
    if (place < 0) {
      return false;
    }
    if (global.WEIGHTS[weightKeys[place]] === MAX_WEIGHT) {
      global.WEIGHTS[weightKeys[place]] = MIN_WEIGHT;
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
    `${Object.keys(weightComboWins).length} champions found -- ${
      winTally[DEV_INDEX]
    }/${currentGameNum} - ${Object.values(global.WEIGHTS).join(",")}`
  );

  if (
    currentGameNum === GAMES_PER_WEIGHT_SET - 1 ||
    winTally[DEV_INDEX] > MIN_RECORDING_SCORE ||
    winTally[DEV_INDEX] <
      MIN_RECORDING_SCORE - (GAMES_PER_WEIGHT_SET - currentGameNum)
  ) {
    currentGameNum = 0;
    if (winTally[DEV_INDEX] > MIN_RECORDING_SCORE) {
      weightComboWins[Object.values(global.WEIGHTS).join(",")] =
        winTally[DEV_INDEX];
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

    fs.writeFile(
      "src/data/winners.json",
      JSON.stringify(weightComboWins),
      (err) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log(
          "Training complete. Winners saved to src/data/winners.json"
        );
      }
    );

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
