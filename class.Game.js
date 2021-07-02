import getAllCharacterCards from "./function.getAllCharacterCards.js";
import getAllLocationTiles from "./function.getAllLocationTiles.js";

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
    this.locationTiles = getNullArray(4).map(() => allLocationTiles.pop());

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
    const colors = ["blue", "orange", "purple", "red", "yellow"];
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

  getState() {
    return {
      players: this.players,
      numPlayers: this.numPlayers,
      locationTiles: this.locationTiles,
      freeAgents: this.freeAgents,
      ownerTracker: this.ownerTracker,
    };
  }

  nextTurn() {
    if (!this.processDecision(this.players[this.whoseTurn].getDecision(this))) {
      this.processEndGame();
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
        break;
      case "recruit":
        let characterCard;
        if (decision.level === "reserves") {
          characterCard = decision.player.getReserve(decision.index);
        } else {
          characterCard = this.freeAgents[decision.level - 1][decision.index];
        }
        decision.player.assignRecruit(characterCard);
        // TODO: any necessary follow-up logic (acquiring tiles, endgame trigger, etc.)
        // return false if game should be over now
        break;
    }
    return true;
  }

  processEndGame() {
    // TODO
    this.postGameCallback(this);
    return false;
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

  start() {
    this.nextTurn();
  }
}
