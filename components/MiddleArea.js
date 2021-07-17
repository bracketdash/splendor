import Card from "./Card.js";
import Token from "./Token.js";

const colors = ["gray", "yellow", "red", "orange", "blue", "purple"];

// TODO: add cost to tiles

export default function MiddleArea(props) {
  return (
    <div>
      <h2>Round {props.gameState.round}</h2>
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
        {props.gameState.locationTiles.map((locationTile, i) => {
          const owner = locationTile.getOwner();
          return (
            <div key={i}>
              <div className="tile">
                <div className="tile-name">{locationTile.getName()}</div>
                <div className="tile-points">+3</div>
                <div className="tile-cost">
                  {Object.keys(locationTile.getCost()).map((color) => (
                    <div className={`tile-bonus-cost ${color}`}>
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
            <div>
              <div className={`card deck lvl-${level}`}>
                <div className="remaining-num">
                  {props.gameState.decks[level - 1].length}
                </div>
                <div className="remaining-label">remaining</div>
                <div className="level-stars">{" * ".repeat(level)}</div>
              </div>
            </div>
            {props.gameState.freeAgents[level - 1].map((card, i) => (
              <Card card={card} key={i} />
            ))}
          </div>
        );
      })}
      <h3>The Bank</h3>
      {colors.map((color) => (
        <Token
          color={color}
          num={
            props.gameState.ownerTracker.tokens[color].filter(
              (owner) => owner === null
            ).length
          }
        />
      ))}
    </div>
  );
}
