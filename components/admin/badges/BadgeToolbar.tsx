import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Award, Menu, Plus, SmilePlus, Trophy } from 'lucide-react';

import AwardBadgeDialog from './AwardBadgeDialog';
import CreateBadgeDialog from './CreateBadgeDialog';
import CustomButton from '@/components/CustomButton';
import { SearchBar } from '@/components/SearchBar';

import {
  useBadgeQuery,
  useFetchLoading,
  useResetQuery,
  useSetQuery,
} from '@/store/badge';

import {
  filterGroups,
  defaultQueryConvertIntoStringPair,
} from '@/lib/small-utils/badge';

import type { Query } from '@/store/badge';
import type { SearchFilters } from '@/types/small-types/searchBar';

export function BadgeToolbar() {
  const query = useBadgeQuery();
  const setQuery = useSetQuery();
  const resetQuery = useResetQuery();
  const loading = useFetchLoading();

  // Convert store query into string/array representation for SearchBar
  const defaultQuery = defaultQueryConvertIntoStringPair(query as Query);

  const [filters, setFilters] = useState<SearchFilters>({ ...defaultQuery });
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAwardBadgeDialogOpen, setIsAwardBadgeDialogOpen] = useState(false);
  const [isCreateBadgeDialogOpen, setIsCreateBadgeDialogOpen] = useState(false);

  const handleSubmit = (search: string, activeFilters: SearchFilters) => {
    const category = activeFilters.category as string | undefined;
    const sort = (activeFilters.sort as string | undefined) ?? 'createdAt';
    const order = (activeFilters.order as 'asc' | 'desc' | undefined) ?? 'asc';
    const includeInactiveRaw = activeFilters.includeInactive;

    const includeInactive =
      includeInactiveRaw === null ||
      includeInactiveRaw === undefined ||
      includeInactiveRaw === 'false'
        ? false
        : true;

    setQuery({
      category: category as Query['category'],
      search: search.trim() === '' ? undefined : search,
      includeInactive,
      order,
      sort: sort as Query['sort'],
    });
  };

  // Apply filters whenever they change
  useEffect(() => {
    handleSubmit(searchQuery, filters);
  }, [filters, searchQuery]);

  return (
    <header className="relative rounded-md border border-border-color bg-surface-primary shadow-sm">
      {/* Desktop Toolbar */}
      <div className="hidden items-center justify-between gap-4 p-4 md:flex">
        <div className="max-w-md lg:max-w-xl flex-1">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSubmit={handleSubmit}
            defaultFilter={defaultQuery}
            placeholder="Search Badges..."
            filters={filters}
            onFiltersChange={setFilters}
            filterGroups={filterGroups}
            debounceMs={400}
            onClear={resetQuery}
          />
        </div>
        <div className="flex gap-2">
          <CustomButton
            label="Create"
            onClick={() => setIsCreateBadgeDialogOpen(true)}
            variant="primary"
            icon={SmilePlus}
            loading={loading}
            disabled={loading}
          />
          <CustomButton
            label="Award"
            onClick={() => setIsAwardBadgeDialogOpen(true)}
            variant="success"
            icon={Trophy}
            loading={loading}
            disabled={loading}
            className="text-black"
          />
        </div>
      </div>

      {/* Mobile Toolbar */}
      <div className="md:hidden">
        <div className="flex items-center justify-between gap-2 p-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="rounded border border-border-color bg-surface-secondary p-2 text-text-primary"
          >
            <Menu className="size-4" />
          </motion.button>

          <div className="w-[90%] sm:w-full">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSubmit={handleSubmit}
              defaultFilter={defaultQuery}
              placeholder="Search Badges..."
              filters={filters}
              onFiltersChange={setFilters}
              filterGroups={filterGroups}
              debounceMs={300}
              compact
            />
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="flex  gap-2 rounded-md border-t border-border-color bg-surface-secondary p-4 sm:flex-row"
            >
              <CustomButton
                label="Create"
                onClick={() => setIsCreateBadgeDialogOpen(true)}
                variant="primary"
                className="w-full"
                loading={loading}
                disabled={loading}
                icon={SmilePlus}
              />
              <CustomButton
                label="Award"
                icon={Trophy}
                onClick={() => setIsAwardBadgeDialogOpen(true)}
                variant="success"
                loading={loading}
                disabled={loading}
                className="w-full text-black"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <CreateBadgeDialog
        open={isCreateBadgeDialogOpen}
        onOpenChange={setIsCreateBadgeDialogOpen}
      />

      <AwardBadgeDialog
        open={isAwardBadgeDialogOpen}
        onOpenChange={setIsAwardBadgeDialogOpen}
      />
    </header>
  );
}
