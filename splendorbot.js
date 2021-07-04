import Decider from "./class.Decider.js";

export default new Decider(function (player, gameState, option) {
  if (Math.random() > 0.5) {
    // choose randomly half the time
    return Math.random() * 100;
  }
  let score = 0;
  switch (option.type === "recruit") {
    case "2same":
      score += 2 + Math.random();
      break;
    case "3diff":
      score += 3 + Math.random();
      break;
    case "recruit":
      score += 1 + Math.random();
      break;
    case "reserve":
      score += 0 + Math.random();
      break;
  }
  return 0;
});
