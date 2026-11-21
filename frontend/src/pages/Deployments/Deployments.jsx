
import { useEffect, useState } from "react";
import { getDeployments } from "../../services/api";

function Deployments() {
  const [deploymentData, setDeploymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDeployments() {
      try {
        const response = await getDeployments();
        setDeploymentData(response.data);
      } catch (err) {
        setError("Unable to load deployments from the server.");
      } finally {
        setLoading(false);
      }
    }

    loadDeployments();
  }, []);

  const deploymentStats = [
    {
      title: "Total Deployments",
      value: deploymentData?.total_deployments ?? 0,
      description: "All deployments",
      icon: "⇧",
    },
    {
      title: "Successful",
      value: deploymentData?.successful ?? 0,
      description: "Successfully deployed",
      icon: "✓",
    },
    {
      title: "Failed",
      value: deploymentData?.failed ?? 0,
      description: "Failed deployments",
      icon: "✕",
    },
    {
      title: "In Progress",
      value: deploymentData?.running ?? 0,
      description: "Currently deploying",
      icon: "◷",
    },
  ];

  const deployments = deploymentData?.deployment_history ?? [];

  if (loading) {
    return <div className="dashboard">Loading deployments...</div>;
  }

  if (error) {
    return <div className="dashboard">{error}</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Deployments</h2>
        <p>Track and manage your application deployments</p>
      </div>

      <div className="stats-grid">
        {deploymentStats.map((stat) => (
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

      <div className="deployments-card">
        <div className="deployments-header">
          <div>
            <h3>Deployment History</h3>
            <p>Overview of recent application deployments</p>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="deployments-table">
            <thead>
              <tr>
                <th>Application</th>
                <th>Version</th>
                <th>Environment</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {deployments.length > 0 ? (
                deployments.map((deployment) => (
                  <tr key={deployment.id}>
                    <td>{deployment.application}</td>
                    <td>{deployment.version}</td>
                    <td>{deployment.environment}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          deployment.status === "Successful"
                            ? "successful"
                            : deployment.status === "Failed"
                            ? "failed"
                            : "in-progress"
                        }`}
                      >
                        {deployment.status}
                      </span>
                    </td>
                    <td>{deployment.date}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No deployments recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Deployments;
