import Decider from "./class.Decider.js";

const weights = [8, 3, 4];

function canAfford(card, tokens) {
  if (!card) {
    return false;
  }
  const cost = card.getCost();
  let affordable = true;
  Object.keys(cost).forEach((color) => {
    if (!tokens[color] || cost[color] > tokens[color]) {
      affordable = false;
    }
  });
  return affordable;
}

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
      score += weights[0];
    case "reserve":
      score += weights[1];
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
      const allCards = gameState.freeAgents[0]
        .concat(gameState.freeAgents[1])
        .concat(gameState.freeAgents[2])
        .concat(player.getReserves());
      const affordapointsBefore = allCards
        .filter((c) => canAfford(c, proposedTokens))
        .map((c) => getCardScore(c))
        .reduce((a, c) => a + c, 0);
      option.tokens.forEach((color) => {
        if (!proposedTokens[color]) {
          proposedTokens[color] = 1;
        } else {
          proposedTokens[color] += 1;
        }
      });
      const affordapointsAfter = allCards
        .filter((c) => canAfford(c, proposedTokens))
        .map((c) => getCardScore(c))
        .reduce((a, c) => a + c, 0);
      score +=
        (affordapointsAfter - affordapointsBefore) / 2 + weights[2];
      break;
  }

  return score;
});
