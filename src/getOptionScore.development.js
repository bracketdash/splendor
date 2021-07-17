const WEIGHTS = global.WEIGHTS; // set in scripts/trainer.js

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
  const infinityScore = card.getInfinityPoints() * WEIGHTS.cardPoints;
  const avangersTagScore = card.getNumAvengersTags() * WEIGHTS.avengersTags;
  const recruits = player.getRecruits();
  const cardBonus = card.getBonus();
  let bonusScore = WEIGHTS.wouldBeFirstOfColor;
  let greenScore = WEIGHTS.wouldGetTimeStone;
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
  let score = 1;

  if (option.location) {
    score += WEIGHTS.wouldGetLocation;
  }

  if (option.type === "recruit" || option.type === "reserve") {
    if (option.level === "reserves") {
      card = player.getReserves()[option.index];
    } else {
      card = gameState.freeAgents[option.level - 1][option.index];
    }
    score += getCardScore(card, player);
  }

  if (
    option.type !== "reserve" ||
    !gameState.ownerTracker.tokens.gray.some((owner) => owner === null)
  ) {
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
    } else if (option.type === "recruit") {
      const cardBonus = card.getBonus();
      if (!proposedTokens[cardBonus]) {
        proposedTokens[cardBonus] = 1;
      } else {
        proposedTokens[cardBonus] += 1;
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

    score +=
      (affordapointsAfter - affordapointsBefore) * WEIGHTS.affordapointsDiff;
  }

  score *=
    WEIGHTS[
      `mult${option.type.substring(0, 1).toUpperCase()}${option.type.substring(
        1
      )}`
    ];

  return score;
}
