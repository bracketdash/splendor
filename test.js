import Game from "./class.Game.js";
import Player from "./class.Player.js";

import bob from "./splendorbot.js";
import laurie from "./splendorbot.js";

const players = [
  new Player("Bob", bob),
  new Player("Laurie", laurie),
  // new Player("Omar", splendorbot),
  // new Player("Steve", splendorbot),
];

const endGameCallback = function (gameState, playerStats) {
  console.log(playerStats);
};

const game = new Game(players, endGameCallback);

game.start();

// TODO: make a UI, and allow human players
