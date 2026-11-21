
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

import {
  getSecurity,
  scanSecurityImage,
} from "../../services/api";

function Security() {
  const [securityData, setSecurityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState("");

  useEffect(() => {
    async function loadSecurity() {
      try {
        const response = await getSecurity();
        setSecurityData(response.data);
      } catch (err) {
        setError("Unable to load security data from the server.");
      } finally {
        setLoading(false);
      }
    }

    loadSecurity();
  }, []);
   
async function handleScan(event) {
  event.preventDefault();

  if (!selectedFile) {
    setScanMessage("Please select a Docker image archive.");
    return;
  }

  setScanning(true);
  setScanMessage("");

  try {
    const result = await scanSecurityImage(selectedFile);

    const total =
  result.data?.total_vulnerabilities ??
  result.total_vulnerabilities ??
  0;

setScanMessage(
  `Scan completed successfully. ${total} vulnerabilities detected.`
);

    // Reload security data from the backend
    const refreshedData = await getSecurity();
    setSecurityData(refreshedData.data);

    setSelectedFile(null);
  } catch (err) {
    setScanMessage(err.message || "Scan failed.");
  } finally {
    setScanning(false);
  }
}

  const vulnerabilities = securityData?.vulnerabilities;

  const totalVulnerabilities =
    securityData?.total_vulnerabilities ?? 0;

  const securityStats = [
    {
      title: "Total Vulnerabilities",
      value: totalVulnerabilities,
      description: "Detected vulnerabilities",
      icon: "◈",
    },
    {
      title: "Critical",
      value: vulnerabilities?.critical ?? 0,
      description: "Critical vulnerabilities",
      icon: "!",
    },
    {
      title: "High",
      value: vulnerabilities?.high ?? 0,
      description: "High severity issues",
      icon: "▲",
    },
    {
      title: "Security Scans",
      value: securityData?.scans_count ?? 0,
      description: "Scans performed",
      icon: "✓",
    },
  ];

  const vulnerabilityData = vulnerabilities
    ? [
        { name: "Critical", value: vulnerabilities.critical },
        { name: "High", value: vulnerabilities.high },
        { name: "Medium", value: vulnerabilities.medium },
        { name: "Low", value: vulnerabilities.low },
      ]
    : [];

  const vulnerabilityColors = [
    "#ef4444",
    "#f97316",
    "#eab308",
    "#22c55e",
  ];

  const securityScans = securityData?.scan_history ?? [];

  const tools = [
    {
      name: "Trivy",
      description: "Container vulnerability scanning",
    },
    {
      name: "Semgrep",
      description: "Static application security testing",
    },
    {
      name: "Checkov",
      description: "Infrastructure as Code scanning",
    },
  ];

  if (loading) {
    return <div className="dashboard">Loading security data...</div>;
  }

  if (error) {
    return <div className="dashboard">{error}</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Security Overview</h2>
        <p>Monitor vulnerabilities and security scan results</p>
      </div>

    
    <div className="deployments-card">
      <div className="deployments-header">
       <div>
      <h3>Scan Docker Image</h3>
      <p>Upload a Docker image archive (.tar) for Trivy analysis</p>
    </div>
  </div>

  <form onSubmit={handleScan}>
    <input
      type="file"
      accept=".tar"
      onChange={(event) => {
        setSelectedFile(event.target.files[0] || null);
        setScanMessage("");
      }}
    />

    <button type="submit" disabled={scanning || !selectedFile}>
      {scanning ? "Scanning..." : "Start Security Scan"}
    </button>
  </form>

  {scanMessage && (
    <p style={{ marginTop: "15px" }}>{scanMessage}</p>
  )}
</div>


      <div className="stats-grid">
        {securityStats.map((stat) => (
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

      <div className="charts-grid">
        <div className="security-chart-card">
          <div className="chart-header">
            <div>
              <h3>Vulnerability Distribution</h3>
              <p>Vulnerabilities by severity level</p>
            </div>
          </div>

          <div className="security-chart-container">
            {vulnerabilityData.some((item) => item.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={vulnerabilityData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={100}
                    paddingAngle={4}
                  >
                    {vulnerabilityData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={vulnerabilityColors[index]}
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

        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3>Security Tools</h3>
              <p>Tools used for security analysis</p>
            </div>
          </div>

          <div className="security-tools-list">
            {tools.map((tool) => {
              const toolStatus =
                securityData?.scanners?.[tool.name.toLowerCase()];

              return (
                <div className="security-tool" key={tool.name}>
                  <h4>{tool.name}</h4>
                  <p>{tool.description}</p>
                  <span>
                    Status:{" "}
                    {toolStatus === "not_scanned"
                      ? "Not scanned"
                      : toolStatus || "Unknown"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="deployments-card">
        <div className="deployments-header">
          <div>
            <h3>Security Scan Results</h3>
            <p>Recent security analysis activities</p>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="deployments-table">
            <thead>
              <tr>
                <th>Tool</th>
                <th>Target</th>
                <th>Scan Type</th>
                <th>Status</th>
                <th>Vulnerabilities</th>
              </tr>
            </thead>

            <tbody>
              {securityScans.length > 0 ? (
                securityScans.map((scan) => (
                  <tr key={scan.id}>
                    <td>{scan.tool}</td>
                    <td>{scan.target}</td>
                    <td>{scan.type}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          ["completed", "successful"].includes(
                            (scan.status || "").toLowerCase()
                          )
                            ? "successful"
                            : "in-progress"
                        }`}
                      >
                        {scan.status}
                      </span>
                    </td>
                    <td>{scan.vulnerabilities}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">
                    No security scans recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Security;
