import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
  const [url, setUrl] = useState("");
  const [history, setHistory] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const reviews =
      JSON.parse(localStorage.getItem("reviews")) || [];

    setHistory(reviews);
  }, []);

  const handleReview = () => {
    const regex =
      /github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/;

    const match = url.match(regex);

    if (!match) {
      alert("Invalid GitHub PR URL");
      return;
    }

    const owner = match[1];
    const repo = match[2];
    const pr = match[3];

    const newHistory = [url, ...history.slice(0, 4)];

    localStorage.setItem(
      "reviews",
      JSON.stringify(newHistory)
    );

    navigate(`/review/${owner}/${repo}/${pr}`);
  };

  return (
    <div className="home">
      <h1>CodeLens</h1>

      <p>
        AI Powered GitHub Pull Request Review Tool
      </p>

      <input
        type="text"
        placeholder="Paste GitHub PR URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />

      <button onClick={handleReview}>
        Review PR
      </button>

      <div className="history">
        <h2>Recent Reviews</h2>

        {history.map((item, index) => (
          <div key={index}>{item}</div>
        ))}
      </div>
    </div>
  );
}

export default Home;