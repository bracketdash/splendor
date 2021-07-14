import Game from "./class.Game.js";
import Player from "./class.Player.js";

import splendorbotStable from "./splendorbot.stable.js";
import splendorbotBeta from "./splendorbot.beta.js";
import splendorbotCanary from "./splendorbot.canary.js";
import splendorbotRandom from "./splendorbot.random.js";

// up to 4 players
const players = [
  // new Player("Stable", splendorbotStable),
  new Player("Beta", splendorbotBeta),
  new Player("Canary", splendorbotCanary),
  // new Player("Random", splendorbotRandom),
];

// TODO: there is a bug that happens much more often with all 4 players, related to lack of options
// This may be character cards actually running out, but we should check to see if they are maxed on tokens, etc., too
// Also check that location tiles are being assigned as players qualify

const winTally = Array(players.length).fill(0);

const singleTestNumGames = 20;
let currentGameNum = 1;

const endGameCallback = function (gameState, playerStats) {
  winTally.forEach((_, index) => {
    winTally[index] += playerStats[index].winner ? 1 : 0;
  });

  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write(`Game ${currentGameNum} in progress...`);

  if (currentGameNum === singleTestNumGames) {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    console.log(`Test complete. ${singleTestNumGames} games played.`);
    console.timeEnd("Test duration");
    winTally.forEach((wins, playerIndex) => {
      console.log(
        `${playerStats[playerIndex].name} won ${wins} games (${Math.round(
          (wins / singleTestNumGames) * 100
        )}%).`
      );
    });
    return;
  }
  players.forEach((player) => {
    player.reset();
  });
  new Game(players, endGameCallback).start();
  currentGameNum++;
};

console.time("Test duration");
new Game(players, endGameCallback).start();
