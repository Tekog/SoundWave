from fastapi import FastAPI, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .ai_summary import generate_song_summary, generate_youtube_summary

app = FastAPI(title="SoundWave API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SongFeatures(BaseModel):
    filename: str = Field(..., min_length=1)
    bpm: float | None = Field(default=None, gt=0)
    duration: float | None = Field(default=None, gt=0)
    energy: float | None = Field(default=None, ge=0, le=1)


class YoutubeAnalysisRequest(BaseModel):
    url: str = Field(..., min_length=8)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/audio")
async def receive_audio(file: UploadFile) -> dict[str, str | int | None]:
    contents = await file.read()

    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "size": len(contents),
    }


@app.post("/song-summary")
def create_song_summary(features: SongFeatures) -> dict[str, str]:
    try:
        summary = generate_song_summary(features.model_dump())
    except RuntimeError as error:
        raise HTTPException(status_code=500, detail=str(error)) from error
    except Exception as error:
        raise HTTPException(
            status_code=502,
            detail="No se pudo generar el analisis. Revisa OPENAI_API_KEY y OPENAI_MODEL.",
        ) from error

    return {"summary": summary}


@app.post("/youtube-summary")
def create_youtube_summary(payload: YoutubeAnalysisRequest) -> dict[str, str]:
    if "youtube.com" not in payload.url and "youtu.be" not in payload.url:
        raise HTTPException(status_code=400, detail="El link debe ser de YouTube.")

    try:
        summary = generate_youtube_summary(payload.url)
    except RuntimeError as error:
        raise HTTPException(status_code=500, detail=str(error)) from error
    except Exception as error:
        raise HTTPException(
            status_code=502,
            detail="No se pudo analizar el link. Revisa OPENAI_API_KEY y OPENAI_MODEL.",
        ) from error

    return {"summary": summary}
