import Game from "./class.Game.js";
import Player from "./class.Player.js";

import splendorbot from "./splendorbot.js";
import splendorbotRandom from "./splendorbot.random.js";
import splendorbotRandomB from "./splendorbot.random.js";
import splendorbotRandomC from "./splendorbot.random.js";

// up to 4 players
const players = [
  new Player("Splendorbot", splendorbot),
  new Player("Random Choice", splendorbotRandom),
];
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
    console.log(
      `AI won ${winTally[0]} out of ${singleTestNumGames} games (${Math.round(
        (winTally[0] / singleTestNumGames) * 100
      )}%) vs Random Choice`
    );
    console.timeEnd("Test duration");
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
