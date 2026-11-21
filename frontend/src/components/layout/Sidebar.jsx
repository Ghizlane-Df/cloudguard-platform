import { NavLink } from "react-router-dom";

function Sidebar() {
  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: "⌂" },
    { name: "Infrastructure", path: "/infrastructure", icon: "▦" },
    { name: "Deployments", path: "/deployments", icon: "⇧" },
    { name: "Security", path: "/security", icon: "◈" },
    { name: "Monitoring", path: "/monitoring", icon: "◷" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>CloudGuard</h2>
        <span>DevSecOps Platform</span>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <p>CloudGuard v1.0</p>
        <span>DevSecOps Dashboard</span>
      </div>
    </aside>
  );
}

export default Sidebar;