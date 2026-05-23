import { useRef, useState } from "react";
import { Bot, FileAudio, MessageSquare, Plus, Search, Send, UploadCloud, X } from "lucide-react";
import { uploadAudio } from "./api/audio";
import { generateSongSummary } from "./api/songSummary";
import appConfig from "./config/app.json";
import "./styles.css";

const maxFileSizeBytes = appConfig.maxFileSizeMb * 1024 * 1024;

function formatBytes(bytes) {
  if (!bytes) return "0 MB";
  const megabytes = bytes / 1024 / 1024;
  return `${megabytes.toFixed(2)} MB`;
}

function getAudioDuration(file) {
  return new Promise((resolve) => {
    const audio = document.createElement("audio");
    const objectUrl = URL.createObjectURL(file);

    audio.preload = "metadata";
    audio.src = objectUrl;
    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(Number.isFinite(audio.duration) ? Math.round(audio.duration) : null);
    };
    audio.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(null);
    };
  });
}

export default function App() {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatStatus, setChatStatus] = useState("idle");
  const [chatSummary, setChatSummary] = useState("");
  const [songFeatures, setSongFeatures] = useState(null);

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
    setIsChatOpen(false);
    setChatStatus("idle");
    setChatSummary("");
    setSongFeatures(null);
    setStatus("ready");
    setMessage("Archivo listo para subir.");
  }

  async function handleUpload() {
    if (!selectedFile) return;

    setStatus("uploading");
    setMessage("Subiendo archivo...");

    let features;

    try {
      const result = await uploadAudio(selectedFile);
      const duration = await getAudioDuration(selectedFile);
      features = {
        filename: result.filename,
        bpm: null,
        duration,
        energy: null,
      };

      setStatus("success");
      setMessage(`Archivo recibido: ${result.filename} (${formatBytes(result.size)}).`);
      setSongFeatures(features);
      setIsChatOpen(true);
      setChatStatus("analyzing");
      setChatSummary("");
    } catch (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    try {
      const summaryResult = await generateSongSummary(features);
      setChatSummary(summaryResult.summary);
      setChatStatus("ready");
    } catch (error) {
      setIsChatOpen(true);
      setChatStatus("error");
      setChatSummary(error.message);
    }
  }

  function openFilePicker() {
    inputRef.current?.click();
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="SoundWave inicio">
          SoundWave
        </a>

        <label className="search-field">
          <Search size={18} />
          <input
            type="search"
            placeholder="Buscar audios, artistas o proyectos"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </label>

        <button className="add-audio-button" type="button" onClick={openFilePicker}>
          <Plus size={18} />
          Agregar audio
        </button>
      </header>

      <section className="workspace">
        <div className="audio-panel">
          <div className="title-group">
            <p>Biblioteca</p>
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

          <div className="library-section">
            <div className="section-heading">
              <h2>Archivos de audio</h2>
              <span>{selectedFile ? "1 archivo seleccionado" : "Sin archivos"}</span>
            </div>

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
                    setIsChatOpen(false);
                    setChatStatus("idle");
                    setChatSummary("");
                    setSongFeatures(null);
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <div className="empty-library">
                <FileAudio size={22} />
                <span>Todavia no agregaste audios.</span>
              </div>
            )}
          </div>

          <div className="actions">
            <button type="button" onClick={handleUpload} disabled={!selectedFile || status === "uploading"}>
              Subir audio
            </button>
            {message ? <p className={`status ${status}`}>{message}</p> : null}
          </div>
        </div>

        <aside className={`chat-panel ${isChatOpen ? "is-open" : ""}`} aria-label="Analisis IA">
          <div className="chat-heading">
            {isChatOpen ? <Bot size={22} /> : <MessageSquare size={22} />}
            <div>
              <h2>Chat IA</h2>
              <span>{isChatOpen ? "Analisis musical" : "Se abre al subir un tema"}</span>
            </div>
          </div>

          <div className="chat-thread">
            {!isChatOpen ? (
              <div className="chat-bubble muted">
                Subi un unico tema para abrir el chat y generar un analisis profundo de la cancion.
              </div>
            ) : null}

            {isChatOpen && songFeatures ? (
              <div className="chat-bubble user">
                Analiza {songFeatures.filename}
                {songFeatures.duration ? `, duracion ${songFeatures.duration} segundos` : ""}.
              </div>
            ) : null}

            {chatStatus === "analyzing" ? (
              <div className="chat-bubble ai loading">
                <span />
                <span />
                <span />
                Analizando tonalidad, BPM, armonia, energia y sensacion...
              </div>
            ) : null}

            {chatStatus === "ready" ? (
              <div className="chat-bubble ai">
                <strong>Analisis IA</strong>
                <p>{chatSummary}</p>
              </div>
            ) : null}

            {chatStatus === "error" ? (
              <div className="chat-bubble error">
                <strong>No pude completar el analisis IA</strong>
                <p>{chatSummary}</p>
              </div>
            ) : null}
          </div>

          <label className="chat-input">
            <input type="text" placeholder="Preguntar sobre este audio" disabled={!isChatOpen || chatStatus !== "ready"} />
            <button type="button" aria-label="Enviar mensaje" disabled>
              <Send size={18} />
            </button>
          </label>
        </aside>
      </section>
    </main>
  );
}
