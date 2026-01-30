from qdrant_client import QdrantClient, models
from typing import List
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Qdrant Cloud Configuration from environment variables
QDRANT_URL = os.getenv('QDRANT_URL', 'http://localhost:6333')
QDRANT_API_KEY = os.getenv('QDRANT_API_KEY')
COLLECTION_NAME = os.getenv('QDRANT_COLLECTION_NAME', 'tech_products_fast')

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