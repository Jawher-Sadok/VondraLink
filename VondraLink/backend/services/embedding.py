from sentence_transformers import SentenceTransformer
from PIL import Image
import numpy as np
from typing import Union, List
import os
import io
import base64
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

def embed_image(image_input):
    """Encode image into a vector embedding using CLIP
    
    Args:
        image_input: Can be a file path string, base64 string, or PIL Image
    """
    # Handle base64 encoded image
    if isinstance(image_input, str):
        if image_input.startswith('data:image'):
            # Remove data URI prefix
            base64_data = image_input.split(',')[1]
            image_bytes = base64.b64decode(base64_data)
            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        else:
            # Assume it's a file path
            image = Image.open(image_input).convert("RGB")
    elif isinstance(image_input, Image.Image):
        image = image_input.convert("RGB")
    else:
        raise ValueError(f"Unsupported image input type: {type(image_input)}")
    
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