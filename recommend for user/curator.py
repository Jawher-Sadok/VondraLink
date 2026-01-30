import sys
import json
import os
import re
import numpy as np
from datetime import datetime
from dotenv import load_dotenv
from openai import OpenAI
from groq import Groq
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient, models

# --- CONFIGURATION ---
script_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(script_dir, '.env')
load_dotenv(dotenv_path=env_path, override=True)

# 1. Connect to Qdrant
url = os.getenv("QDRANT_URL")
api_key = os.getenv("QDRANT_API_KEY")

# 2. Load CLIP Model
# (Kept purely for initialization; stderr output removed for cleanliness)
encoder = SentenceTransformer(os.getenv("CLIP_MODEL_NAME", "sentence-transformers/clip-ViT-B-32"))

# 3. Setup LLM Client
def get_llm_client():
    provider = os.getenv("LLM_PROVIDER", "openai").lower()
    if provider == "groq":
        return Groq(api_key=os.getenv("GROQ_API_KEY")), "llama-3.3-70b-versatile"
    else:
        return OpenAI(api_key=os.getenv("OPENAI_API_KEY")), "gpt-4-turbo"

try:
    qdrant_client = QdrantClient(url=url, api_key=api_key)
except Exception as e:
    # Critical error, must print
    print(f"Error connecting to Qdrant: {e}", file=sys.stderr)
    sys.exit(1)

# --- HELPER FUNCTIONS ---

def cosine_sim(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

def mmr(query_vec, doc_vecs, k=5, lambda_=0.6):
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

def format_activity_summary(user_activity_data):
    summary = []
    if user_activity_data.get('search_history'):
        summary.append("Recent Searches:")
        for search in user_activity_data['search_history'][:5]:
            summary.append(f"  - '{search.get('query', '')}' (Budget: ${search.get('budget', 0)})")
    
    if user_activity_data.get('viewed_products'):
        summary.append("\nRecently Viewed Products:")
        for view in user_activity_data['viewed_products'][:10]:
            summary.append(f"  - {view.get('name', 'Unknown')} ({view.get('brand', '')}) - {view.get('price', '$0')}")
            
    if user_activity_data.get('product_interactions'):
        summary.append("\nMost Engaged Products:")
        sorted_interactions = sorted(
            user_activity_data['product_interactions'].items(), 
            key=lambda x: x[1], 
            reverse=True
        )
        for product, count in sorted_interactions[:5]:
            summary.append(f"  - {product} (viewed {count} times)")
    
    return "\n".join(summary) if summary else "No recent activity"

def clean_json_response(response_text):
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

def generate_search_plan(user_profile, user_activity_data):
    client, model_name = get_llm_client()
    
    tier = user_profile.get('derived_richness_tier', 'Standard')
    archetype = user_profile.get('lifestyle', {}).get('archetype', 'General')
    vibe = user_profile.get('lifestyle', {}).get('vibe', 'Neutral')
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
    
    ### HISTORY
    {activity_summary}
    """

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

# --- THE EXECUTION ENGINE (15 PRODUCTS / MIXED PILLARS) ---
def execute_search_plan(plan, user_avg_price=0.0):
    final_results = []
    collection_name = os.getenv("QDRANT_COLLECTION", "lifestyle_products")
    baseline_price = max(user_avg_price, 50.0)
    seen_products = set()

    # Target: 5 Strategies * 3 Items = 15 Total Items
    ITEMS_PER_STRATEGY = 3

    for item in plan['search_plan']:
        query_text = item['search_query']
        strategy = item['strategy']
        
        must_include = [w.lower() for w in item.get('strict_must_include', [])]
        price_role = item.get('price_role', 'similar')
        
        # 1. Price Ranges
        min_price = 0.0
        max_price = 100000.0
        if price_role == 'upgrade':
            min_price = baseline_price * 1.1
        elif price_role == 'accessory':
            max_price = baseline_price * 0.9
        
        # 2. Vector Search
        vector = encoder.encode(query_text).tolist()
        try:
            hits = qdrant_client.query_points(
                collection_name=collection_name,
                query=vector,
                limit=60, # Fetch more to ensure diversity
                with_payload=True,
                with_vectors=True 
            ).points
        except Exception:
            continue
        
        if len(hits) > 5:
            doc_vectors = [np.array(p.vector) for p in hits]
            query_vec_np = np.array(vector)
            selected_idxs = mmr(query_vec_np, doc_vectors, k=25, lambda_=0.6)
            hits = [hits[i] for i in selected_idxs]

        # 3. Match Logic with Filling
        strategy_matches = []
        
        def add_valid_matches(candidate_hits, strict_keywords=True, strict_price=True):
            count_added = 0
            for hit in candidate_hits:
                if len(strategy_matches) >= ITEMS_PER_STRATEGY: break
                
                product = hit.payload
                pid = product.get('link') or product.get('title')
                if pid in seen_products: continue

                # Price Check
                if strict_price:
                    try:
                        p_str = str(product.get('price', '0')).replace('$', '').replace(',', '')
                        price_val = float(p_str)
                    except: price_val = 0
                    if price_val < min_price or (max_price < 10000 and price_val > max_price):
                        continue

                # Keyword Check
                if strict_keywords and must_include:
                    title = product.get('title', '').lower()
                    if not any(k in title for k in must_include):
                        continue 
                
                strategy_matches.append({
                    "strategy": strategy,
                    "reasoning": item.get('reasoning', ''),
                    "product_match": product,
                    "match_type": "Strict" if strict_keywords and strict_price else "Similar Vibe"
                })
                seen_products.add(pid)
                count_added += 1
            return count_added

        # --- THE WATERFALL FILL ---
        # 1. Try Strict
        add_valid_matches(hits, strict_keywords=True, strict_price=True)
        
        # 2. If needed, Relax Keywords (Keep Price)
        if len(strategy_matches) < ITEMS_PER_STRATEGY:
            add_valid_matches(hits, strict_keywords=False, strict_price=True)
            
        # 3. If needed, Relax Price (Hail Mary)
        if len(strategy_matches) < ITEMS_PER_STRATEGY:
             add_valid_matches(hits, strict_keywords=False, strict_price=False)

        final_results.extend(strategy_matches)

    return final_results

# --- MAIN EXECUTION (TEST CASE 2: THE TECH NOMAD) ---
if __name__ == "__main__":
    # NEW PROFILE: High-end Tech Traveler
    user_profile_data = {
      "user_id": "nomad_alex_2024",
      "derived_richness_tier": "Luxury",
      "lifestyle": {
        "archetype": "Digital Nomad / Tech Enthusiast",
        "vibe": "Matte Black, Industrial, Ultra-Portable", 
      }
    }

    # NEW HISTORY: Expensive headphones and travel gear
    user_activity_data = {
        "search_history": [
            {"query": "best noise cancelling headphones for flight", "budget": 400.0},
            {"query": "compact mechanical keyboard", "budget": 150.0},
        ],
        "viewed_products": [
            {"name": "Sony WH-1000XM5 Wireless Headphones", "brand": "Sony", "price": "$398.00"},
            {"name": "Peak Design Travel Backpack 45L", "brand": "Peak Design", "price": "$299.95"},
        ],
        "product_interactions": {
            "Sony WH-1000XM5": 12, 
            "Peak Design Backpack": 4
        }
    }

    # Calculate Avg Price
    total_price = 0
    count = 0
    for view in user_activity_data.get('viewed_products', []):
        p_str = str(view.get('price', '0')).replace('$', '').replace(',', '')
        try:
            val = float(p_str)
            if val > 0:
                total_price += val
                count += 1
        except: pass
    
    avg_user_price = (total_price / count) if count > 0 else 100.0
    # print(f"DEBUG: User Average Price: ${avg_user_price:.2f}", file=sys.stderr)

    # Execute
    plan = generate_search_plan(user_profile_data, user_activity_data)
    feed = execute_search_plan(plan, user_avg_price=avg_user_price)
    
    # Final JSON Output
    print(json.dumps(feed, indent=2))