import { cn } from '@/lib/utils';
import Icon from '@/components/Icon';
import { ActionMenu } from './ActionMenu';
import { TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { ListChevronsDownUp, ListChevronsUpDown } from 'lucide-react';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import {
  CategoryPreviewProps,
  CategoryRowProps,
  ChildRowProps,
  DataCellProps,
  ToggleButtonProps,
} from '@/types/small-types/category';

const CategoryPreview = ({ category }: CategoryPreviewProps) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <div className="flex items-center gap-3 max-w-[200px]">
        <div
          className="relative flex h-10 w-10 items-center justify-center rounded-lg shadow-sm ring-1 ring-border-color/30"
          style={{ backgroundColor: `${category.color ?? '#64748b'}25` }}
        >
          <div
            className={cn(
              'absolute right-0.5 top-0.5 h-2 w-2 rounded-full ring-1 ring-surface-primary shadow-sm',
              category.isActive ? 'bg-emerald-500' : 'bg-slate-500'
            )}
          />
          <Icon
            name={category.icon ?? 'Folder'}
            className="h-5 w-5"
            style={{ color: category.color ?? '#64748b' }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p
            className="truncate font-semibold text-text-secondary"
            title={category.name}
          >
            {category.name}
          </p>
          <p
            className="truncate text-xs text-text-muted"
            title={`/${category.slug}`}
          >
            /{category.slug}
          </p>
        </div>
      </div>
    </TooltipTrigger>
    <TooltipContent className="border border-border-color bg-transparent backdrop-blur-2xl rounded-[4px]">
      <p className="font-semibold text-text-secondary text-xs">
        {category.description || 'No description'}
      </p>
    </TooltipContent>
  </Tooltip>
);

const ShowChildrenToggle = ({ isExpanded, onToggle }: ToggleButtonProps) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <motion.div whileTap={{ scale: 0.95 }}>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-9 w-9 rounded-lg border border-border-color/50 bg-surface-primary/30 hover:bg-hover-overlay hover:text-text-primary text-text-muted shadow-sm transition-all hover:border-border-color"
        >
          {isExpanded ? (
            <ListChevronsDownUp size={18} />
          ) : (
            <ListChevronsUpDown size={18} />
          )}
        </Button>
      </motion.div>
    </TooltipTrigger>
    <TooltipContent className="border-border-color bg-surface-secondary/95 backdrop-blur rounded-lg px-3 py-1.5">
      <span className="font-semibold text-text-secondary text-xs whitespace-nowrap">
        {isExpanded ? 'Hide subcategories' : 'Show subcategories'}
      </span>
    </TooltipContent>
  </Tooltip>
);

const DataCell = ({ value, muted = false, className = '' }: DataCellProps) => (
  <TableCell
    className={cn(
      'px-4 py-3 text-center border-r border-border-color',
      muted && 'text-text-muted',
      className
    )}
  >
    <span
      className={cn(
        'font-semibold text-text-primary',
        muted && 'text-text-muted'
      )}
    >
      {typeof value === 'number' ? value.toLocaleString() : value}
    </span>
  </TableCell>
);

export const CategoryRow = ({
  category,
  index,
  expandedCategories,
  toggleChildren,
  onUpdate,
  onDelete,
}: CategoryRowProps) => (
  <>
    <motion.tr
      layoutId={`row-${category._id}`}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }}
      className="group border-b border-border-color hover:bg-surface-secondary/20 transition-colors"
    >
      <TableCell className="sticky left-0 z-10 px-4 py-3 font-semibold text-text-secondary text-center border-r border-border-color bg-surface-primary">
        {(index + 1).toString().padStart(2, '0')}
      </TableCell>

      <TableCell className="px-4 py-3 border-r border-border-color">
        <div className="flex items-center justify-between gap-2">
          <CategoryPreview category={category} />
          {category.children?.length ? (
            <ShowChildrenToggle
              isExpanded={!!expandedCategories[category._id]}
              onToggle={() => toggleChildren(category._id)}
            />
          ) : null}
        </div>
      </TableCell>

      <DataCell value={category.templateCount} />
      <DataCell value={category.clickCount} />
      <DataCell value={category.sortOrder} muted />
      <DataCell value={category.createdAt.split('T')[0]} muted />
      <DataCell value={category.updatedAt.split('T')[0]} muted />

      <TableCell className="px-4 py-3">
        <ActionMenu
          category={category}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      </TableCell>
    </motion.tr>

    <AnimatePresence>
      {expandedCategories[category._id] &&
        category.children &&
        category.children.length > 0 &&
        category.children.map((child, childIndex) => (
          <ChildRow
            key={`child-${child._id}`}
            category={child}
            childIndex={childIndex}
            expandedCategories={expandedCategories}
            toggleChildren={toggleChildren}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}
    </AnimatePresence>
  </>
);

const ChildRow = ({
  category,
  childIndex,
  expandedCategories,
  toggleChildren,
  onUpdate,
  onDelete,
}: ChildRowProps) => (
  <motion.tr
    layoutId={`row-${category._id}`}
    layout
    initial={{ opacity: 0, height: 0 }}
    animate={{ opacity: 1, height: 'auto' }}
    exit={{ opacity: 0, height: 0 }}
    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    className="bg-surface-secondary/30 hover:bg-surface-secondary/40 border-b border-border-color transition-all"
  >
    <TableCell className="sticky left-0 z-10 px-4 py-3 bg-surface-primary border-r-2 border-border-color" />

    <TableCell className="px-4 py-3 border-r border-border-color">
      <div className="flex items-center gap-4 pl-1">
        <div className="flex sticky z-20 left-3 size-7 items-center justify-center rounded-full bg-surface-secondary text-xs font-semibold text-text-secondary ring-1 ring-border-color shrink-0">
          {(childIndex + 1).toString().padStart(2, '0')}
        </div>

        <div className="flex items-center justify-between flex-1">
          <CategoryPreview category={category} />
          {category.children?.length ? (
            <ShowChildrenToggle
              isExpanded={!!expandedCategories[category._id]}
              onToggle={() => toggleChildren(category._id)}
            />
          ) : null}
        </div>
      </div>
    </TableCell>

    <DataCell value={category.templateCount} />
    <DataCell value={category.clickCount} />
    <DataCell value={category.sortOrder} muted />
    <DataCell value={category.createdAt.split('T')[0]} muted />
    <DataCell value={category.updatedAt.split('T')[0]} muted />

    <TableCell className="px-4 py-3">
      <ActionMenu category={category} onUpdate={onUpdate} onDelete={onDelete} />
    </TableCell>
  </motion.tr>
);
