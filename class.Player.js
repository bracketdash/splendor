export default class Player {
  constructor(name, ai) {
    this.name = name;
    this.ai = ai;
    this.recruits = [];
    this.reserves = [];
  }

  assignReserve(characterCard) {
    this.reserves.push(characterCard);
  }

  getDecision(player, gameState) {
    return this.ai.getDecision(player, gameState);
  }

  getRecruits() {
    return this.recruits;
  }

  getReserve(index) {
    return this.reserves[index];
  }

  getReserves() {
    return this.reserves;
  }

  hasTimeStone() {
    return this.recruits.some((recruit) => recruit.getLevel() === 3);
  }

  removeReserve(index) {
    this.reserves.splice(index, 1);
  }
}
