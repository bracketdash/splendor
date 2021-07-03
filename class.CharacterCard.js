export default class CharacterCard {
  constructor({ avengersTags, bonus, cost, infinityPoints, level, name }) {
    Object.assign(this, {
      avengersTags,
      bonus,
      cost,
      infinityPoints,
      level,
      name,
    });
  }

  getInfinityPoints() {
    return this.infinityPoints;
  }

  getLevel() {
    return this.level;
  }
}
