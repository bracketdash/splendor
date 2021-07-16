export default function PlayerArea(props) {
  return (
    <div>
      <h2>{props.player.getName()}</h2>
      <p>
        {props.gameState.players[props.gameState.whoseTurn] === props.player
          ? ">> It is this player's turn."
          : ""}
      </p>
      <h4>Tokens</h4>
      <p>
        Gray:{" "}
        {
          props.gameState.ownerTracker.tokens.gray.filter(
            (owner) => owner === props.player
          ).length
        }
      </p>
      <p>
        Yellow:{" "}
        {
          props.gameState.ownerTracker.tokens.yellow.filter(
            (owner) => owner === props.player
          ).length
        }
      </p>
      <p>
        Red:{" "}
        {
          props.gameState.ownerTracker.tokens.red.filter(
            (owner) => owner === props.player
          ).length
        }
      </p>
      <p>
        Orange:{" "}
        {
          props.gameState.ownerTracker.tokens.orange.filter(
            (owner) => owner === props.player
          ).length
        }
      </p>
      <p>
        Blue:{" "}
        {
          props.gameState.ownerTracker.tokens.blue.filter(
            (owner) => owner === props.player
          ).length
        }
      </p>
      <p>
        Purple:{" "}
        {
          props.gameState.ownerTracker.tokens.purple.filter(
            (owner) => owner === props.player
          ).length
        }
      </p>
      <h4>Recruits</h4>
      {props.player.getRecruits().map((card) => {
        return (
          <p>
            {card.getName()} - Bonus: {card.getBonus()}
            <br />
            Points: {card.getInfinityPoints()} | A-Tags:{" "}
            {card.getNumAvengersTags()} | Lvl {card.getLevel()}
          </p>
        );
      })}
      <h4>Reserves</h4>
      {props.player.getReserves().map((card) => {
        return (
          <p>
            {card.getName()} - Bonus: {card.getBonus()}
            <br />
            Points: {card.getInfinityPoints()} | A-Tags:{" "}
            {card.getNumAvengersTags()} | Lvl {card.getLevel()}
          </p>
        );
      })}
      {props.gameState.players[props.gameState.whoseTurn] === props.player ? (
        props.gameState.options.map((option) => {
          return (
            <button>
              {option.type}: {option.tokens ? option.tokens.join(", ") : `${option.level}, ${option.index}`}
            </button>
          );
        })
      ) : (
        <p>&nbsp;</p>
      )}
    </div>
  );
}
