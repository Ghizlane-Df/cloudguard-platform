import { useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();

  const pageTitles = {
    "/dashboard": "Dashboard",
    "/infrastructure": "Infrastructure",
    "/deployments": "Deployments",
    "/security": "Security",
    "/monitoring": "Monitoring",
  };

  const currentTitle = pageTitles[location.pathname] || "Dashboard";

  return (
    <header className="navbar">
      <div className="navbar-title">
        <h1>{currentTitle}</h1>
        <p>CloudGuard / {currentTitle}</p>
      </div>

      <div className="navbar-actions">
        <input
          type="search"
          placeholder="Search..."
          className="navbar-search"
        />

        <div className="navbar-profile">
          <div className="profile-avatar">CG</div>
          <div>
            <strong>CloudGuard Admin</strong>
            <span>Administrator</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;