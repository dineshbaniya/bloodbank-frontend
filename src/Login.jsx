import { useState } from "react";
import { getAuthHeader, apiGet } from "./api";

function Login({ onLogin, onShowDonorSignup, onShowHospitalSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const auth = getAuthHeader(email, password);

    try {
      await apiGet("/donors", auth);
      onLogin(auth);
    } catch (err) {
      setError("Login failed. Check your email and password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="card page-enter" style={{ width: "380px", padding: "40px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              margin: "0 auto 16px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #e63950, #b4243a)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "26px",
              boxShadow: "0 8px 24px #e6395044",
            }}
          >
            🩸
          </div>
          <h1 className="page-title" style={{ fontSize: "22px", marginBottom: "4px" }}>
            Blood Bank System
          </h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            Sign in to manage donors, inventory, and requests
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label className="field-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label className="field-label">Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ paddingRight: "44px" }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--text-secondary)",
                  fontSize: "13px",
                  padding: "4px 6px",
                }}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="btn-primary" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "var(--text-secondary)" }}>
  Are you a donor?{" "}
  <span onClick={onShowDonorSignup} style={{ color: "#e63950", cursor: "pointer", fontWeight: "600" }}>
    Sign up here
  </span>
</p>
<p style={{ textAlign: "center", marginTop: "8px", fontSize: "13px", color: "var(--text-secondary)" }}>
  Represent a hospital?{" "}
  <span onClick={onShowHospitalSignup} style={{ color: "#e63950", cursor: "pointer", fontWeight: "600" }}>
    Register here
  </span>
</p>
      </div>
    </div>
  );
}

export default Login;