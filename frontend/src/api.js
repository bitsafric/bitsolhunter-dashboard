const BACKEND_URL = "http://localhost:8000"; // make sure your backend is running here

export async function fetchTokenData() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/tokens`);
    if (!res.ok) throw new Error("Failed to fetch tokens");
    return await res.json();
  } catch (err) {
    console.error("Error fetching tokens:", err);
    return [];
  }
}

export async function fetchBotStats() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/stats`);
    if (!res.ok) throw new Error("Failed to fetch stats");
    return await res.json();
  } catch (err) {
    console.error("Error fetching stats:", err);
    return {};
  }
}

export async function runTokenScan() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/scan`, {
      method: "POST"
    });
    if (!res.ok) throw new Error("Scan failed");
    return await res.json();
  } catch (err) {
    console.error("Error scanning:", err);
    return null;
  }
}

