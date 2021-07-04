import Decider from "./class.Decider.js";

export default new Decider(function (player, gameState, option) {
  return Math.random() * 100;
});
