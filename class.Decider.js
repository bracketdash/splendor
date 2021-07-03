export default class Decider {
  constructor(player, getOptionScore) {
    this.player = player;
    this.getOptionScore = getOptionScore;
  }

  getDecision(gameState) {
    // TODO: const allOptions (using gameState and this.player)
    const scoredOptions = allOptions.map((option) => ({
      option,
      score: this.getOptionScore(gameState, option),
    }));
    scoredOptions.sort((a, b) => (a.score > b.score ? 1 : -1));
    return scoredOptions[0];
  }
}
