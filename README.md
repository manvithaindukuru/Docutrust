# RAG Knowledge Assistant

A full-stack Retrieval-Augmented Generation (RAG) system for intelligent document querying. Upload company documents, index them with vector embeddings, and ask natural language questions — powered by **Groq LLaMA 3.3** and **FAISS**.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                      │
│  Upload Zone → Document List → Chat Interface → Sources     │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTP / REST
┌───────────────────────────▼─────────────────────────────────┐
│                      BACKEND (FastAPI)                       │
│                                                             │
│  ┌──────────────┐   ┌──────────────┐   ┌───────────────┐   │
│  │  Doc         │   │  Vector      │   │  LLM          │   │
│  │  Processor   │──▶│  Store       │──▶│  Service      │   │
│  │  (PyPDF2,    │   │  (FAISS +    │   │  (Groq API)   │   │
│  │   python-    │   │  MiniLM-L6)  │   │               │   │
│  │   docx)      │   │              │   │               │   │
│  └──────────────┘   └──────────────┘   └───────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer        | Technology                                 |
| ------------ | ------------------------------------------ |
| Frontend     | React 18, Vite, Framer Motion              |
| Backend      | FastAPI, Python 3.10+                      |
| Embeddings   | `all-MiniLM-L6-v2` (sentence-transformers) |
| Vector DB    | FAISS (local, persisted)                   |
| LLM          | Groq — LLaMA 3.3 70B (free tier)           |
| File Support | PDF, DOCX, TXT, Markdown                   |

---

## Quick Start

### 1. Get a Free Groq API Key

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up for a free account
3. Navigate to **API Keys** → **Create API Key**
4. Copy the key

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and paste your Groq API key

# Start the server
uvicorn main:app --reload --port 8000
```

Backend runs at: `http://localhost:8000`
API docs at: `http://localhost:8000/docs`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs at: `http://localhost:3000`

---

## VS Code Setup

Open the root folder in VS Code:

```bash
code .
```

### Recommended Extensions

Install from `.vscode/extensions.json` — VS Code will prompt you automatically.

### Run Full Stack with One Click

Use the **Run and Debug** panel → select **"Full Stack"** compound configuration.

Or run each separately:

- `FastAPI Backend`
- `React Frontend`

---

## API Reference

| Method   | Endpoint                | Description                 |
| -------- | ----------------------- | --------------------------- |
| `POST`   | `/upload`               | Upload and index a document |
| `POST`   | `/query`                | Query the knowledge base    |
| `GET`    | `/documents`            | List all indexed documents  |
| `DELETE` | `/documents/{filename}` | Remove a specific document  |
| `DELETE` | `/documents`            | Clear all documents         |
| `GET`    | `/health`               | Health check                |

### Query Example

```bash
# Replace `BACKEND_URL` with your backend host or set the environment variable `VITE_API_URL`/`PORT` appropriately.
curl -X POST ${VITE_API_URL:-http://localhost:8000}/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What are the main topics?", "top_k": 5}'
```

---

## Project Structure

```
rag-knowledge-assistant/
├── .vscode/
│   ├── launch.json          # Debug configurations
│   ├── settings.json        # Editor settings
│   └── extensions.json      # Recommended extensions
│
├── backend/
│   ├── main.py              # FastAPI app + routes
│   ├── requirements.txt
│   ├── .env.example
│   └── services/
│       ├── document_processor.py  # PDF/DOCX/TXT parsing + chunking
│       ├── vector_store.py        # FAISS embeddings + search
│       └── llm_service.py         # Groq API integration
│
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── App.jsx
│       ├── index.css
│       ├── App.css
│       ├── components/
│       │   ├── Header.jsx
│       │   ├── UploadZone.jsx
│       │   ├── DocumentList.jsx
│       │   ├── ChatMessage.jsx
│       │   └── ChatInterface.jsx
│       ├── hooks/
│       │   ├── useDocuments.js
│       │   └── useQuery.js
│       └── utils/
│           └── api.js
│
└── vectorstore/             # Auto-created — persisted FAISS index
```

---

## How It Works

1. **Upload** — Documents are parsed and split into overlapping ~800-char chunks
2. **Embed** — Each chunk is encoded using `all-MiniLM-L6-v2` (384-dim vectors)
3. **Store** — Embeddings saved to a local FAISS index (persisted to disk)
4. **Query** — User question is embedded → cosine similarity search → top-K chunks retrieved
5. **Answer** — Retrieved chunks + question sent to Groq LLaMA 3.3 → contextual answer returned

---

## Groq Free Tier Limits

- 14,400 requests/day
- 30 requests/minute
- 6,000 tokens/minute on LLaMA 3.3 70B

More than enough for development and small teams.
