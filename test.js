import Player from "./class.Player.js";
import Game from "./class.Game.js";

import bob from "./decider.bob.js";
import omar from "./decider.omar.js";
// import laurie from "./decider.laurie.js";
// import steve from "./decider.steve.js";

const game = new Game([
  new Player("Bob", bob),
  new Player("Omar", omar),
  //   new Player("Laurie", laurie),
  //   new Player("Steve", steve),
]);

console.log(game.debug());
