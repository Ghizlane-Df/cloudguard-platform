
const API_URL = import.meta.env.VITE_API_URL;

export async function apiRequest(endpoint) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("CloudGuard API Error:", error);
    throw error;
  }
}

export async function getHealth() {
  return apiRequest("/health");
}

export async function getDashboard() {
  return apiRequest("/dashboard/");
}

export async function getInfrastructure() {
  return apiRequest("/infrastructure/");
}

export async function getDeployments() {
  return apiRequest("/deployments/");
}

export async function getSecurity() {
  return apiRequest("/security/");
}

export async function getMonitoring() {
  return apiRequest("/monitoring/");
}

export async function scanSecurityImage(file) {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`${API_URL}/security/scan`, {
    method: "POST",
    body: formData,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Security scan failed");
  }

  return result;
}
