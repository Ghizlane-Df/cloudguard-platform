
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import { useEffect, useState } from "react";
import { getDashboard, getSecurity } from "../../services/api";

function Dashboard() {
  // États
  const [dashboardData, setDashboardData] = useState(null);
  const [securityDataFromAPI, setSecurityDataFromAPI] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Récupération des données depuis Flask
  useEffect(() => {
    async function fetchDashboard() {
      try {
        const [dashboardResponse, securityResponse] = await Promise.all([
          getDashboard(),
          getSecurity(),
        ]);

        setDashboardData(dashboardResponse.data);
        setSecurityDataFromAPI(securityResponse.data);
      } catch (err) {
        console.error("Dashboard API Error:", err);
        setError("Impossible de récupérer les données du dashboard.");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  // Statistiques de sécurité
  const totalScans = securityDataFromAPI?.scans_count ?? 0;

  const totalVulnerabilities =
    securityDataFromAPI?.total_vulnerabilities ?? 0;

  // Statistiques principales
  const stats = [
    {
      title: "Infrastructure",
      value: dashboardData?.infrastructure?.total_nodes ?? "—",
      description: "Resources monitored",
      icon: "▦",
    },
    {
      title: "Deployments",
      value: dashboardData?.deployments?.total ?? "—",
      description: "Total deployments",
      icon: "⇧",
    },
    {
      title: "Security Issues",
      value: securityDataFromAPI ? totalVulnerabilities : "—",
      description: `${totalScans} security scans performed`,
      icon: "◈",
    },
    {
      title: "Monitoring",
      value: dashboardData ? "Active" : "—",
      description: "Monitoring status",
      icon: "◷",
    },
  ];

  // Données du graphique des déploiements (démo)
  const deploymentData = [
    { day: "Mon", deployments: 4 },
    { day: "Tue", deployments: 7 },
    { day: "Wed", deployments: 5 },
    { day: "Thu", deployments: 9 },
    { day: "Fri", deployments: 6 },
    { day: "Sat", deployments: 12 },
    { day: "Sun", deployments: 8 },
  ];

  // Données du graphique de sécurité
  const securityData = securityDataFromAPI?.vulnerabilities
  ? [
      {
        name: "Critical",
        value: securityDataFromAPI.vulnerabilities.critical,
      },
      {
        name: "High",
        value: securityDataFromAPI.vulnerabilities.high,
      },
      {
        name: "Medium",
        value: securityDataFromAPI.vulnerabilities.medium,
      },
      {
        name: "Low",
        value: securityDataFromAPI.vulnerabilities.low,
      },
    ]
  : [];

  const securityColors = [
    "#ef4444",
    "#f97316",
    "#eab308",
    "#22c55e",
  ];

  // Derniers déploiements depuis PostgreSQL
  const recentDeployments = dashboardData?.recent_deployments ?? [];

  // Chargement
  if (loading) {
    return <p>Loading dashboard...</p>;
  }

  // Erreur
  if (error) {
    return <p>{error}</p>;
  }

  // Interface Dashboard
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>CloudGuard Dashboard</h2>
        <p>Welcome to CloudGuard Platform</p>
      </div>

      {/* Statistics */}
      <div className="stats-grid">
        {stats.map((stat) => (
          <div className="stat-card" key={stat.title}>
            <div className="stat-card-top">
              <span>{stat.title}</span>
              <span className="stat-icon">{stat.icon}</span>
            </div>
            <h3>{stat.value}</h3>
            <p>{stat.description}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3>Deployment Activity</h3>
              <p>Deployment activity over the last 7 days</p>
            </div>
            <span className="chart-period">Last 7 days</span>
          </div>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={deploymentData}>
                <defs>
                  <linearGradient
                    id="deploymentGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>

                <CartesianGrid stroke="#263852" strokeDasharray="3 3" />
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" allowDecimals={false} />

                <Tooltip
                  contentStyle={{
                    background: "#17243b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="deployments"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fill="url(#deploymentGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="security-chart-card">
          <div className="chart-header">
            <div>
              <h3>Security Overview</h3>
              <p>Vulnerability distribution by severity</p>
            </div>
          </div>

          <div className="security-chart-container">
  {securityData.some((item) => item.value > 0) ? (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={securityData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={65}
          outerRadius={100}
          paddingAngle={4}
        >
          {securityData.map((entry, index) => (
            <Cell
              key={entry.name}
              fill={securityColors[index]}
            />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  ) : (
    <div className="security-empty">
      <p>No security vulnerabilities recorded</p>
      <span>Run a security scan to display results.</span>
    </div>
  )}
</div>
        </div>
      </div>

      {/* Recent Deployments */}
      <div className="deployments-card">
        <div className="deployments-header">
          <div>
            <h3>Recent Deployments</h3>
            <p>Latest application deployments</p>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="deployments-table">
            <thead>
              <tr>
                <th>Application</th>
                <th>Environment</th>
                <th>Version</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {recentDeployments.length > 0 ? (
                recentDeployments.map((deployment) => (
                  <tr key={deployment.id}>
                    <td>{deployment.name}</td>
                    <td>{deployment.environment}</td>
                    <td>{deployment.version}</td>
                    <td>
                      <span
                        className={`status-badge ${deployment.status.toLowerCase()}`}
                      >
                        {deployment.status}
                      </span>
                    </td>
                    <td>{deployment.date}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No deployments available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
