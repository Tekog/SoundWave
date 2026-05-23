const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000`;

export async function generateYoutubeSummary(url) {
  const response = await fetch(`${API_BASE_URL}/youtube-summary`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail || "No se pudo analizar el link de YouTube.");
  }

  return response.json();
}
