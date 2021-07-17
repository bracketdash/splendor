class CharacterCard {
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

  getBonus() {
    return this.bonus;
  }

  getCost() {
    return this.cost;
  }

  getInfinityPoints() {
    return this.infinityPoints;
  }

  getLevel() {
    return this.level;
  }

  getName() {
    return this.name;
  }

  getNumAvengersTags() {
    return this.avengersTags;
  }
}

export default function createCard(data) {
  return new CharacterCard(data);
}
