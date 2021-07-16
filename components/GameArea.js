import { useState } from "react";
import MiddleArea from "../components/MiddleArea.js";
import PlayerArea from "../components/PlayerArea.js";

export default function GameArea(props) {
  if (!props.game) {
    return <div></div>;
  }

  const [gameState, setGameState] = useState(props.game.getState());

  function makeMove(selectedOption, player) {
    props.game.makeMove(selectedOption, player).then((newGameState) => {
      setGameState(newGameState);
    });
  }

  return (
    <div>
      <MiddleArea gameState={gameState} />
      {gameState.players.map((player, i) => (
        <PlayerArea key={i} gameState={gameState} player={player} onMove={makeMove} />
      ))}
    </div>
  );
}
