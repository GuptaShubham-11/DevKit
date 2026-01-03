import { Search, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import type {
  FilterOption,
  FilterPillProps,
  SearchBarProps,
  SearchFilters,
  SuggestionGroupProps,
  TimeoutId,
} from '@/types/small-types/searchBar';

export function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = 'Search what you want...',

  defaultFilter,
  filters,
  onFiltersChange,
  filterGroups = [],

  compact = false,
  className = '',
  showSuggestions = true,
  disabled = false,

  clearable = true,
  debounceMs = 0,

  onFocus,
  onBlur,
  onClear,
}: SearchBarProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showSuggestionsPanel, setShowSuggestionsPanel] = useState(false);
  const [debouncedValue, setDebouncedValue] = useState(value);

  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const suggestionsRef = useRef<HTMLDivElement | null>(null);
  const debounceRef = useRef<TimeoutId | null>(null);

  // Debounce search value (exposed via debouncedValue if needed)
  useEffect(() => {
    if (debounceMs > 0) {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        setDebouncedValue(value);
      }, debounceMs);

      return () => {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }
      };
    } else {
      setDebouncedValue(value);
    }
  }, [value, debounceMs]);

  const getAvailableOptions = () => {
    return filterGroups
      .map((group) => ({
        ...group,
        options: group.options.filter((option) => {
          const current = filters[group.key];
          if (group.type === 'multiple') {
            const currentValues = (current as string[]) || [];
            return !currentValues.includes(option.value);
          }
          return current !== option.value;
        }),
      }))
      .filter((group) => group.options.length > 0);
  };

  const availableGroups = getAvailableOptions();

  // Active filters for pills
  const getActiveFilters = (): FilterPillProps[] => {
    const activeFilters: FilterPillProps[] = [];

    Object.entries(filters).forEach(([key, filterValue]) => {
      const group = filterGroups.find((g) => g.key === key);
      if (!group) return;

      if (Array.isArray(filterValue)) {
        filterValue.forEach((val) => {
          const option = group.options.find((opt) => opt.value === val);
          if (option) {
            activeFilters.push({
              type: key,
              value: val,
              label: option.label,
              option,
              onRemove: () => handleFilterRemove(key, val),
            });
          }
        });
      } else if (filterValue != null) {
        const option = group.options.find((opt) => opt.value === filterValue);
        if (option) {
          activeFilters.push({
            type: key,
            value: filterValue,
            label: option.label,
            option,
            onRemove: () => handleFilterRemove(key, filterValue),
          });
        }
      }
    });

    return activeFilters;
  };

  const activeFilters = getActiveFilters();
  const hasFilters = activeFilters.length > 0;
  const hasContent = Boolean(value) || hasFilters;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = value.trim();
    onSubmit(query, filters);
  };

  const handleFilterSelect = (option: FilterOption) => {
    const group = filterGroups.find((g) => g.key === option.type);
    if (!group) return;

    const newFilters: SearchFilters = { ...filters };

    if (group.type === 'multiple') {
      const currentValues = (newFilters[option.type] as string[]) || [];
      if (!currentValues.includes(option.value)) {
        newFilters[option.type] = [...currentValues, option.value];
      }
    } else {
      const currentValue = newFilters[option.type] as string | null | undefined;
      newFilters[option.type] =
        currentValue === option.value ? null : option.value;
    }

    onFiltersChange(newFilters);
  };

  const handleFilterRemove = (type: string, value: string) => {
    const group = filterGroups.find((g) => g.key === type);
    if (!group || !group.removable) return;

    const newFilters: SearchFilters = { ...filters };

    if (group.type === 'multiple') {
      const currentValues = (newFilters[type] as string[]) || [];
      newFilters[type] = currentValues.filter((v) => v !== value);
    } else {
      newFilters[type] = null;
    }

    onFiltersChange(newFilters);
  };

  const handleClear = () => {
    onChange('');
    const clearedFilters: SearchFilters = { ...defaultFilter };
    filterGroups.forEach((group) => {
      if (group.removable) {
        clearedFilters[group.key] = group.type === 'multiple' ? [] : null;
      } else if (defaultFilter) {
        clearedFilters[group.key] = defaultFilter[group.key] ?? null;
      }
    });
    console.log(clearedFilters);
    onFiltersChange(clearedFilters);
    onClear?.();
    searchInputRef.current?.focus();
  };

  const handleFocus = () => {
    setIsSearchFocused(true);
    if (showSuggestions && availableGroups.length > 0) {
      setShowSuggestionsPanel(true);
    }
    onFocus?.();
  };

  const handleBlur = () => {
    setTimeout(() => {
      setIsSearchFocused(false);
      setShowSuggestionsPanel(false);
    }, 150);
    onBlur?.();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestionsPanel(false);
      }
    };

    if (showSuggestionsPanel) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSuggestionsPanel]);

  return (
    <div className={`relative ${className}`}>
      <motion.form onSubmit={handleSearchSubmit} className="relative group">
        <motion.div
          animate={{
            scale: isSearchFocused ? 1.01 : 1,
            boxShadow: isSearchFocused
              ? '0 0 0 2px var(--color-brand-primary, #3b82f6)'
              : '0 1px 3px rgba(0, 0, 0, 0.1)',
          }}
          transition={{ duration: 0.2 }}
          className={`relative overflow-hidden rounded border border-border-color bg-surface-secondary backdrop-blur-sm
            ${disabled ? 'cursor-not-allowed opacity-50' : ''}
          `}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0 pl-3 pr-2">
              <Search
                className={`${compact ? 'size-4' : 'size-5'} ${
                  isSearchFocused ? 'text-brand-primary' : ''
                } transition-colors`}
              />
            </div>

            <div className="relative flex flex-1 items-center gap-1 overflow-x-auto scrollbar-hide">
              <AnimatePresence>
                {activeFilters.map((filter, index) => {
                  const group = filterGroups.find((g) => g.key === filter.type);
                  const colors = group?.colorDetails?.(filter.value as string);

                  return (
                    <div
                      key={`${filter.type}-${filter.value}-${index}`}
                      className="flex-shrink-0"
                    >
                      <DefaultFilterPill
                        label={filter.label}
                        bgColor={colors?.bg}
                        textColor={colors?.text}
                        onSelect={handleFilterSelect}
                        onRemove={() =>
                          handleFilterRemove(
                            filter.type as string,
                            filter.value as string
                          )
                        }
                        option={filter.option as FilterOption}
                        active={group?.removable}
                      />
                    </div>
                  );
                })}
              </AnimatePresence>

              {/* Search Input */}
              <input
                ref={searchInputRef}
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                disabled={disabled}
                placeholder={hasFilters ? 'Add more filters...' : placeholder}
                className={`min-w-[50%] flex-1 bg-transparent py-1 text-text-primary placeholder-text-muted outline-none
                  ${compact ? 'text-sm' : ''}
                  ${disabled ? 'cursor-not-allowed' : ''}
                `}
              />

              {/* Search hint */}
              {isSearchFocused && value && availableGroups.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute top-full left-0 right-0 z-40 mt-0 rounded border border-border-color bg-surface-primary px-3 py-1 text-xs text-text-muted"
                >
                  Press Enter to search
                </motion.div>
              )}
            </div>

            {/* Clear Button */}
            <AnimatePresence>
              {clearable && hasContent && !disabled && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                  type="button"
                  onClick={handleClear}
                  className="mr-2 flex-shrink-0 cursor-pointer rounded-lg p-0.5 text-text-muted transition-all hover:bg-hover-overlay hover:text-text-primary"
                >
                  <X className="size-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <AnimatePresence>
          {showSuggestions &&
            showSuggestionsPanel &&
            isSearchFocused &&
            availableGroups.length > 0 && (
              <motion.div
                ref={suggestionsRef}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-lg border border-border-color bg-surface-primary p-4 shadow-xl"
              >
                {availableGroups.map((group) => (
                  <div onMouseDown={(e) => e.preventDefault()} key={group.key}>
                    <DefaultSuggestionGroup
                      group={group}
                      options={group.options}
                      onSelect={handleFilterSelect}
                    />
                  </div>
                ))}
              </motion.div>
            )}
        </AnimatePresence>
      </motion.form>
    </div>
  );
}

const DefaultFilterPill = ({
  label,
  bgColor = 'bg-gray-500/20',
  textColor = 'text-gray-400',
  onSelect,
  onRemove,
  option,
  active,
}: FilterPillProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    transition={{ duration: 0.2 }}
    className={`inline-flex flex-shrink-0 items-center gap-1 rounded-md border border-border-color px-2 py-0.5 text-sm font-medium ${bgColor} ${textColor}`}
  >
    <span
      onClick={() => onSelect && option && onSelect(option)}
      className="max-w-25 cursor-pointer truncate"
    >
      {label}
    </span>
    {active !== false && onRemove && (
      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        onClick={onRemove}
        className="flex-shrink-0 rounded-full bg-accent-error p-0.5 text-text-primary transition-colors"
      >
        <X className="size-2.5 cursor-pointer" />
      </motion.button>
    )}
  </motion.div>
);

const DefaultSuggestionGroup = ({
  group,
  options,
  onSelect,
}: SuggestionGroupProps) => (
  <div className="mb-2">
    <h4 className="mb-1 text-xs font-semibold capitalize tracking-wider text-text-muted">
      {group?.title || 'Filters'}
    </h4>
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const colors = group?.colorDetails?.(option.value);

        return (
          <DefaultFilterPill
            key={option.value}
            label={option.label}
            bgColor={colors?.bg}
            textColor={colors?.text}
            onSelect={onSelect}
            option={option}
          />
        );
      })}
    </div>
  </div>
);
