import Game from "./class.Game.js";
import Player from "./class.Player.js";
import splendorbot from "./splendorbot.js";

const players = [
  new Player("Bob", splendorbot),
  new Player("Laurie", splendorbot),
  // new Player("Omar", splendorbot),
  // new Player("Steve", splendorbot),
];

const endGameCallback = function (gameState, playerStats) {
  console.log(gameState);
  console.log(playerStats);
};

const game = new Game(players, endGameCallback);

game.start();

// TODO: make a UI, and allow human players
