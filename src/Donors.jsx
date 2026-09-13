import { useEffect, useState } from "react";
import { apiGet } from "./api";

function Donors({ auth }) {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
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
    loadDonors();
  }, [auth]);

  const filtered = donors.filter((d) => {
    const term = search.toLowerCase();
    return d.fullName.toLowerCase().includes(term) || d.bloodGroup.toLowerCase().includes(term);
  });

  return (
    <div>
      <h1 className="page-title">Donors</h1>
      <p className="page-subtitle">Registered donors and their donation history</p>
      {error && <p className="error-text">{error}</p>}
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
              </tr>
            </thead>
            <tbody>
              {filtered.map((donor) => (
                <tr key={donor.id}>
                  <td style={{ fontWeight: "500" }}>{donor.fullName}</td>
                  <td>
                    <span className="badge" style={{ background: "#e6395022", color: "#f16a75" }}>
                      {donor.bloodGroup}
                    </span>
                  </td>
                  <td>{donor.totalDonations}</td>
                  <td>{(donor.responseRate * 100).toFixed(0)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Donors;