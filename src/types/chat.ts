export interface ChatMessage {
  id: string;
  author: string;
  text: string;
  time: string;
  ts?: number;
  badge?: string;
  badgeColor?: string;
  isVip?: boolean;
  isMod?: boolean;
  isBot?: boolean;
  isAutoBot?: boolean;
  color?: string;
  donation?: {
    amount: number;
    currency: string;
    service: 'yoomoney' | 'sber' | 'tbank' | 'donationalerts' | 'cloudtips';
    status: 'paid' | 'pending';
    targetWallet?: string;
    channelLabel?: string;
  };
}
