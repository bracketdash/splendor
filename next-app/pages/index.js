import Head from "next/head";
import PlayerConfig from "../components/PlayerConfig.js";
import styles from "../styles/Home.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Splendor MARVEL</title>
      </Head>
      <main>
        <section>
          <PlayerConfig />
        </section>
        <section>
          <GameArea />
        </section>
      </main>
    </div>
  );
}
