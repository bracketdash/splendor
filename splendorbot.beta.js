import Decider from "./class.Decider.js";

const weights = [6, 7, 1];
// TODO: redo weights so there is a multiplier for every base value [0.0x - 2.9x]

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
  const infinityScore = card.getInfinityPoints() * 1; // TODO: add multiplier
  const avangersTagScore = card.getNumAvengersTags() * 1; // TODO: add multiplier
  // TODO: add a couple points if the card would give us a bonus color we need
  const bonusScore = 0 * 1; // TODO: add multiplier
  // TODO: add a couple points if the card is level 3 and we don't yet have a level 3 card
  const greenScore = 0 * 1; // TODO: add multiplier
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

  const typeMultiplier = {
    recruit: 1,
    reserve: 1,
    "3diff": 1,
    "2same": 1,
  };

  if (option.type === "recruit" || option.type === "reserve") {
    // TODO: remove this switch once the typeMultiplier is done
    switch (option.type) {
      case "recruit":
        score += weights[0];
      case "reserve":
        score += weights[1];
        break;
    }

    if (option.level === "reserves") {
      card = player.getReserves()[option.index];
    } else {
      card = gameState.freeAgents[option.level - 1][option.index];
    }
    score += getCardScore(card);
    if (true /* TODO: there are unassigned gray tokens */) {
      tokensHaveChanged = true;
    }
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
    score += (affordapointsAfter - affordapointsBefore) / 2 + weights[2];
  }

  return score * typeMultiplier[option.type];
});
