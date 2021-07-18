import fs from "fs";

import createGame from "../createGame.js";
import createPlayer from "../createPlayer.js";

// TODO: switching to getOptionScore.development.js causes errors
import getOptionScoreDevelopment from "../getOptionScore.js";
import getOptionScoreBaseline from "../getOptionScore.baseline.js";

global.WEIGHTS = {
  affordapointsDiff: 1,
  avengersTags: 1,
  cardPoints: 1,
  mult2same: 1,
  mult3diff: 1,
  multRecruit: 1,
  multReserve: 1,
  wouldBeFirstOfColor: 1,
  wouldGetLocation: 1,
  wouldGetTimeStone: 1,
};

// 0 to have bot go first, 1 to have bot go second
// it is typically harder to win as the second player
const DEV_INDEX = 1;

// how many games to run:
// higher means more confidence in the weights you end up with, but takes longer to run
// lower run quickly, but provides less confidence
const GAMES_PER_WEIGHT_SET = 100;

// if too many wins are being recorded, make this closer to GAMES_PER_WEIGHT_SET
const MIN_RECORDING_SCORE = 90;

// you can ignore the next 3 constants if you set this to true
const ITERATE_OVER_INPUT_FILE = true;

// if you are running this on a high-end rig, you can adjust these values to find potentially smarter bots
const INCREMENT_AMOUNT = 1;
const MAX_WEIGHT = 2;
const MIN_WEIGHT = 1;

// create players

const players = [];
const baselinePlayer = createPlayer("Baseline", getOptionScoreBaseline);
const devPlayer = createPlayer("Dev", getOptionScoreDevelopment);
if (DEV_INDEX) {
  players.push(baselinePlayer);
  players.push(devPlayer);
} else {
  players.push(devPlayer);
  players.push(baselinePlayer);
}

// set up weights and increment function

const weightKeys = Object.keys(global.WEIGHTS);
const winners = [];

let winnerIndex = 1;

if (ITERATE_OVER_INPUT_FILE) {
  Object.keys(JSON.parse(fs.readFileSync("src/data/inputFile.json"))).forEach(
    (key) => {
      const v = key.split(",").map((n) => parseFloat(n));
      winners.push({
        affordapointsDiff: v[0],
        avengersTags: v[1],
        cardPoints: v[2],
        mult2same: v[3],
        mult3diff: v[4],
        multRecruit: v[5],
        multReserve: v[6],
        wouldBeFirstOfColor: v[7],
        wouldGetLocation: v[8],
        wouldGetTimeStone: v[9],
      });
    }
  );
}

function tryIncrementWeights() {
  if (ITERATE_OVER_INPUT_FILE) {
    global.WEIGHTS = winners[winnerIndex++];
    return winnerIndex < winners.length + 1;
  }
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
    `${Object.keys(weightComboWins).length} candidates -- ${
      winTally[DEV_INDEX]
    }/${currentGameNum} - ${Object.values(global.WEIGHTS).join(",")}`
  );

  if (currentGameNum === GAMES_PER_WEIGHT_SET) {
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
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
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
      // DEBUGGING
      if (state.options[0].type === "skip" && !state.playerStats) {
        console.log("\n\nFREE AGENTS:\n");
        console.log(state.freeAgents);// -- something is going on with freeagents...
        console.log(state.freeAgents[2]);// -- something is going on with freeagents...
        // console.log("\n\nTOKENS:\n");
        // console.log(state.ownerTracker.tokens);
        // console.log("\n\nPLAYERS:\n");
        // console.log(state.players[0]);
        // console.log(state.players[1]);
        // most common situation: neither player has a level 3 card, so neither qualifies
        // why are recruiting level 3 cards not coming through as options?
        // if the user cannot afford it, I find it hard to believe with how many recuirts they have
        // it can't be that there are no level 3 cards available because none have been reserved or recruited
        return;
      }

      continueGame(state.options[0]);
    }
  });
}

game = createGame(players);
game.makeMove(game.getState().options[0]).then((state) => {
  continueGame(state.options[0]);
});
