export default function PlayerConfig(props) {
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
          onChange={updatePlayerName(0, this.value)}
        />
      </div>
      <div className="player-config-row">
        <input
          type="text"
          defaultValue={props.playerConfig[1].name}
          onChange={updatePlayerName(1, this.value)}
        />
      </div>
      <div className="player-config-row">
        <input
          type="text"
          defaultValue={props.playerConfig[2].name}
          onChange={updatePlayerName(2, this.value)}
        />
        <label>
          <input
            type="checkbox"
            defaultValue={props.playerConfig[2].sittingOut}
            onChange={updatePlayerSittingOut(2, this.value)}
          />
          <span>Sit out</span>
        </label>
      </div>
      <div className="player-config-row">
        <input
          type="text"
          defaultValue={props.playerConfig[3].name}
          onChange={updatePlayerName(3, this.value)}
        />
        <label>
          <input
            type="checkbox"
            defaultValue={props.playerConfig[2].sittingOut}
            onChange={updatePlayerSittingOut(2, this.value)}
          />
          <span>Sit out</span>
        </label>
      </div>
      <button>Start Game</button>
    </div>
  );
}
