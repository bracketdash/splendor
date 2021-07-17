// TODO: remove points, weighted, from recruitment option if tokens before vs after would give
// them fewer options next turn (or vice versa is they can afford more with the added bonus)
// use affordapointsBefore & affordapointsAfter logic

// TODO: make colorScores{color: score} - scores the need for each color based on freeAgents (not weighted)
// maybe integrate affordapointsBefore & affordapointsAfter logic?
// TODO: add weighted points based on colorScores in getCardScore() based on card bonus
// TODO: add weighted points based on colorScores in "if (tokensHaveChanged)" block

// TODO: redo training
// TODO: find a way to weight lift using next-app code instead of node-app code so we don't have to maintain both

const WEIGHTS = {
  affordapointsDiff: 1.5,
  avengersTags: 0.9,
  cardPoints: 0.9,
  mult2same: 1.2,
  mult3diff: 2,
  multRecruit: 1.2,
  multReserve: 0,
  wouldBeFirstOfColor: 1.5,
  wouldGetLocation: 3,
  wouldGetTimeStone: 1.8,
};

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
  let tokensHaveChanged = false;

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
    score +=
      (affordapointsAfter - affordapointsBefore) * WEIGHTS.affordapointsDiff;
  }

  return (
    score *
    WEIGHTS[`mult${option.type.substring(0, 1).toUpperCase()}${option.type}`]
  );
}
