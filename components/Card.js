export default function Card(props) {
  // TODO: design
  return (
    <div className={`card ${props.card.getBonus()}`}>
      <div>{props.card.getName()}</div>
      <div>Bonus: {props.card.getBonus()}</div>
      <div>Infinity Points: {props.card.getInfinityPoints()}</div>
      <div>Avengers Tags: {props.card.getNumAvengersTags()}</div>
      <div>Level: {props.card.getLevel()}</div>
    </div>
  );
}
