export default function MiddleArea(props) {
  return (
    <div>
      <h1>Game Round {props.gameState.round}</h1>
      <p>
        Avengers Tile:{" "}
        {props.gameState.ownerTracker.avengersAssembleTile
          ? props.gameState.ownerTracker.avengersAssembleTile.getName()
          : "Unowned"}
      </p>
      {props.gameState.locationTiles.map((locationTile) => {
        const owner = locationTile.getOwner();
        return (
          <p>
            {locationTile.getName()}: {owner ? owner.getName() : "Unowned"}
          </p>
        );
      })}
      <h4>Level 3s:</h4>
      {props.gameState.freeAgents[2].map((card) => {
        return (
          <p>
            {card.getName()} - Bonus: {card.getBonus()}
            <br />
            Points: {card.getInfinityPoints()} | A-Tags:{" "}
            {card.getNumAvengersTags()} | Lvl {card.getLevel()}
          </p>
        );
      })}
      <p>{props.gameState.decks[2].length} left in deck.</p>
      <h4>Level 2s:</h4>
      {props.gameState.freeAgents[1].map((card) => {
        return (
          <p>
            {card.getName()} - Bonus: {card.getBonus()}
            <br />
            Points: {card.getInfinityPoints()} | A-Tags:{" "}
            {card.getNumAvengersTags()} | Lvl {card.getLevel()}
          </p>
        );
      })}
      <p>{props.gameState.decks[1].length} left in deck.</p>
      <h4>Level 1s:</h4>
      {props.gameState.freeAgents[0].map((card) => {
        return (
          <p>
            {card.getName()} - Bonus: {card.getBonus()}
            <br />
            Points: {card.getInfinityPoints()} | A-Tags:{" "}
            {card.getNumAvengersTags()} | Lvl {card.getLevel()}
          </p>
        );
      })}
      <p>{props.gameState.decks[0].length} left in deck.</p>
      <h3>The Bank</h3>
      <p>
        Gray:{" "}
        {
          props.gameState.ownerTracker.tokens.gray.filter(
            (owner) => owner === null
          ).length
        }
      </p>
      <p>
        Yellow:{" "}
        {
          props.gameState.ownerTracker.tokens.yellow.filter(
            (owner) => owner === null
          ).length
        }
      </p>
      <p>
        Red:{" "}
        {
          props.gameState.ownerTracker.tokens.red.filter(
            (owner) => owner === null
          ).length
        }
      </p>
      <p>
        Orange:{" "}
        {
          props.gameState.ownerTracker.tokens.orange.filter(
            (owner) => owner === null
          ).length
        }
      </p>
      <p>
        Blue:{" "}
        {
          props.gameState.ownerTracker.tokens.blue.filter(
            (owner) => owner === null
          ).length
        }
      </p>
      <p>
        Purple:{" "}
        {
          props.gameState.ownerTracker.tokens.purple.filter(
            (owner) => owner === null
          ).length
        }
      </p>
    </div>
  );
}
