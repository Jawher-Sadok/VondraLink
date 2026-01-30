import { Product } from "../types";
// Transform a single recommendation item to Product type
export function recommendationToProduct(item: any): Product {
  return {
    id: item.id?.toString() || item.url || item.link || Math.random().toString(36).slice(2),
    name: item.title || item.name || "Recommended Product",
    brand: item.brand || "Unknown",
    price: typeof item.price === "number" ? item.price : parsePrice(item.price || "0"),
    image: item.image || "https://picsum.photos/400/300",
    url: item.url || item.link || "#",
    rating: typeof item.rating === "number" ? item.rating : parseFloat(item.rating || "0"),
    description: item.description || "Recommended for you.",
    features: item.features || ["Recommended"],
    specs: {
      quality: item.quality || 80,
      durability: item.durability || 80,
      battery: item.battery,
    },
    tags: item.tags || ["Recommended"],
    category: item.category || "General",
    savings: item.savings || 0,
  };
}
// =====================
// Recommendations Transformation
// =====================

export interface RecommendationItem {
  title: string;
  url?: string;
  description?: string;
  score?: number;
  [key: string]: any;
}

// Extract a short title from the pageContent (first product name)
function extractTitleFromContent(content: string): string {
  if (!content) return "Recommended Product";
  // Try to get the product name from the beginning (usually "Brand - Product Name")
  const firstLine = content.split('.')[0];
  if (firstLine && firstLine.length < 150) {
    return firstLine.trim();
  }
  // Fallback: first 100 characters
  return content.substring(0, 100).trim() + "...";
}

export function transformRecommendations(raw: any): RecommendationItem[] {
  // Handle the actual API format: array of { document: { pageContent, metadata }, score }
  if (Array.isArray(raw)) {
    return raw.map((item: any) => {
      // Check if it's the document structure from the API
      if (item.document) {
        return {
          title: extractTitleFromContent(item.document.pageContent),
          url: item.document.metadata, // metadata contains the URL
          description: item.document.pageContent,
          score: item.score,
        };
      }
      // Fallback for other formats
      return {
        title: item.title || item.name || "Untitled",
        url: item.url || item.link || item.metadata,
        description: item.description || item.pageContent,
        ...item,
      };
    });
  }

  // If the API returns { items: [...] }
  if (raw && Array.isArray(raw.items)) {
    return transformRecommendations(raw.items);
  }

  // Fallback: wrap as single item
  if (raw && typeof raw === "object") {
    if (raw.document) {
      return [{
        title: extractTitleFromContent(raw.document.pageContent),
        url: raw.document.metadata,
        description: raw.document.pageContent,
        score: raw.score,
      }];
    }
    return [{
      title: raw.title || raw.name || "Untitled",
      url: raw.url || raw.link,
      ...raw,
    }];
  }
  return [];
}
import { TradeOffPair } from "../types";

const API_BASE_URL = "http://localhost:8000";

// =====================
// Utils
// =====================

// Convert File to base64 string
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Parse prices like "$1,299.99"
function parsePrice(priceStr: string): number {
  try {
    return parseFloat(priceStr.replace("$", "").replace(/,/g, "").trim());
  } catch {
    return 0;
  }
}

// Budget remaining helper
function budgetLeft(price: number, budget?: number): number | null {
  if (!budget) return null;
  return Math.max(0, Math.round(budget - price));
}

// Extract simple brand
function extractBrand(title: string): string {
  if (!title) return "Unknown";
  const words = title.split(" ");
  return words.length > 1 ? words.slice(0, 2).join(" ") : words[0];
}

// =====================
// API Call
// =====================

export async function searchProducts(
  query: string,
  budgetLimit?: number,
  imageFile?: File,
): Promise<TradeOffPair[]> {
  try {
    let imageBase64: string | undefined;

    if (imageFile) {
      imageBase64 = await fileToBase64(imageFile);
    }

    const requestBody = {
      query: imageBase64 || query,
      mode: imageBase64 ? "image" : "text",
      limit: 12,
      use_mmr: true,
      lambda: 0.6,
      budget_limit: budgetLimit,
    };

    const response = await fetch(`${API_BASE_URL}/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const results = await response.json();
    return transformResults(results, budgetLimit);
  } catch (error) {
    console.error("❌ API Error:", error);
    return [];
  }
}

export async function getRecommendations(payload: any): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/recommendations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("❌ Recommendations API Error:", error);
    return null;
  }
}

// =====================
// Result Transformation
// =====================

function transformResults(
  backendResults: any[],
  budgetLimit?: number,
): TradeOffPair[] {
  const pairs: TradeOffPair[] = [];

  if (!backendResults || backendResults.length < 2) {
    console.warn("⚠️ Not enough results to create pairs");
    return pairs;
  }

  // Pair sequentially (backend ranking already matters)
  for (let i = 0; i < backendResults.length - 1; i += 2) {
    const a = backendResults[i];
    const b = backendResults[i + 1];


    if (!a || !b) continue;

    const priceA = parsePrice(a.price || "0");
    const priceB = parsePrice(b.price || "0");

    if (!priceA || !priceB) continue;

    // Premium = higher price, Smart = lower price
    const premium = priceA >= priceB ? a : b;
    const smart = priceA >= priceB ? b : a;

    const premiumPrice = parsePrice(premium.price);
    const smartPrice = parsePrice(smart.price);

    const premiumBudgetLeft = budgetLeft(premiumPrice, budgetLimit);
    const smartBudgetLeft = budgetLeft(smartPrice, budgetLimit);

    const savings = Math.round(premiumPrice - smartPrice);

    pairs.push({
      premium: {
        id: `p-${i}`,
        name: premium.title || "Premium Product",
        brand: extractBrand(premium.title),
        price: premiumPrice,
        image: premium.image || "https://picsum.photos/400/300",
        url: premium.link || "#",
        rating: parseFloat(premium.score || "0") * 5,
        description:
          premiumBudgetLeft !== null
            ? `Premium option. Leaves ${premiumBudgetLeft}$ from your budget.`
            : "Premium option with high-end features.",
        features: ["Premium Quality", "Advanced Features"],
        specs: {
          quality: Math.round(parseFloat(premium.score || "0") * 100),
          durability: 85,
          battery: 25,
        },
        tags: ["Premium"],
        category: "Electronics",
        savings: savings,
      },

      smart: {
        id: `-${i}`,
        name: smart.title || "Smart Choice",
        brand: extractBrand(smart.title),
        price: smartPrice,
        image: smart.image || "https://picsum.photos/400/300",
        url: smart.link || "#",
        rating: parseFloat(smart.score || "0") * 5,
        description:
          smartBudgetLeft !== null
            ? `Best value. Leaves ${smartBudgetLeft}$ from your budget.`
            : "Best value option.",
        features: ["Great Value", "Reliable Performance"],
        specs: {
          quality: Math.round(parseFloat(smart.score || "0") * 100),
          durability: 90,
          battery: 40,
        },
        tags: ["Best Value"],
        category: "Electronics",
        savings: savings,
      },

      matchReason:
        "Both products match your request. The smart option maximizes remaining budget while keeping similar relevance.",
      savings: premiumPrice - smartPrice,
    });
  }

  console.log(`✅ Built ${pairs.length} honest trade-off pairs`);
  return pairs;
}