# SoundWave

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
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

