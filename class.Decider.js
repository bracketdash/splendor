export default class Decider {
  constructor(getDecision) {
    this.getDecision = getDecision;
  }
  getDecision() {
    return this.getDecision();
  }
}
