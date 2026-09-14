import { useState } from "react";
import { apiPostPublic, formatBloodGroup } from "./api";

const bloodGroups = ["A_POS", "A_NEG", "B_POS", "B_NEG", "AB_POS", "AB_NEG", "O_POS", "O_NEG"];

function Signup({ onBackToLogin }) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phoneNumber: "",
    bloodGroup: "O_POS",
    address: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiPostPublic("/signup/donor", form);
      setSuccess(true);
    } catch (err) {
      setError("Signup failed. This email may already be registered.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="card page-enter" style={{ width: "380px", padding: "40px", textAlign: "center" }}>
          <div style={{ fontSize: "40px", marginBottom: "16px" }}>✅</div>
          <h1 className="page-title" style={{ fontSize: "20px" }}>Account created!</h1>
          <p className="page-subtitle" style={{ marginBottom: "24px" }}>You can now sign in as a donor.</p>
          <button className="btn-primary" style={{ width: "100%" }} onClick={onBackToLogin}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div className="card page-enter" style={{ width: "420px", padding: "40px" }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div
            style={{
              width: "56px", height: "56px", margin: "0 auto 16px", borderRadius: "16px",
              background: "linear-gradient(135deg, #e63950, #b4243a)", display: "flex",
              alignItems: "center", justifyContent: "center", fontSize: "26px", boxShadow: "0 8px 24px #e6395044",
            }}
          >
            🩸
          </div>
          <h1 className="page-title" style={{ fontSize: "22px", marginBottom: "4px" }}>Become a Donor</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>Register to help save lives nearby</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "14px" }}>
            <label className="field-label">Full Name</label>
            <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
          </div>
          <div style={{ marginBottom: "14px" }}>
            <label className="field-label">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div style={{ marginBottom: "14px" }}>
            <label className="field-label">Password</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          <div style={{ marginBottom: "14px" }}>
            <label className="field-label">Phone Number</label>
            <input value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} required />
          </div>
          <div style={{ display: "flex", gap: "12px", marginBottom: "14px" }}>
            <div style={{ flex: 1 }}>
              <label className="field-label">Blood Group</label>
              <select
                value={form.bloodGroup}
                onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                style={{ width: "100%", background: "#ffffff08", border: "1px solid var(--border-soft)", borderRadius: "10px", padding: "11px 14px", color: "var(--text-primary)" }}
              >
                {bloodGroups.map((bg) => (
                <option key={bg} value={bg} style={{ background: "#181a21" }}>{formatBloodGroup(bg)}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label className="field-label">Address</label>
            <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
          </div>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="btn-primary" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Creating account…" : "Sign Up"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "var(--text-secondary)" }}>
          Already have an account?{" "}
          <span onClick={onBackToLogin} style={{ color: "#e63950", cursor: "pointer", fontWeight: "600" }}>
            Log in
          </span>
        </p>
      </div>
    </div>
  );
}

export default Signup;