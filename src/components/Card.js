export default function Card(props) {
  return (
    <div className={`card ${props.card.bonus}`}>
      <div className="card-banner">
        <div className="card-points">
          {props.card.infinityPoints ? `+${props.card.infinityPoints}` : ""}
        </div>
        <div
          className={props.card.level > 2 ? "time-stone" : "time-stone hide"}
        ></div>
        {Array(props.card.avengersTags)
          .fill(1)
          .map((_, i) => (
            <div className="avengers-tag" key={i}>
              A
            </div>
          ))}
      </div>
      <div className="card-cost">
        {Object.keys(props.card.cost).map((color, i) => (
          <div className={`cost-orb ${color}`} key={i}>
            {props.card.cost[color]}
          </div>
        ))}
      </div>
      <div className="card-name">{props.card.name}</div>
      <div className="level-stars">{" * ".repeat(props.card.level)}</div>
    </div>
  );
}
