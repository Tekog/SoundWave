import os
from pathlib import Path
from typing import Any, Mapping

from dotenv import load_dotenv
from google import genai

DEFAULT_MODEL = "gemini-2.5-flash"
ENV_PATH = Path(__file__).resolve().parents[2] / ".env"
BACKEND_ENV_PATH = Path(__file__).resolve().parents[1] / ".env"

load_dotenv(dotenv_path=ENV_PATH)
load_dotenv(dotenv_path=BACKEND_ENV_PATH, override=True)


def _format_feature(value: Any, unit: str = "") -> str:
    if value is None:
        return "no disponible"

    return f"{value}{unit}"


def _get_gemini_client() -> genai.Client:
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not configured.")

    return genai.Client(api_key=api_key)


def _generate_text(prompt: str) -> str:
    client = _get_gemini_client()
    response = client.models.generate_content(
        model=os.getenv("GEMINI_MODEL", DEFAULT_MODEL),
        contents=prompt,
    )

    return response.text or ""


def generate_song_summary(features: Mapping[str, Any]) -> str:
    filename = features.get("filename") or features.get("file_name") or "tema sin nombre"
    bpm = _format_feature(features.get("bpm"), " BPM")
    duration = _format_feature(features.get("duration"), " segundos")
    energy = _format_feature(features.get("energy"))

    return _generate_text(
        "Sos un analista musical experto. Respondé siempre en español, con un tono claro, "
        "profundo y útil para músicos, productores y oyentes curiosos. No inventes datos "
        "técnicos que no estén en las features recibidas; cuando falten datos, explicá qué "
        "podría analizarse después.\n\n"
        "Analizá esta canción a partir de sus features disponibles.\n\n"
        f"Nombre del archivo: {filename}\n"
        f"BPM: {bpm}\n"
        f"Duración: {duration}\n"
        f"Energía: {energy}\n\n"
        "Devolvé un resumen musical con estas secciones: lectura general, pulso y movimiento, "
        "sensación emocional, posibles decisiones de producción, y próximos datos útiles "
        "para analizar tonalidad, armonía y estructura."
    )


def generate_youtube_summary(youtube_url: str) -> str:
    return _generate_text(
        "Sos un analista musical experto. Respondé siempre en español, con criterio musical "
        "profundo y lenguaje claro. El usuario compartió un link de YouTube, pero no tenés "
        "acceso garantizado al audio real. No inventes BPM, tonalidad ni armonía; si no hay "
        "datos técnicos confiables, explicá qué se podría analizar al procesar el audio.\n\n"
        "Analizá este link de YouTube para SoundWave:\n\n"
        f"{youtube_url}\n\n"
        "Devolvé un análisis con estas secciones: identificación del material si es posible, "
        "lectura musical general posible, datos que faltan para un análisis profundo, sensación "
        "esperada si se pudiera escuchar el tema, y próximos pasos para extraer BPM, tonalidad, "
        "armonía, energía y estructura."
    )
