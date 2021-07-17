import { useState } from "react";
import Head from "next/head";

import GameArea from "../src/components/GameArea.js";
import PlayerConfig from "../src/components/PlayerConfig.js";

import createGame from "../src/createGame.js";
import createPlayer from "../src/createPlayer.js";

export default function Home() {
  const [configuringPlayers, setConfiguringPlayers] = useState(true);

  const [game, setGame] = useState(null);

  function startGame(playerData) {
    setConfiguringPlayers(false);
    setGame(
      createGame(
        playerData.reduce((arr, config) => {
          if (!config.sittingOut) {
            arr.push(createPlayer(config.name));
          }
          return arr;
        }, [])
      )
    );
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
