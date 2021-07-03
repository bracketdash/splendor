import Player from "./class.Player.js";
import Game from "./class.Game.js";

import bob from "./ai.bob.js";
// import laurie from "./ai.laurie.js";
// import omar from "./ai.omar.js";
// import steve from "./ai.steve.js";

const players = [
  new Player("Bob", bob),
  new Player("Laurie", bob),
  // new Player("Omar", omar),
  // new Player("Steve", steve),
];

const endGameCallback = function (gameState, playerStats) {
  console.log(gameState);
  console.log(playerStats);
};

const game = new Game(players, endGameCallback);

game.start();
