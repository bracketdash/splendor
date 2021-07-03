export default class Decider {
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
      const needed = cardCost[color] - tokensOfColor + bonusesOfColor;
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
    if (
      unownedColors.length &&
      unownedColors.length < 4 &&
      numPlayerTokens < 11 - unownedColors.length
    ) {
      allOptions.push({ type: "3diff", tokens: unownedColors });
    } else if (unownedColors.length > 3) {
      const threeDiffLoop = function (n, src, combo) {
        if (n === 0) {
          if (combo.length && numPlayerTokens < 8) {
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

    const scoredOptions = allOptions.map((option) => ({
      option,
      score: this.getOptionScore(player, gameState, option),
    }));
    scoredOptions.sort((a, b) => (a.score > b.score ? -1 : 1));
    scoredOptions[0].option.player = player;

    return scoredOptions[0].option;
  }
}
