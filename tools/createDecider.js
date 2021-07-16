class Decider {
  constructor(getOptionScore) {
    this.getOptionScore = getOptionScore;
  }

  addRecruitOptionIfApplicable({
    allOptions,
    characterCard,
    index,
    locationTiles,
    playerBonuses,
    playerTokens,
    rowIndex,
  }) {
    const level = rowIndex === "reserves" ? "reserves" : rowIndex + 1;

    let playerCanAffordCard = true;
    let grayTokensLeft = playerTokens.gray || 0;

    const cardCost = characterCard.getCost();

    Object.keys(cardCost).forEach((color) => {
      const tokensOfColor = playerTokens[color] || 0;
      const bonusesOfColor = playerBonuses[color] || 0;
      const needed = cardCost[color] - (tokensOfColor + bonusesOfColor);
      if (needed > 0) {
        if (grayTokensLeft < needed) {
          playerCanAffordCard = false;
        } else {
          grayTokensLeft -= needed;
        }
      }
    });

    if (!playerCanAffordCard) {
      return;
    } else {
    }

    const locationOptions = [];
    locationTiles.forEach((locationTile) => {
      if (locationTile.getOwner() === null) {
        if (
          Object.keys(locationTile.cost).every(
            (color) =>
              playerBonuses[color] &&
              playerBonuses[color] >= locationTile.cost[color]
          )
        ) {
          locationOptions.push(locationTile);
        }
      }
    });

    if (locationOptions.length && locationOptions.length > 1) {
      locationOptions.forEach((location) => {
        allOptions.push({ type: "recruit", level, index, location });
      });
    } else {
      allOptions.push({ type: "recruit", level, index });
    }
  }

  getDecision(player, gameState) {
    const allOptions = [];

    const playerTokens = {};
    Object.keys(gameState.ownerTracker.tokens).forEach((color) => {
      gameState.ownerTracker.tokens[color].forEach((owner) => {
        if (owner === player) {
          if (!playerTokens[color]) {
            playerTokens[color] = 1;
          } else {
            playerTokens[color]++;
          }
        }
      });
    });

    const playerBonuses = player.getRecruits().reduce((bonuses, cc) => {
      const bonus = cc.getBonus();
      if (!bonuses[bonus]) {
        bonuses[bonus] = 1;
      } else {
        bonuses[bonus]++;
      }
      return bonuses;
    }, {});

    const numPlayerTokens = Object.values(playerTokens).reduce(
      (a, b) => a + b,
      0
    );
    const atMaxReserves = player.getReserves().length === 3;

    const unownedTokens = {};
    Object.keys(gameState.ownerTracker.tokens).forEach((color) => {
      if (color === "gray") {
        return;
      }
      const unowned = gameState.ownerTracker.tokens[color].filter(
        (owner) => owner === null
      ).length;
      if (unowned) {
        unownedTokens[color] = unowned;
        if (unowned > 3 && numPlayerTokens < 9) {
          allOptions.push({ type: "2same", tokens: [color, color] });
        }
      }
    });

    const unownedColors = Object.keys(unownedTokens);
    if (unownedColors.length && numPlayerTokens < 10) {
      const threeDiffLoop = function (n, src, combo) {
        if (n === 0) {
          if (combo.length && numPlayerTokens < 11 - combo.length) {
            allOptions.push({ type: "3diff", tokens: combo });
          }
          return;
        }
        for (var j = 0; j < src.length; j++) {
          threeDiffLoop(n - 1, src.slice(j + 1), combo.concat([src[j]]));
        }
        return;
      };
      threeDiffLoop(3, unownedColors, []);
      threeDiffLoop(2, unownedColors, []);
      threeDiffLoop(1, unownedColors, []);
    }

    const recruitConfig = {
      allOptions,
      locationTiles: gameState.locationTiles,
      playerBonuses,
      playerTokens,
    };
    gameState.freeAgents.forEach((row, rowIndex) => {
      row.forEach((characterCard, index) => {
        if (characterCard !== null) {
          this.addRecruitOptionIfApplicable(
            Object.assign({}, recruitConfig, {
              characterCard,
              index,
              rowIndex,
            })
          );
          if (!atMaxReserves) {
            allOptions.push({ type: "reserve", level: rowIndex + 1, index });
          }
        }
      });
    });
    player.getReserves().forEach((characterCard, index) => {
      this.addRecruitOptionIfApplicable(
        Object.assign({}, recruitConfig, {
          characterCard,
          index,
          rowIndex: "reserves",
        })
      );
    });

    if (!allOptions.length) {
      return { type: "skip" };
    }

    const scoredOptions = allOptions.map((option) => ({
      option,
      score: this.getOptionScore(player, gameState, option),
    }));
    scoredOptions.sort((a, b) => (a.score > b.score ? -1 : 1));
    scoredOptions[0].option.player = player;

    return scoredOptions[0].option;
  }
}

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

export default function createDecider() {
  return new Decider(function (player, gameState, option) {
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
  });
}