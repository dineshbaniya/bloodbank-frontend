import { useEffect, useState } from "react";
import { apiGet } from "./api";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const groupColors = {
  A_POS: "#3498db", A_NEG: "#2980b9",
  B_POS: "#27ae60", B_NEG: "#1e8449",
  AB_POS: "#9b59b6", AB_NEG: "#8e44ad",
  O_POS: "#e63950", O_NEG: "#b4243a",
};

const urgencyColors = { NORMAL: "#3498db", URGENT: "#f39c12", CRITICAL: "#e63950" };

function Dashboard({ auth, onNavigate }) {
  const [donors, setDonors] = useState([]);
  const [inventoryCount, setInventoryCount] = useState(null);
  const [requests, setRequests] = useState([]);
  const [expiringSoon, setExpiringSoon] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStats() {
      try {
        const donorsData = await apiGet("/donors", auth);
        const inventory = await apiGet("/inventory", auth);
        const requestsData = await apiGet("/requests", auth);
        const expiring = await apiGet("/inventory/nearing-expiry?withinDays=7", auth);
        setDonors(donorsData);
        setInventoryCount(inventory.length);
        setRequests(requestsData);
        setExpiringSoon(expiring);
      } catch (err) {
        setError("Failed to load dashboard stats.");
      }
    }
    loadStats();
  }, [auth]);

  const cards = [
    { label: "Total Donors", value: donors.length || (donors.length === 0 ? null : 0), color: "#3498db" },
    { label: "Inventory Units", value: inventoryCount, color: "#e63950" },
    { label: "Blood Requests", value: requests.length, color: "#27ae60" },
  ];

  const groupCounts = {};
  donors.forEach((d) => {
    groupCounts[d.bloodGroup] = (groupCounts[d.bloodGroup] || 0) + 1;
  });
  const chartData = Object.entries(groupCounts).map(([name, value]) => ({ name, value }));

  const recentRequests = [...requests].sort((a, b) => b.id - a.id).slice(0, 5);

  const quickActions = [
    { label: "View Donors", icon: "🧑‍🤝‍🧑", page: "donors" },
    { label: "View Inventory", icon: "🧪", page: "inventory" },
    { label: "View Requests", icon: "📋", page: "requests" },
    { label: "AI Forecast", icon: "✨", page: "forecast" },
  ];

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-subtitle">Live overview of your blood bank</p>
      {error && <p className="error-text">{error}</p>}

      <div style={{ display: "flex", gap: "18px", flexWrap: "wrap", marginBottom: "24px" }}>
        {cards.map((card) => (
          <div key={card.label} className="card card-hover" style={{ padding: "24px", minWidth: "200px", boxShadow: `0 8px 24px ${card.color}1a` }}>
            <div className="stat-label">{card.label}</div>
            <div className="stat-value" style={{ color: card.color }}>
              {card.value === null ? "…" : card.value}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px", marginBottom: "24px" }}>
        <div className="card" style={{ padding: "24px" }}>
          <div className="section-label" style={{ marginBottom: "16px" }}>Blood group distribution</div>
          {chartData.length === 0 ? (
            <div className="empty-state">No donor data yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={groupColors[entry.name] || "#7f8c8d"} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#181a21", border: "1px solid #262932", borderRadius: "8px", fontSize: "13px" }} />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card" style={{ padding: "24px" }}>
          <div className="section-label" style={{ marginBottom: "16px" }}>Quick actions</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {quickActions.map((action) => (
              <div
                key={action.page}
                onClick={() => onNavigate(action.page)}
                className="card card-hover"
                style={{ padding: "18px", textAlign: "center", cursor: "pointer" }}
              >
                <div style={{ fontSize: "22px", marginBottom: "8px" }}>{action.icon}</div>
                <div style={{ fontSize: "13px", fontWeight: "500" }}>{action.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
             {expiringSoon.length > 0 && (
        <div className="card" style={{ padding: "24px", marginBottom: "24px", border: "1px solid #f39c1244" }}>
          <div className="section-label" style={{ marginBottom: "16px", color: "#f39c12" }}>
            ⚠ Expiring within 7 days
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {expiringSoon.map((unit) => (
              <div key={unit.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #ffffff08" }}>
                <div style={{ fontSize: "14px" }}>
                  <span style={{ fontWeight: "500" }}>{unit.bloodGroup}</span>
                  <span style={{ color: "var(--text-secondary)" }}> · {unit.componentType}</span>
                </div>
                <span style={{ fontSize: "13px", color: "#f39c12", fontWeight: "600" }}>
                  Expires {unit.expiryDate}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="card" style={{ padding: "24px" }}>
        <div className="section-label" style={{ marginBottom: "16px" }}>Recent requests</div>
        {recentRequests.length === 0 ? (
          <div className="empty-state">No requests yet.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {recentRequests.map((req) => {
              const color = urgencyColors[req.urgency] || "#a8adb8";
              return (
                <div key={req.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #ffffff08" }}>
                  <div style={{ fontSize: "14px" }}>
                    <span style={{ fontWeight: "500" }}>{req.patientName || "Unnamed"}</span>
                    <span style={{ color: "var(--text-secondary)" }}> · {req.bloodGroup} · {req.quantityNeeded} unit(s)</span>
                  </div>
                  <span className="pill" style={{ background: `${color}22`, color, border: `1px solid ${color}55` }}>
                    {req.urgency}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;