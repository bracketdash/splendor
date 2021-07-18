import Card from "./Card.js";
import Token from "./Token.js";

const colors = ["gray", "yellow", "red", "orange", "blue", "purple"];

export default function MiddleArea(props) {
  return (
    <div>
      <h2>
        {!props.gameState.playerStats
          ? `Round ${props.gameState.round}`
          : "GAME OVER"}
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
              {props.gameState.ownerTracker.avengersAssembleTile
                ? props.gameState.ownerTracker.avengersAssembleTile.getName()
                : "Not Yet Owned"}
            </div>
          </div>
        </div>
      </div>
      <div className="tiles-container">
        {props.gameState.locationTiles.map((locationTile, i) => {
          const owner = locationTile.getOwner();
          return (
            <div key={i}>
              <div className="tile">
                <div className="tile-name">{locationTile.getName()}</div>
                <div className="tile-points">+3</div>
                <div className="tile-cost">
                  {Object.keys(locationTile.getCost()).map((color, ii) => (
                    <div className={`tile-bonus-cost ${color}`} key={ii}>
                      {locationTile.getCost()[color]}
                    </div>
                  ))}
                </div>
                <div className="tile-owner">
                  {owner ? owner.getName() : "Not Yet Owned"}
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
          <Token
            key={i}
            color={color}
            num={
              props.gameState.ownerTracker.tokens[color].filter(
                (owner) => owner === null
              ).length
            }
          />
        ))}
      </div>
    </div>
  );
}
