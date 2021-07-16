import MiddleArea from "../components/MiddleArea.js";
import PlayerArea from "../components/PlayerArea.js";

export default function GameArea(props) {
  const gameState = props.game.getState();
  return (
    <div>
      <MiddleArea gameState={gameState} />
      {gameState.players.map((player) => (
        <PlayerArea player={player} />
      ))}
    </div>
  );
}
