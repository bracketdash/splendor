import { useState } from "react";

export default function PlayerConfig(props) {
  const [players, setPlayers] = useState([
    { name: "Player 1" },
    { name: "Player 2" },
    { name: "Player 3", sittingOut: true },
    { name: "Player 4", sittingOut: true },
  ]);

  function startGame() {
    props.onStartGame(players);
  }

  function updatePlayerName(index, newName) {
    setPlayers((players) => {
      players[index].name = newName;
      return [...players];
    });
  }

  function updatePlayerSittingOut(index, newSittingOut) {
    setPlayers((players) => {
      players[index].sittingOut = newSittingOut;
      return [...players];
    });
  }

  return (
    <div className="player-config-container">
      <h2>Configure Players</h2>
      {players.map((player, index) => {
        if (index < 2) {
          return (
            <div className="player-config-row" key={index}>
              <input
                type="text"
                defaultValue={player.name}
                onChange={(e) => updatePlayerName(index, e.target.value)}
              />
            </div>
          );
        } else {
          return (
            <div
              className={
                player.sittingOut
                  ? "player-config-row sitting-out"
                  : "player-config-row"
              }
              key={index}
            >
              <input
                type="text"
                defaultValue={player.name}
                onChange={(e) => updatePlayerName(index, e.target.value)}
              />
              <label>
                <input
                  type="checkbox"
                  defaultChecked={player.sittingOut}
                  onChange={(e) =>
                    updatePlayerSittingOut(index, e.target.checked)
                  }
                />
                <span>Sitting out</span>
              </label>
            </div>
          );
        }
      })}
      <button onClick={startGame}>Start Game</button>
    </div>
  );
}
