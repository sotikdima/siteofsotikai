export type DeviceViewMode = 'desktop' | 'laptop' | 'mobile';

export type DonationServiceId =
  | 'yoomoney'
  | 'sber'
  | 'tbank'
  | 'vtb'
  | 'donationalerts'
  | 'donatestream'
  | 'cloudtips';

export interface DonationServiceInfo {
  id: DonationServiceId;
  name: string;
  category: 'wallet' | 'bank' | 'streamer';
  badge: string;
  icon: string;
  color: string;
  description: string;
  recipientAccount: string;
  actionUrl?: string;
  instruction: string;
  isTemporarilyHidden?: boolean;
  hidden?: boolean;
  quickAmounts?: number[];
}

export interface DmitryTransfer {
  id: string;
  senderName: string;
  isAnonymous: boolean;
  amount: number;
  message?: string;
  timestamp: string;
  status: 'completed' | 'pending';
}

export interface DmitryProfile {
  name: string;
  nickname: string;
  username?: string;
  team: string;
  region: string;
  bio: string;
  description?: string;
  story: string;
  avatarUrl: string;
  coverUrl: string;
  yoomoneyWallet: string;
  sbpPhone: string;
  sberCard: string;
  tbankCard: string;
  vtbCard: string;
  donationAlertsUrl: string;
  donateStreamUrl: string;
  cloudTipsUrl: string;
  quickAmounts: number[];
}
