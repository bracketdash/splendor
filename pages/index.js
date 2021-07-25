import { useState } from "react";
import Head from "next/head";

import GameArea from "../src/components/GameArea.js";
import PlayerConfig from "../src/components/PlayerConfig.js";

import Game from "../src/game.js";

export default function Home() {
  const [configuringPlayers, setConfiguringPlayers] = useState(true);

  const [game, setGame] = useState(null);
  const [gameState, setGameState] = useState(null);

  function makeMove(selectedOption, player, firstGame) {
    const game = firstGame || game;
    game.makeMove(selectedOption, player).then((newGameState) => {
      if (newGameState.gameOver) {
        setGameState(newGameState);
        return;
      }
      const newPlayer = newGameState.players[newGameState.whoseTurn];
      if (newPlayer.computer) {
        makeMove(
          Object.keys(newGameState.options)
            .reduce((opts, key) => opts.concat(newGameState.options[key]), [])
            .sort((a, b) => (a.score > b.score ? -1 : 1))[0],
          newPlayer,
          firstGame
        );
      } else {
        setGameState(newGameState);
      }
    });
  }

  function startGame(playerData) {
    const players = playerData.filter((p) => !p.sittingOut);
    const firstGame = new Game(players);
    const gameState = firstGame.getState();
    setConfiguringPlayers(false);
    setGame(firstGame);
    setGameState(gameState);
    if (players[0].computer) {
      makeMove(
        Object.keys(gameState.options)
          .reduce((opts, key) => opts.concat(gameState.options[key]), [])
          .sort((a, b) => (a.score > b.score ? -1 : 1))[0],
        players[0],
        firstGame
      );
    }
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
          <GameArea
            game={game}
            gameState={gameState}
            onMakeMove={makeMove}
            onSetGameState={setGameState}
          />
        </section>
      </main>
    </div>
  );
}
