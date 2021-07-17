class LocationTile {
  constructor({ cost, infinityPoints, name }) {
    Object.assign(this, {
      cost,
      infinityPoints,
      name,
      owner: null,
    });
  }

  getCost() {
    return this.cost;
  }

  getInfinityPoints() {
    return this.infinityPoints;
  }

  getName() {
    return this.name;
  }

  getOwner() {
    return this.owner;
  }

  setOwner(player) {
    this.owner = player;
  }
}

export default function createLocation(data) {
  return new LocationTile(data);
}
