import getCharacterCards from "./function.getCharacterCards.js";
import getShuffledCards from "./function.getShuffledCards.js";

function getNullArray(n) {
  return Array(4).fill(null);
}

export default class Game {
  constructor(players) {
    this.players = players;
    this.numPlayers = players.length;

    this.ownerTracker = {
      avengersAssembleTile: null,
      infinityGauntletTile: null,
      locationTiles: [],
      tokens: {
        gray: getNullArray(5),
      },
    };

    const characterCards = getCharacterCards();
    this.decks = [
      getShuffledCards(characterCards.filter((cc) => cc.getLevel() === 1)),
      getShuffledCards(characterCards.filter((cc) => cc.getLevel() === 2)),
      getShuffledCards(characterCards.filter((cc) => cc.getLevel() === 3)),
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
        // TODO: add 2 locationTiles to this.ownerTracker.locationTiles at random
        break;
      case 3:
        this.ownerTracker.tokens.blue = getNullArray(5);
        this.ownerTracker.tokens.orange = getNullArray(5);
        this.ownerTracker.tokens.purple = getNullArray(5);
        this.ownerTracker.tokens.red = getNullArray(5);
        this.ownerTracker.tokens.yellow = getNullArray(5);
        // TODO: add 3 locationTiles to this.ownerTracker.locationTiles at random
        break;
      case 4:
        this.ownerTracker.tokens.blue = getNullArray(7);
        this.ownerTracker.tokens.orange = getNullArray(7);
        this.ownerTracker.tokens.purple = getNullArray(7);
        this.ownerTracker.tokens.red = getNullArray(7);
        this.ownerTracker.tokens.yellow = getNullArray(7);
        // TODO: add 4 locationTiles to this.ownerTracker.locationTiles at random
        break;
    }
  }

  debug() {
    return this;
  }
}
