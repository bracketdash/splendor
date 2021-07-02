export default class LocationTile {
  constructor({ cost, infinityPoints, name }) {
    Object.assign(this, {
      cost,
      infinityPoints,
      name,
      owner: null,
    });
  }
}
