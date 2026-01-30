from qdrant_client import QdrantClient, models
from typing import List

# Qdrant Cloud Configuration
QDRANT_URL = "https://656ff6c0-88ba-4b7c-ab69-0b1f23796f3f.europe-west3-0.gcp.cloud.qdrant.io:6333"
QDRANT_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.ID2ng5RvxLCAHYjxpl5Icea3v8mCL3q4TH-_O73LeUU"
COLLECTION_NAME = "tech_products_fast"

client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)

def search(vector: List[float], limit: int = 5, with_vectors: bool = False):
    """
    Search using query_points (modern Qdrant method)
    
    Args:
        vector: query vector embedding
        limit: number of results to fetch
        with_vectors: whether to return vectors (needed for MMR)
    """
    results = client.query_points(
        collection_name=COLLECTION_NAME,
        query=vector,
        limit=limit,
        with_vectors=with_vectors,
        with_payload=True,
    )
    return results