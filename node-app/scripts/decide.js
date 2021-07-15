import Game from "../class.Game.js";
import Player from "../class.Player.js";

import splendorbotStable from "../splendorbot.stable.js";
import splendorbotBeta from "../splendorbot.beta.js";
import splendorbotCanary from "../splendorbot.canary.js";
import splendorbotRandom from "../splendorbot.random.js";

const players = [
  new Player("Canary", splendorbotCanary),
  new Player("Beta", splendorbotBeta),
  // new Player("Stable", splendorbotStable),
  // new Player("Random", splendorbotRandom),
];

new Game(players, function () {})
  .setState({
    freeAgents: [
      ["Kate Bishop", "Taskmaster", "Valkyrie", "Ms. Marvel"],
      ["She-Hulk", "Crossbones", "Carnage", "Black Cat"],
      ["Doctor Strange", "Doctor Octopus", "Nova", "Iron Man"],
    ],
    recruits: ["Scorpion", "Lockjaw", "America Chavez", "Wasp"],
    reserves: ["Green Goblin", "Hulk", "Vision"],
    tokens: [
      { blue: 4, gray: 5, orange: 4, purple: 4, red: 4, yellow: 4 }, // bank
      { blue: 0, gray: 0, orange: 0, purple: 0, red: 0, yellow: 0 }, // p1
      { blue: 0, gray: 0, orange: 0, purple: 0, red: 0, yellow: 0 }, // p2
    ],
  })
  .getFirstPlayerMove(function (option) {
    console.log(option);
  });
