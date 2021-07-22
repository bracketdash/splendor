import fs from "fs";
import Game from "./game.js";

const GAMES_PER_WEIGHT_SET = 10;
const INCREMENT_AMOUNT = 1;
const ITERATE_OVER_INPUT_FILE = false;
const MAX_WEIGHT = 4;
const MIN_WEIGHT = 1;

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
function tryIncrementWeights() {
  if (ITERATE_OVER_INPUT_FILE) {
    Object.assign(weights, winners[winnerIndex]);
    winnerIndex++;
    return winnerIndex < winners.length + 1;
  }
  const looper = function (place) {
    if (place < 0) {
      console.log("place < 0");
      return false;
    }
    if (weights[weightKeys[place]] === MAX_WEIGHT) {
      weights[weightKeys[place]] = MIN_WEIGHT;
      return looper(place - 1);
    }
    weights[weightKeys[place]] += INCREMENT_AMOUNT;
    return true;
  };
  if (looper(weightKeys.length - 1)) {
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

const weightCombos = {};

let currentGameNum = 1;
let game;
let skips = 0;

function continueGame(decision) {
  if (decision.type === "skip") {
    skips++;
    if (skips > 30) {
      // TODO: if bot has to skip 30 times, it's too stupid to survive
      // TODO: remove this candidate from the record and move onto the next
      skips = 0;
      currentGameNum = 0;
      const comboStr = Object.values(weights).join(",");
      if (weightCombos[comboStr]) {
        delete weightCombos[comboStr];
      }
      if (tryIncrementWeights()) {
        return;
      }
    }
  }
  game.makeMove(decision).then((state) => {
    if (state.gameOver) {
      skips = 0;
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      process.stdout.write(
        `${Object.keys(weightCombos).length} - ${Object.values(weights).join(
          ","
        )} - ${currentGameNum} - ${state.round}`
      );

      if (currentGameNum >= GAMES_PER_WEIGHT_SET) {
        currentGameNum = 0;

        const comboStr = Object.values(weights).join(",");
        if (!weightCombos[comboStr]) {
          weightCombos[comboStr] = state.round;
        } else {
          weightCombos[comboStr] += state.round;
        }

        tryIncrementWeights();
        return;
      }

      currentGameNum++;
      game = new Game(weights);
      game.makeMove(game.getState().options[0]).then((state) => {
        continueGame(state.options[0]);
      });
    } else {
      continueGame(state.options[0]);
    }
  });
}

game = new Game(weights);
game.makeMove(game.getState().options[0]).then((state) => {
  continueGame(state.options[0]);
});
