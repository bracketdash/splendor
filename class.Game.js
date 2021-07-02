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
    // TODO
    /*
    decision: {
      type: '', // 3diff, 2same, reserve, or recruit
      (3diff, 2same) tokens: ['red','blue','purple']
      (reserve, recruit) level: 2 (1 - 3 or reserves)
      (reserve, recruit) index: 1 (0 - 3, or 0 - 2 for reserves)
      (if they need to remove tokens to reach limit of 10) tokensToRemove: ['yellow','orange']
    }
    */
    return false;
  }

  processEndGame() {
    // TODO
    this.postGameCallback(this);
    return false;
  }

  start() {
    this.nextTurn();
  }
}
