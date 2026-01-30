import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Heart, Clock, ExternalLink } from 'lucide-react';
import { 
  getPersonalizedRecommendations, 
  transformPersonalizedRecommendations,
  PersonalizedRecommendation 
} from '../services/apiService';

interface Product {
  id: string;
  name: string;
  brand?: string;
  price: string | number;
  image?: string;
  description?: string;
  score?: number;
  url?: string;
  features?: string[];
  tags?: string[];
}

interface HomePageProps {
  userProfile?: any; // The JSON payload from questionnaire
  recommendedProducts?: Product[];
  userId?: string;
}

const HomePage: React.FC<HomePageProps> = ({ userProfile, recommendedProducts = [], userId }) => {
  const [products, setProducts] = useState<Product[]>(recommendedProducts);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get userId from localStorage if not provided
  const effectiveUserId = userId || localStorage.getItem("vondralink_user_id") || "anonymous";

  // Fetch personalized recommendations when component mounts or profile changes
  useEffect(() => {
    const fetchRecommendations = async () => {
      // Only fetch if we have a user profile with some data
      if (!userProfile || Object.keys(userProfile).filter(k => k !== 'fullName').length === 0) {
        console.log("No user profile data, using placeholder products");
        setProducts(placeholderProducts);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Transform form state to the expected profile format
        const transformedProfile = transformFormStateToProfile(userProfile);
        
        const response = await getPersonalizedRecommendations(
          effectiveUserId,
          transformedProfile,
          true // Include user activity
        );

        if (response && response.recommendations && response.recommendations.length > 0) {
          // Transform recommendations to product format
          const transformedProducts = transformPersonalizedRecommendations(response.recommendations);
          setProducts(transformedProducts as Product[]);
          console.log(`✅ Loaded ${transformedProducts.length} personalized recommendations`);
        } else {
          console.log("No recommendations returned, using placeholders");
          setProducts(placeholderProducts);
        }
      } catch (err) {
        console.error("Failed to fetch recommendations:", err);
        setError("Failed to load recommendations. Showing sample products.");
        setProducts(placeholderProducts);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [userProfile, effectiveUserId]);

  // Transform form state from questionnaire to profile format expected by API
  const transformFormStateToProfile = (formState: any) => {
    return {
      demographics: {
        gender: mapStyleFocusToGender(formState.styleFocus),
        generation: mapEraToGeneration(formState.era),
      },
      wealth_signals: {
        shopping_philosophy: mapPhilosophy(formState.philosophy),
        treat_preference: mapTreat(formState.treat),
      },
      derived_richness_tier: determineTier(formState.treat, formState.philosophy),
      lifestyle: {
        archetype: mapMode(formState.mode),
        vibe: mapAesthetic(formState.aesthetic),
        hobbies: mapSundayToHobbies(formState.sunday),
      },
      // Pass raw form values as well for fallback
      mode: formState.mode,
      aesthetic: formState.aesthetic,
      philosophy: formState.philosophy,
      treat: formState.treat,
    };
  };

  // Mapping functions (same as in App.tsx)
  const mapStyleFocusToGender = (val: string) => {
    switch (val) {
      case "masculine": return "Male";
      case "feminine": return "Female";
      case "neutral":
      case "mixed": return "Non-binary";
      default: return "Unknown";
    }
  };

  const mapEraToGeneration = (val: string) => {
    switch (val) {
      case "genz": return "Gen Z";
      case "millennial": return "Millennial";
      case "genx": return "Gen X";
      default: return "Unknown";
    }
  };

  const mapPhilosophy = (val: string) => {
    switch (val) {
      case "value": return "The Value Hunter";
      case "researcher": return "The Researcher";
      case "bifl": return "Buy It For Life";
      case "enthusiast": return "The Enthusiast";
      default: return "Unknown";
    }
  };

  const mapTreat = (val: string) => {
    switch (val) {
      case "small": return "Small & Sweet";
      case "upgrade": return "The Solid Upgrade";
      case "splurge": return "The Big Splurge";
      default: return "Unknown";
    }
  };

  const mapMode = (val: string) => {
    switch (val) {
      case "creator": return "The Creator";
      case "optimizer": return "The Optimizer";
      case "nester": return "The Nester";
      case "explorer": return "The Explorer";
      default: return "Unknown";
    }
  };

  const mapAesthetic = (val: string) => {
    switch (val) {
      case "minimalist": return "Minimalist";
      case "industrial": return "Industrial";
      case "retro": return "Retro";
      case "cyber": return "Cyber";
      default: return "Unknown";
    }
  };

  const mapSundayToHobbies = (val: string) => {
    switch (val) {
      case "focus": return ["Coding", "Writing"];
      case "grind": return ["Gaming", "Hardware"];
      case "recharge": return ["Yoga", "Meditation"];
      case "out": return ["Hiking", "Cycling"];
      case "hosting": return ["Cooking", "Mixology"];
      default: return [];
    }
  };

  const determineTier = (treat: string, philosophy: string) => {
    if (treat === "splurge" || philosophy === "enthusiast") return "Luxury";
    if (treat === "upgrade" || philosophy === "bifl") return "Premium";
    return "Standard";
  };

  // Placeholder data - shown when no recommendations are available
  const placeholderProducts: Product[] = [
    {
      id: '1',
      name: 'Herman Miller Aeron Chair',
      brand: 'Herman Miller',
      price: '$1,445.00',
      description: 'Ergonomic office chair with PostureFit support',
      score: 0.95
    },
    {
      id: '2',
      name: 'LG 27" UltraGear Gaming Monitor',
      brand: 'LG',
      price: '$399.99',
      description: '240Hz refresh rate, 1ms response time',
      score: 0.92
    },
    {
      id: '3',
      name: 'Keychron Q1 Pro Mechanical Keyboard',
      brand: 'Keychron',
      price: '$189.00',
      description: 'Wireless mechanical keyboard with hot-swappable switches',
      score: 0.89
    },
    {
      id: '4',
      name: 'Logitech MX Master 3S',
      brand: 'Logitech',
      price: '$99.99',
      description: 'Wireless ergonomic mouse for productivity',
      score: 0.87
    },
  ];

  const categories = [
    { id: 'for-you', label: 'For You', icon: <Sparkles size={16} /> },
    { id: 'trending', label: 'Trending', icon: <TrendingUp size={16} /> },
    { id: 'saved', label: 'Saved', icon: <Heart size={16} /> },
    { id: 'recent', label: 'Recent', icon: <Clock size={16} /> },
  ];

  const [activeCategory, setActiveCategory] = useState('for-you');

  // Format price for display
  const formatPrice = (price: string | number): string => {
    if (typeof price === 'number') {
      return `$${price.toFixed(2)}`;
    }
    if (typeof price === 'string' && !price.startsWith('$')) {
      return `$${price}`;
    }
    return price;
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pt-32 pb-12">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-teal to-coral bg-clip-text text-transparent">
          Welcome Back{userProfile?.fullName ? `, ${userProfile.fullName}` : ''}
        </h1>
        <p className="text-gray-400 text-sm">
          {isLoading 
            ? "Finding personalized recommendations for you..." 
            : error 
              ? error 
              : `${products.length} personalized recommendations based on your profile`}
        </p>
      </motion.div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeCategory === cat.id
                ? 'bg-teal/10 text-teal border border-teal/30'
                : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
            }`}
          >
            {cat.icon}
            {cat.label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center py-24">
          <div className="w-16 h-16 border-t-2 border-teal rounded-full animate-spin mb-4" />
          <p className="text-sm text-gray-400">Finding personalized recommendations...</p>
        </div>
      )}

      {/* Products Grid */}
      {!isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {products.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx * 0.05, 0.5) }}
              className="group glass rounded-2xl p-4 border border-white/10 hover:border-teal/30 transition-all cursor-pointer relative"
              onClick={() => {
                if (product.url && product.url !== '#') {
                  window.open(product.url, '_blank', 'noopener,noreferrer');
                }
              }}
            >
              {/* Strategy Tag */}
              {product.tags && product.tags[0] && (
                <div className="absolute top-2 right-2 px-2 py-1 bg-teal/20 rounded-lg">
                  <span className="text-[10px] text-teal font-semibold uppercase tracking-wide">
                    {product.tags[0]}
                  </span>
                </div>
              )}

              {/* Product Image */}
              <div className="w-full aspect-square bg-white/5 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                {product.image && product.image.trim() !== '' && product.image !== 'https://picsum.photos/400/300' ? (
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="text-6xl opacity-20">📦</div>';
                    }}
                  />
                ) : (
                  <div className="text-6xl opacity-20">📦</div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-2">
                {product.brand && (
                  <p className="text-[10px] uppercase tracking-wider text-teal font-semibold">
                    {product.brand}
                  </p>
                )}
                <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-teal transition-colors">
                  {product.name}
                </h3>
                {product.description && (
                  <p className="text-xs text-gray-400 line-clamp-2">
                    {product.description}
                  </p>
                )}
                <div className="flex items-center justify-between pt-2">
                  <p className="text-lg font-bold text-white">{formatPrice(product.price)}</p>
                  <div className="flex items-center gap-2">
                    {product.score && (
                      <div className="flex items-center gap-1 text-xs text-teal">
                        <Sparkles size={12} />
                        <span>{Math.round(product.score * 100)}%</span>
                      </div>
                    )}
                    {product.url && product.url !== '#' && (
                      <ExternalLink size={14} className="text-gray-500 group-hover:text-teal transition-colors" />
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Empty State */}
      {!isLoading && products.length === 0 && (
        <div className="text-center py-24">
          <Sparkles size={48} className="mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400 mb-2">No recommendations yet</p>
          <p className="text-sm text-gray-500">Complete your profile to get personalized suggestions</p>
        </div>
      )}
    </div>
  );
};

export default HomePage;
