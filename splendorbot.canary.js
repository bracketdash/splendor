import Decider from "./class.Decider.js";

if (!global.weights) {
  global.weights = [0.2, 0.2, 0.2, 0.8, 0.4, 2.4, 0.4, 1.8, 2.4];
}

function canAfford(card, tokens) {
  if (!card) {
    return false;
  }
  // TODO: account for gray tokens
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
  const infinityScore = card.getInfinityPoints() * global.weights[0];
  const avangersTagScore = card.getNumAvengersTags() * global.weights[1];
  // TODO: add a couple points if the card would give us a bonus color we need
  const bonusScore = 0 * global.weights[2];
  // TODO: add a couple points if the card is level 3 and we don't yet have a level 3 card
  const greenScore = 0 * global.weights[3];
  return infinityScore + avangersTagScore + bonusScore + greenScore;
}

export default new Decider(function (player, gameState, option) {
  const proposedTokens = {};
  const allCards = gameState.freeAgents[0]
    .concat(gameState.freeAgents[1])
    .concat(gameState.freeAgents[2])
    .concat(player.getReserves());

  let card;
  let score = 0;
  let tokensHaveChanged = false;

  if (option.type === "recruit" || option.type === "reserve") {
    if (option.level === "reserves") {
      card = player.getReserves()[option.index];
    } else {
      card = gameState.freeAgents[option.level - 1][option.index];
    }
    score += getCardScore(card);
    tokensHaveChanged = gameState.ownerTracker.tokens.gray.some(
      (owner) => owner === null
    );
  } else {
    tokensHaveChanged = true;
  }

  if (tokensHaveChanged) {
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
    const affordapointsBefore = allCards
      .filter((c) => canAfford(c, proposedTokens))
      .map((c) => getCardScore(c))
      .reduce((a, c) => a + c, 0);

    if (option.type === "reserve") {
      if (!proposedTokens.gray) {
        proposedTokens.gray = 1;
      } else {
        proposedTokens.gray += 1;
      }
    } else if (option.tokens) {
      option.tokens.forEach((color) => {
        if (!proposedTokens[color]) {
          proposedTokens[color] = 1;
        } else {
          proposedTokens[color] += 1;
        }
      });
    }

    const affordapointsAfter = allCards
      .filter((c) => canAfford(c, proposedTokens))
      .map((c) => getCardScore(c))
      .reduce((a, c) => a + c, 0);
    score += (affordapointsAfter - affordapointsBefore) * global.weights[4];
  }

  const typeMultiplier = {
    recruit: global.weights[5],
    reserve: global.weights[6],
    "3diff": global.weights[7],
    "2same": global.weights[8],
  };

  return score * typeMultiplier[option.type];
});
