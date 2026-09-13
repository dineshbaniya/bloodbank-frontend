import { useEffect, useState } from "react";
import { apiGet } from "./api";

const urgencyColors = { NORMAL: "#3498db", URGENT: "#f39c12", CRITICAL: "#e63950" };
const statusColors = { PENDING: "#f39c12", PARTIALLY_FULFILLED: "#3498db", FULFILLED: "#27ae60", CANCELLED: "#7f8c8d" };

const BANK_LAT = 27.68;
const BANK_LNG = 85.32;

function Requests({ auth, currentUser }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [sendingId, setSendingId] = useState(null);
  const [search, setSearch] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState("ALL");

  const canSendAlert = currentUser.role === "BANK_STAFF" || currentUser.role === "SUPER_ADMIN";

  useEffect(() => {
    loadRequests();
  }, [auth]);

  async function loadRequests() {
    try {
      const data = await apiGet("/requests", auth);
      setRequests(data);
    } catch (err) {
      setError("Failed to load requests.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSendAlert(req) {
    setSendingId(req.id);
    setMessage("");
    try {
      const response = await fetch(
        `http://localhost:8080/api/alerts/send/${req.id}?lat=${BANK_LAT}&lng=${BANK_LNG}`,
        { method: "POST", headers: { Authorization: auth } }
      );
      const alerts = await response.json();
      if (alerts.length === 0) {
        setMessage(`No eligible donors found nearby for ${req.patientName || "this request"}.`);
      } else {
        setMessage(`Alert sent to ${alerts.length} nearby donor(s) for ${req.patientName || "this request"}.`);
      }
    } catch (err) {
      setMessage("Failed to send alert.");
    } finally {
      setSendingId(null);
    }
  }

  const urgencyOptions = ["ALL", "NORMAL", "URGENT", "CRITICAL"];

  const filtered = requests.filter((r) => {
    const matchesSearch = (r.patientName || "").toLowerCase().includes(search.toLowerCase());
    const matchesUrgency = urgencyFilter === "ALL" || r.urgency === urgencyFilter;
    return matchesSearch && matchesUrgency;
  });

  return (
    <div>
      <h1 className="page-title">Blood Requests</h1>
      <p className="page-subtitle">Active requests, sorted by urgency</p>
      {error && <p className="error-text">{error}</p>}
      {message && <p style={{ color: "#27ae60", fontSize: "13px", marginBottom: "16px" }}>{message}</p>}

      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        <input
          className="search-bar"
          style={{ margin: 0 }}
          placeholder="Search by patient name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={urgencyFilter}
          onChange={(e) => setUrgencyFilter(e.target.value)}
          style={{
            background: "#ffffff08",
            border: "1px solid var(--border-soft)",
            borderRadius: "10px",
            padding: "11px 14px",
            color: "var(--text-primary)",
            fontSize: "14px",
          }}
        >
          {urgencyOptions.map((u) => (
            <option key={u} value={u} style={{ background: "#181a21" }}>
              {u === "ALL" ? "All urgencies" : u}
            </option>
          ))}
        </select>
      </div>

      {!loading && filtered.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            padding: "0 22px 10px",
            fontSize: "11px",
            fontWeight: "600",
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.6px",
          }}
        >
          <div style={{ flex: 1 }}>Patient</div>
          <div style={{ width: "90px", textAlign: "center" }}>Urgency</div>
          <div style={{ width: "150px", textAlign: "center" }}>Status</div>
          {canSendAlert && <div style={{ width: "100px", textAlign: "center" }}>Action</div>}
        </div>
      )}

      {loading ? (
        <p style={{ color: "var(--text-secondary)" }}>Loading requests…</p>
      ) : filtered.length === 0 ? (
        <div className="empty-state">No requests match your filters.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filtered.map((req) => {
            const urgencyColor = urgencyColors[req.urgency] || "#a8adb8";
            const statusColor = statusColors[req.status] || "#a8adb8";
            return (
              <div
                key={req.id}
                className="card"
                style={{ padding: "18px 22px", display: "flex", alignItems: "center", gap: "16px", borderLeft: `3px solid ${urgencyColor}`, borderRadius: "12px" }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "15px", fontWeight: "600" }}>{req.patientName || "Unnamed patient"}</div>
                  <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
                    {req.bloodGroup} · {req.componentType} · {req.quantityNeeded} unit(s)
                  </div>
                </div>
                <div style={{ width: "90px", textAlign: "center" }}>
                  <span className="pill" style={{ background: `${urgencyColor}22`, color: urgencyColor, border: `1px solid ${urgencyColor}55` }}>
                    {req.urgency}
                  </span>
                </div>
                <div style={{ width: "150px", textAlign: "center" }}>
                  <span className="pill" style={{ background: `${statusColor}22`, color: statusColor, border: `1px solid ${statusColor}55` }}>
                    {req.status}
                  </span>
                </div>
                {canSendAlert && (
                  <div style={{ width: "100px", textAlign: "center" }}>
                    {req.status === "PENDING" && (
                      <button
                        onClick={() => handleSendAlert(req)}
                        className="btn-primary"
                        style={{ padding: "8px 16px", fontSize: "12px" }}
                        disabled={sendingId === req.id}
                      >
                        {sendingId === req.id ? "Sending…" : "Send Alert"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Requests;