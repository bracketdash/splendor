import characterCards from "./data/characterCards.js";
import locationTiles from "./data/locationTiles.js";

import canAfford from "./util/canAfford.js";
import getBonuses from "./util/getBonuses.js";
import getPPD from "./util/getPPD.js";

const colors = ["blue", "orange", "purple", "red", "yellow"];

function count(n) {
  return Array(n).fill(null);
}

function getAvengersTags(recruits) {
  return recruits.reduce((t, r) => t + r.avengersTags, 0);
}

function getShuffled(items) {
  return items.sort(() => (Math.random() > 0.5 ? 1 : -1));
}

export default class Game {
  constructor(players) {
    const numPlayersToTokenMap = [null, null, 4, 5, 7];
    const shuffledLocations = getShuffled(locationTiles);
    this.avengersTileOwner = null;
    this.decks = [];
    this.freeAgents = [];
    count(3).forEach((_, i) => {
      this.decks.push(
        getShuffled(characterCards.filter((cc) => cc.level === i + 1))
      );
      this.freeAgents.push(count(4).map(() => this.decks[i].pop()));
    });
    this.locations = count(players.length).map(() => {
      return shuffledLocations.pop();
    });
    this.players = players.map(({ computer, name, weights }) => {
      const tokens = [...colors, "gray"].reduce((tokens, color) => {
        tokens[color] = 0;
        return tokens;
      }, {});
      return {
        computer,
        name,
        recruits: [],
        reserves: [],
        tokens,
        weights,
      };
    });
    this.round = 1;
    this.whoseTurn = 0;
    this.bankChips = colors.reduce((chips, color) => {
      chips[color] = numPlayersToTokenMap[players.length];
      return chips;
    }, {});
    this.bankChips.gray = 5;
  }

  getOptions() {
    const allOptions = [];
    const currPlayer = this.players[this.whoseTurn];
    const bonuses = getBonuses(currPlayer);
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
      count(3).forEach((_, i) => {
        threeDiffLoop(i + 1, colors, []);
      });
      Object.keys(this.bankChips).forEach((color) => {
        if (color === "gray") {
          return;
        }
        if (this.bankChips[color] > 3 && numTokens < 9) {
          allOptions.push({ type: "2same", tokens: [color, color] });
        }
      });
      allOptions.sort((a, b) => (a.tokens.length > b.tokens.length ? -1 : 1));
    }

    this.freeAgents.forEach((row, rowIndex) => {
      row.forEach((characterCard, index) => {
        if (characterCard !== null) {
          const cost = characterCard.cost;
          if (currPlayer.reserves.length < 3) {
            const reserveOption = {
              type: "reserve",
              level: rowIndex + 1,
              index,
            };
            if (this.bankChips.gray > 0) {
              reserveOption.tokens = ["gray"];
            }
            allOptions.push(reserveOption);
          }
          if (canAfford(currPlayer, cost)) {
            const tokensToRemove = Object.keys(cost).reduce((arr, color) => {
              const needed = cost[color] - bonuses[color];
              if (needed > 0) {
                if (needed <= currPlayer.tokens[color]) {
                  count(needed).forEach(() => {
                    arr.push(color);
                  });
                } else {
                  const graysNeeded = needed - currPlayer.tokens[color];
                  count(graysNeeded).forEach(() => {
                    arr.push("gray");
                  });
                  count(needed - graysNeeded).forEach(() => {
                    arr.push(color);
                  });
                }
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
      if (canAfford(currPlayer, cost)) {
        const tokensToRemove = Object.keys(cost).reduce((arr, color) => {
          const needed = cost[color] - bonuses[color];
          if (needed > 0) {
            if (needed <= currPlayer.tokens[color]) {
              count(needed).forEach(() => {
                arr.push(color);
              });
            } else {
              const graysNeeded = needed - currPlayer.tokens[color];
              count(graysNeeded).forEach(() => {
                arr.push("gray");
              });
              count(needed - graysNeeded).forEach(() => {
                arr.push(color);
              });
            }
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
    return scoredOptions;
  }

  getOptionScore(player, option) {
    const afterState = {
      recruits: [...player.recruits],
      tokens: Object.assign({}, player.tokens),
    };
    if (option.type === "recruit") {
      if (option.level === "reserves") {
        afterState.recruits.push(player.reserves[option.index]);
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
          getAvengersTags(afterState.recruits) >
          getAvengersTags(this.avengersTileOwner.recruits)
        ) {
          score += player.weights ? player.weights[0] : 3;
        }
      } else if (getAvengersTags(afterState.recruits) > 2) {
        score += player.weights ? player.weights[0] : 3;
      }
    }

    const afterWallet = Object.assign(
      {},
      afterState.tokens,
      getBonuses(player, afterState.recruits)
    );

    this.locations
      .filter((l) => !l.owner)
      .forEach((location) => {
        if (canAfford(player, location.cost, afterWallet)) {
          score += player.weights ? player.weights[1] : 3;
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
      score += player.weights ? player.weights[2] : 2;
    } else if (
      !player.recruits.some(
        (r) =>
          r.bonus === afterState.recruits[afterState.recruits.length - 1].bonus
      )
    ) {
      score += player.weights ? player.weights[3] : 1;
    }

    const afterBonuses = getBonuses(player, afterState.recruits);
    const currentBonuses = getBonuses(player);

    if (!player.recruits.some(({ level }) => level === 3)) {
      if (afterState.recruits.some(({ level }) => level === 3)) {
        score += player.weights ? player.weights[4] : 5;
      } else {
        let closerToTimeStoneScore = 0;
        this.freeAgents[2].forEach((card) => {
          if (!card) {
            return;
          }
          closerToTimeStoneScore +=
            getPPD({
              afterBonuses,
              afterState,
              card,
              currentBonuses,
              player,
            }) / Object.values(card.cost).reduce((s, c) => s + c, 0);
        });
        if (closerToTimeStoneScore > 0) {
          score +=
            closerToTimeStoneScore * (player.weights ? player.weights[5] : 4);
        }
      }
    }

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
          agentScore += player.weights ? player.weights[3] : 2;
        }
        if (
          freeAgent.level === 3 &&
          !afterState.recruits.some((c) => c.level === 3)
        ) {
          agentScore += player.weights ? player.weights[4] : 3;
        }
        const afterWalletPlusBonus = Object.assign({}, afterWallet);
        afterWalletPlusBonus[freeAgent.bonus] += 1;
        this.locations
          .filter((l) => !l.owner)
          .forEach((location) => {
            if (canAfford(player, location.cost, afterWalletPlusBonus)) {
              agentScore += player.weights ? player.weights[1] : 2;
            }
          });
        if (
          !canAfford(player, freeAgent.cost) &&
          canAfford(player, freeAgent.cost, afterWalletPlusBonus)
        ) {
          affordaScore += agentScore;
        } else {
          const ratio =
            getPPD({
              afterBonuses,
              afterState,
              card: freeAgent,
              currentBonuses,
              player,
            }) / Object.values(freeAgent.cost).reduce((s, c) => s + c, 0);
          if (ratio > 0) {
            affordaScore += agentScore * ratio;
          }
        }
      });
    });
    score += affordaScore;

    if (option.type === "recruit") {
      score *= player.weights ? player.weights[6] : 8;
    } else if (option.type === "reserve") {
      score *= 1 / (player.weights ? player.weights[7] : 2);
    }

    return score;
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

  getState(skipOptions, skipCats) {
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
      options: {},
      players,
      round: this.round,
      whoseTurn: this.whoseTurn,
    };
    if (!skipOptions) {
      state.options = this.getOptions();
      if (!skipCats) {
        state.options = state.options.reduce(
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
    }
    return state;
  }

  makeMove(decision, skipCats) {
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
    if (getAvengersTags(currPlayer.recruits) > 2) {
      const playerTags = this.players
        .map((p) => ({ p, tags: getAvengersTags(p.recruits) }))
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
        canAfford(currPlayer, location.cost, getBonuses(currPlayer))
      ) {
        location.owner = currPlayer;
      }
    });
    if (this.meetsWinCriteria(currPlayer)) {
      // TODO: if this isn't the last player, we need to finish out the round
      return new Promise((resolve) => {
        const results = this.getState(true);
        results.gameOver = true;
        resolve(results);
      });
    } else {
      this.whoseTurn++;
      if (this.whoseTurn > this.players.length - 1) {
        this.round++;
        this.whoseTurn = 0;
      }
      return new Promise((resolve) => {
        resolve(this.getState(false, skipCats));
      });
    }
  }

  meetsWinCriteria(player) {
    player.meetsWinCriteria =
      this.getPoints(player) > 15 &&
      colors.every(
        (c) => !!player.recruits.filter((cc) => cc.bonus === c).length
      ) &&
      player.recruits.some(({ level }) => level === 3);
    return player.meetsWinCriteria;
  }
}
