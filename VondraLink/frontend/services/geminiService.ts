
import { GoogleGenAI, Type } from "@google/genai";
import { TradeOffPair } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export async function analyzeShoppingIntent(query: string, budgetLimit?: number, imageData?: string): Promise<TradeOffPair[]> {
  const model = 'gemini-3-flash-preview';
  
  const prompt = `
    Task: Act as an expert shopping consultant. 
    Context: The user is looking for high-value alternatives to premium lifestyle products.
    
    User Input: "${query}"
    ${budgetLimit ? `Maximum Budget: $${budgetLimit}` : ''}
    ${imageData ? 'Image provided: Use image features to identify the premium item.' : ''}

    Return a list of comparison pairs. Each pair must include:
    1. A "Premium" (Dream) product that represents the high-end version.
    2. A "Smart Link" product that is a significantly cheaper but high-quality substitute.
    3. The "Smart Link" should match key specs like battery life or screen quality if applicable.
    4. Provide a realistic URL for each (e.g., from major retailers like Amazon, BestBuy, or official sites).

    The "matchReason" should explain exactly why the smart version is a good substitute (e.g., "Same panel source", "Same sensor as last year's pro model").
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: imageData 
        ? [{ parts: [{ text: prompt }, { inlineData: { mimeType: 'image/jpeg', data: imageData.split(',')[1] } }] }]
        : prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              premium: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  brand: { type: Type.STRING },
                  price: { type: Type.NUMBER },
                  url: { type: Type.STRING },
                  description: { type: Type.STRING },
                  features: { type: Type.ARRAY, items: { type: Type.STRING } },
                  specs: {
                    type: Type.OBJECT,
                    properties: {
                      battery: { type: Type.NUMBER },
                      quality: { type: Type.NUMBER },
                      durability: { type: Type.NUMBER }
                    },
                    required: ['quality', 'durability']
                  }
                },
                required: ['name', 'brand', 'price', 'url', 'description', 'features', 'specs']
              },
              smart: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  brand: { type: Type.STRING },
                  price: { type: Type.NUMBER },
                  url: { type: Type.STRING },
                  description: { type: Type.STRING },
                  features: { type: Type.ARRAY, items: { type: Type.STRING } },
                  specs: {
                    type: Type.OBJECT,
                    properties: {
                      battery: { type: Type.NUMBER },
                      quality: { type: Type.NUMBER },
                      durability: { type: Type.NUMBER }
                    },
                    required: ['quality', 'durability']
                  }
                },
                required: ['name', 'brand', 'price', 'url', 'description', 'features', 'specs']
              },
              matchReason: { type: Type.STRING },
              savings: { type: Type.NUMBER }
            },
            required: ['premium', 'smart', 'matchReason', 'savings']
          }
        }
      }
    });

    const results = JSON.parse(response.text || "[]");
    return results.map((r: any, idx: number) => ({
      ...r,
      premium: { ...r.premium, id: `p-${idx}`, image: `https://picsum.photos/seed/prem-${idx}/400/300` },
      smart: { ...r.smart, id: `s-${idx}`, image: `https://picsum.photos/seed/smart-${idx}/400/300` }
    }));
  } catch (error) {
    console.error("Gemini Error:", error);
    return [];
  }
}
