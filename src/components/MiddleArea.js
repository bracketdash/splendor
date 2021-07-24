import Card from "./Card.js";
import Token from "./Token.js";

const colors = ["gray", "yellow", "red", "orange", "blue", "purple"];

export default function MiddleArea(props) {
  return (
    <div>
      <h2>
        {props.gameState.gameOver
          ? "GAME OVER"
          : `Round ${props.gameState.round} - ${
              props.gameState.players[props.gameState.whoseTurn].name
            }'s turn`}
      </h2>
      <div className="tiles-container">
        <div>
          <div className="tile">
            <div className="tile-name">Avengers Tile</div>
            <div className="tile-points">+3</div>
            <div className="tile-cost">
              <div className="tile-bonus-cost">3+</div>
            </div>
            <div className="tile-owner">
              {props.gameState.avengersTileOwner
                ? props.gameState.avengersTileOwner.name
                : "Not Yet Owned"}
            </div>
          </div>
        </div>
      </div>
      <div className="tiles-container">
        {props.gameState.locations.map((location, i) => {
          const owner = location.owner;
          return (
            <div key={i}>
              <div className="tile">
                <div className="tile-name">{location.name}</div>
                <div className="tile-points">+3</div>
                <div className="tile-cost">
                  {Object.keys(location.cost).map((color, ii) => (
                    <div className={`tile-bonus-cost ${color}`} key={ii}>
                      {location.cost[color]}
                    </div>
                  ))}
                </div>
                <div className="tile-owner">
                  {location.owner ? location.owner.name : "Not Yet Owned"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {[3, 2, 1].map((level) => {
        return (
          <div className="level-row" key={level}>
            {props.gameState.freeAgents[level - 1].map((card, i) => (
              <Card card={card} key={i} />
            ))}
          </div>
        );
      })}
      <div className="the-bank">
        {colors.map((color, i) => (
          <Token key={i} color={color} num={props.gameState.bankChips[color]} />
        ))}
      </div>
    </div>
  );
}
