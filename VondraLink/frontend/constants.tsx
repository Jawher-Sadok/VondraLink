
import { TradeOffPair } from './types';

export const MOCK_PRODUCTS: TradeOffPair[] = [
  {
    premium: {
      id: 'p1',
      name: 'Vision Pro Max',
      brand: 'Luminal',
      price: 3499,
      image: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&q=80&w=400',
      url: 'https://www.apple.com/apple-vision-pro/',
      rating: 4.9,
      description: 'The pinnacle of spatial computing.',
      features: ['Dual 4K displays', 'Eye tracking', 'M2 Chip'],
      specs: { battery: 20, quality: 98, durability: 85 },
      tags: ['Premium', 'New'],
      category: 'Electronics'
    },
    smart: {
      id: 's1',
      name: 'Horizon S2',
      brand: 'Vondra',
      price: 599,
      image: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&q=80&w=400',
      url: 'https://www.meta.com/quest/quest-3/',
      rating: 4.7,
      description: 'High-performance VR with mobile freedom.',
      features: ['2K resolution', 'Gesture control', 'Snapdragon XR2'],
      specs: { battery: 40, quality: 82, durability: 90 },
      tags: ['Value', 'Trending'],
      category: 'Electronics'
    },
    matchReason: 'Shares the same OLED panel manufacturing source as the Pro model, delivering 90% visual clarity for 1/5th the price.',
    savings: 2900
  }
];
