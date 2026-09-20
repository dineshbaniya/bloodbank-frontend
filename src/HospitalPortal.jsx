import { useEffect, useState } from "react";
import { apiGet, apiPost, formatBloodGroup } from "./api";

const urgencyColors = { NORMAL: "#3498db", URGENT: "#f39c12", CRITICAL: "#e63950" };
const statusColors = { PENDING: "#f39c12", PARTIALLY_FULFILLED: "#3498db", FULFILLED: "#27ae60", CANCELLED: "#7f8c8d" };

function HospitalPortal({ auth, currentUser }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    bloodGroup: "O_POS",
    componentType: "WHOLE_BLOOD",
    quantityNeeded: 1,
    urgency: "NORMAL",
    patientName: "",
  });

  useEffect(() => {
    loadRequests();
  }, [auth]);

  async function loadRequests() {
    try {
      const data = await apiGet("/requests/my-organization", auth);
      setRequests(data);
    } catch (err) {
      setError("Failed to load your hospital's requests.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await apiPost(
        "/requests",
        { ...form, requestingOrg: { id: currentUser.organizationId } },
        auth
      );
      setForm({ bloodGroup: "O_POS", componentType: "WHOLE_BLOOD", quantityNeeded: 1, urgency: "NORMAL", patientName: "" });
      setShowForm(false);
      loadRequests();
    } catch (err) {
      setError("Failed to create request.");
    }
  }

  return (
    <div>
      <h1 className="page-title">{currentUser.organizationName}</h1>
      <p className="page-subtitle">Your hospital's blood requests</p>
      {error && <p className="error-text">{error}</p>}

      <button className="btn-primary" style={{ marginBottom: "20px" }} onClick={() => setShowForm(!showForm)}>
        {showForm ? "Cancel" : "+ New Request"}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="card" style={{ padding: "20px", marginBottom: "24px", maxWidth: "480px" }}>
          <div style={{ marginBottom: "12px" }}>
            <label className="field-label">Patient Name</label>
            <input value={form.patientName} onChange={(e) => setForm({ ...form, patientName: e.target.value })} required />
          </div>
          <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
            <div style={{ flex: 1 }}>
              <label className="field-label">Blood Group</label>
              <select
                value={form.bloodGroup}
                onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                style={{ width: "100%", background: "#ffffff08", border: "1px solid var(--border-soft)", borderRadius: "10px", padding: "11px 14px", color: "var(--text-primary)" }}
              >
                {["A_POS", "A_NEG", "B_POS", "B_NEG", "AB_POS", "AB_NEG", "O_POS", "O_NEG"].map((bg) => (
                 <option key={bg} value={bg} style={{ background: "#181a21" }}>{formatBloodGroup(bg)}</option>
                 ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label className="field-label">Urgency</label>
              <select
                value={form.urgency}
                onChange={(e) => setForm({ ...form, urgency: e.target.value })}
                style={{ width: "100%", background: "#ffffff08", border: "1px solid var(--border-soft)", borderRadius: "10px", padding: "11px 14px", color: "var(--text-primary)" }}
              >
                {["NORMAL", "URGENT", "CRITICAL"].map((u) => (
                  <option key={u} value={u} style={{ background: "#181a21" }}>{u}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label className="field-label">Units Needed</label>
            <input
              type="number"
              min="1"
              value={form.quantityNeeded}
              onChange={(e) => setForm({ ...form, quantityNeeded: parseInt(e.target.value) })}
            />
          </div>
          <button type="submit" className="btn-primary" style={{ width: "100%" }}>
            Submit Request
          </button>
        </form>
      )}

      {loading ? (
        <p style={{ color: "var(--text-secondary)" }}>Loading requests…</p>
      ) : requests.length === 0 ? (
        <div className="empty-state">No requests yet from your hospital.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {requests.map((req) => {
            const urgencyColor = urgencyColors[req.urgency] || "#a8adb8";
            const statusColor = statusColors[req.status] || "#a8adb8";
            const isRecentlyFulfilled = req.status === "FULFILLED" && req.fulfilledAt &&
            (new Date() - new Date(req.fulfilledAt)) < 24 * 60 * 60 * 1000; // within last 24 hours
            return (
              <div
                key={req.id}
                className="card"
                style={{
                padding: "18px 22px",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                borderLeft: `3px solid ${urgencyColor}`,
                borderRadius: "12px",
                boxShadow: isRecentlyFulfilled ? "0 0 0 1px #27ae6055, 0 8px 24px #27ae6022" : "none",
              }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "15px", fontWeight: "600" }}>{req.patientName}</div>
                  <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
                  {formatBloodGroup(req.bloodGroup)} · {req.componentType} · {req.quantityNeeded} unit(s)
                  </div>
                  {req.friendlyStatus && (
                  <div style={{ fontSize: "13px", color: "#3498db", marginTop: "6px", fontWeight: "500" }}>
                  {req.friendlyStatus}
                 </div>
                    )}
                 {isRecentlyFulfilled && (
                  <span style={{ fontSize: "11px", color: "#27ae60", fontWeight: "600" }}>
                 ✓ Fulfilled recently
                       </span>
                     )}
                </div>
                <span className="pill" style={{ background: `${urgencyColor}22`, color: urgencyColor, border: `1px solid ${urgencyColor}55` }}>
                  {req.urgency}
                </span>
                <span className="pill" style={{ background: `${statusColor}22`, color: statusColor, border: `1px solid ${statusColor}55` }}>
                  {req.status}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default HospitalPortal;