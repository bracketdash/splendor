import Game from "../game.js";

const BEST_OUT_OF = 3; // must be an odd number

// TODO: weights config (for each weight: starting value, max value, iteration amount)

const players = [
  { name: "P1", wins: 0 },
  { name: "P2", wins: 0 },
];

// TODO: set starting weights for each player

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
      // TODO: if both are winners, make them play an extra game (don't count this one)
      // TODO: winnerIndex = (the winner)
      players[winnerIndex].wins++;
      startNewGame();
    } else {
      const loserIndex = players[0].wins > players[1].wins ? 0 : 1;
      if (iterateWeights(loserIndex)) {
        startNewGame(true);
      } else {
        // TODO: handle when no more iterations are available (i.e. crown the champion)
      }
    }
    console.log("GAME OVER!");
    return;
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
