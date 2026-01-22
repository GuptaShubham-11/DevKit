import { Skeleton } from '@/components/ui/skeleton';
import { TableCell, TableRow } from '@/components/ui/table';

export const RowSkeleton = () => (
  <>
    {[...Array(10)].map((_, i) => (
      <TableRow
        key={i}
        className="group border-b border-r border-border-color  hover:bg-transparent"
      >
        <TableCell className="sticky left-0 bg-surface-primary z-10 px-4 py-3 border-r border-border-color ">
          <Skeleton className="mx-auto h-6 w-6 rounded-full bg-surface-secondary" />
        </TableCell>
        <TableCell className="py-3 px-4 border-r border-border-color">
          <div className="flex items-center gap-4">
            <Skeleton className="size-10 rounded-xl bg-surface-secondary" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-32 rounded bg-surface-secondary" />
              <Skeleton className="h-3 w-24 rounded bg-surface-secondary" />
            </div>
          </div>
        </TableCell>
        <TableCell className="px-4 py-3 border-r border-border-color">
          <Skeleton className="mx-auto h-8 w-16 rounded-xl bg-surface-secondary" />
        </TableCell>
        <TableCell className="px-4 py-3 border-r border-border-color">
          <Skeleton className="mx-auto h-8 w-16 rounded-xl bg-surface-secondary" />
        </TableCell>
        <TableCell className="px-4 py-3 border-r border-border-color">
          <Skeleton className="mx-auto h-8 w-12 rounded-xl bg-surface-secondary" />
        </TableCell>
        <TableCell className="px-4 py-3 border-r border-border-color">
          <Skeleton className="mx-auto h-6 w-20 rounded bg-surface-secondary" />
        </TableCell>
        <TableCell className="px-4 py-3 border-r border-border-color">
          <Skeleton className="mx-auto h-6 w-20 rounded bg-surface-secondary" />
        </TableCell>
        <TableCell className="px-4 py-3">
          <Skeleton className="ml-auto h-8 w-8 rounded-lg bg-surface-secondary mx-auto" />
        </TableCell>
      </TableRow>
    ))}
  </>
);
