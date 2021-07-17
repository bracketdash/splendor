import createDecider from "./createDecider.js";

class Player {
  constructor(name, ai) {
    this.name = name;
    this.ai = ai;
    this.recruits = [];
    this.reserves = [];
  }

  assignRecruit(characterCard) {
    this.recruits.push(characterCard);
  }

  assignReserve(characterCard) {
    this.reserves.push(characterCard);
  }

  getName() {
    return this.name;
  }

  getOptions(player, gameState) {
    return this.ai.getOptions(player, gameState);
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

  reset() {
    this.recruits = [];
    this.reserves = [];
  }
}

export default function createPlayer(name, getOptionScore) {
  return new Player(name, createDecider(getOptionScore));
}
