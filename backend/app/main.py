from fastapi import FastAPI, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .ai_summary import generate_song_summary

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

    return {"summary": summary}
