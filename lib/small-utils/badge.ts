import { Step } from '@/components/StepIndicator';
import {
  Activity,
  BarChart3,
  BetweenVerticalEnd,
  Calendar,
  Circle,
  Clock,
  Command,
  Copy,
  CreativeCommons,
  Crown,
  Gem,
  Hourglass,
  Infinity,
  LayoutTemplate,
  Medal,
  Milestone,
  Star,
  Target,
  ThumbsUp,
  TrendingUp,
  Trophy,
  UserRoundPlusIcon,
  Users,
  Watch,
} from 'lucide-react';
import { ColorBasedOnKeyword, SelectItem } from '@/types/small-types/badge';
import { Query } from '@/store/badge';
import { FilterGroup } from '@/types/small-types/searchBar';

export const steps: Step[] = [
  {
    id: 1,
    title: 'Basic Info',
    icon: 'Info',
  },
  {
    id: 2,
    title: 'Configuration',
    icon: 'Setting',
  },
  {
    id: 3,
    title: 'Rewards',
    icon: 'Gift',
  },
];

export const categoryOptions: SelectItem = [
  {
    value: 'creator',
    label: 'Creator',
    icon: UserRoundPlusIcon,
  },
  {
    value: 'usage',
    label: 'Usage',
    icon: Activity,
  },
  {
    value: 'milestone',
    label: 'Milestone',
    icon: Milestone,
  },
  {
    value: 'special',
    label: 'Special',
    icon: Star,
  },
  {
    value: 'community',
    label: 'Community',
    icon: Users,
  },
  {
    value: 'seasonal',
    label: 'Seasonal',
    icon: Calendar,
  },
  {
    value: 'achievement',
    label: 'Achievement',
    icon: Medal,
  },
];

export const conditionOptions: SelectItem = [
  {
    value: 'lte',
    label: 'At most',
    icon: BarChart3,
  },
  {
    value: 'gte',
    label: 'At least',
    icon: TrendingUp,
  },
  {
    value: 'eq',
    label: 'Exactly',
    icon: Target,
  },
  {
    value: 'between',
    label: 'Between',
    icon: BetweenVerticalEnd,
  },
];

export const timeframeOptions: SelectItem = [
  {
    value: 'allTime',
    label: 'All Time',
    icon: Infinity,
  },
  {
    value: '30Days',
    label: '30 Days',
    icon: Clock,
  },
  {
    value: '7Days',
    label: '1 Week',
    icon: Watch,
  },
  {
    value: '1Day',
    label: '24 Hours',
    icon: Hourglass,
  },
];

export const rarityOptions: SelectItem = [
  {
    value: 'common',
    label: 'Common',
    icon: Circle,
  },
  {
    value: 'rare',
    label: 'Rare',
    icon: Gem,
  },
  {
    value: 'epic',
    label: 'Epic',
    icon: Trophy,
  },
  {
    value: 'legendary',
    label: 'Legendary',
    icon: Crown,
  },
];

export const rarityColor = (rarity: string): ColorBasedOnKeyword => {
  switch (rarity) {
    case 'common':
      return {
        bg: 'bg-[#6b7280]/10',
        color: '#6b7280',
        text: 'text-[#6b7280]',
      };
    case 'rare':
      return {
        bg: 'bg-[#FED8B1]/10',
        color: '#FED8B1',
        text: 'text-[#FED8B1]',
      };
    case 'epic':
      return {
        bg: 'bg-[#007FFF]/10',
        color: '#007FFF',
        text: 'text-[#007FFF]',
      };
    case 'legendary':
      return {
        bg: 'bg-[#f59e0b]/10',
        color: '#f59e0b',
        text: 'text-[#f59e0b]',
      };
    default:
      return {
        bg: 'bg-gray-400/10',
        color: '#6b7280',
        text: 'text-gray-400',
      };
  }
};

export const timeframeColor = (timeframe: string): ColorBasedOnKeyword => {
  switch (timeframe) {
    case 'allTime':
      return {
        bg: 'bg-[#DDD06A]/10',
        text: 'text-[#DDD06A]',
        color: '#DDD06A',
      };
    case '30Days':
      return {
        bg: 'bg-[#D99058]/10',
        text: 'text-[#D99058]',
        color: '#D99058',
      };
    case '7Days':
      return {
        bg: 'bg-[#F5F5DC]/10',
        text: 'text-[#F5F5DC]',
        color: '#F5F5DC',
      };
    case '1Day':
      return {
        bg: 'bg-[#2E8B57]/10',
        text: 'text-[#2E8B57]',
        color: '#2E8B57',
      };
    default:
      return {
        bg: 'bg-gray-400/10',
        text: 'text-gray-400',
        color: '#6b7280',
      };
  }
};

export const criteriaColor = (criteria: string): ColorBasedOnKeyword => {
  switch (criteria) {
    case 'templatesCreated':
      return {
        bg: 'bg-[#DFFFFD]/10',
        color: '#DFFFFD',
        text: 'text-[#DFFFFD]',
      };
    case 'copiesReceived':
      return {
        bg: 'bg-[#AA98A9]/10',
        color: '#AA98A9',
        text: 'text-[#AA98A9]',
      };
    case 'commandsGenerated':
      return {
        bg: 'bg-[#f59e0b]/10',
        color: '#f59e0b',
        text: 'text-[#f59e0b]',
      };
    case 'likesReceived':
      return {
        bg: 'bg-[#FED8B1]/10',
        color: '#FED8B1',
        text: 'text-[#FED8B1]',
      };
    case 'communityHelper':
      return {
        bg: 'bg-[#E52B50]/10',
        color: '#E52B50',
        text: 'text-[#E52B50]',
      };
    default:
      return {
        bg: 'bg-gray-400/10',
        color: '#6b7280',
        text: 'text-gray-400',
      };
  }
};

export const conditionColor = (condition: string): ColorBasedOnKeyword => {
  switch (condition) {
    case 'gte':
      return {
        bg: 'bg-[#007BA7]/10',
        color: '#007BA7',
        text: 'text-[#007BA7]',
      };
    case 'lte':
      return {
        bg: 'bg-[#006D6F]/10',
        color: '#006D6F',
        text: 'text-[#006D6F]',
      };
    case 'eq':
      return {
        bg: 'bg-[#AB274F]/10',
        color: '#AB274F',
        text: 'text-[#AB274F]',
      };
    case 'between':
      return {
        bg: 'bg-[#F4C2C2]/10',
        color: '#F4C2C2',
        text: 'text-[#F4C2C2]',
      };
    default:
      return {
        bg: 'bg-gray-400/10',
        color: '#6b7280',
        text: 'text-gray-400',
      };
  }
};

export const categoryColor = (category: string): ColorBasedOnKeyword => {
  switch (category) {
    case 'creator':
      return {
        bg: 'bg-sky-400/10',
        text: 'text-sky-400',
      };
    case 'community':
      return {
        bg: 'bg-blue-400/10',
        text: 'text-blue-400',
      };
    case 'usage':
      return {
        bg: 'bg-purple-400/10',
        text: 'text-purple-400',
      };
    case 'milestone':
      return {
        bg: 'bg-pink-400/10',
        text: 'text-pink-400',
      };
    case 'special':
      return {
        bg: 'bg-red-400/10',
        text: 'text-red-400',
      };
    case 'seasonal':
      return {
        bg: 'bg-yellow-400/10',
        text: 'text-yellow-400',
      };
    default:
      return {
        bg: 'bg-gray-400/10',
        text: 'text-gray-400',
      };
  }
};

export const criteriaTypeOptions: SelectItem = [
  {
    value: 'templatesCreated',
    label: 'Templates',
    icon: LayoutTemplate,
  },
  {
    value: 'copiesReceived',
    label: 'Copies',
    icon: Copy,
  },
  {
    value: 'commandsGenerated',
    label: 'Commands',
    icon: Command,
  },
  {
    value: 'likesReceived',
    label: 'Likes',
    icon: ThumbsUp,
  },
  {
    value: 'communityHelper',
    label: 'Community',
    icon: Users,
  },
];

export const rarityConfig: Record<string, any> = {
  common: {
    color: 'text-gray-600',
    bg: 'bg-surface-primary',
    border: 'border-gray-300',
    points: { min: 0, max: 300 },
    xp: { min: 10, max: 100 },
    icon: CreativeCommons,
  },
  rare: {
    color: 'text-blue-600',
    bg: 'bg-blue-100',
    border: 'border-blue-300',
    points: { min: 301, max: 800 },
    xp: { min: 101, max: 250 },
    icon: Star,
  },
  epic: {
    color: 'text-purple-600',
    bg: 'bg-purple-100',
    border: 'border-purple-300',
    points: { min: 801, max: 4000 },
    xp: { min: 251, max: 500 },
    icon: Gem,
  },
  legendary: {
    color: 'text-yellow-600',
    bg: 'bg-yellow-100',
    border: 'border-yellow-300',
    points: { min: 4001, max: 10000 },
    xp: { min: 501, max: 1000 },
    icon: Crown,
  },
};

export const conditionToSymbol = (condition: string) => {
  const conditions: Record<string, string> = {
    gte: '+',
    lte: '<',
    eq: '',
    between: '-',
  };
  return conditions[condition] || '';
};

export const defaultQueryConvertIntoStringPair = (query: Query) => {
  const stringQuery = {} as Record<string, string | string[]>;
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      stringQuery[key] = String(value);
    }
  });
  return stringQuery;
};

export const sortColor = (sort: string): ColorBasedOnKeyword => {
  switch (sort) {
    case 'name':
      return {
        bg: 'bg-[#14B8B6]/10',
        color: '#14B8B6',
        text: 'text-[#14B8B6]',
      };
    case 'createdAt':
      return {
        bg: 'bg-[#6366F1]/10',
        color: '#6366F1',
        text: 'text-[#6366F1]',
      };
    case 'rarity':
      return {
        bg: 'bg-[#F97316]/10',
        color: '#F97316',
        text: 'text-[#F97316]',
      };
    case 'category':
      return {
        bg: 'bg-[#10B981]/10',
        color: '#10B981',
        text: 'text-[#10B981]',
      };
    case 'earnedBy':
      return {
        bg: 'bg-[#EC4899]/10',
        color: '#EC4899',
        text: 'text-[#EC4899]',
      };
    default:
      return {
        bg: 'bg-[#64748B]/10',
        color: '#64748B',
        text: 'text-[#64748B]',
      };
  }
};

export const orderColor = (order: string): ColorBasedOnKeyword => {
  switch (order) {
    case 'asc':
      return {
        bg: 'bg-[#22C55E]/10',
        color: '#22C55E',
        text: 'text-[#22C55E]',
      };
    case 'desc':
      return {
        bg: 'bg-[#EF4444]/10',
        color: '#EF4444',
        text: 'text-[#EF4444]',
      };
    default:
      return {
        bg: 'bg-[#94A3B8]/10',
        color: '#94A3B8',
        text: 'text-[#94A3B8]',
      };
  }
};

export const inactiveColor = (value: string): ColorBasedOnKeyword => {
  if (value === 'true') {
    return {
      bg: 'bg-[#8B5CF6]/10',
      color: '#8B5CF6',
      text: 'text-[#8B5CF6]',
    };
  }
  return {
    bg: 'bg-[#0EA5E9]/10',
    color: '#0EA5E9',
    text: 'text-[#0EA5E9]',
  };
};

export const filterGroups: FilterGroup[] = [
  {
    title: 'Category',
    key: 'category',
    type: 'single' as const,
    colorDetails: categoryColor,
    removable: true,
    options: [
      { type: 'category', label: 'General', value: 'general' },
      { type: 'category', label: 'Creator', value: 'creator' },
      { type: 'category', label: 'Community', value: 'community' },
      { type: 'category', label: 'Usage', value: 'usage' },
      { type: 'category', label: 'Milestone', value: 'milestone' },
      { type: 'category', label: 'Special', value: 'special' },
      { type: 'category', label: 'Seasonal', value: 'seasonal' },
      { type: 'category', label: 'Achievement', value: 'achievement' },
    ],
  },
  {
    title: 'Rairty',
    key: 'rarity',
    type: 'single' as const,
    colorDetails: rarityColor,
    removable: true,
    options: [
      { type: 'rarity', label: 'Common', value: 'common' },
      { type: 'rarity', label: 'Rare', value: 'rare' },
      { type: 'rarity', label: 'Epic', value: 'epic' },
      { type: 'rarity', label: 'Legendary', value: 'legendary' },
    ],
  },
  {
    title: 'Sort',
    key: 'sort',
    type: 'single' as const,
    colorDetails: sortColor,
    removable: false,
    options: [
      { type: 'sort', label: 'Name', value: 'name' },
      { type: 'sort', label: 'Created At', value: 'createdAt' },
      { type: 'sort', label: 'Rarity', value: 'rarity' },
      { type: 'sort', label: 'Category', value: 'category' },
    ],
  },
  {
    title: 'Order',
    key: 'order',
    type: 'single' as const,
    removable: false,
    colorDetails: orderColor,
    options: [
      { type: 'order', label: 'Ascending', value: 'asc' },
      { type: 'order', label: 'Descending', value: 'desc' },
    ],
  },
  {
    title: 'Include Inactive',
    key: 'includeInactive',
    type: 'single' as const,
    colorDetails: inactiveColor,
    removable: false,
    options: [
      { type: 'includeInactive', label: 'Yes', value: 'true' },
      { type: 'includeInactive', label: 'No', value: 'false' },
    ],
  },
];
