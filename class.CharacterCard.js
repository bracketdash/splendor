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
}
