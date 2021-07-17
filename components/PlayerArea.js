export default function PlayerArea(props) {
  return (
    <div
      className={
        props.gameState.players[props.gameState.whoseTurn] === props.player
          ? "player-area-container active-player"
          : "player-area-container"
      }
    >
      <h2>{props.player.getName()}</h2>
      <div className="token gray">
        <label>Gray</label>
        <span>
          {
            props.gameState.ownerTracker.tokens.gray.filter(
              (owner) => owner === props.player
            ).length
          }
        </span>
      </div>
      <div className="token yellow">
        <label>Yellow</label>
        <span>
          {
            props.gameState.ownerTracker.tokens.yellow.filter(
              (owner) => owner === props.player
            ).length
          }
        </span>
      </div>
      <div className="token red">
        <label>Red</label>
        <span>
          {
            props.gameState.ownerTracker.tokens.red.filter(
              (owner) => owner === props.player
            ).length
          }
        </span>
      </div>
      <div className="token orange">
        <label>Orange</label>
        <span>
          {
            props.gameState.ownerTracker.tokens.orange.filter(
              (owner) => owner === props.player
            ).length
          }
        </span>
      </div>
      <div className="token blue">
        <label>Blue</label>
        <span>
          {
            props.gameState.ownerTracker.tokens.blue.filter(
              (owner) => owner === props.player
            ).length
          }
        </span>
      </div>
      <div className="token purple">
        <label>Purple</label>
        <span>
          {
            props.gameState.ownerTracker.tokens.purple.filter(
              (owner) => owner === props.player
            ).length
          }
        </span>
      </div>
      <h4>Recruits</h4>
      {props.player.getRecruits().map((card, i) => {
        return (
          <p key={i}>
            {card.getName()} - Bonus: {card.getBonus()}
            <br />
            Points: {card.getInfinityPoints()} | A-Tags:{" "}
            {card.getNumAvengersTags()} | Lvl {card.getLevel()}
          </p>
        );
      })}
      <h4>Reserves</h4>
      {props.player.getReserves().map((card, i) => {
        return (
          <p key={i}>
            {card.getName()} - Bonus: {card.getBonus()}
            <br />
            Points: {card.getInfinityPoints()} | A-Tags:{" "}
            {card.getNumAvengersTags()} | Lvl {card.getLevel()}
          </p>
        );
      })}
      {props.gameState.players[props.gameState.whoseTurn] === props.player ? (
        props.gameState.options.map((option, i) => {
          return (
            <button key={i} onClick={() => props.onMove(option, props.player)}>
              {option.type}:{" "}
              {option.tokens
                ? option.tokens.join(", ")
                : `${option.level}, ${option.index}`}{" "}
              ({option.score})
            </button>
          );
        })
      ) : (
        <p>&nbsp;</p>
      )}
    </div>
  );
}
