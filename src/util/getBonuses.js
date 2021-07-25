export default function getBonuses(player, recruits) {
  return Object.assign(
    Object.keys(player.tokens).reduce((tokens, color) => {
      tokens[color] = 0;
      return tokens;
    }, {}),
    (recruits || player.recruits).reduce((bonuses, cc) => {
      const bonus = cc.bonus;
      if (!bonuses[bonus]) {
        bonuses[bonus] = 1;
      } else {
        bonuses[bonus]++;
      }
      return bonuses;
    }, {})
  );
}
