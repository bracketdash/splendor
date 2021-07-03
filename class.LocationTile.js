export default class LocationTile {
  constructor({ cost, infinityPoints, name }) {
    Object.assign(this, {
      cost,
      infinityPoints,
      name,
      owner: null,
    });
  }

  getInfinityPoints() {
    return this.infinityPoints;
  }

  getOwner() {
    return this.owner;
  }

  setOwner(player) {
    this.owner = player;
  }
}
