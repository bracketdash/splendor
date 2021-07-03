export default class Decider {
  constructor(getOptionScore) {
    this.getOptionScore = getOptionScore;
  }

  getDecision(player, gameState) {
    const allOptions = [];

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
        if (unowned > 3) {
          allOptions.push({ type: "2same", tokens: [color, color] });
        }
      }
    });
    const unownedColors = Object.keys(unownedTokens);
    if (unownedColors.length && unownedColors.length < 4) {
      allOptions.push({ type: "3diff", tokens: unownedColors });
    } else if (unownedColors.length > 3) {
      const threeDiffLoop = function (n, src, combo) {
        if (n === 0) {
          if (combo.length) {
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
          allOptions.push({ type: "recruit", level: rowIndex + 1, index });
          allOptions.push({ type: "reserve", level: rowIndex + 1, index });
        }
      });
    });
    player.getReserves().forEach((_, index) => {
      allOptions.push({ type: "recruit", level: "reserves", index });
    });

    const scoredOptions = allOptions.map((option) => ({
      option,
      score: this.getOptionScore(player, gameState, option),
    }));
    scoredOptions.sort((a, b) => (a.score > b.score ? -1 : 1));

    // TESTING
    // console.log(scoredOptions);
    // throw new Error("Done testing.");

    return scoredOptions[0];
  }
}
