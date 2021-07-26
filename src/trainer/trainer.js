import Game from "../game.js";

const BEST_OUT_OF = 21; // must be an odd number

const POSSIBLE_WEIGHTS = [
  [13.85, 13.9], // recruit multiplier
  [3.34, 3.35, 3.36, 3.37, 3.38, 3.39, 3.4], // reserve divisor
];

const players = [1, 2].map((n) => ({
  name: `P${n}`,
  wins: 0,
}));

players[0].weights = [13.9, 3.34];
players[1].weights = POSSIBLE_WEIGHTS.map((v) => v[0]);

const results = {};

const weightIndexes = POSSIBLE_WEIGHTS.map((_, i) => {
  return i === POSSIBLE_WEIGHTS.length - 1 ? 1 : 0;
});

const weightMaxIndexes = POSSIBLE_WEIGHTS.map((v) => v.length - 1);

let game = new Game(players);
let outOf = 1;

looper();

function iterateWeights() {
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
  if (place === false) {
    return false;
  }
  weightIndexes[place]++;
  players[1].weights = weightIndexes.map(
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
  if (state.gameOver) {
    let winnerIndex = 0;
    if (
      state.players[0].meetsWinCriteria &&
      state.players[1].meetsWinCriteria
    ) {
      winnerIndex =
        game.getPoints(state.players[1]) >= game.getPoints(state.players[0])
          ? 1
          : 0;
    } else if (state.players[1].meetsWinCriteria) {
      winnerIndex = 1;
    }
    players[winnerIndex].wins++;
    if (outOf < BEST_OUT_OF) {
      outOf++;
      startNewGame();
    } else {
      results[players[1].weights] = players[1].wins;
      if (iterateWeights()) {
        startNewGame(true);
      } else {
        console.log("\n\nTraining complete.");
        console.log(JSON.stringify(results));
      }
    }
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(
      `${game.players[0].weights.join(",")} (${
        players[0].wins
      }) v ${game.players[1].weights.join(",")} (${players[1].wins})`
    );
  } else if (state.options.length) {
    const bestMove = Object.keys(state.options)
      .reduce((arr, key) => arr.concat(state.options[key]), [])
      .sort((a, b) => (a.score > b.score ? -1 : 1))[0];
    game.makeMove(bestMove, true).then((newState) => looper(newState));
  } else {
    console.log("\n\nstate.options:");
    console.log(state.options);
    throw new Error("Fin.");
  }
}
