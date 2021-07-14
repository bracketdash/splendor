import Decider from "./class.Decider.js";

function getCardScore(card) {
  let cardScore = card.getInfinityPoints() + card.getNumAvengersTags();
  // TODO: add a couple points if the card would give us a bonus color we need
  // TODO: add a couple points if the card is level 3 and we don't yet have a level 3 card
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
      let proposedTokens = {};
      player.getRecruits().forEach((recruit) => {
        const bonus = recruit.getBonus();
        if (!proposedTokens[bonus]) {
          proposedTokens[bonus] = 1;
        } else {
          proposedTokens[bonus] += 1;
        }
      });
      Object.keys(gameState.ownerTracker.tokens).forEach((color) => {
        gameState.ownerTracker.tokens[color].forEach((owner) => {
          if (owner === player) {
            if (!proposedTokens[color]) {
              proposedTokens[color] = 1;
            } else {
              proposedTokens[color] += 1;
            }
          }
        });
      });
      // TODO: figure out the combined score of all the cards we can currently afford
      option.tokens.forEach((color) => {
        if (!proposedTokens[color]) {
          proposedTokens[color] = 1;
        } else {
          proposedTokens[color] += 1;
        }
      });
      // TODO: figure out the combined score of all the cards we can afford after adding the option.tokens
      // TODO: get the difference between the two combined scores
      // TODO: score += (the difference) / 2;
      break;
  }

  return score;
});
