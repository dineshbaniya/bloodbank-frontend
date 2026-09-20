import { useEffect, useState, Fragment } from "react";
import { apiGet, apiPost, apiPostNoBody, formatBloodGroup } from "./api";

const statusColors = {
  AVAILABLE: "#27ae60",
  RESERVED: "#f39c12",
  ISSUED: "#3498db",
  EXPIRED: "#7f8c8d",
  DISCARDED: "#e74c3c",
};

const bloodGroupOptions = ["A_POS", "A_NEG", "B_POS", "B_NEG", "AB_POS", "AB_NEG", "O_POS", "O_NEG"];
const componentOptions = ["WHOLE_BLOOD", "PLASMA", "PLATELETS", "RBC"];

function Inventory({ auth, currentUser }) {
  const [units, setUnits] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reservingUnitId, setReservingUnitId] = useState(null);
  const [selectedRequestId, setSelectedRequestId] = useState("");
  const [newUnit, setNewUnit] = useState({
    bloodGroup: "O_POS",
    componentType: "WHOLE_BLOOD",
    collectionDate: new Date().toISOString().slice(0, 10),
    expiryDate: "",
  });

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
      setRequests(requestsData.filter((r) => r.status === "PENDING" || r.status === "PARTIALLY_FULFILLED"));
    } catch (err) {
      setError("Failed to load inventory.");
    } finally {
      setLoading(false);
    }
  }

  function openReserveChoice(unit) {
    setReservingUnitId(unit.id);
    setSelectedRequestId("");
    setMessage("");
  }

  async function handleConfirmReserve(unit) {
    if (!selectedRequestId) {
      setMessage("Please select a request first.");
      return;
    }
    try {
      const result = await apiPostNoBody(`/inventory/reserve?requestId=${selectedRequestId}&quantity=1`, auth);
      if (result.reserved > 0) {
        const req = requests.find((r) => r.id === Number(selectedRequestId));
        setMessage(`Reserved for ${req?.patientName || "request #" + selectedRequestId}.`);
        setReservingUnitId(null);
        loadData();
      } else {
        setMessage("Could not reserve — unit may no longer be available.");
      }
    } catch (err) {
      setMessage("Reservation failed.");
    }
  }

  function openAddForm() {
    setShowAddForm(true);
    setNewUnit({
      bloodGroup: "O_POS",
      componentType: "WHOLE_BLOOD",
      collectionDate: new Date().toISOString().slice(0, 10),
      expiryDate: "",
    });
    setMessage("");
  }

  async function handleAddUnit(e) {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    try {
      await apiPost("/inventory", newUnit, auth);
      setMessage("New blood unit added to inventory.");
      setShowAddForm(false);
      loadData();
    } catch (err) {
      setMessage("Failed to add unit.");
    } finally {
      setSubmitting(false);
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

      {canReserve && (
        <button className="btn-primary" style={{ marginBottom: "20px" }} onClick={() => (showAddForm ? setShowAddForm(false) : openAddForm())}>
          {showAddForm ? "Cancel" : "+ Add Blood Unit"}
        </button>
      )}

      {showAddForm && (
        <form onSubmit={handleAddUnit} className="card" style={{ padding: "20px", marginBottom: "24px", maxWidth: "480px" }}>
          <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
            <div style={{ flex: 1 }}>
              <label className="field-label">Blood Group</label>
              <select
                value={newUnit.bloodGroup}
                onChange={(e) => setNewUnit({ ...newUnit, bloodGroup: e.target.value })}
                style={{ width: "100%", background: "#ffffff08", border: "1px solid var(--border-soft)", borderRadius: "10px", padding: "11px 14px", color: "var(--text-primary)" }}
              >
                {bloodGroupOptions.map((bg) => (
                  <option key={bg} value={bg} style={{ background: "#181a21" }}>{formatBloodGroup(bg)}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label className="field-label">Component</label>
              <select
                value={newUnit.componentType}
                onChange={(e) => setNewUnit({ ...newUnit, componentType: e.target.value })}
                style={{ width: "100%", background: "#ffffff08", border: "1px solid var(--border-soft)", borderRadius: "10px", padding: "11px 14px", color: "var(--text-primary)" }}
              >
                {componentOptions.map((c) => (
                  <option key={c} value={c} style={{ background: "#181a21" }}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
            <div style={{ flex: 1 }}>
              <label className="field-label">Collection Date</label>
              <input
                type="date"
                value={newUnit.collectionDate}
                onChange={(e) => setNewUnit({ ...newUnit, collectionDate: e.target.value })}
                required
                style={{ width: "100%", background: "#ffffff08", border: "1px solid var(--border-soft)", borderRadius: "10px", padding: "10px 12px", color: "var(--text-primary)" }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label className="field-label">Expiry Date</label>
              <input
                type="date"
                value={newUnit.expiryDate}
                onChange={(e) => setNewUnit({ ...newUnit, expiryDate: e.target.value })}
                required
                style={{ width: "100%", background: "#ffffff08", border: "1px solid var(--border-soft)", borderRadius: "10px", padding: "10px 12px", color: "var(--text-primary)" }}
              />
            </div>
          </div>
          <button type="submit" className="btn-primary" style={{ width: "100%" }} disabled={submitting}>
            {submitting ? "Adding…" : "Add to Inventory"}
          </button>
        </form>
      )}

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
                const matchingRequests = requests.filter(
                  (r) => r.bloodGroup === unit.bloodGroup && r.componentType === unit.componentType
                );
                return (
                   <Fragment key={unit.id}>
                    <tr>
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
                              onClick={() => (reservingUnitId === unit.id ? setReservingUnitId(null) : openReserveChoice(unit))}
                              className="btn-primary"
                              style={{ padding: "6px 14px", fontSize: "12px" }}
                            >
                              {reservingUnitId === unit.id ? "Cancel" : "Reserve"}
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                    {reservingUnitId === unit.id && (
                      <tr>
                        <td colSpan={6} style={{ background: "#ffffff08", padding: "16px 22px" }}>
                          {matchingRequests.length === 0 ? (
                            <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                              No pending requests match this unit's blood group/component.
                            </span>
                          ) : (
                            <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                              <select
                                value={selectedRequestId}
                                onChange={(e) => setSelectedRequestId(e.target.value)}
                                style={{ background: "#181a21", border: "1px solid var(--border-soft)", borderRadius: "10px", padding: "8px 12px", color: "var(--text-primary)", minWidth: "260px" }}
                              >
                                <option value="">Select a request…</option>
                                {matchingRequests.map((r) => (
                                  <option key={r.id} value={r.id} style={{ background: "#181a21" }}>
                                    {r.patientName || "Request #" + r.id} — {r.urgency} — {r.quantityFulfilled}/{r.quantityNeeded} fulfilled
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => handleConfirmReserve(unit)}
                                className="btn-primary"
                                style={{ padding: "8px 16px", fontSize: "12px" }}
                              >
                                Confirm Reserve
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
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