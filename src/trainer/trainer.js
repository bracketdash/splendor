import Game from "../game.js";

const BEST_OUT_OF = 3; // must be an odd number

const POSSIBLE_WEIGHTS = [
  [1, 2, 3], // avengers tile points
  [1, 2, 3], // location tile points
  [1, 2, 3], // if move would complete "one of each color"
  [1, 2, 3], // if move would get them closer to "one of each color"
  [3, 4, 5, 6], // if move would get them the time stone
  [2, 3, 4, 5], // the "closer to time stone" multiplier
  [7, 8, 9], // recruit multiplier
  [2, 3], // reserve divisor
];

const players = [1, 2].map((playerNum, playerIndex) => ({
  name: `P${playerNum}`,
  wins: 0,
  weights: POSSIBLE_WEIGHTS.map((vals, indx) => {
    if (indx === POSSIBLE_WEIGHTS.length - 1 && playerIndex) {
      return vals[1];
    }
    return vals[0];
  }),
}));

const weightIndexes = POSSIBLE_WEIGHTS.map((_, i) => {
  return i === POSSIBLE_WEIGHTS.length - 1 ? 1 : 0;
});

const weightMaxIndexes = POSSIBLE_WEIGHTS.map((v) => v.length);

let game = new Game(players);
let outOf = 1;

looper();

function iterateWeights(loserIndex) {
  console.log(weightIndexes);
  const findPlace = (place) => {
    if (place < 0) {
      return false;
    }
    if (weightIndexes[place] < weightMaxIndexes[place]) {
      return place;
    }
    weightIndexes[place] = 0;
    return findPlace(place - 1);
  };
  const place = findPlace(POSSIBLE_WEIGHTS.length - 1);
  if (!place) {
    return false;
  }
  weightIndexes[place]++;
  players[loserIndex].weights = weightIndexes.map(
    (valIndex, weightIndex) => POSSIBLE_WEIGHTS[weightIndex][valIndex]
  );
  return true;
}

function startNewGame(reset) {
  if (reset) {
    outOf = 1;
    players[0].wins = 0;
    players[1].wins = 0;
  }
  game = new Game(players);
  looper();
}

function looper(newState) {
  const state = newState || game.getState(false, true);

  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write(
    `${players[0].weights.join(",")} v ${players[1].weights.join(",")}`
  );

  if (state.gameOver) {
    if (outOf < BEST_OUT_OF) {
      let winnerIndex = 0;
      if (players[0].meetsWinCriteria && players[1].meetsWinCriteria) {
        winnerIndex =
          game.getPoints(players[1]) >= game.getPoints(players[0]) ? 1 : 0;
      } else if (players[1].meetsWinCriteria) {
        winnerIndex = 1;
      }
      outOf++;
      players[winnerIndex].wins++;
      startNewGame();
    } else {
      const loserIndex = players[0].wins > players[1].wins ? 0 : 1;
      if (iterateWeights(loserIndex)) {
        startNewGame(true);
      } else {
        console.log(
          `Training complete. Best weights: ${players[
            loserIndex ? 0 : 1
          ].weights.join(",")}`
        );
      }
    }
  } else if (state.options.length && state.options[0].type !== "skip") {
    game
      .makeMove(
        Object.keys(state.options)
          .reduce((arr, key) => arr.concat(state.options[key]), [])
          .sort((a, b) => (a.score > b.score ? -1 : 1))[0],
        true
      )
      .then((newState) => looper(newState));
  } else {
    console.log("\n\nstate.options:");
    console.log(state.options);
    throw new Error("Fin.");
  }
}