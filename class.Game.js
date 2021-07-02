import getAllCharacterCards from "./function.getAllCharacterCards.js";
import getAllLocationTiles from "./function.getAllLocationTiles.js";

function getNullArray(n) {
  return Array(4).fill(null);
}

function getShuffled(items) {
  return items.sort(() => (Math.random() > 0.5 ? 1 : -1));
}

export default class Game {
  constructor(players) {
    this.players = players;
    this.numPlayers = players.length + 1;

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

  debug() {
    return this;
  }
}
