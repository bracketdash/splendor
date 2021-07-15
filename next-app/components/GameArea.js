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
