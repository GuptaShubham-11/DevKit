import { StatsCardProps } from '@/types/small-types/admin/statsCard';
import { Skeleton } from '../ui/skeleton';
import { Card } from '../ui/card';

export function StatsCard({ stat, index, loading }: StatsCardProps) {
  if (loading) {
    return (
      <Card
        key={index}
        className="bg-surface-primary  border-border-color rounded-xl p-4 md:p-6 hover:shadow-lg hover:border-white/20 transition-all duration-300"
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 sm:p-2 rounded bg-surface-secondary border-border-color">
            <Skeleton className="size-6 bg-surface-secondary" />
          </div>
          <div className="min-w-0 flex-1">
            <Skeleton className="h-4 w-24 sm:w-32 bg-surface-secondary mb-1" />
            <Skeleton className="h-4 w-18 sm:w-24 bg-surface-secondary" />
          </div>
        </div>
        <div className="flex items-center justify-center">
          <Skeleton className="size-12 bg-surface-secondary rounded-xl" />
        </div>
      </Card>
    );
  }

  return (
    <Card
      key={index}
      className="bg-surface-primary  border-border-color rounded-xl p-4 md:p-6 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center gap-2">
        <div
          className={`p-1.5 sm:p-2 rounded ${stat.bgColor} border-border-color`}
        >
          <stat.icon className={`size-4 sm:size-5 ${stat.color}`} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-medium text-text-secondary tracking-wide truncate">
            {stat.label}
          </p>
          <p className="text-xs text-text-muted truncate">{stat.description}</p>
        </div>
      </div>
      <div className="text-center text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary leading-none">
        {stat.value.toLocaleString().padStart(2, '0')}
      </div>
    </Card>
  );
}
