import { useRef, useState } from "react";
import { FileAudio, UploadCloud, X } from "lucide-react";
import { uploadAudio } from "./api/audio";
import appConfig from "./config/app.json";
import "./styles.css";

const maxFileSizeBytes = appConfig.maxFileSizeMb * 1024 * 1024;

function formatBytes(bytes) {
  if (!bytes) return "0 MB";
  const megabytes = bytes / 1024 / 1024;
  return `${megabytes.toFixed(2)} MB`;
}

export default function App() {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  function validateAudio(file) {
    if (!file) return "Selecciona un archivo de audio.";

    if (!appConfig.acceptedAudioTypes.includes(file.type)) {
      return "El formato no esta soportado todavia.";
    }

    if (file.size > maxFileSizeBytes) {
      return `El archivo supera el limite de ${appConfig.maxFileSizeMb} MB.`;
    }

    return "";
  }

  async function handleFile(file) {
    const error = validateAudio(file);

    if (error) {
      setSelectedFile(null);
      setStatus("error");
      setMessage(error);
      return;
    }

    setSelectedFile(file);
    setStatus("ready");
    setMessage("Archivo listo para subir.");
  }

  async function handleUpload() {
    if (!selectedFile) return;

    setStatus("uploading");
    setMessage("Subiendo archivo...");

    try {
      const result = await uploadAudio(selectedFile);
      setStatus("success");
      setMessage(`Archivo recibido: ${result.filename} (${formatBytes(result.size)}).`);
    } catch (error) {
      setStatus("error");
      setMessage(error.message);
    }
  }

  function openFilePicker() {
    inputRef.current?.click();
  }

  return (
    <main className="app-shell">
      <section className="workspace">
        <div className="title-group">
          <p>SoundWave</p>
          <h1>Arrastra un archivo de audio</h1>
        </div>

        <button
          className={`dropzone ${isDragging ? "is-dragging" : ""}`}
          type="button"
          onClick={openFilePicker}
          onDragEnter={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            handleFile(event.dataTransfer.files[0]);
          }}
        >
          <UploadCloud size={42} strokeWidth={1.7} />
          <span>Suelta tu audio aca o toca para elegirlo</span>
          <small>MP3, WAV, AAC, M4A u OGG hasta {appConfig.maxFileSizeMb} MB</small>
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="audio/*"
          onChange={(event) => handleFile(event.target.files[0])}
          hidden
        />

        {selectedFile ? (
          <div className="file-row">
            <FileAudio size={24} />
            <div>
              <strong>{selectedFile.name}</strong>
              <span>{formatBytes(selectedFile.size)}</span>
            </div>
            <button
              className="icon-button"
              type="button"
              aria-label="Quitar archivo"
              onClick={() => {
                setSelectedFile(null);
                setStatus("idle");
                setMessage("");
              }}
            >
              <X size={18} />
            </button>
          </div>
        ) : null}

        <div className="actions">
          <button type="button" onClick={handleUpload} disabled={!selectedFile || status === "uploading"}>
            Subir audio
          </button>
          {message ? <p className={`status ${status}`}>{message}</p> : null}
        </div>
      </section>
    </main>
  );
}

