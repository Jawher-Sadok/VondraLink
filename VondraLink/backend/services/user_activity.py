"""
User Activity Tracking Service
Stores search queries and viewed products for each user session
"""

from typing import List, Dict, Optional
from datetime import datetime
from collections import defaultdict, deque

class UserActivityCache:
    """
    In-memory cache for user activities including:
    - Search queries
    - Viewed products
    - Search timestamps
    """
    
    def __init__(self, max_history_per_user: int = 100):
        """
        Initialize the activity cache
        
        Args:
            max_history_per_user: Maximum number of items to store per user
        """
        self.max_history = max_history_per_user
        
        # Store search queries: {user_id: deque([{query, timestamp, mode}, ...])}
        self.search_history: Dict[str, deque] = defaultdict(lambda: deque(maxlen=self.max_history))
        
        # Store viewed products: {user_id: deque([{product_name, price, timestamp}, ...])}
        self.viewed_products: Dict[str, deque] = defaultdict(lambda: deque(maxlen=self.max_history))
        
        # Store product interactions: {user_id: {product_name: count}}
        self.product_interactions: Dict[str, Dict[str, int]] = defaultdict(lambda: defaultdict(int))
    
    def add_search_query(self, user_id: str, query: str, mode: str = "text", budget: Optional[float] = None):
        """
        Add a search query to user's history
        
        Args:
            user_id: Unique identifier for the user
            query: The search query string
            mode: Search mode (text, image, etc.)
            budget: Optional budget limit
        """
        search_entry = {
            "query": query,
            "mode": mode,
            "budget": budget,
            "timestamp": datetime.now().isoformat()
        }
        self.search_history[user_id].append(search_entry)
        print(f"📝 Added search for user {user_id}: '{query}'")
    
    def add_viewed_products(self, user_id: str, products: List[Dict]):
        """
        Add viewed products to user's history
        
        Args:
            user_id: Unique identifier for the user
            products: List of product dictionaries with name, price, etc.
        """
        timestamp = datetime.now().isoformat()
        
        for product in products:
            product_name = product.get("name", "Unknown Product")
            
            # Add to viewed products history
            view_entry = {
                "name": product_name,
                "brand": product.get("brand"),
                "price": product.get("price"),
                "timestamp": timestamp
            }
            self.viewed_products[user_id].append(view_entry)
            
            # Increment interaction count
            self.product_interactions[user_id][product_name] += 1
        
        print(f"👁️ Added {len(products)} viewed products for user {user_id}")
    
    def get_search_history(self, user_id: str, limit: Optional[int] = None) -> List[Dict]:
        """
        Get user's search history
        
        Args:
            user_id: Unique identifier for the user
            limit: Maximum number of results to return
            
        Returns:
            List of search history entries
        """
        history = list(self.search_history[user_id])
        if limit:
            history = history[-limit:]
        return history
    
    def get_viewed_products(self, user_id: str, limit: Optional[int] = None) -> List[Dict]:
        """
        Get user's viewed products
        
        Args:
            user_id: Unique identifier for the user
            limit: Maximum number of results to return
            
        Returns:
            List of viewed product entries
        """
        viewed = list(self.viewed_products[user_id])
        if limit:
            viewed = viewed[-limit:]
        return viewed
    
    def get_top_products(self, user_id: str, limit: int = 10) -> List[Dict]:
        """
        Get user's most viewed/interacted products
        
        Args:
            user_id: Unique identifier for the user
            limit: Maximum number of products to return
            
        Returns:
            List of top products sorted by interaction count
        """
        interactions = self.product_interactions[user_id]
        sorted_products = sorted(
            interactions.items(),
            key=lambda x: x[1],
            reverse=True
        )[:limit]
        
        return [
            {"name": name, "interaction_count": count}
            for name, count in sorted_products
        ]
    
    def get_recent_searches(self, user_id: str, limit: int = 5) -> List[str]:
        """
        Get user's recent search queries (strings only)
        
        Args:
            user_id: Unique identifier for the user
            limit: Maximum number of queries to return
            
        Returns:
            List of recent search query strings
        """
        history = self.get_search_history(user_id, limit)
        return [entry["query"] for entry in history]
    
    def get_user_context(self, user_id: str) -> Dict:
        """
        Get complete user context for recommendations
        
        Args:
            user_id: Unique identifier for the user
            
        Returns:
            Dictionary with search history, viewed products, and top products
        """
        return {
            "recent_searches": self.get_recent_searches(user_id, limit=10),
            "recent_products": self.get_viewed_products(user_id, limit=20),
            "top_products": self.get_top_products(user_id, limit=10),
            "total_searches": len(self.search_history[user_id]),
            "total_views": len(self.viewed_products[user_id])
        }
    
    def clear_user_data(self, user_id: str):
        """
        Clear all data for a specific user
        
        Args:
            user_id: Unique identifier for the user
        """
        if user_id in self.search_history:
            del self.search_history[user_id]
        if user_id in self.viewed_products:
            del self.viewed_products[user_id]
        if user_id in self.product_interactions:
            del self.product_interactions[user_id]
        print(f"🗑️ Cleared all data for user {user_id}")


# Global singleton instance
activity_cache = UserActivityCache(max_history_per_user=100)
