export interface Badge {
  _id: string;
  name: string;
  description: string;
  badgeImage: string;
  criteria: {
    type:
      | 'templatesCreated'
      | 'copiesReceived'
      | 'commandsGenerated'
      | 'likesReceived'
      | 'communityHelper';
    condition: 'gte' | 'lte' | 'eq' | 'between';
    value: number;
    timeframe?: 'allTime' | '30Days' | '7Days' | '1Day';
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
