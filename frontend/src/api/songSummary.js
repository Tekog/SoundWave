const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000`;

export async function generateSongSummary(features) {
  const response = await fetch(`${API_BASE_URL}/song-summary`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(features),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail || "No se pudo generar el analisis musical.");
  }

  return response.json();
}
