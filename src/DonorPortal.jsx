import { useEffect, useState } from "react";
import { apiGet } from "./api";

function DonorPortal({ auth }) {
  const [profile, setProfile] = useState(null);
  const [donations, setDonations] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const profileData = await apiGet("/donors/me", auth);
        setProfile(profileData);
        const [donationsData, alertsData] = await Promise.all([
          apiGet("/donations/me", auth),
          apiGet("/alertlogs/me", auth),
        ]);
        setDonations(donationsData);
        setAlerts(alertsData);
      } catch (err) {
        setError("No donor profile is linked to your account yet. Please contact your blood bank.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [auth]);

  if (loading) {
    return <p style={{ color: "var(--text-secondary)" }}>Loading your profile…</p>;
  }

  if (error) {
    return (
      <div>
        <h1 className="page-title">Welcome</h1>
        <div className="card" style={{ padding: "24px", maxWidth: "480px" }}>
          <p style={{ color: "var(--text-secondary)" }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">Welcome, {profile.fullName}</h1>
      <p className="page-subtitle">Your donor profile and donation history</p>

      <div style={{ display: "flex", gap: "18px", flexWrap: "wrap", marginBottom: "24px" }}>
        <div className="card" style={{ padding: "24px", minWidth: "180px" }}>
          <div className="stat-label">Blood Group</div>
          <div className="stat-value" style={{ color: "#e63950" }}>{profile.bloodGroup}</div>
        </div>
        <div className="card" style={{ padding: "24px", minWidth: "180px" }}>
          <div className="stat-label">Total Donations</div>
          <div className="stat-value" style={{ color: "#27ae60" }}>{profile.totalDonations}</div>
        </div>
        <div className="card" style={{ padding: "24px", minWidth: "180px" }}>
          <div className="stat-label">Eligibility</div>
          <div
            className="stat-value"
            style={{ fontSize: "22px", color: profile.eligibleToDonate ? "#27ae60" : "#f39c12" }}
          >
            {profile.eligibleToDonate ? "Eligible now" : "Not yet eligible"}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
        <div className="card" style={{ padding: "24px" }}>
          <div className="section-label" style={{ marginBottom: "16px" }}>Donation history</div>
          {donations.length === 0 ? (
            <div className="empty-state">No donations recorded yet.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {donations.map((d) => (
                <div key={d.id} style={{ padding: "10px 0", borderBottom: "1px solid #ffffff08" }}>
                  <div style={{ fontSize: "14px", fontWeight: "500" }}>{d.donationDate}</div>
                  <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                    {d.donationType} · {d.preScreeningPassed ? "Completed" : "Deferred"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card" style={{ padding: "24px" }}>
          <div className="section-label" style={{ marginBottom: "16px" }}>Alert history</div>
          {alerts.length === 0 ? (
            <div className="empty-state">No alerts sent to you yet.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {alerts.map((a) => (
                <div key={a.id} style={{ padding: "10px 0", borderBottom: "1px solid #ffffff08" }}>
                  <div style={{ fontSize: "14px", fontWeight: "500" }}>
                    {a.sentAt ? new Date(a.sentAt).toLocaleDateString() : "Unknown date"}
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                    {a.channel} · {a.status} · {a.searchRadiusKm}km radius
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DonorPortal;