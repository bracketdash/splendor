export default function PlayerArea(props) {
  return (
    <div>
      <h2>{props.player.getName()}</h2>
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
      <p>
        <strong>
          {props.gameState.players[props.gameState.whoseTurn] === props.player
            ? ">> It is this player's turn. Their choices are..."
            : ""}
        </strong>
      </p>
      {props.gameState.players[props.gameState.whoseTurn] === props.player ? (
        props.gameState.options.map((option, i) => {
          return (
            <p key={i}>
              <button onClick={() => props.onMove(option, props.player)}>
                {option.type}:{" "}
                {option.tokens
                  ? option.tokens.join(", ")
                  : `${option.level}, ${option.index}`}{" "}
                ({option.score})
              </button>
            </p>
          );
        })
      ) : (
        <p>&nbsp;</p>
      )}
    </div>
  );
}
