import { useState } from "react";
import Head from "next/head";
import GameArea from "../components/GameArea.js";
import PlayerConfig from "../components/PlayerConfig.js";

export default function Home() {
  const [configuringPlayers, setConfiguringPlayers] = useState(true);

  return (
    <div>
      <Head>
        <title>Splendor MARVEL</title>
      </Head>
      <main>
        <section className={configuringPlayers ? "" : "hide"}>
          <PlayerConfig />
        </section>
        <section className={configuringPlayers ? "hide" : ""}>
          <GameArea />
        </section>
      </main>
    </div>
  );
}
