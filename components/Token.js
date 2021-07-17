export default function Token(props) {
  return (
    <div className={`token ${props.color}`}>
      <label>
        {props.color.substring(0, 1).toUpperCase() + props.color.substring(1)}
      </label>
      <span>{props.num}</span>
    </div>
  );
}
