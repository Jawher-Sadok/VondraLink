# services/recommendation_service.py
import requests
from fastapi import HTTPException

def get_product_recommendations(description: str):
    webhook_url = "https://jawhersadok01.app.n8n.cloud/webhook/personality-to-product"
    payload = {"description": description}

    try:
        response = requests.post(webhook_url, json=payload)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Webhook request failed: {e}")
