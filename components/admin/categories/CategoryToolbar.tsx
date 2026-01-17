import CustomButton from '@/components/CustomButton';
import { SearchBar } from '@/components/SearchBar';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, Network, Plus } from 'lucide-react';
import { filterGroups } from '@/lib/small-utils/category';
import { CreateCategoryDialog } from './CreateCategoryDialog';
import { Query } from '@/types/small-types/store/category';
import { SearchFilters } from '@/types/small-types/searchBar';
import { defaultQueryConvertIntoStringPair } from '@/lib/small-utils/category';

import {
  useFetchLoading,
  useQuery,
  useResetQuery,
  useSetQuery,
} from '@/store/category';

export default function CategoryToolbar() {
  const query = useQuery();
  const setQuery = useSetQuery();
  const loading = useFetchLoading();
  const resetQuery = useResetQuery();

  // Convert store query into string/array representation for SearchBar
  const defaultQuery = defaultQueryConvertIntoStringPair(query as Query);

  const [filters, setFilters] = useState<SearchFilters>({ ...defaultQuery });
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCreateCategoryDialogOpen, setIsCreateCategoryDialogOpen] =
    useState(false);

  const handleSubmit = (searchQuery: string, activeFilters: SearchFilters) => {
    try {
      const sort = (activeFilters.sort as string | undefined) ?? 'createdAt';
      const order =
        (activeFilters.order as 'asc' | 'desc' | undefined) ?? 'asc';
      const includeInactiveRaw = activeFilters.includeInactive;
      const treeStructureRaw = activeFilters.treeStructure as
        | string
        | undefined;

      const includeInactive =
        includeInactiveRaw === null ||
        includeInactiveRaw === undefined ||
        includeInactiveRaw === 'false'
          ? false
          : true;

      setQuery({
        search: searchQuery.trim() === '' ? undefined : searchQuery,
        includeInactive,
        order,
        sort: sort as Query['sort'],
        treeStructure: treeStructureRaw,
      });
    } catch {
      // error handling done in store
    }
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
            placeholder="Search categories..."
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
            onClick={() => setIsCreateCategoryDialogOpen(true)}
            variant="primary"
            loading={loading}
            disabled={loading}
            icon={Network}
          />
        </div>
      </div>

      {/* Mobile Toolbar */}
      <div className="md:hidden">
        <div className="flex items-center justify-between gap-2 p-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded bg-surface-secondary border border-border-color text-text-primary"
          >
            <Menu className="size-4" />
          </motion.button>

          <div className="w-[90%]">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSubmit={handleSubmit}
              defaultFilter={defaultQuery}
              placeholder="Search categories..."
              filters={filters}
              onFiltersChange={setFilters}
              filterGroups={filterGroups}
              debounceMs={400}
              onClear={resetQuery}
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
                icon={Plus}
                onClick={() => setIsCreateCategoryDialogOpen(true)}
                variant="primary"
                className="w-full"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <CreateCategoryDialog
        open={isCreateCategoryDialogOpen}
        onOpenChange={setIsCreateCategoryDialogOpen}
      />
    </header>
  );
}
