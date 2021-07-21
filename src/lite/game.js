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
      affordapointsDiff: 3,
      avengersTags: 2,
      cardPoints: 1,
      mult3diff: 1,
      multReserve: 1,
      wouldBeFirstOfColor: 2,
      wouldGetTimeStone: 2,
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

  getBonuses() {
    return this.recruits.reduce((bonuses, cc) => {
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

    const bonuses = getBonuses();
    this.freeAgents.forEach((row, rowIndex) => {
      row.forEach((characterCard, index) => {
        if (characterCard !== null) {
          const cost = characterCard.cost;
          if (canAfford(cost)) {
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
    const getCardScore = (card, level) => {
      let cardScore = 1;
      cardScore += card.infinityPoints * this.weights.cardPoints;
      if (card.level === 3 && !this.recruits.some((r) => r.level === 3)) {
        cardScore += this.weights.wouldBeFirstOfColor;
      }
      if (!this.recruits.some((r) => card.bonus === r.bonus)) {
        cardScore += this.weights.wouldGetTimeStone;
      }
      if (!level || level <= this.weights.maxCardScoreLevel) {
        // TODO: weigh how valuable it would be to get a bonus of this color (colorScore * this.weights.colorScore)
      }
      return cardScore;
    };

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

    let score = 0;

    if (meetsWinCriteria(afterState.recruits)) {
      return 9999;
    }

    // TODO: points for how much closer they are to meeting the win conditions

    // TODO: point addition or subtraction based on which cards they are able to afford
    // (or closer or further from being able to afford) compared to the current state

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
      recruits.reduce((p, r) => p + r.infinityPoints) > 15 &&
      colors.every(
        (c) => !!recruits.filter((cc) => cc.getBonus() === c).length
      ) &&
      recruits.some(({ level }) => level === 3)
    );
  }
}
