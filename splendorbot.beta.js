import Decider from "./class.Decider.js";

function getCardScore(card) {
  let cardScore = card.getInfinityPoints() + card.getNumAvengersTags();
  // TODO: add a couple points if the card would give us a bonus color we need
  return cardScore;
}

export default new Decider(function (player, gameState, option) {
  let card;
  let score = 0;
  switch (option.type) {
    case "recruit":
      score += 5;
    case "reserve":
      if (option.level === "reserves") {
        card = player.getReserves()[option.index];
      } else {
        card = gameState.freeAgents[option.level - 1][option.index];
      }
      score += getCardScore(card);
      break;
    case "3diff":
    case "2same":
      // TODO: score += (token score);
      break;
  }

  return score;
});
