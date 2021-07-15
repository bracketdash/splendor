export default function PlayerConfig(props) {
  function startGame() {
    props.onStartGame();
  }
  function updatePlayerName(index, newName) {
    props.playerConfig[index].name = newName;
    props.setPlayerConfig(props.playerConfig);
  }
  function updatePlayerSittingOut(index, newSittingOut) {
    props.playerConfig[index].sittingOut = newSittingOut;
    props.setPlayerConfig(props.playerConfig);
  }
  return (
    <div>
      <h1>Players</h1>
      <div className="player-config-row">
        <input
          type="text"
          defaultValue={props.playerConfig[0].name}
          onChange={(e) => updatePlayerName(0, e.target.value)}
        />
      </div>
      <div className="player-config-row">
        <input
          type="text"
          defaultValue={props.playerConfig[1].name}
          onChange={(e) => updatePlayerName(1, e.target.value)}
        />
      </div>
      <div className="player-config-row">
        <input
          type="text"
          defaultValue={props.playerConfig[2].name}
          onChange={(e) => updatePlayerName(2, e.target.value)}
        />
        <label>
          <input
            type="checkbox"
            defaultChecked={props.playerConfig[2].sittingOut}
            onChange={(e) => updatePlayerSittingOut(2, e.target.checked)}
          />
          <span>Sit out</span>
        </label>
      </div>
      <div className="player-config-row">
        <input
          type="text"
          defaultValue={props.playerConfig[3].name}
          onChange={(e) => updatePlayerName(3, e.target.value)}
        />
        <label>
          <input
            type="checkbox"
            defaultChecked={props.playerConfig[3].sittingOut}
            onChange={(e) => updatePlayerSittingOut(3, e.target.checked)}
          />
          <span>Sit out</span>
        </label>
      </div>
      <button onClick={startGame}>Start Game</button>
    </div>
  );
}
