
import { useEffect, useState } from "react";
import { getInfrastructure } from "../../services/api";

function Infrastructure() {
  const [selectedType, setSelectedType] = useState("All");
  const [infrastructureData, setInfrastructureData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadInfrastructure() {
      try {
        const response = await getInfrastructure();
        setInfrastructureData(response.data);
      } catch (err) {
        setError("Unable to load infrastructure data from the server.");
      } finally {
        setLoading(false);
      }
    }

    loadInfrastructure();
  }, []);

  const resources = infrastructureData?.resource_history ?? [];

  const infrastructureStats = [
    {
      title: "Total Resources",
      value: infrastructureData?.total_resources ?? 0,
      description: "Registered resources",
      icon: "▦",
    },
    {
      title: "Running",
      value: infrastructureData?.running ?? 0,
      description: "Resources currently running",
      icon: "◉",
    },
    {
      title: "Pending",
      value: infrastructureData?.pending ?? 0,
      description: "Resources waiting",
      icon: "⇧",
    },
    {
      title: "Failed",
      value: infrastructureData?.failed ?? 0,
      description: "Failed resources",
      icon: "◇",
    },
  ];

  const filteredResources =
    selectedType === "All"
      ? resources
      : resources.filter(
          (resource) => resource.type === selectedType
        );

  if (loading) {
    return <div className="dashboard">Loading infrastructure...</div>;
  }

  if (error) {
    return <div className="dashboard">{error}</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Infrastructure</h2>
        <p>Monitor and manage your Kubernetes resources</p>
      </div>

      <div className="stats-grid">
        {infrastructureStats.map((stat) => (
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

      <div className="deployments-card infrastructure-card">
        <div className="deployments-header">
          <div>
            <h3>Infrastructure Resources</h3>
            <p>Overview of Kubernetes cluster resources</p>
          </div>
        </div>

        <div className="filter-container">
          <label htmlFor="resource-filter">Filter by type:</label>

          <select
            id="resource-filter"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="All">All Resources</option>
            <option value="Pod">Pods</option>
            <option value="Service">Services</option>
            <option value="Deployment">Deployments</option>
          </select>
        </div>

        <div className="table-wrapper">
          <table className="deployments-table">
            <thead>
              <tr>
                <th>Resource Name</th>
                <th>Type</th>
                <th>Namespace</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {filteredResources.length > 0 ? (
                filteredResources.map((resource) => (
                  <tr key={resource.id}>
                    <td>{resource.name}</td>
                    <td>{resource.type}</td>
                    <td>{resource.namespace}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          resource.status === "Running"
                            ? "successful"
                            : resource.status === "Failed"
                            ? "failed"
                            : "in-progress"
                        }`}
                      >
                        {resource.status}
                      </span>
                    </td>
                    <td>{resource.date || "—"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">
                    No infrastructure resources recorded yet.
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

export default Infrastructure;
