import { useState } from "react";
import { apiPostPublic } from "./api";

function HospitalSignup({ onBackToLogin }) {
  const [form, setForm] = useState({
    hospitalName: "",
    hospitalAddress: "",
    staffFullName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiPostPublic("/signup/hospital", form);
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
          <h1 className="page-title" style={{ fontSize: "20px" }}>Hospital registered!</h1>
          <p className="page-subtitle" style={{ marginBottom: "24px" }}>You can now sign in as hospital staff.</p>
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
            🏥
          </div>
          <h1 className="page-title" style={{ fontSize: "22px", marginBottom: "4px" }}>Register Your Hospital</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>Start requesting blood for your patients</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "14px" }}>
            <label className="field-label">Hospital Name</label>
            <input value={form.hospitalName} onChange={(e) => setForm({ ...form, hospitalName: e.target.value })} required />
          </div>
          <div style={{ marginBottom: "14px" }}>
            <label className="field-label">Hospital Address</label>
            <input value={form.hospitalAddress} onChange={(e) => setForm({ ...form, hospitalAddress: e.target.value })} required />
          </div>
          <div style={{ marginBottom: "14px" }}>
            <label className="field-label">Your Full Name (Staff Contact)</label>
            <input value={form.staffFullName} onChange={(e) => setForm({ ...form, staffFullName: e.target.value })} required />
          </div>
          <div style={{ marginBottom: "14px" }}>
            <label className="field-label">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label className="field-label">Password</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="btn-primary" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Registering…" : "Register Hospital"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "var(--text-secondary)" }}>
          Already registered?{" "}
          <span onClick={onBackToLogin} style={{ color: "#e63950", cursor: "pointer", fontWeight: "600" }}>
            Log in
          </span>
        </p>
      </div>
    </div>
  );
}

export default HospitalSignup;