export default class Decider {
  constructor(getOptionScore) {
    this.getOptionScore = getOptionScore;
  }

  getDecision(player, gameState) {
    const allOptions = [];

    const unownedTokens = {};
    Object.keys(ownerTracker.tokens).forEach((color) => {
      const unowned = ownerTracker.tokens[color].filter(
        (owner) => owner === null
      ).length;
      if (unowned.length) {
        unownedTokens[color] = unowned.length;
        if (unowned.length > 3) {
          allOptions.push({ type: "2same", tokens: [color, color] });
        }
      }
    });
    const unownedColors = Object.keys(unownedTokens);
    if (unownedColors.length && unownedColors.length < 4) {
      allOptions.push({ type: "3diff", tokens: unownedColors });
    } else if (unownedColors.length > 3) {
      const threeDiffLoop = function (n, src, got) {
        if (n == 0) {
          if (got.length > 0) {
            allOptions.push({ type: "3diff", tokens: got });
          }
          return;
        }
        for (var j = 0; j < src.length; j++) {
          threeDiffLoop(n - 1, src.slice(j + 1), got.concat([src[j]]));
        }
        return;
      };
      threeDiffLoop(3, unownedColors, []);
    }

    // TODO: loop through freeAgents:
    //    { type: "reserve", level, index }
    //    { type: "recruit", level, index }
    Array(player.getReserves().length)
      .fill(null)
      .forEach((_, index) => {
        allOptions.push({ type: "recruit", level: "reserves", index });
      });

    const scoredOptions = allOptions.map((option) => ({
      option,
      score: this.getOptionScore(player, gameState, option),
    }));
    scoredOptions.sort((a, b) => (a.score > b.score ? 1 : -1));
    return scoredOptions[0];
  }
}
