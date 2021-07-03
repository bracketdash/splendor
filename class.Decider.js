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
      }
    });
    // TODO: 3diff (all combos of 3 different colors that can be made with unowned tokens)
    //    { type: "3diff", colors: ["blue", "red", "yellow"] }
    // TODO: 2same (each color with at least 4 unowned)
    //    { type: "2same", colors: ["purple", "purple"] }

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
