from PIL import Image
from typing import Union, List, Dict
import numpy as np
from services.embedding import encode
from services.qdrant_ops import search

def cosine_sim(a, b):
    """Calculate cosine similarity between two vectors"""
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

def mmr(query_vec, doc_vecs, k=5, lambda_=0.7):
    """
    Maximal Marginal Relevance (MMR) for diversified results.
    lambda_ controls trade-off: 1.0 = pure relevance, 0.0 = pure diversity
    """
    selected = []
    candidates = list(range(len(doc_vecs)))
    query_sims = [cosine_sim(query_vec, v) for v in doc_vecs]

    while len(selected) < k and candidates:
        scores = []
        for i in candidates:
            diversity = 0 if not selected else max(
                cosine_sim(doc_vecs[i], doc_vecs[j]) for j in selected
            )
            score = lambda_ * query_sims[i] - (1 - lambda_) * diversity
            scores.append((score, i))

        best = max(scores, key=lambda x: x[0])[1]
        selected.append(best)
        candidates.remove(best)

    return selected

def fast_search(
    query_data: Union[str, Image.Image],
    mode: str = "text",
    limit: int = 5,
    use_mmr: bool = True,
    lambda_: float = 0.7
) -> List[Dict]:
    """
    Perform vector search on Qdrant using CLIP embeddings with optional MMR.
    
    Args:
        query_data: string (text) or PIL Image object
        mode: "text" or "image"
        limit: number of results to return
        use_mmr: whether to apply MMR for diversity
        lambda_: MMR trade-off parameter (0.7 = more relevance, 0.5 = balanced)
    """

    # 1️⃣ Encode query using CLIP
    query_vector = encode(query_data, mode)

    # 2️⃣ Search in Qdrant (fetch more if using MMR)
    fetch_limit = 50 if use_mmr else limit * 2
    search_results = search(query_vector, fetch_limit, with_vectors=use_mmr)

    points = search_results.points
    
    if not points:
        return []

    # 3️⃣ Smart filtering with fallback
    # Try to get high-quality results, but fallback if not enough
    high_quality = [p for p in points if p.score >= 0.5]  # High threshold
    medium_quality = [p for p in points if p.score >= 0.3]  # Medium threshold
    
    # Use best available quality tier
    if len(high_quality) >= limit:
        points = high_quality
        print(f"✅ Using high-quality results (score >= 0.5)")
    elif len(medium_quality) >= limit:
        points = medium_quality
        print(f"⚠️ Using medium-quality results (score >= 0.3)")
    else:
        # Use all results, but warn if scores are too low
        min_score = min(p.score for p in points)
        print(f"⚠️ Using all available results (min score: {min_score:.3f})")

    # 4️⃣ Apply MMR for diversity if enabled
    if use_mmr and len(points) > limit:
        doc_vectors = [p.vector for p in points]
        selected_idxs = mmr(query_vector, doc_vectors, k=limit, lambda_=lambda_)
        points = [points[i] for i in selected_idxs]
    else:
        points = points[:limit]

    # 5️⃣ Format results (frontend-friendly)
    results = []
    for res in points:
        results.append({
            "score": f"{res.score:.4f}",
            "title": res.payload.get("title"),
            "price": f"${res.payload.get('price')}",
            "image": res.payload.get("image_online"), 
            "link": res.payload.get("link"), 
        })

    return results