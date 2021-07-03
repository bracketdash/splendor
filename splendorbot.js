import Decider from "./class.Decider.js";

export default new Decider(function (player, gameState, option) {
  // TODO: score option by analyzing player and gameState data

  // TESTING: random decision-making
  return Math.round(Math.random()*1000);
});
