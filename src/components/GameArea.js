import MiddleArea from "./MiddleArea.js";
import PlayerArea from "./PlayerArea.js";

export default function GameArea(props) {
  if (!props.game || !props.gameState) {
    return <div></div>;
  }
  return (
    <div>
      <MiddleArea gameState={props.gameState} />
      {props.gameState.players.map((player, i) => (
        <PlayerArea
          key={i}
          gameState={props.gameState}
          player={player}
          onMove={props.onMakeMove}
        />
      ))}
    </div>
  );
}
