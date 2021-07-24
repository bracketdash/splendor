import { useState } from "react";
import Head from "next/head";

import GameArea from "../src/components/GameArea.js";
import PlayerConfig from "../src/components/PlayerConfig.js";

import Game from "../src/game.js";

export default function Home() {
  const [configuringPlayers, setConfiguringPlayers] = useState(true);

  const [game, setGame] = useState(null);

  function startGame(playerData) {
    const players = playerData.filter((p) => !p.sittingOut);
    setConfiguringPlayers(false);
    setGame(new Game(players));
  }

  return (
    <div>
      <Head>
        <title>Splendor MARVEL</title>
      </Head>
      <main>
        <h1>Splendor MARVEL</h1>
        <section className={configuringPlayers ? "" : "hide"}>
          <PlayerConfig onStartGame={startGame} />
        </section>
        <section className={configuringPlayers ? "hide" : ""}>
          <GameArea game={game} />
        </section>
      </main>
    </div>
  );
}
