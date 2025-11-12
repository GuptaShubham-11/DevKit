export interface Badge {
  _id: string;
  name: string;
  description: string;
  badgeImage: string;
  criteria: {
    type: string;
    condition: string;
    value: number;
    timeframe?: string;
    additionalConditions?: any;
  };
  pointsRequired: number;
  rarityLevel: 'common' | 'rare' | 'epic' | 'legendary';
  rewardData: {
    xpBonus?: number;
    profileBadge?: boolean;
    specialPrivileges?: string[];
  };
  isActive: boolean;
  category:
    | 'general'
    | 'creator'
    | 'community'
    | 'usage'
    | 'milestone'
    | 'special'
    | 'seasonal'
    | 'achievement';
  createdAt: string;
  updatedAt: string;
}
