import Token from "./Token.js";

const colors = ["gray", "yellow", "red", "orange", "blue", "purple"];

export default function MiddleArea(props) {
  return (
    <div>
      <h2>Round {props.gameState.round}</h2>
      <p>
        Avengers Tile:{" "}
        {props.gameState.ownerTracker.avengersAssembleTile
          ? props.gameState.ownerTracker.avengersAssembleTile.getName()
          : "Unowned"}
      </p>
      {props.gameState.locationTiles.map((locationTile, i) => {
        const owner = locationTile.getOwner();
        return (
          <p key={i}>
            {locationTile.getName()}: {owner ? owner.getName() : "Unowned"}
          </p>
        );
      })}
      <h4>Level 3s:</h4>
      {props.gameState.freeAgents[2].map((card, i) => {
        return (
          <p key={i}>
            {card.getName()} - Bonus: {card.getBonus()}
            <br />
            Points: {card.getInfinityPoints()} | A-Tags:{" "}
            {card.getNumAvengersTags()} | Lvl {card.getLevel()}
          </p>
        );
      })}
      <p>{props.gameState.decks[2].length} left in deck.</p>
      <h4>Level 2s:</h4>
      {props.gameState.freeAgents[1].map((card, i) => {
        return (
          <p key={i}>
            {card.getName()} - Bonus: {card.getBonus()}
            <br />
            Points: {card.getInfinityPoints()} | A-Tags:{" "}
            {card.getNumAvengersTags()} | Lvl {card.getLevel()}
          </p>
        );
      })}
      <p>{props.gameState.decks[1].length} left in deck.</p>
      <h4>Level 1s:</h4>
      {props.gameState.freeAgents[0].map((card, i) => {
        return (
          <p key={i}>
            {card.getName()} - Bonus: {card.getBonus()}
            <br />
            Points: {card.getInfinityPoints()} | A-Tags:{" "}
            {card.getNumAvengersTags()} | Lvl {card.getLevel()}
          </p>
        );
      })}
      <p>{props.gameState.decks[0].length} left in deck.</p>
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
