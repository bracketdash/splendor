// const game = new Game();
// game.getState().options
// game.makeMove(decision)

import characterCards from "./data/characterCards.js";
import locationTiles from "./data/locationTiles.js";

const colors = ["blue", "orange", "purple", "red", "yellow"];

function getNullArray(n) {
  return Array(n).fill(null);
}

function getShuffled(items) {
  return items.sort(() => (Math.random() > 0.5 ? 1 : -1));
}

export default class Game {
  constructor(playerNames) {
    const numPlayersToTokenMap = [null, null, 4, 5, 7];
    const shuffledLocations = getShuffled(locationTiles);
    this.avengersTileOwner = null;
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
    this.locations = getNullArray(playerNames.length).map(() => {
      return shuffledLocations.pop();
    });
    this.players = playerNames.map((name) => ({
      name,
      recruits: [],
      reserves: [],
      tokens: colors.reduce((tokens, color) => {
        tokens[color] = 0;
        return tokens;
      }, {}),
    }));
    this.round = 1;
    this.whoseTurn = 0;
    this.bankChips = colors.reduce((chips, color) => {
      chips[color] = numPlayersToTokenMap[this.playerNames.length];
      return chips;
    }, {});
  }

  canAfford(player, cost, wallet) {
    return !Object.keys(cost).some((color) => {
      if (wallet) {
        return cost[color] > wallet[color];
      } else {
        const bonusesOfColor = this.getBonuses(player)[color] || 0;
        return cost[color] > player.tokens[color] + bonusesOfColor;
      }
    });
  }

  getBonuses(player, recruits) {
    return (recruits || player.recruits).reduce((bonuses, cc) => {
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
    const currPlayer = this.players[this.whoseTurn];

    const numTokens = Object.values(currPlayer.tokens).reduce(
      (a, b) => a + b,
      0
    );
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
      // TODO: add 2same options
    }

    const bonuses = this.getBonuses(currPlayer);
    this.freeAgents.forEach((row, rowIndex) => {
      row.forEach((characterCard, index) => {
        if (characterCard !== null) {
          const cost = characterCard.cost;
          if (this.canAfford(currPlayer, cost)) {
            const tokensToRemove = Object.keys(cost).reduce((arr, color) => {
              const needed = cost[color] - (bonuses[color] || 0);
              if (needed > 0) {
                getNullArray(needed).forEach(() => {
                  arr.push(color);
                });
              }
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

    // TODO: add options to recruit from this player's reserves if any
    // TODO: add reserve options

    if (!allOptions.length) {
      return [{ type: "skip" }];
    }

    const scoredOptions = allOptions.map((option) => {
      option.score = this.getOptionScore(currPlayer, option);
      return option;
    });
    scoredOptions.sort((a, b) => (a.score > b.score ? -1 : 1));
    return scoredOptions;
  }

  getOptionScore(player, option) {
    const afterState = {
      recruits: [...player.recruits],
      tokens: Object.assign({}, player.tokens),
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

    if (this.meetsWinCriteria(player)) {
      return 9999;
    }

    let score =
      afterState.recruits.reduce((p, r) => p + r.infinityPoints, 0) -
      player.recruits.reduce((p, r) => p + r.infinityPoints, 0);

    if (
      !colors.every(
        (c) => !!player.recruits.filter((cc) => cc.bonus === c).length
      ) &&
      colors.every(
        (c) => !!afterState.recruits.filter((cc) => cc.bonus === c).length
      )
    ) {
      score += 1;
    } else if (
      !player.recruits.some(
        (r) =>
          r.bonus === afterState.recruits[afterState.recruits.length - 1].bonus
      )
    ) {
      score += 1;
    }

    if (!player.recruits.some(({ level }) => level === 3)) {
      if (afterState.recruits.some(({ level }) => level === 3)) {
        score += 1;
      } else {
        const afterBonuses = this.getBonuses(player, afterState.recruits);
        const currentBonuses = this.getBonuses(player);
        let closerToTimeStoneScore = 0;
        this.freeAgents[2].forEach((card) => {
          if (!card) {
            return;
          }
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
        score += closerToTimeStoneScore * 3.88;
      }
    }

    const afterWallet = Object.assign(
      {},
      player.tokens,
      this.getBonuses(player, afterState.recruits)
    );
    let affordaScore = 0;
    this.freeAgents.forEach((row, rowIndex) => {
      row.forEach((freeAgent, index) => {
        if (
          !freeAgent ||
          (rowIndex === option.level - 1 && index === option.index)
        ) {
          return;
        }
        let agentScore = freeAgent.infinityPoints;
        if (!afterState.recruits.some((c) => freeAgent.bonus === c.bonus)) {
          agentScore += 1;
        }
        if (
          freeAgent.level === 3 &&
          !afterState.recruits.some((c) => c.level === 3)
        ) {
          agentScore += 1;
        }

        if (
          !this.canAfford(player, freeAgent.cost) &&
          this.canAfford(player, freeAgent.cost, afterWallet)
        ) {
          affordaScore += agentScore;
        } else {
          affordaScore += agentScore * 0.2824858757;
        }
      });
    });
    score += affordaScore;

    return score;
  }

  getState(skipOptions) {
    const state = {
      bankChips: this.bankChips,
      decks: this.decks,
      freeAgents: this.freeAgents,
      options: [],
      players: this.players,
      round: this.round,
      whoseTurn: this.whoseTurn,
    };
    if (!skipOptions) {
      state.options = this.getOptions();
    }
    return state;
  }

  makeMove(decision) {
    const currPlayer = this.players[this.whoseTurn];
    // TODO: handle 2same, reserve, and recruiting reserves options
    // TODO: handle avengers and location tile owner changes at end of turn
    if (decision.type === "recruit") {
      const row = decision.level - 1;
      currPlayer.recruits.push(this.freeAgents[row][decision.index]);
      if (this.decks[row].length) {
        this.freeAgents[row][decision.index] = this.decks[row].pop();
      } else {
        this.freeAgents[row][decision.index] = null;
      }
      if (decision.tokensToRemove && decision.tokensToRemove.length) {
        decision.tokensToRemove.forEach((color) => {
          currPlayer.tokens[color]--;
        });
      }
    } else if (decision.tokens) {
      decision.tokens.forEach((color) => {
        currPlayer.tokens[color]++;
      });
    }

    if (this.meetsWinCriteria(currPlayer)) {
      return new Promise((resolve) => {
        const results = this.getState(true);
        results.gameOver = true;
        resolve(results);
      });
    } else {
      this.decks.some((deck, row) => {
        if (deck.length) {
          return this.freeAgents[row].some((freeAgent, index) => {
            if (freeAgent) {
              if (this.decks[row].length) {
                this.freeAgents[row][index] = this.decks[row].pop();
              } else {
                this.freeAgents[row][index] = null;
              }

              return true;
            }
          });
        }
      });
      this.round++;
      return new Promise((resolve) => {
        resolve(this.getState());
      });
    }
  }

  meetsWinCriteria(player) {
    // TODO: take into account avengers and locations tiles if any
    return (
      player.recruits.reduce((p, r) => p + r.infinityPoints, 0) > 15 &&
      colors.every(
        (c) => !!player.recruits.filter((cc) => cc.bonus === c).length
      ) &&
      player.recruits.some(({ level }) => level === 3)
    );
  }
}
