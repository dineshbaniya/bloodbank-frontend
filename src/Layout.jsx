function Layout({ userEmail, userRole, onLogout, activePage, onNavigate, children }) {
  const staffNavItems = [
    { key: "dashboard", label: "Dashboard", icon: "📊" },
    { key: "donors", label: "Donors", icon: "🧑‍🤝‍🧑" },
    { key: "inventory", label: "Inventory", icon: "🧪" },
    { key: "requests", label: "Requests", icon: "📋" },
    { key: "forecast", label: "AI Forecast", icon: "✨" },
  ];

  const donorNavItems = [
    { key: "portal", label: "My Profile", icon: "🩸" },
  ];

  const hospitalNavItems = [
  { key: "hospital", label: "My Requests", icon: "🏥" },
];

const navItems =
  userRole === "DONOR" ? donorNavItems :
  userRole === "HOSPITAL_STAFF" ? hospitalNavItems :
  staffNavItems;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        style={{
          width: "240px",
          background: "linear-gradient(180deg, #14161c 0%, #0a0b0f 100%)",
          borderRight: "1px solid var(--border-soft)",
          padding: "28px 18px",
          display: "flex",
          flexDirection: "column",
          position: "sticky",
          top: 0,
          height: "100vh",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "0 8px" }}>
          <div
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #e63950, #b4243a)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
            }}
          >
            🩸
          </div>
          <span style={{ fontSize: "17px", fontWeight: "700" }}>BloodBank</span>
        </div>

        <nav style={{ marginTop: "36px", display: "flex", flexDirection: "column", gap: "4px" }}>
          {navItems.map((item) => {
            const active = activePage === item.key;
            return (
              <div
                key={item.key}
                onClick={() => onNavigate(item.key)}
                className={`nav-item ${active ? "active" : ""}`}
              >
                <span style={{ fontSize: "16px" }}>{item.icon}</span>
                {item.label}
              </div>
            );
          })}
        </nav>

        <div style={{ marginTop: "auto", paddingTop: "18px", borderTop: "1px solid var(--border-soft)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px", marginBottom: "10px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "#ffffff10",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "13px",
                fontWeight: "600",
              }}
            >
              {userEmail?.[0]?.toUpperCase()}
            </div>
            <span
              style={{
                fontSize: "13px",
                color: "var(--text-secondary)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {userEmail}
            </span>
          </div>
          <button onClick={onLogout} className="logout-btn">
            Log Out
          </button>
        </div>
      </aside>
      <main style={{ flex: 1, padding: "36px 40px", overflowY: "auto" }}>
        <div className="page-enter">{children}</div>
      </main>
    </div>
  );
}

export default Layout;