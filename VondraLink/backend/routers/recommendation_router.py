# router/recommendation_router.py
from fastapi import APIRouter
from pydantic import BaseModel
from services.recommendation_service import get_product_recommendations

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

class DescriptionRequest(BaseModel):
    description: str

@router.post("/")
def recommend(req: DescriptionRequest):
    return get_product_recommendations(req.description)
