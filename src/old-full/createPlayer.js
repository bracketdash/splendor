class Player {
  constructor(name) {
    this.name = name;
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

export default function createPlayer(name, getOptionScore) {
  return new Player(name, createDecider(getOptionScore));
}
