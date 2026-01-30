# VondraLink: A Smart Multimodal Discovery Platform 🔍✨

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Qdrant](https://img.shields.io/badge/Qdrant-Vector%20DB-FF4444?style=for-the-badge)](https://qdrant.tech/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

**VondraLink** is a "FinCommerce" engine designed to bridge the gap between aesthetic inspiration and financial reality. By leveraging **Vector Search** and **CLIP embeddings**, it helps users discover products based on "vibes," specific technical features, and strict budget constraints.

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Core Features](#-core-features)
- [Tech Stack & Architecture](#-tech-stack--architecture)
- [Folder Structure](#-folder-structure)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Running the Application](#-running-the-application)
- [API Endpoints](#-api-endpoints)
- [Data Pipeline](#-data-pipeline)
- [Evaluation Metrics](#-evaluation-metrics)
- [Environment Variables](#-environment-variables)
- [Troubleshooting](#-troubleshooting)
- [License](#-license)

---

## 🎯 Project Overview

In today's market, users often face "Feature Confusion" or find high-end items they love but cannot afford. VondraLink solves this by connecting users to affordable alternatives that maintain the "must-have" qualities of premium products.

While the system is built for various product categories (like furniture or clothing), the current implementation focuses on **Tech Gadgets**.

---

## ✨ Core Features

| Feature | Description |
|---------|-------------|
| **Visual "Vibe-on-a-Budget" Search** | Upload an image of a luxury item, and the system finds visually similar products within your price range |
| **The "Trade-Off" Engine** | Identify "close substitutes" that save money while preserving key specs (battery life, screen quality, etc.) |
| **Contextual Gift Finder** | Describe a person's lifestyle in plain English, and the system identifies relevant products through NLU |
| **MMR (Maximal Marginal Relevance)** | Diversified search results balancing relevance and variety |
| **Budget Range Filtering** | Intelligent filtering showing products within 50-100% of your budget limit |

---

## 🛠️ Tech Stack & Architecture

### Backend
- **Framework**: FastAPI (Python)
- **Vector Database**: Qdrant Cloud
- **Embeddings**: CLIP (clip-ViT-B-32) via Sentence Transformers
- **Search Algorithm**: Cosine similarity with MMR for diversity
- **Webhooks**: n8n for personality-to-product recommendations

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 6
- **Animations**: Framer Motion 12
- **Icons**: Lucide React
- **Styling**: Custom CSS with dark theme

### Data Pipeline
- **Data Source**: Best Buy API
- **Processing**: Jupyter Notebooks
- **Storage**: JSON datasets with local image caching

---

## 📁 Folder Structure

```
VondraLink/
├── README.md                    # This file
├── requirements.txt             # Python dependencies (root-level)
│
└── VondraLink/                  # Main application directory
    ├── docker-compose.yml       # Docker configuration (placeholder)
    │
    ├── backend/                 # FastAPI Backend
    │   ├── main.py              # Entry point - FastAPI app initialization
    │   ├── .env.example         # Environment variables template
    │   ├── routers/             # API route handlers
    │   │   ├── __init__.py
    │   │   ├── search.py        # /search and /recommendations endpoints
    │   │   └── recommendation_router.py
    │   ├── services/            # Business logic layer
    │   │   ├── __init__.py
    │   │   ├── embedding.py     # CLIP embedding generation (text & image)
    │   │   ├── qdrant_ops.py    # Qdrant Cloud operations
    │   │   ├── search_service.py # Search with MMR implementation
    │   │   └── recommendation_service.py # n8n webhook integration
    │   └── venv/                # Python virtual environment
    │
    ├── frontend/                # React Frontend
    │   ├── index.html           # HTML entry point
    │   ├── index.tsx            # React DOM entry
    │   ├── App.tsx              # Main app component with routing
    │   ├── types.ts             # TypeScript interfaces
    │   ├── package.json         # Node.js dependencies
    │   ├── tsconfig.json        # TypeScript configuration
    │   ├── vite.config.ts       # Vite build configuration
    │   ├── components/          # React components
    │   │   ├── Header.tsx       # Navigation header
    │   │   ├── HeroBento.tsx    # Hero section with search
    │   │   ├── MobileDock.tsx   # Mobile navigation dock
    │   │   └── TradeOffEngine.tsx # Product comparison cards
    │   └── services/
    │       └── apiService.ts    # API client for backend communication
    │
    ├── Data_Pipeline/           # Data collection & processing
    │   ├── ScrapingV2.ipynb     # Best Buy API scraping notebook
    │   ├── qdrant_multimodal_ETL_search_pipeline.ipynb # ETL pipeline
    │   ├── qdrant_local_dataset.json     # Processed product data
    │   ├── qdrant_optimized_dataset.json # Optimized dataset
    │   ├── tech_gaming_dataset_10000.json # Gaming products dataset
    │   └── downloaded_images/   # Cached product images
    │
    ├── qdrant/                  # Qdrant setup scripts
    │   ├── schema_setup.py      # Collection schema definition
    │   └── ingest_data.py       # Data ingestion script
    │
    └── Images/                  # Project assets
        └── Untitled diagram-*.png # Architecture diagrams
```

---

## 📋 Prerequisites

Before running VondraLink, ensure you have:

- **Python** 3.10 or higher
- **Node.js** 18 or higher
- **npm** or **yarn**
- **Qdrant Cloud account** (or local Qdrant instance)
- **Git**

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/VondraLink.git
cd VondraLink
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd VondraLink/backend

# Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r ../../requirements.txt

# Additional backend dependencies
pip install fastapi uvicorn sentence-transformers qdrant-client Pillow requests
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Or with yarn
yarn install
```

---

## ▶️ Running the Application

### Start the Backend Server

```bash
# From VondraLink/VondraLink/backend directory
cd VondraLink/backend

# Activate virtual environment (if not already active)
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate

# Run FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at: `http://localhost:8000`

### Start the Frontend Development Server

```bash
# From VondraLink/VondraLink/frontend directory (in a new terminal)
cd VondraLink/frontend

# Run development server
npm run dev

# Or with yarn
yarn dev
```

The frontend will be available at: `http://localhost:3000`

### API Documentation

FastAPI provides automatic API documentation:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## 🔌 API Endpoints

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `GET` | `/` | Health check | - |
| `GET` | `/ping` | Ping-pong test | - |
| `POST` | `/search` | Search products | `{ query, mode, limit, use_mmr, lambda_, budget_limit }` |
| `POST` | `/recommendations` | Get personalized recommendations | `{ description }` |

### Search Request Example

```json
{
  "query": "wireless gaming headset",
  "mode": "text",
  "limit": 12,
  "use_mmr": true,
  "lambda_": 0.6,
  "budget_limit": 150.00
}
```

### Image Search (Base64)

```json
{
  "query": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "mode": "image",
  "limit": 10,
  "use_mmr": true
}
```

---

## 📊 Data Pipeline

The dataset is curated through a dedicated scraping and collection pipeline using the **Best Buy API**.

### Pipeline Steps

1. **Scrape**: Fetch data via Best Buy API
2. **Download**: Save product images locally for vector embedding generation
3. **Embed**: Convert images and text descriptions into high-dimensional vectors using CLIP
4. **Upsert**: Upload vectors and metadata (price, link) to Qdrant

### Data Format

```json
{
    "id": 1,
    "title": "Apple - iPhone 14 Pro 128GB - Space Black",
    "price": 999.99,
    "link": "https://api.bestbuy.com/click/-/6255530/pdp",
    "image": "https://pisces.bbystatic.com/...",
    "characteristics": "....",
    "image_local": "/content/downloaded_images/product_1.jpg"
}
```

### Running the Data Pipeline

Open and execute the Jupyter notebooks in order:

1. `Data_Pipeline/ScrapingV2.ipynb` - Scrape products from Best Buy
2. `Data_Pipeline/qdrant_multimodal_ETL_search_pipeline.ipynb` - Process and upload to Qdrant

---

## 📈 Evaluation Metrics

| Metric | Description |
|--------|-------------|
| **Accuracy** | Visual similarity of results in "Vibe Search" |
| **Budget Success** | Percentage of recommendations adhering to user financial constraints |
| **Speed** | Near real-time delivery (searching millions of items in <1 second) |

---

## 🔐 Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Qdrant Cloud Configuration
QDRANT_URL=https://your-cluster.cloud.qdrant.io:6333
QDRANT_API_KEY=your-api-key-here

# HuggingFace Token (for model downloads)
HF_TOKEN=hf_your_token_here

# n8n Webhook URL (for recommendations)
N8N_WEBHOOK_URL=https://your-n8n-instance/webhook/personality-to-product
```

> ⚠️ **Note**: The current codebase has hardcoded credentials in `qdrant_ops.py` and `embedding.py`. For production, move these to environment variables.

---

## 🐛 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| **CORS Error** | Ensure backend is running on port 8000 and frontend on port 3000 |
| **Model loading slow** | First run downloads CLIP model (~500MB). Subsequent runs are faster |
| **Qdrant connection failed** | Check QDRANT_URL and QDRANT_API_KEY are correct |
| **No search results** | Verify the collection `tech_products_fast` exists in Qdrant |
| **Port already in use** | Kill existing processes: `lsof -i :8000` or `netstat -ano \| findstr :8000` |

### Debug Mode

Enable debug logging by running uvicorn with:

```bash
uvicorn main:app --reload --log-level debug
```

---

## 📐 Architecture Diagram

<img src="./VondraLink/Images/Untitled diagram-2026-01-26-192024.png" alt="VondraLink Architecture" width="800">

---

## 📦 Dependencies

### Backend (Python)

| Package | Version | Purpose |
|---------|---------|---------|
| `fastapi` | Latest | Web framework |
| `uvicorn` | Latest | ASGI server |
| `sentence-transformers` | ≥2.2.0 | CLIP embeddings |
| `qdrant-client` | ≥1.9.0 | Vector database client |
| `Pillow` | ≥10.2.0 | Image processing |
| `requests` | ≥2.31.0 | HTTP client |
| `pandas` | ≥2.0.0 | Data manipulation |

### Frontend (Node.js)

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | 19.2.3 | UI framework |
| `react-dom` | 19.2.3 | React DOM rendering |
| `framer-motion` | 12.29.0 | Animations |
| `lucide-react` | 0.563.0 | Icons |
| `vite` | 6.2.0 | Build tool |
| `typescript` | 5.8.2 | Type safety |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Qdrant** for the amazing vector database
- **OpenAI CLIP** for multimodal embeddings
- **Best Buy** for product data API
- **n8n** for workflow automation

---

<p align="center">
  Made with ❤️ by the VondraLink Team
</p>