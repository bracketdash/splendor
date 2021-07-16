export default function PlayerArea(props) {
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
