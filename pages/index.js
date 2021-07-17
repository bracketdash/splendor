import { useState } from "react";
import Head from "next/head";
import GameArea from "../components/GameArea.js";
import createGame from "../tools/createGame.js";
import createPlayer from "../tools/createPlayer.js";
import PlayerConfig from "../components/PlayerConfig.js";

// ui TODOs
// TODO: style cards
// TODO: add win condition checklist to top right of player area

// bug TODOs
// TODO: recruiting not deducting tokens?
// TODO: locations not being assigned?
// TODO: gray tokens not included in the option object for reserves?
// TODO: end-game scenario breaking the page?

// infra TODOs
// TODO: make the player config screen the home route and /game the game screen
// TODO: refactor all the things

// more TODOs (related to ai) in getOptionScore.js

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
