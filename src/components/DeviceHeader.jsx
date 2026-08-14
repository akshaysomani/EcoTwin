import { useState } from "react";
import { Activity, RefreshCw, Menu, X } from "lucide-react";

export default function DeviceHeader({
  deviceId,
  deviceOnline,
  onRefresh,
  loading,
  activeAlertsCount = 0,
  currentTab,
  onNavigate
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { key: "overview", label: "Overview" },
    { key: "health", label: "Health" },
    { key: "energy", label: "Energy" },
    { key: "sustainability", label: "Sustainability" },
    { key: "copilot", label: "AI Copilot" },
    { key: "reports", label: "Reports" }
  ];

  const handleNavClick = (tabKey) => {
    onNavigate(tabKey);
    setMobileMenuOpen(false);
  };

  return (
    <header className="topbar">
      <div className="brand no-print">
        <div className="brand-mark">
          <Activity size={24} />
        </div>
        <div>
          <div className="brand-name">EcoTwin</div>
          <div className="brand-subtitle">Digital Twin</div>
        </div>
      </div>

      {/* Desktop Navigation Links */}
      <nav className="desktop-nav no-print" aria-label="Main navigation">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => handleNavClick(item.key)}
            className={`nav-link-btn ${currentTab === item.key ? "active" : ""}`}
            aria-current={currentTab === item.key ? "page" : undefined}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="topbar-right no-print">
        <div className="device-info-header">
          <span className="label">Node:</span>
          <span className="value">{deviceId}</span>
        </div>

        {activeAlertsCount > 0 && (
          <div className="alert-count-header-badge" title="Active alerts count">
            {activeAlertsCount}
          </div>
        )}

        <div className={`connection-pill ${deviceOnline ? "online" : "offline"}`}>
          <span className="dot" />
          <span className="pill-text">{deviceOnline ? "LIVE" : "OFFLINE"}</span>
        </div>

        <button
          className={`refresh-button ${loading ? "spinning" : ""}`}
          onClick={onRefresh}
          title="Refresh telemetry data"
          disabled={loading}
          aria-label="Refresh telemetry data"
        >
          <RefreshCw size={17} />
        </button>

        {/* Mobile Hamburger Toggle Button */}
        <button
          className="mobile-hamburger-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-drawer no-print" role="dialog" aria-modal="true">
          <div className="mobile-drawer-content">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => handleNavClick(item.key)}
                className={`drawer-link-btn ${currentTab === item.key ? "active" : ""}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
