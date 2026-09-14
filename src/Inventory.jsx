import { useEffect, useState } from "react";
import { apiGet, formatBloodGroup } from "./api";

const statusColors = {
  AVAILABLE: "#27ae60",
  RESERVED: "#f39c12",
  ISSUED: "#3498db",
  EXPIRED: "#7f8c8d",
  DISCARDED: "#e74c3c",
};

function Inventory({ auth, currentUser }) {
  const [units, setUnits] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const canReserve = currentUser.role === "BANK_STAFF" || currentUser.role === "SUPER_ADMIN";

  useEffect(() => {
    loadData();
  }, [auth]);

  async function loadData() {
    try {
      const [unitsData, requestsData] = await Promise.all([
        apiGet("/inventory", auth),
        apiGet("/requests", auth),
      ]);
      setUnits(unitsData);
      setRequests(requestsData.filter((r) => r.status === "PENDING"));
    } catch (err) {
      setError("Failed to load inventory.");
    } finally {
      setLoading(false);
    }
  }

  async function handleReserve(unit) {
    const matchingRequest = requests.find(
      (r) => r.bloodGroup === unit.bloodGroup && r.componentType === unit.componentType
    );
    if (!matchingRequest) {
      setMessage("No pending request matches this unit's blood group/component.");
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:8080/api/inventory/reserve?requestId=${matchingRequest.id}&quantity=1`,
        { method: "POST", headers: { Authorization: auth } }
      );
      const result = await response.json();
      if (result.reserved > 0) {
        setMessage(`Reserved for ${matchingRequest.patientName || "request #" + matchingRequest.id}.`);
        loadData();
      } else {
        setMessage("Could not reserve — unit may no longer be available.");
      }
    } catch (err) {
      setMessage("Reservation failed.");
    }
  }

  const statusOptions = ["ALL", "AVAILABLE", "RESERVED", "ISSUED", "EXPIRED", "DISCARDED"];

  const filtered = units.filter((u) => {
    const matchesSearch = u.bloodGroup.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <h1 className="page-title">Blood Inventory</h1>
      <p className="page-subtitle">Track units by status, group, and expiry</p>
      {error && <p className="error-text">{error}</p>}
      {message && <p style={{ color: "#27ae60", fontSize: "13px", marginBottom: "16px" }}>{message}</p>}

      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        <input
          className="search-bar"
          style={{ margin: 0 }}
          placeholder="Search by blood group…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            background: "#ffffff08",
            border: "1px solid var(--border-soft)",
            borderRadius: "10px",
            padding: "11px 14px",
            color: "var(--text-primary)",
            fontSize: "14px",
          }}
        >
          {statusOptions.map((s) => (
            <option key={s} value={s} style={{ background: "#181a21" }}>
              {s === "ALL" ? "All statuses" : s}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p style={{ color: "var(--text-secondary)" }}>Loading inventory…</p>
      ) : filtered.length === 0 ? (
        <div className="empty-state">No inventory units match your filters.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Blood Group</th>
                <th>Component</th>
                <th>Collected</th>
                <th>Expires</th>
                <th>Status</th>
                {canReserve && <th></th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((unit) => {
                const color = statusColors[unit.status] || "#a8adb8";
                return (
                  <tr key={unit.id}>
                    <td>
                      <span className="badge" style={{ background: "#e6395022", color: "#f16a75" }}>
                        {formatBloodGroup(unit.bloodGroup)}
                      </span>
                    </td>
                    <td>{unit.componentType}</td>
                    <td>{unit.collectionDate}</td>
                    <td>{unit.expiryDate}</td>
                    <td>
                      <span className="pill" style={{ background: `${color}22`, color, border: `1px solid ${color}55` }}>
                        {unit.status}
                      </span>
                    </td>
                    {canReserve && (
                      <td>
                        {unit.status === "AVAILABLE" && (
                          <button
                            onClick={() => handleReserve(unit)}
                            className="btn-primary"
                            style={{ padding: "6px 14px", fontSize: "12px" }}
                          >
                            Reserve
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Inventory;