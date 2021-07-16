export default function PlayerArea(props) {
  // TODO: display player tokens, recruits, reserves
  // TODO: active player state, available options + scores, handle choosing option

  return (
    <div>
      <h2>{props.player.getName()}</h2>
      <p>
        If it's this player's turn, this block should be highlighted and a list
        of options should be shown
      </p>
    </div>
  );
}
