import "./Scorecard.css";

function Scorecard({ scores }) {
  const average =
    (
      (scores.quality +
        scores.security +
        scores.performance +
        scores.readability) /
      4
    ).toFixed(1);

  let colorClass = "bad";

  if (average >= 8) colorClass = "good";
  else if (average >= 5) colorClass = "average";

  return (
    <div className="score-card">
      <div className={`overall-score ${colorClass}`}>
        {average}/10
      </div>

      <div className="metrics">
        <div>Quality: {scores.quality}</div>
        <div>Security: {scores.security}</div>
        <div>Performance: {scores.performance}</div>
        <div>Readability: {scores.readability}</div>
      </div>
    </div>
  );
}

export default Scorecard;