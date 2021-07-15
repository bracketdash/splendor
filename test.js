import Game from "./class.Game.js";
import Player from "./class.Player.js";

import splendorbotStable from "./splendorbot.stable.js";
import splendorbotBeta from "./splendorbot.beta.js";
import splendorbotCanary from "./splendorbot.canary.js";
import splendorbotRandom from "./splendorbot.random.js";

const singleTestNumGames = 100;

// up to 4 players
const players = [
  new Player("Canary", splendorbotCanary),
  new Player("Stable", splendorbotStable),
  new Player("Beta", splendorbotBeta),
  // new Player("Random", splendorbotRandom),
];

new Game(players, function () {})
  .setState({
    freeAgents: [
      [null, null, null, null],
      [null, null, null, null],
      ["Green Goblin", "Hulk", null, null],
    ],
    recruits: [],
    reserves: [],
    tokens: [
      { blue: 4, gray: 5, orange: 4, purple: 4, red: 4, yellow: 4 },
      { blue: 0, gray: 0, orange: 0, purple: 0, red: 0, yellow: 0 },
      { blue: 0, gray: 0, orange: 0, purple: 0, red: 0, yellow: 0 },
    ],
  })
  .getFirstPlayerMove(function (option) {
    console.log(option);
  });

// let winTally = Array(players.length).fill(0);

// let currentGameNum = 1;

// const endGameCallback = function (gameState, playerStats) {
//   winTally.forEach((_, index) => {
//     winTally[index] += playerStats[index].winner ? 1 : 0;
//   });

//   process.stdout.clearLine();
//   process.stdout.cursorTo(0);
//   process.stdout.write(`Game ${currentGameNum} in progress...`);

//   if (currentGameNum === singleTestNumGames - 1) {
//     process.stdout.clearLine();
//     process.stdout.cursorTo(0);
//     console.log(
//       winTally
//         .map((wins, playerIndex) => `${wins} ${playerStats[playerIndex].name}`)
//         .join(" | ")
//     );
//     return;
//   }
//   players.forEach((player) => {
//     player.reset();
//   });
//   new Game(players, endGameCallback).start();
//   currentGameNum++;
// };

// new Game(players, endGameCallback).start();
