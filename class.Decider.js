export default class Decider {
  constructor(getDecisionCallback) {
    this.getDecisionCallback = getDecisionCallback;
  }

  getDecision(game) {
    return this.getDecisionCallback(game);
  }
}
