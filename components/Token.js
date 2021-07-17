export default function Token(props) {
  return <div className={`token ${props.color}`}>{props.num}</div>;
}
