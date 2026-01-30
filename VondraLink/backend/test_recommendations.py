"""
Quick Test Script for Personalized Recommendations
Run this to verify the backend is working before testing the full UI
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from services.personalized_recommendation_service import (
    get_personalized_recommendations,
    generate_search_plan,
    generate_fallback_search_plan
)

# Test user profile (same format as questionnaire output)
test_profile = {
    "demographics": {
        "gender": "Male",
        "generation": "Millennial"
    },
    "wealth_signals": {
        "shopping_philosophy": "The Researcher",
        "treat_preference": "The Solid Upgrade"
    },
    "derived_richness_tier": "Premium",
    "lifestyle": {
        "archetype": "The Optimizer",
        "vibe": "Minimalist",
        "hobbies": ["Coding", "Writing"],
    }
}

# Test user activity (optional)
test_activity = {
    "recent_searches": [
        {"query": "ergonomic keyboard", "budget": 200},
        {"query": "standing desk", "budget": 500}
    ],
    "viewed_products": [
        {
            "name": "Herman Miller Aeron Chair",
            "brand": "Herman Miller",
            "price": "$1,445.00"
        },
        {
            "name": "Keychron Q1 Keyboard",
            "brand": "Keychron",
            "price": "$189.00"
        }
    ]
}

def test_fallback_mode():
    """Test without LLM (fallback mode)"""
    print("\n" + "="*60)
    print("TEST 1: Fallback Mode (No LLM)")
    print("="*60)
    
    plan = generate_fallback_search_plan(test_profile, test_activity)
    
    print(f"\n✅ Generated {len(plan['search_plan'])} search strategies:")
    for i, strategy in enumerate(plan['search_plan'], 1):
        print(f"\n{i}. {strategy['strategy']}")
        print(f"   Query: {strategy['search_query']}")
        print(f"   Reasoning: {strategy['reasoning']}")
        print(f"   Price Role: {strategy['price_role']}")

def test_llm_mode():
    """Test with LLM (requires API keys)"""
    print("\n" + "="*60)
    print("TEST 2: LLM Mode (Requires API Keys)")
    print("="*60)
    
    try:
        plan = generate_search_plan(test_profile, test_activity)
        
        if plan.get('search_plan'):
            print(f"\n✅ LLM generated {len(plan['search_plan'])} strategies:")
            for i, strategy in enumerate(plan['search_plan'], 1):
                print(f"\n{i}. {strategy['strategy']}")
                print(f"   Query: {strategy['search_query']}")
                print(f"   Reasoning: {strategy['reasoning']}")
                print(f"   Must Include: {strategy.get('strict_must_include', [])}")
                print(f"   Price Role: {strategy['price_role']}")
        else:
            print("⚠️ LLM unavailable - fell back to basic mode")
            
    except Exception as e:
        print(f"❌ LLM Error: {e}")
        print("   This is expected if API keys are not configured")

def test_full_recommendations():
    """Test full recommendation flow (requires Qdrant)"""
    print("\n" + "="*60)
    print("TEST 3: Full Recommendation Flow (Requires Qdrant)")
    print("="*60)
    
    try:
        recommendations = get_personalized_recommendations(
            user_profile=test_profile,
            user_activity_data=test_activity
        )
        
        print(f"\n✅ Generated {len(recommendations)} recommendations:")
        
        # Group by strategy
        by_strategy = {}
        for rec in recommendations:
            strategy = rec['strategy']
            if strategy not in by_strategy:
                by_strategy[strategy] = []
            by_strategy[strategy].append(rec)
        
        for strategy, recs in by_strategy.items():
            print(f"\n📦 {strategy} ({len(recs)} products):")
            for rec in recs:
                product = rec['product']
                print(f"   • {product['title']}")
                print(f"     Price: {product['price']} | Score: {product['score']}")
                print(f"     Match: {rec['match_type']}")
                
    except Exception as e:
        print(f"❌ Error: {e}")
        print("   Make sure:")
        print("   1. .env file exists with QDRANT_URL and QDRANT_API_KEY")
        print("   2. Qdrant collection has data")

if __name__ == "__main__":
    print("\n🧪 Testing Personalized Recommendation Service")
    print("="*60)
    
    # Test 1: Fallback mode (always works)
    test_fallback_mode()
    
    # Test 2: LLM mode (requires API keys)
    test_llm_mode()
    
    # Test 3: Full flow (requires Qdrant + data)
    test_full_recommendations()
    
    print("\n" + "="*60)
    print("✅ Testing Complete!")
    print("="*60)
    print("\nNext Steps:")
    print("1. If LLM test failed: Add GROQ_API_KEY or OPENAI_API_KEY to .env")
    print("2. If Qdrant test failed: Check QDRANT_URL and QDRANT_API_KEY")
    print("3. If all pass: Start the frontend and test the full flow!")
    print("\n")
