import { useState } from "react";
import MiddleArea from "../components/MiddleArea.js";
import PlayerArea from "../components/PlayerArea.js";

export default function GameArea(props) {
  if (!props.game) {
    return <div></div>;
  }

  const [gameState, setGameState] = useState(props.game.getState());

  function makeMove(decision) {
    props.game.makeMove(decision).then((newGameState) => {
      setGameState(newGameState);
      // TODO: produce options for next player here?
    });
  }

  return (
    <div>
      <MiddleArea gameState={gameState} />
      {gameState.players.map((player) => (
        <PlayerArea gameState={gameState} player={player} onMove={makeMove} />
      ))}
    </div>
  );
}
