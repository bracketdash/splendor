import getAllCharacterCards from "./function.getAllCharacterCards.js";
import getAllLocationTiles from "./function.getAllLocationTiles.js";

function getNullArray(n) {
  return Array(4).fill(null);
}

function getShuffled(items) {
  // TODO: shuffle
  return items;
}

export default class Game {
  constructor(players) {
    this.players = players;
    this.numPlayers = players.length;

    this.ownerTracker = {
      avengersAssembleTile: null,
      infinityGauntletTile: null,
      tokens: {
        gray: getNullArray(5),
      },
    };

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

    switch (this.numPlayers) {
      case 2:
        this.ownerTracker.tokens.blue = getNullArray(4);
        this.ownerTracker.tokens.orange = getNullArray(4);
        this.ownerTracker.tokens.purple = getNullArray(4);
        this.ownerTracker.tokens.red = getNullArray(4);
        this.ownerTracker.tokens.yellow = getNullArray(4);
        break;
      case 3:
        this.ownerTracker.tokens.blue = getNullArray(5);
        this.ownerTracker.tokens.orange = getNullArray(5);
        this.ownerTracker.tokens.purple = getNullArray(5);
        this.ownerTracker.tokens.red = getNullArray(5);
        this.ownerTracker.tokens.yellow = getNullArray(5);
        break;
      case 4:
        this.ownerTracker.tokens.blue = getNullArray(7);
        this.ownerTracker.tokens.orange = getNullArray(7);
        this.ownerTracker.tokens.purple = getNullArray(7);
        this.ownerTracker.tokens.red = getNullArray(7);
        this.ownerTracker.tokens.yellow = getNullArray(7);
        break;
    }
  }

  debug() {
    return this;
  }
}
