import Game from "../game.js";

// BEGIN CONFIG

const BEST_OUT_OF = 3; // must be an odd number

const POSSIBLE_WEIGHTS = [
  [0, 1, 2, 3], // avengers tile points
  [0, 1, 2, 3], // location tile points
  [0, 1, 2, 3], // if move would complete "one of each color"
  [0, 1, 2, 3], // if move would get them closer to "one of each color"
  [3, 4, 5, 6], // if move would get them the time stone
  [2, 3, 4, 5], // the "closer to time stone" multiplier
  [7, 8, 9], // recruit multiplier
  [2, 3], // reserve divisor
];

// END CONFIG

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

const weightMaxIndexes = POSSIBLE_WEIGHTS.map((vals, indx) => {
  return indx === POSSIBLE_WEIGHTS.length - 1 ? vals[1] : vals[0];
});

let game = new Game(players);
let outOf = 1;

function iterateWeights(loserIndex) {
  // TODO: iterate the loser's weights
  // (starting from whichever of the two players have the most advanced weights)
  // TODO: return true if weights were able to be iterated
  // TODO: return false if we can't iterate the weights anymore (i.e. training is over)
}

function startNewGame(reset) {
  if (reset) {
    outOf = 1;
    players[0].wins = 0;
    players[1].wins = 0;
  }
  game = new Game(players);
}

(function looper() {
  const state = game.getState();
  if (state.gameOver) {
    if (outOf < BEST_OUT_OF) {
      // TODO: determine the winner (set winnerIndex)
      // TODO: if both are winners, make them play an extra game (don't count this one)
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
          .sort((a, b) => (a.score > b.score ? -1 : 1))[0]
      )
      .then(looper);
  } else {
    console.log("state.options[0]:");
    console.log(state.options[0]);
    throw new Error("Fin.");
  }
})();
