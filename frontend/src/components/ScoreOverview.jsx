import "./ScoreOverview.css";

export default function ScoreOverview({
  overallScore,
}) {
  const avg = Math.round(
    (
      overallScore.quality +
      overallScore.security +
      overallScore.performance +
      overallScore.readability
    ) / 4
  );

  return (
    <div className="score-card">
      <h3>Overall Score</h3>

      <div className="score">
        {avg}/10
      </div>

      <div className="metrics">
        <p>
          Quality:
          {overallScore.quality}
        </p>

        <p>
          Security:
          {overallScore.security}
        </p>

        <p>
          Performance:
          {overallScore.performance}
        </p>

        <p>
          Readability:
          {overallScore.readability}
        </p>
      </div>
    </div>
  );
}