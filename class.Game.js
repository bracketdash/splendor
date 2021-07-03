import getAllCharacterCards from "./function.getAllCharacterCards.js";
import getAllLocationTiles from "./function.getAllLocationTiles.js";

const colors = ["blue", "orange", "purple", "red", "yellow"];

function getNullArray(n) {
  return Array(4).fill(null);
}

function getShuffled(items) {
  return items.sort(() => (Math.random() > 0.5 ? 1 : -1));
}

export default class Game {
  constructor(players, postGameCallback) {
    this.postGameCallback = postGameCallback;

    this.players = players;
    this.numPlayers = players.length + 1;
    this.whoseTurn = 0;
    this.round = 1;

    const allLocationTiles = getShuffled(getAllLocationTiles());
    this.locationTiles = getNullArray(this.numPlayers).map(() =>
      allLocationTiles.pop()
    );

    const characterCards = getAllCharacterCards();
    this.decks = [
      getShuffled(characterCards.filter((cc) => cc.getLevel() === 1)),
      getShuffled(characterCards.filter((cc) => cc.getLevel() === 2)),
      getShuffled(characterCards.filter((cc) => cc.getLevel() === 3)),
    ];
    this.freeAgents = [
      getNullArray(4).map(() => this.decks[0].pop()),
      getNullArray(4).map(() => this.decks[1].pop()),
      getNullArray(4).map(() => this.decks[2].pop()),
    ];

    this.ownerTracker = {
      avengersAssembleTile: null,
      infinityGauntletTile: null,
      tokens: {
        gray: getNullArray(5),
      },
    };

    const numPlayersToTokenMap = [null, null, 4, 5, 7];
    colors.forEach((color) => {
      const numTokens = numPlayersToTokenMap[this.numPlayers];
      this.ownerTracker.tokens[color] = getNullArray(numTokens);
    });
  }

  assignToken(color, player) {
    const tokens = this.ownerTracker.tokens[color].filter(
      (token) => token === null
    );
    if (tokens.length) {
      tokens[0] = player;
    }
  }

  avengersAssembleTileCheck(thisPlayer) {
    if (this.getPlayerAvengersTags(thisPlayer) < 3) {
      return;
    }
    let assignAssembleTile = true;
    const thisPlayerNumTags = this.getPlayerAvengersTags(thisPlayer);
    this.players.forEach((player) => {
      if (player === thisPlayer) {
        return;
      }
      if (this.getPlayerAvengersTags(player) >= thisPlayerNumTags) {
        assignAssembleTile = false;
      }
    });
    if (assignAssembleTile) {
      this.ownerTracker.avengersAssembleTile = thisPlayer;
    }
  }

  doesPlayerQualifyForGauntlet(player) {
    const hasEnoughPoints = this.getPlayerScore(player) > 15;
    const hasAllColors = colors.all((c) => !!this.getPlayerBonus(player, c));
    const hasTimeStone = player.hasTimeStone();
    return hasEnoughPoints && hasAllColors && hasTimeStone;
  }

  getPlayerAvengersTags(player) {
    let numAvengersTags = 0;
    player.getRecruits().forEach((recruit) => {
      numAvengersTags += recruit.getNumAvengersTags();
    });
    return numAvengersTags;
  }

  getPlayerBonus(player, color) {
    return player.getRecruits().filter((cc) => cc.getBonus() === color).length;
  }

  getPlayerScore(player) {
    let score = 0;
    player.getRecruits().forEach((recruit) => {
      score += recruit.getInfinityPoints();
    });
    if (this.ownerTracker.avengersAssembleTile === player) {
      score += 3;
    }
    this.locationTiles.forEach((locationTile) => {
      if (locationTile.getOwner() === player) {
        score += locationTile.getInfinityPoints();
      }
    });
    return score;
  }

  getState() {
    return {
      players: this.players,
      numPlayers: this.numPlayers,
      locationTiles: this.locationTiles,
      freeAgents: this.freeAgents,
      ownerTracker: this.ownerTracker,
    };
  }

  infinityGauntletTileCheck(thisPlayer) {
    const isLastTurn = this.whoseTurn === this.numPlayers - 1;
    const thisPlayerQualifies = this.doesPlayerQualifyForGauntlet(thisPlayer);
    let gauntletOwned = this.ownerTracker.infinityGauntletTile !== null;

    if (thisPlayerQualifies) {
      if (!gauntletOwned) {
        this.ownerTracker.infinityGauntletTile = thisPlayer;
        gauntletOwned = true;
      }
    } else if (!gauntletOwned) {
      return false;
    }

    if (gauntletOwned && isLastTurn) {
      const playerStats = this.players.map((player) => {
        const numRecruits = player.getRecruits().length;
        const numReserves = player.getReserves().length;
        const numCharacterCards = numRecruits + numReserves;
        return {
          qualifiesForGauntlet: this.doesPlayerQualifyForGauntlet(player),
          infinityPoints: this.getPlayerScore(player),
          hasAvengersTile: this.ownerTracker.avengersAssembleTile === player,
          numCharacterCards,
          winner: false,
        };
      });
      const qualifiedForGauntlet = playerStats.filter(
        (p) => p.qualifiesForGauntlet
      );
      if (qualifiedForGauntlet.length === 1) {
        qualifiedForGauntlet[0].winner = true;
      } else {
        const topPoints = Math.max(...playerStats.map((p) => p.infinityPoints));
        const playersWithMaxPoints = playerStats.filter(
          (p) => p.infinityPoints === topPoints
        );
        if (playersWithMaxPoints.length === 1) {
          playersWithMaxPoints[0].winner = true;
        } else {
          const playersWithAvengersTile = playerStats.filter(
            (p) => p.hasAvengersTile
          );
          if (playersWithAvengersTile.length) {
            playersWithAvengersTile[0].winner = true;
          } else {
            const lowestCardCount = Math.min(
              ...playerStats.map((p) => p.numCharacterCards)
            );
            playerStats.forEach((p) => {
              if (p.numCharacterCards === lowestCardCount) {
                p.winner = true;
              }
            });
          }
        }
      }
      this.postGameCallback({
        gameState: this.getState(),
        playerStats,
      });
      return true;
    }

    return false;
  }

  locationTileCheck(player, location) {
    this.locationTiles.forEach((locationTile) => {
      if (locationTile.getOwner() === null) {
        if (
          Object.keys(locationTile.cost).all(
            (color) =>
              this.getPlayerBonus(player, color) >= locationTile.cost[color]
          )
        ) {
          locationTile.setOwner(player);
        }
      }
    });
  }

  nextTurn() {
    const decision = this.players[this.whoseTurn].getDecision(
      this.players[this.whoseTurn],
      this.getState()
    );
    if (!this.processDecision(decision)) {
      return;
    }
    this.whoseTurn++;
    if (this.whoseTurn > this.numPlayers - 1) {
      this.whoseTurn = 0;
      this.round++;
    }
    this.nextTurn();
  }

  processDecision(decision) {
    switch (decision.type) {
      case "3diff":
      case "2same":
        decision.tokens.forEach((color) => {
          this.assignToken(color, decision.player);
        });
        this.removeTokens(decision.tokensToRemove, decision.player);
        break;
      case "reserve":
        const freeAgentRow = this.freeAgents[decision.level - 1];
        const characterCard = freeAgentRow[decision.index];
        decision.player.assignReserve(characterCard);
        this.assignToken("gray", decision.player);
        this.removeTokens(decision.tokensToRemove, decision.player);
        this.replaceCard(decision.level - 1, decision.index);
        break;
      case "recruit":
        let characterCard;
        if (decision.level === "reserves") {
          characterCard = decision.player.getReserve(decision.index);
        } else {
          characterCard = this.freeAgents[decision.level - 1][decision.index];
          this.replaceCard(decision.level - 1, decision.index);
        }
        this.removeTokens(decision.tokensToRemove, decision.player);
        decision.player.assignRecruit(characterCard);
        decision.player.removeReserve(decision.index);
        this.locationTileCheck(decision.player, decision.location);
        this.avengersAssembleTileCheck(decision.player);
        if (this.infinityGauntletTileCheck(decision.player)) {
          return false;
        }
        break;
    }
    return true;
  }

  removeTokens(tokensToRemove, player) {
    if (!tokensToRemove.length) {
      return;
    }
    tokensToRemove.forEach((color) => {
      const tokens = this.ownerTracker.tokens[color].filter(
        (token) => token === player
      );
      tokens[0] = null;
    });
  }

  replaceCard(row, index) {
    if (this.decks[row].length) {
      this.freeAgents[row][index] = this.decks[row].pop();
    }
  }

  start() {
    this.nextTurn();
  }
}
