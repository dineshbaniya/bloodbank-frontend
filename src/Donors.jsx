import { useEffect, useState, Fragment } from "react";
import { apiGet, apiPost, formatBloodGroup } from "./api";

function Donors({ auth, currentUser }) {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [openFormId, setOpenFormId] = useState(null);
  const [donationDate, setDonationDate] = useState(new Date().toISOString().slice(0, 10));
  const [donationType, setDonationType] = useState("VOLUNTARY");
  const [preScreeningPassed, setPreScreeningPassed] = useState(true);
  const [deferralReason, setDeferralReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const canRecordDonation = currentUser?.role === "BANK_STAFF" || currentUser?.role === "SUPER_ADMIN";

  useEffect(() => {
    loadDonors();
  }, [auth]);

  async function loadDonors() {
    try {
      const data = await apiGet("/donors", auth);
      setDonors(data);
    } catch (err) {
      setError("Failed to load donors.");
    } finally {
      setLoading(false);
    }
  }

  function openForm(donorId) {
    setOpenFormId(donorId);
    setDonationDate(new Date().toISOString().slice(0, 10));
    setDonationType("VOLUNTARY");
    setPreScreeningPassed(true);
    setDeferralReason("");
    setMessage("");
  }

  async function handleRecordDonation(donorId) {
    setSubmitting(true);
    setMessage("");
    try {
      await apiPost(
        "/donations",
        {
          donor: { id: donorId },
          donationDate,
          donationType,
          preScreeningPassed,
          deferralReason: preScreeningPassed ? "" : deferralReason,
        },
        auth
      );
      setMessage("Donation recorded successfully.");
      setOpenFormId(null);
      loadDonors();
    } catch (err) {
      setMessage("Failed to record donation.");
    } finally {
      setSubmitting(false);
    }
  }

  const filtered = donors.filter((d) => {
    const term = search.toLowerCase();
    return d.fullName.toLowerCase().includes(term) || d.bloodGroup.toLowerCase().includes(term);
  });

  return (
    <div>
      <h1 className="page-title">Donors</h1>
      <p className="page-subtitle">Registered donors and their donation history</p>
      {error && <p className="error-text">{error}</p>}
      {message && <p style={{ color: "#27ae60", fontSize: "13px", marginBottom: "16px" }}>{message}</p>}
      <input
        className="search-bar"
        placeholder="Search by name or blood group…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {loading ? (
        <p style={{ color: "var(--text-secondary)" }}>Loading donors…</p>
      ) : filtered.length === 0 ? (
        <div className="empty-state">No donors match your search.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Blood Group</th>
                <th>Total Donations</th>
                <th>Response Rate</th>
                {canRecordDonation && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((donor) => (
                <Fragment key={donor.id}>
                  <tr>
                    <td style={{ fontWeight: "500" }}>{donor.fullName}</td>
                    <td>
                      <span className="badge" style={{ background: "#e6395022", color: "#f16a75" }}>
                        {formatBloodGroup(donor.bloodGroup)}
                      </span>
                    </td>
                    <td>{donor.totalDonations}</td>
                    <td>{(donor.responseRate * 100).toFixed(0)}%</td>
                    {canRecordDonation && (
                      <td>
                        <button
                          onClick={() => (openFormId === donor.id ? setOpenFormId(null) : openForm(donor.id))}
                          className="btn-primary"
                          style={{ padding: "6px 12px", fontSize: "12px" }}
                        >
                          {openFormId === donor.id ? "Cancel" : "Record Donation"}
                        </button>
                      </td>
                    )}
                  </tr>
                  {openFormId === donor.id && (
                    <tr>
                      <td colSpan={5} style={{ background: "#ffffff08", padding: "16px 22px" }}>
                        <div style={{ display: "flex", gap: "16px", alignItems: "flex-end", flexWrap: "wrap" }}>
                          <div>
                            <label style={{ display: "block", fontSize: "12px", marginBottom: "4px", color: "var(--text-secondary)" }}>
                              Donation date
                            </label>
                            <input
                              type="date"
                              value={donationDate}
                              onChange={(e) => setDonationDate(e.target.value)}
                              style={{ padding: "8px", borderRadius: "8px", border: "1px solid var(--border-soft)", background: "#ffffff08", color: "var(--text-primary)" }}
                            />
                          </div>
                          <div>
                            <label style={{ display: "block", fontSize: "12px", marginBottom: "4px", color: "var(--text-secondary)" }}>
                              Donation type
                            </label>
                            <select
                              value={donationType}
                              onChange={(e) => setDonationType(e.target.value)}
                              style={{ padding: "8px", borderRadius: "8px", border: "1px solid var(--border-soft)", background: "#181a21", color: "var(--text-primary)" }}
                            >
                              <option value="VOLUNTARY">Voluntary</option>
                              <option value="REPLACEMENT">Replacement</option>
                            </select>
                          </div>
                          <div>
                            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
                              <input
                                type="checkbox"
                                checked={preScreeningPassed}
                                onChange={(e) => setPreScreeningPassed(e.target.checked)}
                              />
                              Pre-screening passed
                            </label>
                          </div>
                          {!preScreeningPassed && (
                            <div style={{ flex: 1, minWidth: "200px" }}>
                              <label style={{ display: "block", fontSize: "12px", marginBottom: "4px", color: "var(--text-secondary)" }}>
                                Deferral reason
                              </label>
                              <input
                                type="text"
                                value={deferralReason}
                                onChange={(e) => setDeferralReason(e.target.value)}
                                placeholder="Reason for deferral"
                                style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid var(--border-soft)", background: "#ffffff08", color: "var(--text-primary)" }}
                              />
                            </div>
                          )}
                          <button
                            onClick={() => handleRecordDonation(donor.id)}
                            className="btn-primary"
                            style={{ padding: "8px 16px", fontSize: "13px" }}
                            disabled={submitting}
                          >
                            {submitting ? "Saving…" : "Save Donation"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Donors;