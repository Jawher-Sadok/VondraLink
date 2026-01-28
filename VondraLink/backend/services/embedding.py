from sentence_transformers import SentenceTransformer
from PIL import Image
import numpy as np
from typing import Union, List
import os
os.environ['HF_TOKEN'] = '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'

# Use the SAME model that was used to ingest data into Qdrant
print("loeading CLIP model for embeddings..." )
model = SentenceTransformer('clip-ViT-B-32')
print("CLIP model loaded successfully.")
def embed_text(text):
    """Encode text into a vector embedding using CLIP"""
    result = model.encode(text)
    print(f"🔍 DEBUG: Text embedding shape: {result.shape}, dimension: {len(result)}")
    return result

def embed_image(image_path):
    """Encode image into a vector embedding using CLIP"""
    image = Image.open(image_path).convert("RGB")
    result = model.encode(image)
    print(f"🔍 DEBUG: Image embedding shape: {result.shape}, dimension: {len(result)}")
    return result

def encode(query: Union[str, Image.Image], mode: str = "text") -> List[float]:
    """Main encoding function that returns a flat list of floats"""
    if mode == "text":
        vector = embed_text(query).flatten().tolist()
    else:
        vector = embed_image(query).flatten().tolist()
    print(f"🔍 DEBUG: Final vector length: {len(vector)}")
    return vector