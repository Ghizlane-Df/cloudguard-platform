
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import { getMonitoring } from "../../services/api";

function Monitoring() {
  const [monitoringData, setMonitoringData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchMonitoring() {
      try {
        const result = await getMonitoring();
        setMonitoringData(result.data);
      } catch (err) {
        setError("Impossible de charger les données de monitoring.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchMonitoring();
  }, []);

  if (loading) {
    return <div className="dashboard">Loading monitoring data...</div>;
  }

  if (error) {
    return <div className="dashboard">{error}</div>;
  }

  const metrics = monitoringData?.metrics_history || {};

  const metricDefinitions = [
    { key: "cpu_usage", name: "CPU Usage" },
    { key: "memory_usage", name: "Memory Usage" },
    { key: "disk_usage", name: "Disk Usage" },
  ];

  const getValue = (key) => {
    const metric = metrics[key];
    return metric ? `${metric.value} ${metric.unit || ""}` : "—";
  };

  const monitoringStats = [
    {
      title: "CPU Usage",
      value: getValue("cpu_usage"),
      description: "Latest recorded CPU utilization",
      icon: "◉",
    },
    {
      title: "Memory Usage",
      value: getValue("memory_usage"),
      description: "Latest recorded memory utilization",
      icon: "▦",
    },
    {
      title: "Disk Usage",
      value: getValue("disk_usage"),
      description: "Latest recorded disk utilization",
      icon: "▤",
    },
    {
      title: "System Status",
      value:
        monitoringData?.application_status === "monitoring"
          ? "Monitoring"
          : "No Data",
      description:
        monitoringData?.application_status === "monitoring"
          ? "Metrics are available"
          : "No metrics recorded yet",
      icon: "✓",
    },
  ];

  const monitoringMetrics = metricDefinitions
    .filter(({ key }) => metrics[key])
    .map(({ key, name }) => ({
      name,
      value: metrics[key].value,
      unit: metrics[key].unit || "",
      source: metrics[key].source || "Unknown",
      date: metrics[key].date || "—",
    }));

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Monitoring</h2>
        <p>Monitor infrastructure performance and system health</p>
      </div>

      <div className="stats-grid">
        {monitoringStats.map((stat) => (
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

      <div className="chart-card monitoring-chart">
        <div className="chart-header">
          <div>
            <h3>System Performance</h3>
            <p>CPU and memory usage history</p>
          </div>
          <span className="chart-period">Historical data</span>
        </div>

        <div className="monitoring-chart-container">
          <p>
            Historical metrics are not available yet.
            Connect a monitoring source to collect data over time.
          </p>
        </div>
      </div>

      <div className="deployments-card">
        <div className="deployments-header">
          <div>
            <h3>Monitoring Metrics</h3>
            <p>Infrastructure performance indicators from PostgreSQL</p>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="deployments-table">
            <thead>
              <tr>
                <th>Metric</th>
                <th>Value</th>
                <th>Source</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {monitoringMetrics.length > 0 ? (
                monitoringMetrics.map((metric) => (
                  <tr key={metric.name}>
                    <td>{metric.name}</td>
                    <td>{metric.value} {metric.unit}</td>
                    <td>{metric.source}</td>
                    <td>{metric.date}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">
                    No monitoring metrics recorded in the database.
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

export default Monitoring;
