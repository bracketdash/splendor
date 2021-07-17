import Token from "./Token.js";

const colors = ["gray", "yellow", "red", "orange", "blue", "purple"];

export default function MiddleArea(props) {
  return (
    <div>
      <h2>Round {props.gameState.round}</h2>
      <div className="tiles-container">
        <div>
          <div className="tile">
            <label>Avengers Tile</label>
            <span>
              {props.gameState.ownerTracker.avengersAssembleTile
                ? props.gameState.ownerTracker.avengersAssembleTile.getName()
                : "Unowned"}
            </span>
          </div>
        </div>
        {props.gameState.locationTiles.map((locationTile, i) => {
          const owner = locationTile.getOwner();
          return (
            <div key={i}>
              <div className="tile">
                <label>{locationTile.getName()}</label>
                <span>{owner ? owner.getName() : "Unowned"}</span>
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
            {props.gameState.freeAgents[level - 1].map((card, i) => {
              // TODO: replace with .map((card, i) => <Card card={card} />)
              return (
                <div key={i}>
                  <div className="card">
                    {card.getName()} - Bonus: {card.getBonus()}
                    <br />
                    Points: {card.getInfinityPoints()} | A-Tags:{" "}
                    {card.getNumAvengersTags()} | Lvl {card.getLevel()}
                  </div>
                </div>
              );
            })}
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
