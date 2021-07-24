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
    this.players = playerNames.map((name) => {
      const tokens = colors.reduce((tokens, color) => {
        tokens[color] = 0;
        return tokens;
      }, {});
      tokens.gray = 0;
      return {
        name,
        recruits: [],
        reserves: [],
        tokens,
      };
    });
    this.round = 1;
    this.whoseTurn = 0;
    this.bankChips = colors.reduce((chips, color) => {
      chips[color] = numPlayersToTokenMap[playerNames.length];
      return chips;
    }, {});
    this.bankChips.gray = 5;
  }

  canAfford(player, cost, wallet) {
    let graysLeft = wallet ? wallet.gray : player.tokens.gray;
    return !Object.keys(cost).some((color) => {
      if (wallet) {
        if (cost[color] <= wallet[color]) {
          return true;
        } else if (graysLeft >= 0) {
          // TODO: if graysLeft > (still needed after bonuses and token)
          // TODO: reduce graysLeft and return true
          graysLeft -= 0;
          return true;
        } else {
          return false;
        }
      } else {
        const bonusesOfColor = this.getBonuses(player)[color] || 0;
        if (cost[color] <= player.tokens[color] + bonusesOfColor) {
          return true;
        } else if (graysLeft >= 0) {
          // TODO: if graysLeft > (still needed after bonuses and token)
          // TODO: reduce graysLeft and return true
          graysLeft -= 0;
          return true;
        } else {
          return false;
        }
      }
    });
  }

  getAvengersTags(recruits) {
    return recruits.reduce((t, r) => t + r.avengersTags, 0);
  }

  getBonuses(player, recruits) {
    return Object.assign(
      colors.reduce((tokens, color) => {
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

  getOptions() {
    const allOptions = [];
    const currPlayer = this.players[this.whoseTurn];
    const bonuses = this.getBonuses(currPlayer);
    const numTokens = Object.values(currPlayer.tokens).reduce(
      (a, b) => a + b,
      0
    );

    if (numTokens < 10) {
      const threeDiffLoop = (n, src, combo) => {
        if (n === 0) {
          if (combo.length && numTokens < 11 - combo.length) {
            let bankCanAfford = true;
            combo.reduce((obj, color) => {
              obj[color]--;
              if (obj[color] < 0) {
                bankCanAfford = false;
              }
              return obj;
            }, Object.assign({}, this.bankChips));
            if (bankCanAfford) {
              allOptions.push({ type: "3diff", tokens: combo });
            }
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
      Object.keys(this.bankChips).forEach((color) => {
        if (color === "gray") {
          return;
        }
        if (this.bankChips[color] > 3 && numTokens < 9) {
          allOptions.push({ type: "2same", tokens: [color, color] });
        }
      });
    }

    this.freeAgents.forEach((row, rowIndex) => {
      row.forEach((characterCard, index) => {
        if (characterCard !== null) {
          const cost = characterCard.cost;
          const reserveOption = {
            type: "reserve",
            level: rowIndex + 1,
            index,
          };
          if (this.bankChips.gray > 0) {
            reserveOption.tokens = ["gray"];
          }
          allOptions.push(reserveOption);
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
    currPlayer.reserves.forEach((characterCard, index) => {
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
          level: "reserves",
          index,
          tokensToRemove,
        });
      }
    });

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

  getPoints(player) {
    let points = player.recruits.reduce((p, r) => p + r.points, 0);
    if (player === this.avengersTileOwner) {
      points += 3;
    }
    this.locations.forEach((location) => {
      if (player === location.owner) {
        points += 3;
      }
    });
    return points;
  }

  getOptionScore(player, option) {
    const afterState = {
      recruits: [...player.recruits],
      tokens: Object.assign({}, player.tokens),
    };
    if (option.type === "recruit") {
      if (option.level === "reserves") {
        afterState.recruits.push(this.reserves[option.index]);
      } else {
        afterState.recruits.push(
          this.freeAgents[option.level - 1][option.index]
        );
      }
      if (option.tokensToRemove && option.tokensToRemove.length) {
        option.tokensToRemove.forEach((color) => {
          afterState.tokens[color]--;
        });
      }
    } else if (option.tokens) {
      option.tokens.forEach((color) => {
        afterState.tokens[color]++;
      });
    }

    if (this.meetsWinCriteria(player)) {
      return 9999;
    }

    let score =
      afterState.recruits.reduce((p, r) => p + r.points, 0) -
      player.recruits.reduce((p, r) => p + r.points, 0);

    if (this.avengersTileOwner !== player) {
      if (this.avengersTileOwner) {
        if (
          this.getAvengersTags(afterState.recruits) >
          this.getAvengersTags(this.avengersTileOwner.recruits)
        ) {
          score += 3;
        }
      } else if (this.getAvengersTags(afterState.recruits) > 2) {
        score += 3;
      }
    }

    const afterWallet = Object.assign(
      {},
      afterState.tokens,
      this.getBonuses(player, afterState.recruits)
    );

    this.locations
      .filter((l) => !l.owner)
      .forEach((location) => {
        if (this.canAfford(player, location.cost, afterWallet)) {
          score += 3;
        }
      });

    if (
      !colors.every(
        (c) => !!player.recruits.filter((cc) => cc.bonus === c).length
      ) &&
      colors.every(
        (c) => !!afterState.recruits.filter((cc) => cc.bonus === c).length
      )
    ) {
      score += 2;
    } else if (
      !player.recruits.some(
        (r) =>
          r.bonus === afterState.recruits[afterState.recruits.length - 1].bonus
      )
    ) {
      score += 1;
    }

    const afterBonuses = this.getBonuses(player, afterState.recruits);
    const currentBonuses = this.getBonuses(player);

    if (!player.recruits.some(({ level }) => level === 3)) {
      if (afterState.recruits.some(({ level }) => level === 3)) {
        score += 5;
      } else {
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
                ? Math.min(player.tokens[color], currentNeeded)
                : 0);
          });
          closerToTimeStoneScore +=
            (afterPurchasingPower - currentPurchasingPower) /
            Object.values(card.cost).reduce((s, c) => s + c, 0);
        });
        if (closerToTimeStoneScore > 0) {
          score += closerToTimeStoneScore * 4;
        }
      }
    }

    // TODO: score reserve options

    let affordaScore = 0;
    this.freeAgents.forEach((row, rowIndex) => {
      row.forEach((freeAgent, index) => {
        if (
          !freeAgent ||
          (rowIndex === option.level - 1 && index === option.index)
        ) {
          return;
        }
        let agentScore = freeAgent.points + freeAgent.avengersTags;
        if (!afterState.recruits.some((c) => freeAgent.bonus === c.bonus)) {
          agentScore += 2;
        }
        if (
          freeAgent.level === 3 &&
          !afterState.recruits.some((c) => c.level === 3)
        ) {
          agentScore += 3;
        }
        this.locations
          .filter((l) => !l.owner)
          .forEach((location) => {
            const afterWalletPlusBonus = Object.assign({}, afterWallet);
            afterWalletPlusBonus[freeAgent.bonus] += 1;
            if (this.canAfford(player, location.cost, afterWalletPlusBonus)) {
              agentScore += 2;
            }
          });
        if (
          !this.canAfford(player, freeAgent.cost) &&
          this.canAfford(player, freeAgent.cost, afterWallet)
        ) {
          affordaScore += agentScore;
        } else {
          let afterPurchasingPower = 0;
          let currentPurchasingPower = 0;
          Object.keys(freeAgent.cost).forEach((color) => {
            const afterBonus = afterBonuses[color];
            const afterNeeded = freeAgent.cost[color] - afterBonus;
            const currentBonus = currentBonuses[color];
            const currentNeeded = freeAgent.cost[color] - currentBonus;
            afterPurchasingPower +=
              Math.min(afterBonus, freeAgent.cost[color]) +
              (afterNeeded > 0
                ? Math.min(afterState.tokens[color], afterNeeded)
                : 0);
            currentPurchasingPower +=
              Math.min(currentBonus, freeAgent.cost[color]) +
              (currentNeeded > 0
                ? Math.min(player.tokens[color], currentNeeded)
                : 0);
          });
          const ratio =
            (afterPurchasingPower - currentPurchasingPower) /
            Object.values(freeAgent.cost).reduce((s, c) => s + c, 0);
          if (ratio > 0) {
            affordaScore += agentScore * ratio;
          }
        }
      });
    });
    score += affordaScore;

    if (option.type === "recruit") {
      score *= 16;
    }

    return score;
  }

  getState(skipOptions) {
    const players = this.players.map((p) => {
      p.points = this.getPoints(p);
      return p;
    });
    const state = {
      avengersTileOwner: this.avengersTileOwner,
      bankChips: this.bankChips,
      decks: this.decks,
      freeAgents: this.freeAgents,
      locations: this.locations,
      options: [],
      players,
      round: this.round,
      whoseTurn: this.whoseTurn,
    };
    if (!skipOptions) {
      state.options = this.getOptions().reduce(
        (obj, opt) => {
          const key =
            opt.type === "3diff" || opt.type === "2same" ? "chips" : opt.type;
          obj[key].push(opt);
          return obj;
        },
        {
          chips: [],
          recruit: [],
          reserve: [],
        }
      );
    }
    return state;
  }

  makeMove(decision) {
    const currPlayer = this.players[this.whoseTurn];
    const row =
      decision.level && typeof decision.level === "number"
        ? decision.level - 1
        : decision.level
        ? decision.level
        : null;
    if (decision.type === "recruit") {
      if (row === "reserves") {
        currPlayer.recruits.push(currPlayer.reserves[decision.index]);
        currPlayer.reserves.splice(decision.index, 1);
      } else {
        currPlayer.recruits.push(this.freeAgents[row][decision.index]);
        if (this.decks[row].length) {
          this.freeAgents[row][decision.index] = this.decks[row].pop();
        } else {
          this.freeAgents[row][decision.index] = null;
        }
      }
    } else if (decision.type === "reserve") {
      currPlayer.reserves.push(this.freeAgents[row][decision.index]);
      if (this.decks[row].length) {
        this.freeAgents[row][decision.index] = this.decks[row].pop();
      } else {
        this.freeAgents[row][decision.index] = null;
      }
    }
    if (decision.tokens && decision.tokens.length) {
      decision.tokens.forEach((color) => {
        this.bankChips[color]--;
        currPlayer.tokens[color]++;
      });
    }
    if (decision.tokensToRemove && decision.tokensToRemove.length) {
      decision.tokensToRemove.forEach((color) => {
        currPlayer.tokens[color]--;
        this.bankChips[color]++;
      });
    }
    if (this.getAvengersTags(currPlayer.recruits) > 2) {
      const playerTags = this.players
        .map((p) => ({ p, tags: this.getAvengersTags(p.recruits) }))
        .filter((pt) => pt.tags > 2)
        .sort((a, b) => (a.tags > b.tags ? -1 : 1));
      if (playerTags.length > 1 && playerTags[0] > playerTags[1]) {
        this.avengersTileOwner = playerTags[0].p;
      } else {
        this.avengersTileOwner = currPlayer;
      }
    }
    this.locations.forEach((location) => {
      if (
        !location.owner &&
        this.canAfford(currPlayer, location.cost, this.getBonuses(currPlayer))
      ) {
        location.owner = currPlayer;
      }
    });
    if (this.meetsWinCriteria(currPlayer)) {
      return new Promise((resolve) => {
        const results = this.getState(true);
        results.gameOver = true;
        resolve(results);
      });
    } else {
      this.whoseTurn = this.round++ % this.players.length;
      return new Promise((resolve) => {
        resolve(this.getState());
      });
    }
  }

  meetsWinCriteria(player) {
    return (
      this.getPoints(player) > 15 &&
      colors.every(
        (c) => !!player.recruits.filter((cc) => cc.bonus === c).length
      ) &&
      player.recruits.some(({ level }) => level === 3)
    );
  }
}
