import { useEffect, useState } from "react";
import { apiGet } from "./api";

function Forecast({ auth }) {
  const [forecast, setForecast] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadForecast() {
      try {
        const data = await apiGet("/forecast/donations", auth);
        setForecast(data);
      } catch (err) {
        setError("Failed to load forecast. Is the Python AI service running on port 5000?");
      } finally {
        setLoading(false);
      }
    }
    loadForecast();
  }, [auth]);

  return (
    <div>
      <h1 className="page-title">AI Demand Forecast</h1>
      <p className="page-subtitle">Predicted next-period demand, based on recent donation history</p>

      {loading && <p style={{ color: "var(--text-secondary)" }}>Running forecast…</p>}
      {error && <p className="error-text">{error}</p>}

      {forecast && (
        <div className="card" style={{ position: "relative", padding: "40px", maxWidth: "420px", overflow: "hidden" }}>
          <div
            style={{
              position: "absolute",
              top: "-60px",
              right: "-60px",
              width: "180px",
              height: "180px",
              background: "radial-gradient(circle, #e6395055 0%, transparent 70%)",
              borderRadius: "50%",
            }}
          ></div>
          <div style={{ position: "relative", zIndex: 1 }}>
            <div className="section-label" style={{ marginBottom: "10px" }}>
              Predicted next-period demand
            </div>
            <div style={{ fontSize: "56px", fontWeight: "800", color: "#fff" }}>
              {forecast.predicted_next_period_demand}
            </div>
            <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "16px" }}>
              Based on {forecast.history_used.length} day(s) of history: {forecast.history_used.join(", ")}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Forecast;