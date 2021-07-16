import { useState } from "react";
import Head from "next/head";
import GameArea from "../components/GameArea.js";
import createGame from "../tools/createGame.js";
import createPlayer from "../tools/createPlayer.js";
import PlayerConfig from "../components/PlayerConfig.js";

export default function Home() {
  const [configuringPlayers, setConfiguringPlayers] = useState(true);

  let game;

  function startGame(playerData) {
    setConfiguringPlayers(false);
    game = createGame(
      playerData.reduce((config, arr) => {
        if (!config.sittingOut) {
          arr.push(createPlayer(config.name));
        }
        return arr;
      }, [])
    );
  }

  return (
    <div>
      <Head>
        <title>Splendor MARVEL</title>
      </Head>
      <main>
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
