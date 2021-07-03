import Player from "./class.Player.js";
import Game from "./class.Game.js";

import bob from "./decider.bob.js";
import omar from "./decider.omar.js";
// import laurie from "./decider.laurie.js";
// import steve from "./decider.steve.js";

const players = [
  new Player("Bob", bob),
  new Player("Omar", omar),
  //   new Player("Laurie", laurie),
  //   new Player("Steve", steve),
];

const endGameCallback = function (gameState, playerStats) {
  console.log(gameState);
  console.log(playerStats);
};

const game = new Game(players, endGameCallback);

game.start();
