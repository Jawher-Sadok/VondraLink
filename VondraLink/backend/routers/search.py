from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from services.search_service import fast_search

router = APIRouter()

class SearchRequest(BaseModel):
    query: str
    mode: str = "text"
    limit: int = 5
    use_mmr: bool = True
    lambda_: float = 0.6
    budget_limit: Optional[float] = None

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
    
    # Apply budget filter if specified
    if data.budget_limit:
        filtered_results = []
        for result in results:
            try:
                price = float(result["price"].replace("$", ""))
                if price <= data.budget_limit:
                    filtered_results.append(result)
            except (ValueError, AttributeError):
                # If price parsing fails, include the result
                filtered_results.append(result)
        results = filtered_results
    
    return results