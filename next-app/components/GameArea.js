import MiddleArea from "../components/MiddleArea.js";
import PlayerArea from "../components/PlayerArea.js";

const players = []; // TODO

export default function GameArea() {
  return (
    <div>
      <MiddleArea />
      {players.map((player) => (
        <PlayerArea player={player} />
      ))}
    </div>
  );
}
