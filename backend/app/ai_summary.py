import os
from typing import Any, Mapping

from openai import OpenAI

DEFAULT_MODEL = "gpt-5.4-mini"


def _format_feature(value: Any, unit: str = "") -> str:
    if value is None:
        return "no disponible"

    return f"{value}{unit}"


def generate_song_summary(features: Mapping[str, Any]) -> str:
    api_key = os.getenv("OPENAI_API_KEY")

    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not configured.")

    filename = features.get("filename") or features.get("file_name") or "tema sin nombre"
    bpm = _format_feature(features.get("bpm"), " BPM")
    duration = _format_feature(features.get("duration"), " segundos")
    energy = _format_feature(features.get("energy"))

    client = OpenAI(api_key=api_key)

    response = client.responses.create(
        model=os.getenv("OPENAI_MODEL", DEFAULT_MODEL),
        instructions=(
            "Sos un analista musical experto. Respondé siempre en español, con un tono claro, "
            "profundo y útil para músicos, productores y oyentes curiosos. No inventes datos "
            "técnicos que no estén en las features recibidas; cuando falten datos, explicá qué "
            "podría analizarse después."
        ),
        input=(
            "Analizá esta canción a partir de sus features disponibles.\n\n"
            f"Nombre del archivo: {filename}\n"
            f"BPM: {bpm}\n"
            f"Duración: {duration}\n"
            f"Energía: {energy}\n\n"
            "Devolvé un resumen musical con estas secciones: lectura general, pulso y movimiento, "
            "sensación emocional, posibles decisiones de producción, y próximos datos útiles "
            "para analizar tonalidad, armonía y estructura."
        ),
    )

    return response.output_text
