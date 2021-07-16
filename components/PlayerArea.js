export default function PlayerArea(props) {
  // TODO: display player tokens, recruits, reserves
  // TODO: active player state, available options + scores, handle choosing option

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
      <h4>Reserves</h4>
      <p>
        If it's this player's turn, this block should be highlighted and a list
        of options should be shown
      </p>
    </div>
  );
}
