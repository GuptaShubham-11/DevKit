import { ColorBasedOnKeyword } from './badge';

// Filter Option Props
export type FilterOption = {
  type: string;
  label: string;
  value: string;
  colorDetails?: (option: string) => ColorBasedOnKeyword;
  category?: string;
};

// Search Filter Props
export type SearchFilters = {
  [key: string]: string[] | string | null;
};

// Filter Group Props
export type FilterGroup = {
  title: string;
  key: string;
  type: 'single' | 'multiple';
  options: FilterOption[];
  removable?: boolean;
  colorDetails?: (option: string) => ColorBasedOnKeyword;
};

// Search Bar Props
export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (query: string, filters: SearchFilters) => void;
  placeholder?: string;

  defaultFilter?: SearchFilters;
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  filterGroups?: FilterGroup[];

  compact?: boolean;
  className?: string;
  showSuggestions?: boolean;
  disabled?: boolean;

  clearable?: boolean;
  debounceMs?: number;

  onFocus?: () => void;
  onBlur?: () => void;
  onClear?: () => void;
}

// Fillter Pill Props
export type FilterPillProps = {
  type?: string;
  value?: string;
  label: string;
  bgColor?: string;
  textColor?: string;
  onSelect?: (option: FilterOption) => void;
  onRemove?: () => void;
  option?: FilterOption;
  active?: boolean;
};

// Suggestion Group Props
export type SuggestionGroupProps = {
  group: FilterGroup;
  options: FilterOption[];
  onSelect: (option: FilterOption) => void;
};

// Timeout Id
export type TimeoutId = ReturnType<typeof setTimeout>;
