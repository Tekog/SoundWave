# SoundWave

App web para analizar canciones a otro nivel.

SoundWave is a web app for working with audio files. The first milestone is a drag-and-drop upload experience, with a Python backend and a React frontend.

## Project Structure

- `backend/`: Python API code.
- `frontend/`: React UI, JavaScript API helpers, and JSON configuration.

## Local Development

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export OPENAI_API_KEY="tu_api_key"
uvicorn app.main:app --reload
```

You can also create a local `.env` file:

```bash
OPENAI_API_KEY=tu_api_key
OPENAI_MODEL=gpt-5.4-mini
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```
