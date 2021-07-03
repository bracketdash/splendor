export default class Player {
  constructor(name) {
    this.name = name;
    this.recruits = [];
    this.reserves = [];
  }

  assignReserve(characterCard) {
    this.reserves.push(characterCard);
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
