class LocationTile {
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