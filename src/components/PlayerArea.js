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
        {props.player.name} - {props.player.points} Points
      </h2>
      {colors.map((color, i) => (
        <Token key={i} color={color} num={props.player.tokens[color]} />
      ))}
      <h4>{props.player.recruits.length > 0 ? "Recruits" : ""}</h4>
      <div className="cards-container">
        {props.player.recruits.map((card, i) => (
          <Card card={card} key={i} />
        ))}
      </div>
      <h4>{props.player.reserves.length > 0 ? "Reserves" : ""}</h4>
      <div className="cards-container">
        {props.player.reserves.map((card, i) => (
          <div>
            <Card card={card} key={i} />
          </div>
        ))}
      </div>
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
                      .toUpperCase()}${option.type.substring(1)} ${
                      (option.level === "reserves"
                        ? props.player.reserves[option.index]
                        : props.gameState.freeAgents[option.level - 1][
                            option.index
                          ]
                      ).name
                    }`
                  : ""}
                {option.location ? ` + ${option.location.name}` : ""}
              </div>
              <div className="ai-score">{option.score.toFixed(3)}</div>
            </button>
          );
        })
      ) : (
        <p>&nbsp;</p>
      )}
    </div>
  );
}
