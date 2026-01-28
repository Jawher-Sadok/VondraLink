
export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  url: string;
  rating: number;
  description: string;
  features: string[];
  specs: {
    battery?: number;
    quality: number;
    durability: number;
  };
  tags: string[];
  category: string;
}

export interface TradeOffPair {
  premium: Product;
  smart: Product;
  matchReason: string;
  savings: number;
}

export interface SearchState {
  query: string;
  budgetLimit?: number;
  isSearching: boolean;
  imageInput?: string | File;
  results: TradeOffPair[];
}
