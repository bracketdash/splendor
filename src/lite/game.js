import characterCards from "../data/characterCards.js";

const colors = ["blue", "orange", "purple", "red", "yellow"];

function getNullArray(n) {
  return Array(n).fill(null);
}

function getShuffled(items) {
  return items.sort(() => (Math.random() > 0.5 ? 1 : -1));
}

export default class Game {
  constructor(weights) {
    this.decks = [
      getShuffled(characterCards.filter((cc) => cc.level === 1)),
      getShuffled(characterCards.filter((cc) => cc.level === 2)),
      getShuffled(characterCards.filter((cc) => cc.level === 3)),
    ];
    this.freeAgents = [
      getNullArray(4).map(() => this.decks[0].pop()),
      getNullArray(4).map(() => this.decks[1].pop()),
      getNullArray(4).map(() => this.decks[2].pop()),
    ];
    this.tokens = colors.reduce((tokens, color) => {
      tokens[color] = 0;
      return tokens;
    }, {});
    this.recruits = [];
    this.round = 1;
    this.weights = weights || {
      afterStateAllColors: 1,
      afterStateFirstOfColor: 2,
      afterStatePoints: 1,
      afterStateTimeStone: 1,
      closerToAffording: 2,
      closerToTimeStone: 1,
    };
  }

  canAfford(cost, wallet) {
    return !Object.keys(cost).some((color) => {
      if (wallet) {
        return cost[color] > wallet[color];
      } else {
        const bonusesOfColor = this.getBonuses()[color] || 0;
        return cost[color] > this.tokens[color] + bonusesOfColor;
      }
    });
  }

  getBonuses(recruits) {
    return (recruits || this.recruits).reduce((bonuses, cc) => {
      const bonus = cc.bonus;
      if (!bonuses[bonus]) {
        bonuses[bonus] = 1;
      } else {
        bonuses[bonus]++;
      }
      return bonuses;
    }, {});
  }

  getOptions() {
    const allOptions = [];

    const numTokens = Object.values(this.tokens).reduce((a, b) => a + b, 0);
    if (numTokens < 10) {
      const threeDiffLoop = function (n, src, combo) {
        if (n === 0) {
          if (combo.length && numTokens < 11 - combo.length) {
            allOptions.push({ type: "3diff", tokens: combo });
          }
          return;
        }
        for (var j = 0; j < src.length; j++) {
          threeDiffLoop(n - 1, src.slice(j + 1), combo.concat([src[j]]));
        }
        return;
      };
      threeDiffLoop(3, colors, []);
      threeDiffLoop(2, colors, []);
      threeDiffLoop(1, colors, []);
    }

    const bonuses = this.getBonuses();
    this.freeAgents.forEach((row, rowIndex) => {
      row.forEach((characterCard, index) => {
        if (characterCard !== null) {
          const cost = characterCard.cost;
          if (this.canAfford(cost)) {
            const tokensToRemove = Object.keys(cost).reduce((arr, color) => {
              const needed = cost[color] - (bonuses[color] || 0);
              getNullArray(needed).forEach(() => {
                arr.push(color);
              });
              return arr;
            }, []);
            allOptions.push({
              type: "recruit",
              level: rowIndex + 1,
              index,
              tokensToRemove,
            });
          }
        }
      });
    });

    if (!allOptions.length) {
      return [{ type: "skip", score: 1 }];
    }

    const scoredOptions = allOptions.map((option) => {
      option.score = this.getOptionScore(option);
      return option;
    });
    scoredOptions.sort((a, b) => (a.score > b.score ? -1 : 1));
    return scoredOptions;
  }

  getOptionScore(option) {
    const afterState = {
      recruits: [...this.recruits],
      tokens: Object.assign({}, this.tokens),
    };
    if (option.type === "recruit") {
      afterState.recruits.push(this.freeAgents[option.level - 1][option.index]);
      if (option.tokensToRemove && option.tokensToRemove.length) {
        option.tokensToRemove.forEach((color) => {
          afterState.tokens[color]--;
        });
      }
    } else {
      option.tokens.forEach((color) => {
        afterState.tokens[color]++;
      });
    }

    if (this.meetsWinCriteria(afterState.recruits)) {
      return 9999;
    }

    let score =
      (afterState.recruits.reduce((p, r) => p + r.infinityPoints, 0) -
        this.recruits.reduce((p, r) => p + r.infinityPoints, 0)) *
      this.weights.afterStatePoints;

    if (
      !colors.every(
        (c) => !!this.recruits.filter((cc) => cc.getBonus() === c).length
      ) &&
      colors.every(
        (c) => !!afterState.recruits.filter((cc) => cc.getBonus() === c).length
      )
    ) {
      score += this.weights.afterStateAllColors;
    } else if (
      !this.recruits.some(
        (r) =>
          r.bonus === afterState.recruits[afterState.recruits.length - 1].bonus
      )
    ) {
      score += this.weights.afterStateFirstOfColor;
    }

    if (!this.recruits.some(({ level }) => level === 3)) {
      if (afterState.recruits.some(({ level }) => level === 3)) {
        score += this.weights.afterStateTimeStone;
      } else {
        const afterBonuses = this.getBonuses(afterState.recruits);
        const currentBonuses = this.getBonuses();
        let closerToTimeStoneScore = 0;
        this.freeAgents[2].forEach((card) => {
          let afterPurchasingPower = 0;
          let currentPurchasingPower = 0;
          Object.keys(card.cost).forEach((color) => {
            const afterBonus = afterBonuses[color] || 0;
            const afterNeeded = card.cost[color] - afterBonus;
            const currentBonus = currentBonuses[color] || 0;
            const currentNeeded = card.cost[color] - currentBonus;
            afterPurchasingPower +=
              Math.min(afterBonus, card.cost[color]) +
              (afterNeeded > 0
                ? Math.min(afterState.tokens[color], afterNeeded)
                : 0);
            currentPurchasingPower +=
              Math.min(currentBonus, card.cost[color]) +
              (currentNeeded > 0
                ? Math.min(this.tokens[color], currentNeeded)
                : 0);
          });
          closerToTimeStoneScore +=
            (afterPurchasingPower - currentPurchasingPower) /
            Object.values(card.cost).reduce((s, c) => s + c, 0);
        });
        score += closerToTimeStoneScore * this.weights.closerToTimeStone;
      }
    }

    const afterWallet = Object.assign(
      {},
      this.tokens,
      this.getBonuses(afterState.recruits)
    );
    let affordaScore = 0;
    this.freeAgents.forEach((row, rowIndex) => {
      row.forEach((freeAgent, index) => {
        if (rowIndex === option.level - 1 && index === option.index) {
          return;
        }
        let agentScore =
          freeAgent.infinityPoints * this.weights.afterStatePoints;
        if (!afterState.recruits.some((c) => freeAgent.bonus === c.bonus)) {
          agentScore += this.weights.wouldBeFirstOfColor;
        }
        if (
          freeAgent.level === 3 &&
          !afterState.recruits.some((c) => c.level === 3)
        ) {
          agentScore += this.weights.afterStateTimeStone;
        }
        if (
          !this.canAfford(freeAgent.cost) &&
          this.canAfford(freeAgent.cost, afterWallet)
        ) {
          affordaScore += agentScore;
        } else {
          affordaScore += agentScore * (1 / this.weights.closerToAffording);
        }
      });
    });
    score += affordaScore * this.weights.affordaScore;

    return score;
  }

  getState(skipOptions) {
    const state = {
      decks: this.decks,
      freeAgents: this.freeAgents,
      options: [],
      recruits: this.recruits,
      round: this.round,
    };
    if (!skipOptions) {
      state.options = this.getOptions();
    }
    return state;
  }

  makeMove(decision) {
    if (decision.type === "recruit") {
      const row = decision.level - 1;
      this.recruits.push(this.freeAgents[row][decision.index]);
      if (this.decks[row].length) {
        this.freeAgents[row][index] = this.decks[row].pop();
      } else {
        this.freeAgents[row][index] = null;
      }
      if (decision.tokensToRemove && decision.tokensToRemove.length) {
        decision.tokensToRemove.forEach((color) => {
          this.tokens[color]--;
        });
      }
    } else {
      // DEBUGGING
      if (!decision.tokens) {
        console.log(decision);
      }

      decision.tokens.forEach((color) => {
        this.tokens[color]++;
      });
    }

    if (this.meetsWinCriteria(this.recruits)) {
      return new Promise((resolve) => {
        const results = this.getState(true);
        results.gameOver = true;
        resolve(results);
      });
    } else {
      this.round++;
      return new Promise((resolve) => {
        resolve(this.getState());
      });
    }
  }

  meetsWinCriteria(recruits) {
    return (
      recruits.reduce((p, r) => p + r.infinityPoints, 0) > 15 &&
      colors.every(
        (c) => !!recruits.filter((cc) => cc.getBonus() === c).length
      ) &&
      recruits.some(({ level }) => level === 3)
    );
  }
}
