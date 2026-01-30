# services/personalized_recommendation_service.py
"""
Personalized Recommendation Service
Integrates the curator logic to generate AI-powered personalized product recommendations
based on user profile (from questionnaire) and user activity history.
"""

import os
import re
import json
import numpy as np
from typing import Dict, List, Optional, Any
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Try to import LLM clients
try:
    from openai import OpenAI
    HAS_OPENAI = True
except ImportError:
    HAS_OPENAI = False

try:
    from groq import Groq
    HAS_GROQ = True
except ImportError:
    HAS_GROQ = False

from services.embedding import encode
from services.qdrant_ops import search


def cosine_sim(a, b):
    """Calculate cosine similarity between two vectors"""
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))


def mmr(query_vec, doc_vecs, k=5, lambda_=0.6):
    """
    Maximal Marginal Relevance for diversity.
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


def get_llm_client():
    """Get LLM client based on environment configuration"""
    provider = os.getenv("LLM_PROVIDER", "groq").lower()
    
    if provider == "groq" and HAS_GROQ:
        api_key = os.getenv("GROQ_API_KEY")
        if api_key:
            return Groq(api_key=api_key), "llama-3.3-70b-versatile"
    
    if HAS_OPENAI:
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            return OpenAI(api_key=api_key), "gpt-4-turbo"
    
    return None, None


def format_activity_summary(user_activity_data: Dict) -> str:
    """Format user activity data into a readable summary for the LLM"""
    summary = []
    
    if user_activity_data.get('search_history') or user_activity_data.get('recent_searches'):
        summary.append("Recent Searches:")
        searches = user_activity_data.get('search_history', user_activity_data.get('recent_searches', []))
        for search_item in searches[:5]:
            if isinstance(search_item, dict):
                summary.append(f"  - '{search_item.get('query', '')}' (Budget: ${search_item.get('budget', 0)})")
            else:
                summary.append(f"  - '{search_item}'")
    
    if user_activity_data.get('viewed_products') or user_activity_data.get('recent_products'):
        summary.append("\nRecently Viewed Products:")
        products = user_activity_data.get('viewed_products', user_activity_data.get('recent_products', []))
        for view in products[:10]:
            if isinstance(view, dict):
                summary.append(f"  - {view.get('name', 'Unknown')} ({view.get('brand', '')}) - {view.get('price', '$0')}")
    
    if user_activity_data.get('product_interactions') or user_activity_data.get('top_products'):
        summary.append("\nMost Engaged Products:")
        interactions = user_activity_data.get('product_interactions', {})
        top_products = user_activity_data.get('top_products', [])
        
        if isinstance(interactions, dict):
            sorted_interactions = sorted(
                interactions.items(),
                key=lambda x: x[1],
                reverse=True
            )
            for product, count in sorted_interactions[:5]:
                summary.append(f"  - {product} (viewed {count} times)")
        elif top_products:
            for item in top_products[:5]:
                summary.append(f"  - {item.get('name', 'Unknown')} (viewed {item.get('interaction_count', 0)} times)")
    
    return "\n".join(summary) if summary else "No recent activity"


def clean_json_response(response_text: str) -> Dict:
    """Parse JSON from LLM response, handling markdown code blocks"""
    try:
        return json.loads(response_text)
    except json.JSONDecodeError:
        json_match = re.search(r'```json\s*(.*?)\s*```', response_text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group(1))
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group(0))
        return {"search_plan": []}


def generate_search_plan(user_profile: Dict, user_activity_data: Dict) -> Dict:
    """
    Use LLM to generate a search plan based on user profile and activity.
    Returns a list of search strategies.
    """
    client, model_name = get_llm_client()
    
    if client is None:
        # Fallback: create basic search plan without LLM
        return generate_fallback_search_plan(user_profile, user_activity_data)
    
    # Extract profile information
    tier = user_profile.get('derived_richness_tier', 'Standard')
    archetype = user_profile.get('lifestyle', {}).get('archetype', user_profile.get('mode', 'General'))
    vibe = user_profile.get('lifestyle', {}).get('vibe', user_profile.get('aesthetic', 'Neutral'))
    hobbies = user_profile.get('lifestyle', {}).get('hobbies', [])
    
    activity_summary = format_activity_summary(user_activity_data)
    
    system_prompt = """
    You are an Expert AI Curator. Your goal is to discover "Hidden Gems".

    ### THE STRATEGY PLAYBOOK
    Generate exactly 5 distinct search strategies. The system will pull 3 products per strategy to create a 15-item feed.
    
    PILLARS:
    1. 🏆 "Aesthetic Match": Visual vibe match.
    2. 🧩 "The Missing Piece": Accessories for main items.
    3. 🃏 "Wildcard": Unexpected but relevant.
    4. 🌐 "Ecosystem Expansion": Brand compatibility.
    5. 🚀 "Direct Upgrade": Spec comparison.

    ### CRITICAL RULES
    1. "strict_must_include": Use concrete nouns ONLY (e.g., "blender", "pan"). No adjectives.
    2. "price_role":
       - "accessory": Target 20-50% of avg view price.
       - "upgrade": Target 110%+ 
       - "similar": Target same range.

    ### OUTPUT JSON FORMAT
    {
      "search_plan": [
        {
          "strategy": "Strategy Name",
          "search_query": "Detailed vector search query",
          "reasoning": "Why this fits",
          "strict_must_include": ["noun1"],
          "price_role": "accessory"
        }
      ]
    }
    """
    
    user_message = f"""
    ### USER PROFILE
    - Tier: {tier}
    - Archetype: {archetype}
    - Vibe: {vibe}
    - Hobbies: {', '.join(hobbies) if hobbies else 'Not specified'}
    
    ### HISTORY
    {activity_summary}
    """

    try:
        completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            model=model_name,
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        
        return clean_json_response(completion.choices[0].message.content)
    except Exception as e:
        print(f"LLM Error: {e}")
        return generate_fallback_search_plan(user_profile, user_activity_data)


def generate_fallback_search_plan(user_profile: Dict, user_activity_data: Dict) -> Dict:
    """
    Generate a basic search plan without LLM based on user profile.
    """
    archetype = user_profile.get('lifestyle', {}).get('archetype', user_profile.get('mode', 'General'))
    vibe = user_profile.get('lifestyle', {}).get('vibe', user_profile.get('aesthetic', 'Neutral'))
    hobbies = user_profile.get('lifestyle', {}).get('hobbies', [])
    
    # Map archetypes to search queries
    archetype_queries = {
        "The Creator": ["creative tools camera", "art supplies", "design equipment"],
        "The Optimizer": ["productivity gadgets", "ergonomic accessories", "office tech"],
        "The Nester": ["home decor", "kitchen appliances", "comfort items"],
        "The Explorer": ["travel gear", "outdoor equipment", "portable tech"],
        "Digital Nomad / Tech Enthusiast": ["portable tech", "travel accessories", "wireless gadgets"],
    }
    
    vibe_queries = {
        "Minimalist": ["minimal design", "clean aesthetic", "simple"],
        "Industrial": ["industrial style", "raw materials", "leather"],
        "Retro": ["vintage style", "retro design", "classic"],
        "Cyber": ["RGB lighting", "gaming setup", "futuristic"],
        "Matte Black, Industrial, Ultra-Portable": ["matte black", "portable", "industrial design"],
    }
    
    search_plan = []
    
    # Add archetype-based searches
    queries = archetype_queries.get(archetype, ["trending products"])
    for i, query in enumerate(queries[:2]):
        search_plan.append({
            "strategy": f"Based on {archetype}",
            "search_query": query,
            "reasoning": f"Matches your {archetype} lifestyle",
            "strict_must_include": [],
            "price_role": "similar"
        })
    
    # Add vibe-based searches
    vibe_searches = vibe_queries.get(vibe, ["popular products"])
    for query in vibe_searches[:2]:
        search_plan.append({
            "strategy": f"Aesthetic: {vibe}",
            "search_query": query,
            "reasoning": f"Matches your {vibe} aesthetic preference",
            "strict_must_include": [],
            "price_role": "similar"
        })
    
    # Add hobby-based search
    if hobbies:
        search_plan.append({
            "strategy": "Hobby Match",
            "search_query": " ".join(hobbies[:2]),
            "reasoning": f"Based on your interests: {', '.join(hobbies)}",
            "strict_must_include": [],
            "price_role": "similar"
        })
    
    return {"search_plan": search_plan[:5]}


def execute_search_plan(plan: Dict, user_avg_price: float = 100.0) -> List[Dict]:
    """
    Execute the search plan against Qdrant and return matched products.
    """
    final_results = []
    baseline_price = max(user_avg_price, 50.0)
    seen_products = set()
    
    ITEMS_PER_STRATEGY = 3
    
    for item in plan.get('search_plan', []):
        query_text = item.get('search_query', '')
        strategy = item.get('strategy', 'General')
        
        if not query_text:
            continue
        
        must_include = [w.lower() for w in item.get('strict_must_include', [])]
        price_role = item.get('price_role', 'similar')
        
        # Price ranges based on role
        min_price = 0.0
        max_price = 100000.0
        if price_role == 'upgrade':
            min_price = baseline_price * 1.1
        elif price_role == 'accessory':
            max_price = baseline_price * 0.9
        
        # Encode query and search
        try:
            vector = encode(query_text, "text")
            search_results = search(vector, limit=60, with_vectors=True)
            hits = search_results.points
        except Exception as e:
            print(f"Search error: {e}")
            continue
        
        if not hits:
            continue
        
        # Apply MMR for diversity
        if len(hits) > 5:
            doc_vectors = [p.vector for p in hits]
            query_vec_np = np.array(vector)
            selected_idxs = mmr(query_vec_np, doc_vectors, k=25, lambda_=0.6)
            hits = [hits[i] for i in selected_idxs]
        
        # Match logic with filling
        strategy_matches = []
        
        def add_valid_matches(candidate_hits, strict_keywords=True, strict_price=True):
            for hit in candidate_hits:
                if len(strategy_matches) >= ITEMS_PER_STRATEGY:
                    break
                
                product = hit.payload
                pid = product.get('link') or product.get('title')
                if pid in seen_products:
                    continue
                
                # Price check
                if strict_price:
                    try:
                        p_str = str(product.get('price', '0')).replace('$', '').replace(',', '')
                        price_val = float(p_str)
                    except (ValueError, TypeError):
                        price_val = 0
                    if price_val < min_price or (max_price < 10000 and price_val > max_price):
                        continue
                
                # Keyword check
                if strict_keywords and must_include:
                    title = product.get('title', '').lower()
                    if not any(k in title for k in must_include):
                        continue
                
                strategy_matches.append({
                    "strategy": strategy,
                    "reasoning": item.get('reasoning', ''),
                    "match_type": "Strict" if strict_keywords and strict_price else "Similar Vibe",
                    "product": {
                        "title": product.get('title', 'Unknown Product'),
                        "price": product.get('price', '0'),
                        "image": product.get('image_online', ''),
                        "link": product.get('link', ''),
                        "score": f"{hit.score:.4f}"
                    }
                })
                seen_products.add(pid)
        
        # Waterfall fill
        add_valid_matches(hits, strict_keywords=True, strict_price=True)
        if len(strategy_matches) < ITEMS_PER_STRATEGY:
            add_valid_matches(hits, strict_keywords=False, strict_price=True)
        if len(strategy_matches) < ITEMS_PER_STRATEGY:
            add_valid_matches(hits, strict_keywords=False, strict_price=False)
        
        final_results.extend(strategy_matches)
    
    return final_results


def calculate_avg_price(user_activity_data: Dict) -> float:
    """Calculate average price from user's viewed products"""
    total_price = 0
    count = 0
    
    products = user_activity_data.get('viewed_products', user_activity_data.get('recent_products', []))
    
    for view in products:
        if isinstance(view, dict):
            p_str = str(view.get('price', '0')).replace('$', '').replace(',', '')
            try:
                val = float(p_str)
                if val > 0:
                    total_price += val
                    count += 1
            except (ValueError, TypeError):
                pass
    
    return (total_price / count) if count > 0 else 100.0


def get_personalized_recommendations(user_profile: Dict, user_activity_data: Optional[Dict] = None) -> List[Dict]:
    """
    Main function to get personalized recommendations.
    
    Args:
        user_profile: User profile from questionnaire (demographics, lifestyle, etc.)
        user_activity_data: Optional user activity data (searches, viewed products)
    
    Returns:
        List of recommended products with strategy info
    """
    if user_activity_data is None:
        user_activity_data = {}
    
    # Calculate average price from activity
    avg_price = calculate_avg_price(user_activity_data)
    
    # Generate search plan
    plan = generate_search_plan(user_profile, user_activity_data)
    
    # Execute search plan
    recommendations = execute_search_plan(plan, user_avg_price=avg_price)
    
    return recommendations
