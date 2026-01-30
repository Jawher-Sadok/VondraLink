from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from services.search_service import fast_search
from services.recommendation_service import get_product_recommendations


router = APIRouter()

class SearchRequest(BaseModel):
    query: str
    mode: str = "text"
    limit: int = 50
    use_mmr: bool = True
    lambda_: float = 0.6
    budget_limit: Optional[float] = None
    
class DescriptionRequest(BaseModel):
    description: str

def parse_price(price_str: str) -> Optional[float]:
    """
    Parse price string safely.
    Handles formats: "$100", "$1,299.99", "100", etc.
    Returns None if parsing fails.
    """
    if not price_str or price_str == "Price on request":
        return None
    
    try:
        # Remove $ and commas, convert to float
        cleaned = str(price_str).replace("$", "").replace(",", "").strip()
        return float(cleaned)
    except (ValueError, AttributeError):
        return None



    
@router.post("/search")
def search(data: SearchRequest):
    """Search endpoint with MMR support and budget filtering"""
    print(f"Received search request: query='{data.query}', mode={data.mode}, budget={data.budget_limit}")
    
    results = fast_search(
        query_data=data.query,
        mode=data.mode,
        limit=data.limit,
        use_mmr=data.use_mmr,
        lambda_=data.lambda_
    )
    
    # Apply budget range filter if specified [50% - 100% of budget]
    if data.budget_limit:
        min_budget = data.budget_limit * 0.5  # 50% of budget limit
        max_budget = data.budget_limit         # 100% of budget limit
        filtered_results = []
        
        for result in results:
            # Parse price safely (handles commas and $ signs)
            price = parse_price(result.get("price", ""))
            
            if price is None:
                print(f"⚠️ Skipping result with invalid price: {result.get('price')}")
                continue
            
            # Check if price is in budget range
            if min_budget <= price <= max_budget:
                filtered_results.append(result)
        
        results = filtered_results
        print(f"Budget filter applied: ${min_budget:.2f} - ${max_budget:.2f}, {len(results)} results after filtering")
    
    return results

@router.post("/recommendations")
def recommend(req: DescriptionRequest):
    return get_product_recommendations(req.description)