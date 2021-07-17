export default function Card(props) {
  return (
    <div className={`card ${props.card.getBonus()}`}>
      <div className="card-banner">
        <div className="card-points">
          {props.card.getInfinityPoints()
            ? `+${props.card.getInfinityPoints()}`
            : ""}
        </div>
        <div
          className={
            props.card.getLevel() > 2 ? "time-stone" : "time-stone hide"
          }
        ></div>
        {Array(props.card.getNumAvengersTags())
          .fill(1)
          .map((_, i) => (
            <div className="avengers-tag" key={i}>A</div>
          ))}
      </div>
      <div className="card-cost">
        {Object.keys(props.card.getCost()).map((color, i) => (
          <div className={`cost-orb ${color}`} key={i}>
            {props.card.getCost()[color]}
          </div>
        ))}
      </div>
      <div className="card-name">{props.card.getName()}</div>
      <div className="level-stars">{" * ".repeat(props.card.getLevel())}</div>
    </div>
  );
}
