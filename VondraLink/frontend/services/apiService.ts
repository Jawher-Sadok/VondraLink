import { TradeOffPair } from "../types";

const API_BASE_URL = "http://localhost:8000";

// Convert File to base64 string
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function searchProducts(
  query: string,
  budgetLimit?: number,
  imageFile?: File
): Promise<TradeOffPair[]> {
  try {
    let imageBase64: string | undefined;
    
    // Convert image File to base64 if provided
    if (imageFile) {
      imageBase64 = await fileToBase64(imageFile);
    }
    
    // Determine search mode based on whether image is provided
    const mode = imageBase64 ? "image" : "text";
    
    const requestBody = {
      query: imageBase64 || query,
      mode: mode,
      limit: 10,
      use_mmr: true,
      lambda: 0.6,
      budget_limit: budgetLimit
    };

    const response = await fetch(`${API_BASE_URL}/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const results = await response.json();
    
    // Transform backend results into TradeOffPair format
    return transformResults(results, budgetLimit);
  } catch (error) {
    console.error("API Error:", error);
    return [];
  }
}

function transformResults(
  backendResults: any[],
  budgetLimit?: number
): TradeOffPair[] {
  const pairs: TradeOffPair[] = [];

  // Group results into pairs (premium vs smart choice)
  for (let i = 0; i < backendResults.length - 1; i += 2) {
    const result1 = backendResults[i];
    const result2 = backendResults[i + 1];

    if (!result1 || !result2) continue;

    // Determine which is premium and which is smart based on price
    const price1 = parseFloat(result1.price.replace("$", ""));
    const price2 = parseFloat(result2.price.replace("$", ""));

    let premium, smart;
    if (price1 > price2) {
      premium = result1;
      smart = result2;
    } else {
      premium = result2;
      smart = result1;
    }

    // Apply budget filter if specified
    const smartPrice = parseFloat(smart.price.replace("$", ""));
    if (budgetLimit && smartPrice > budgetLimit) {
      continue;
    }

    const premiumPrice = parseFloat(premium.price.replace("$", ""));
    const savings = premiumPrice - smartPrice;

    pairs.push({
      premium: {
        id: `p-${i}`,
        name: premium.title || "Premium Product",
        brand: extractBrand(premium.title),
        price: premiumPrice,
        image: premium.link || "https://picsum.photos/400/300",
        url: premium.link || "#",
        rating: parseFloat(premium.score) * 5,
        description: `High-end option with premium features`,
        features: ["Premium Quality", "Latest Technology", "Brand Recognition"],
        specs: {
          quality: Math.round(parseFloat(premium.score) * 100),
          durability: 85,
          battery: 20,
        },
        tags: ["Premium", "High-End"],
        category: "Electronics",
      },
      smart: {
        id: `s-${i}`,
        name: smart.title || "Smart Choice",
        brand: extractBrand(smart.title),
        price: smartPrice,
        image: smart.link || "https://picsum.photos/400/300",
        url: smart.link || "#",
        rating: parseFloat(smart.score) * 5,
        description: `Value-focused alternative with comparable features`,
        features: ["Great Value", "Reliable Performance", "Smart Choice"],
        specs: {
          quality: Math.round(parseFloat(smart.score) * 100),
          durability: 90,
          battery: 40,
        },
        tags: ["Value", "Recommended"],
        category: "Electronics",
      },
      matchReason: `AI-matched alternative with ${Math.round(parseFloat(smart.score) * 100)}% relevance score. Similar specifications and features at a significantly lower price point.`,
      savings: Math.round(savings),
    });
  }

  return pairs;
}

function extractBrand(title: string): string {
  if (!title) return "Unknown";
  // Extract first word or first two words as brand
  const words = title.split(" ");
  return words.length > 1 ? words.slice(0, 2).join(" ") : words[0];
}
