import { useState } from "react";

import MiddleArea from "./MiddleArea.js";
import PlayerArea from "./PlayerArea.js";

export default function GameArea(props) {
  if (!props.game) {
    return <div></div>;
  }

  const [gameState, setGameState] = useState(props.game.getState());

  function makeMove(selectedOption, player) {
    props.game.makeMove(selectedOption, player).then((newGameState) => {
      const newPlayer = newGameState.players[newGameState.whoseTurn];
      if (newPlayer.computer) {
        makeMove(
          Object.keys(newGameState.options)
            .reduce((opts, key) => opts.concat(newGameState.options[key]), [])
            .sort((a, b) => (a.score > b.score ? -1 : 1))[0],
          newPlayer
        );
      } else {
        setGameState(newGameState);
      }
    });
  }

  return (
    <div>
      <MiddleArea gameState={gameState} />
      {gameState.players.map((player, i) => (
        <PlayerArea
          key={i}
          gameState={gameState}
          player={player}
          onMove={makeMove}
        />
      ))}
    </div>
  );
}
