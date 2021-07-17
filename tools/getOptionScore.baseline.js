const weights = [0.9, 0.9, 1.5, 1.8, 1.5, 1.2, 0.0, 2.0, 1.2];

function canAfford(card, tokens) {
  if (!card) {
    return false;
  }
  let grays = tokens.gray || 0;
  const cost = card.getCost();
  let affordable = true;
  Object.keys(cost).forEach((color) => {
    if (!tokens[color] || cost[color] > tokens[color]) {
      const needed = cost[color] - (tokens[color] || 0);
      if (grays > needed) {
        grays -= needed;
      } else {
        affordable = false;
      }
    }
  });
  return affordable;
}

function getCardScore(card, player) {
  const infinityScore = card.getInfinityPoints() * weights[0];
  const avangersTagScore = card.getNumAvengersTags() * weights[1];
  const recruits = player.getRecruits();
  const cardBonus = card.getBonus();
  let bonusScore = weights[2];
  let greenScore = weights[3];
  recruits.forEach((recruit) => {
    if (cardBonus === recruit.getBonus()) {
      bonusScore = 0;
    }
    if (recruit.getLevel() === 3) {
      greenScore = 0;
    }
  });
  return infinityScore + avangersTagScore + bonusScore + greenScore;
}

export default function getOptionScore(player, gameState, option) {
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
    score += getCardScore(card, player);
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
      .map((c) => getCardScore(c, player))
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
      .map((c) => getCardScore(c, player))
      .reduce((a, c) => a + c, 0);
    score += (affordapointsAfter - affordapointsBefore) * weights[4];
  }

  const typeMultiplier = {
    recruit: weights[5],
    reserve: weights[6],
    "3diff": weights[7],
    "2same": weights[8],
  };

  return score * typeMultiplier[option.type];
}
