import Token from "./Token.js";

const colors = ["gray", "yellow", "red", "orange", "blue", "purple"];

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
      {colors.map((color) => (
        <Token
          color={color}
          num={
            props.gameState.ownerTracker.tokens[color].filter(
              (owner) => owner === props.player
            ).length
          }
        />
      ))}
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
