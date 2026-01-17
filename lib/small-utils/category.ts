import { ColorBasedOnKeyword } from '@/types/small-types/category';
import { FilterGroup } from '@/types/small-types/searchBar';
import { Query } from '@/types/small-types/store/category';

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
    case 'sortOrder':
      return {
        bg: 'bg-[#F97316]/10',
        color: '#F97316',
        text: 'text-[#F97316]',
      };
    case 'clickCount':
      return {
        bg: 'bg-[#10B981]/10',
        color: '#10B981',
        text: 'text-[#10B981]',
      };
    case 'templateCount':
      return {
        bg: 'bg-[#EC4899]/10',
        color: '#EC4899',
        text: 'text-[#EC4899]',
      };
    default:
      return {
        bg: 'bg-gray-400/10',
        color: '#6b7280',
        text: 'text-gray-400',
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

export const treeColor = (value: string): ColorBasedOnKeyword => {
  if (value === 'true') {
    return {
      bg: 'bg-[#a8aaf3]/10',
      color: '#a8aaf3',
      text: 'text-[#a8aaf3]',
    };
  }
  return {
    bg: 'bg-[#ff8aa2]/10',
    color: '#ff8aa2',
    text: 'text-[#ff8aa2]',
  };
};

export const filterGroups: FilterGroup[] = [
  {
    title: 'Sort',
    key: 'sort',
    type: 'single' as const,
    removable: false,
    colorDetails: sortColor,
    options: [
      { type: 'sort', label: 'Name', value: 'name' },
      { type: 'sort', label: 'Created At', value: 'createdAt' },
      { type: 'sort', label: 'Sort Order', value: 'sortOrder' },
      { type: 'sort', label: 'Click Count', value: 'clickCount' },
      { type: 'sort', label: 'Template Count', value: 'templateCount' },
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
    removable: false,
    colorDetails: inactiveColor,
    options: [
      { type: 'includeInactive', label: 'Yes', value: 'true' },
      { type: 'includeInactive', label: 'No', value: 'false' },
    ],
  },
  {
    title: 'Tree Structure',
    key: 'treeStructure',
    type: 'single' as const,
    removable: false,
    colorDetails: treeColor,
    options: [
      { type: 'treeStructure', label: 'Yes', value: 'true' },
      { type: 'treeStructure', label: 'No', value: 'false' },
    ],
  },
];
