import Card from "./Card.js";
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
      <h2>
        {props.player.getName()} - {props.points} Points
      </h2>
      {colors.map((color, i) => (
        <Token
          key={i}
          color={color}
          num={
            props.gameState.ownerTracker.tokens[color].filter(
              (owner) => owner === props.player
            ).length
          }
        />
      ))}
      <h4>{props.player.getRecruits().length > 0 ? "Recruits" : ""}</h4>
      {props.player.getRecruits().map((card, i) => (
        <Card card={card} key={i} />
      ))}
      <h4>{props.player.getReserves().length > 0 ? "Reserves" : ""}</h4>
      {props.player.getReserves().map((card, i) => (
        <Card card={card} key={i} />
      ))}
      <h4>
        {props.gameState.players[props.gameState.whoseTurn] === props.player
          ? "Select A Move"
          : ""}
      </h4>
      {props.gameState.players[props.gameState.whoseTurn] === props.player ? (
        props.gameState.options.map((option, i) => {
          return (
            <button
              className={option.tokens ? "has-tokens" : ""}
              key={i}
              onClick={() => props.onMove(option, props.player)}
            >
              <div className="action">
                {option.tokens
                  ? option.tokens.map((token, ii) => (
                      <span className={`option-token ${token}`} key={ii}></span>
                    ))
                  : ""}
                {option.type === "recruit" || option.type === "reserve"
                  ? `${option.type
                      .substring(0, 1)
                      .toUpperCase()}${option.type.substring(
                      1
                    )} ${(option.level === "reserves"
                      ? props.gameState.players[
                          props.gameState.whoseTurn
                        ].getReserves()[option.index]
                      : props.gameState.freeAgents[option.level - 1][
                          option.index
                        ]
                    ).getName()}`
                  : ""}
                {option.location ? ` + ${option.location.getName()}` : ""}
              </div>
              <div className="ai-score">{option.score.toFixed(0)}</div>
            </button>
          );
        })
      ) : (
        <p>&nbsp;</p>
      )}
    </div>
  );
}
