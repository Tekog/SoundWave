const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000`;

export async function uploadAudio(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/audio`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("No se pudo subir el archivo de audio.");
  }

  return response.json();
}
