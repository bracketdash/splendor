import getBonuses from "./getBonuses.js";

export default function canAfford(player, cost, wallet) {
  let graysLeft = wallet ? wallet.gray : player.tokens.gray;
  return !Object.keys(cost).some((color) => {
    if (wallet) {
      if (cost[color] > wallet[color]) {
        if (graysLeft >= cost[color] - wallet[color]) {
          graysLeft -= cost[color] - wallet[color];
          return false;
        }
        return true;
      } else {
        return false;
      }
    } else {
      const bonusesOfColor = getBonuses(player)[color] || 0;
      if (cost[color] > player.tokens[color] + bonusesOfColor) {
        if (
          graysLeft >=
          cost[color] - (player.tokens[color] + bonusesOfColor)
        ) {
          graysLeft -= cost[color] - (player.tokens[color] + bonusesOfColor);
          return false;
        }
        return true;
      } else {
        return false;
      }
    }
  });
}
