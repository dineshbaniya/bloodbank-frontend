import { useState, useEffect } from "react";
import Login from "./Login";
import Layout from "./Layout";
import Dashboard from "./Dashboard";
import Donors from "./Donors";
import Inventory from "./Inventory";
import Requests from "./Requests";
import Forecast from "./Forecast";
import DonorPortal from "./DonorPortal";
import HospitalPortal from "./HospitalPortal";
import { apiGet } from "./api";
import Signup from "./Signup";
import HospitalSignup from "./HospitalSignup";

function App() {
  const [auth, setAuth] = useState(() => localStorage.getItem("bb_auth"));
  const [signupMode, setSignupMode] = useState(null); // null | "donor" | "hospital"
  const [currentUser, setCurrentUser] = useState(null);
  const [activePage, setActivePageState] = useState(
    () => localStorage.getItem("bb_page") || "dashboard"
  );

  function setActivePage(page) {
    localStorage.setItem("bb_page", page);
    setActivePageState(page);
  }

  useEffect(() => {
    if (!auth) return;
    apiGet("/users/me", auth)
      .then((user) => {
        setCurrentUser(user);
        if (user.role === "DONOR") {
          setActivePage("portal");
        } else if (user.role === "HOSPITAL_STAFF") {
          setActivePage("hospital");
        }
      })
      .catch(() => {
        localStorage.removeItem("bb_auth");
        setAuth(null);
      });
  }, [auth]);

  function handleLogin(authHeader) {
    localStorage.setItem("bb_auth", authHeader);
    setAuth(authHeader);
  }

  function handleLogout() {
    localStorage.removeItem("bb_auth");
    localStorage.removeItem("bb_page");
    setAuth(null);
    setCurrentUser(null);
  }

 if (!auth) {
  if (signupMode === "donor") {
    return <Signup onBackToLogin={() => setSignupMode(null)} />;
  }
  if (signupMode === "hospital") {
    return <HospitalSignup onBackToLogin={() => setSignupMode(null)} />;
  }
  return (
    <Login
      onLogin={handleLogin}
      onShowDonorSignup={() => setSignupMode("donor")}
      onShowHospitalSignup={() => setSignupMode("hospital")}
    />
  );
}

  if (!currentUser) {
    return <div style={{ color: "#fff", padding: "40px" }}>Loading…</div>;
  }

  const isDonor = currentUser.role === "DONOR";
  const isHospitalStaff = currentUser.role === "HOSPITAL_STAFF";
  const isBloodBankStaff = !isDonor && !isHospitalStaff;

  return (
    <Layout
      userEmail={currentUser.email}
      userRole={currentUser.role}
      onLogout={handleLogout}
      activePage={activePage}
      onNavigate={setActivePage}
    >
      {isDonor && <DonorPortal auth={auth} />}
      {isHospitalStaff && <HospitalPortal auth={auth} currentUser={currentUser} />}
      {isBloodBankStaff && activePage === "dashboard" && <Dashboard auth={auth} onNavigate={setActivePage} />}
      {isBloodBankStaff && activePage === "donors" && <Donors auth={auth} currentUser={currentUser} />}
      {isBloodBankStaff && activePage === "inventory" && <Inventory auth={auth} currentUser={currentUser} />}
      {isBloodBankStaff && activePage === "requests" && <Requests auth={auth} currentUser={currentUser} />}
      {isBloodBankStaff && activePage === "forecast" && <Forecast auth={auth} />}
    </Layout>
  );
}

export default App;