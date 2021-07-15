import { useState } from "react";
import Head from "next/head";
import GameArea from "../components/GameArea.js";
import createPlayer from "../tools/createPlayer.js";
import PlayerConfig from "../components/PlayerConfig.js";

export default function Home() {
  const [configuringPlayers, setConfiguringPlayers] = useState(true);
  const [playerConfig, setPlayerConfig] = useState([
    { name: "Player 1" },
    { name: "Player 2" },
    { name: "Player 3", sittingOut: true },
    { name: "Player 4", sittingOut: true },
  ]);

  let game;

  function handleStartGame() {
    setConfiguringPlayers(false);
    // const players = playerConfigData.reduce((config, arr) => {
    //   if (!config.sittingOut) {
    //     arr.push(createPlayer(config.name));
    //   }
    //   return arr;
    // }, []);
    // game = new Game(players);
  }

  return (
    <div>
      <Head>
        <title>Splendor MARVEL</title>
      </Head>
      <main>
        <section className={configuringPlayers ? "" : "hide"}>
          <PlayerConfig
            playerConfig={playerConfig}
            setPlayerConfig={setPlayerConfig}
            onStartGame={handleStartGame}
          />
        </section>
        <section className={configuringPlayers ? "hide" : ""}>
          <GameArea />
        </section>
      </main>
    </div>
  );
}
