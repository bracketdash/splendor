export default class Decider {
  constructor(getOptionScore) {
    this.getOptionScore = getOptionScore;
  }

  addRecruitOptionIfApplicable(rowIndex, index) {
    const level = rowIndex === "reserves" ? "reserves" : rowIndex + 1;
    // TODO: (don't add recruit options that player cannot buy) compare card cost to playerTokens
    // TODO: (don't add recruit options that player cannot buy) special cases for gray tokens
    // TODO: if option would qualify a player for multiple location tiles, make an option for each tile
    allOptions.push({ type: "recruit", level, index });
  }

  getDecision(player, gameState) {
    const allOptions = [];
    const playerTokens = {};
    // TODO: build a playerTokens object
    const numPlayerTokens = Object.values(playerTokens).reduce((a, b) => a + b);
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
    if (unownedColors.length && unownedColors.length < 4 && numPlayerTokens < (11 - unownedColors.length)) {
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

    gameState.freeAgents.forEach((row, rowIndex) => {
      row.forEach((characterCard, index) => {
        if (characterCard !== null) {
          this.addRecruitOptionIfApplicable(allOptions, rowIndex, index);
          if (!atMaxReserves) {
            allOptions.push({ type: "reserve", level: rowIndex + 1, index });
          }
        }
      });
    });
    player.getReserves().forEach((_, index) => {
      this.addRecruitOptionIfApplicable(allOptions, "reserves", index);
    });

    // TESTING
    console.log(allOptions);
    throw new Error("Done testing.");

    const scoredOptions = allOptions.map((option) => ({
      option,
      score: this.getOptionScore(player, gameState, option),
    }));
    scoredOptions.sort((a, b) => (a.score > b.score ? -1 : 1));
    scoredOptions[0].option.player = player;

    return scoredOptions[0].option;
  }
}
