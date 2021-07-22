import fs from "fs";
import Game from "./game.js";

// a contendor: 1,1,3,2,4,5,3
// a contendor: 1,1,1,3,4,4,5

const GAMES_PER_WEIGHT_SET = 60;
const MAX_AVG_ROUNDS = 34;

const ITERATE_OVER_INPUT_FILE = true;

const MIN_WEIGHT = 1;
const INCREMENT_AMOUNT = 1;
const MAX_WEIGHT = 5;

const weights = {
  affordaScore: 1,
  afterStateAllColors: 1,
  afterStateFirstOfColor: 1,
  afterStatePoints: 1,
  afterStateTimeStone: 1,
  closerToAffording: 1,
  closerToTimeStone: 1,
};

const winners = [];
if (ITERATE_OVER_INPUT_FILE) {
  Object.keys(JSON.parse(fs.readFileSync("src/lite/input.json"))).forEach(
    (key) => {
      const v = key.split(",").map((n) => parseFloat(n));
      winners.push({
        afterStateAllColors: v[0],
        afterStateFirstOfColor: v[1],
        afterStatePoints: v[2],
        afterStateTimeStone: v[3],
        closerToAffording: v[4],
        closerToTimeStone: v[5],
      });
    }
  );
  Object.assign(weights, winners[0]);
}

const weightKeys = Object.keys(weights);

let winnerIndex = 1;

function newGameOrDone(keepGoing) {
  if (keepGoing) {
    game = new Game(weights);
    game.makeMove(game.getState().options[0]).then((state) => {
      continueGame(state.options[0]);
    });
    return true;
  } else {
    console.log("Training complete.");
    fs.writeFile(
      "src/lite/output.json",
      JSON.stringify(weightCombos),
      (err) => {
        if (err) {
          console.error(err);
          return;
        }
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        console.log("Results saved to output.json");
      }
    );
    return false;
  }
}

function tryIncrementWeights() {
  if (ITERATE_OVER_INPUT_FILE) {
    Object.assign(weights, winners[winnerIndex]);
    winnerIndex++;
    return newGameOrDone(winnerIndex < winners.length + 1);
  }
  const looper = function (place) {
    if (place < 0) {
      return false;
    }
    if (weights[weightKeys[place]] === MAX_WEIGHT) {
      weights[weightKeys[place]] = MIN_WEIGHT;
      return looper(place - 1);
    }
    weights[weightKeys[place]] += INCREMENT_AMOUNT;
    return true;
  };
  return newGameOrDone(looper(weightKeys.length - 1));
}

const weightCombos = {};

let currentGameNum = 1;
let game;
let skips = 0;

function continueGame(decision) {
  if (decision.type === "skip") {
    skips++;
    if (skips > 30) {
      skips = 0;
      if (currentGameNum >= GAMES_PER_WEIGHT_SET) {
        currentGameNum = 0;
        const comboStr = Object.values(weights).join(",");
        if (
          weightCombos[comboStr].rounds / weightCombos[comboStr].games >
          MAX_AVG_ROUNDS
        ) {
          delete weightCombos[comboStr];
        }
        tryIncrementWeights();
      } else {
        currentGameNum++;
        game = new Game(weights);
        game.makeMove(game.getState().options[0]).then((state) => {
          continueGame(state.options[0]);
        });
      }
      return;
    }
  }
  game.makeMove(decision).then((state) => {
    if (state.gameOver) {
      const comboStr = Object.values(weights).join(",");

      skips = 0;

      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      process.stdout.write(
        `${Object.keys(weightCombos).length} - ${Object.values(weights).join(
          ","
        )} - ${
          weightCombos[comboStr]
            ? (
                weightCombos[comboStr].rounds / weightCombos[comboStr].games
              ).toFixed(0)
            : "--"
        }`
      );

      if (!weightCombos[comboStr]) {
        weightCombos[comboStr] = { rounds: state.round, games: 1 };
      } else {
        weightCombos[comboStr].games++;
        weightCombos[comboStr].rounds += state.round;
      }

      if (currentGameNum >= GAMES_PER_WEIGHT_SET) {
        currentGameNum = 0;
        if (
          weightCombos[comboStr].rounds / weightCombos[comboStr].games >
          MAX_AVG_ROUNDS
        ) {
          delete weightCombos[comboStr];
        }
        tryIncrementWeights();
      } else {
        currentGameNum++;
        game = new Game(weights);
        game.makeMove(game.getState().options[0]).then((state) => {
          continueGame(state.options[0]);
        });
      }
    } else {
      continueGame(state.options[0]);
    }
  });
}

game = new Game(weights);
game.makeMove(game.getState().options[0]).then((state) => {
  continueGame(state.options[0]);
});
