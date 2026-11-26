export interface AuctionBidRecord {
  id: string;
  bidder: string;
  amount: number;
  time: string;
  car?: string;
}

export interface AuctionLot {
  id: string;
  title: string;
  description: string;
  category: 'car' | 'race' | 'tune' | 'track' | 'special';
  categoryLabel: string;
  currentBid: number;
  startBid: number;
  minStep: number;
  bidsCount: number;
  leaderName: string;
  selectedCar?: string;
  timeLeftSeconds: number;
  endsAt?: number;
  imageUrl: string;
  status: 'active' | 'ending_soon' | 'completed';
  featured?: boolean;
  bidsHistory: AuctionBidRecord[];
}

export type PortalSite = 'portal' | 'site' | 'donations' | 'auctions';
