export default function getPPD({
  afterBonuses,
  afterState,
  card,
  currentBonuses,
  player,
}) {
  let afterPurchasingPower = 0;
  let currentPurchasingPower = 0;
  Object.keys(card.cost).forEach((color) => {
    const afterBonus = afterBonuses[color];
    const afterTokens = card.cost[color] - afterBonus;
    const currentBonus = currentBonuses[color];
    const currentTokens = card.cost[color] - currentBonus;
    afterPurchasingPower += Math.min(afterBonus, card.cost[color]);
    if (afterTokens > 0) {
      const afterGrays = Math.min(afterState.tokens[color], afterTokens);
      afterPurchasingPower += afterGrays;
      if (
        card.cost[color] -
          (Math.min(afterBonus, card.cost[color]) + afterGrays) >
        0
      ) {
        afterPurchasingPower += Math.min(
          card.cost[color] -
            (Math.min(afterBonus, card.cost[color]) + afterGrays),
          afterState.tokens.gray
        );
      }
    }
    currentPurchasingPower += Math.min(currentBonus, card.cost[color]);
    if (currentTokens > 0) {
      const currentGrays = Math.min(player.tokens[color], currentTokens);
      currentPurchasingPower += currentGrays;
      if (
        card.cost[color] -
          (Math.min(currentBonus, card.cost[color]) + currentGrays) >
        0
      ) {
        currentPurchasingPower += Math.min(
          card.cost[color] -
            (Math.min(currentBonus, card.cost[color]) + currentGrays),
          player.tokens.gray
        );
      }
    }
  });
  return afterPurchasingPower - currentPurchasingPower;
}
