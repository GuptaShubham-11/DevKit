import { motion } from 'framer-motion';
import { StatsCard } from '../StatsCard';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useMemo, useState } from 'react';
import { rarityColor } from '@/lib/small-utils/badge';
import { useBadgeStats, useFetchLoading } from '@/store/badge';
import {
  CategoryDotProps,
  StatData,
  TooltipProps,
} from '@/types/small-types/badge';

import {
  Award,
  ChartNoAxesCombined,
  ChartSpline,
  LayoutGrid,
  Shield,
  ShieldCheck,
  Trophy,
} from 'lucide-react';

import {
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const CATEGORY_OPTIONS = [
  'creator',
  'community',
  'usage',
  'milestone',
  'special',
  'seasonal',
  'achievement',
] as const;

const COLORS = {
  pie: '#1a1a1a',
  line: '#6366f1',
  lineStroke: '5',
};

// Custom Tooltip Components
const CircleTooltip = ({ active, payload }: TooltipProps) => {
  if (!active || !payload?.[0]) return null;

  const data = payload[0].payload;
  return (
    <div className="rounded-lg border border-border-color bg-surface-secondary p-3 shadow-xl">
      <p className="text-sm font-medium text-text-primary">{data._id}</p>
      <p className="text-xs text-text-muted">{data.count} badges</p>
    </div>
  );
};

const DotTooltip = ({ active, payload }: TooltipProps) => {
  if (!active || !payload?.[0]) return null;

  const data = payload[0].payload;
  return (
    <div className="rounded-lg border border-border-color bg-surface-secondary p-3 shadow-xl">
      <p className="text-sm font-medium text-text-primary">{data.category}</p>
      <p className="text-xs text-text-muted">
        {data.count} badges ({data.percentage}%)
      </p>
    </div>
  );
};

export function BadgeStats() {
  const stats = useBadgeStats();
  const loading = useFetchLoading();
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile size
  useEffect(() => {
    const checkSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  // Memoize computed values
  const totals = useMemo(() => {
    const total = stats?.totalBadges ?? 0;
    const active = stats?.activeBadges ?? 0;
    return {
      total,
      active,
      inactive: total - active,
      categories: stats?.categories.length ?? 0,
    };
  }, [stats?.totalBadges, stats?.activeBadges, stats?.categories.length]);

  const statsData: StatData[] = useMemo(
    () => [
      {
        label: 'Total Badges',
        value: totals.total,
        icon: Award,
        color: 'text-purple-400',
        bgColor: 'bg-purple-400/10',
        description: 'Created all badges',
      },
      {
        label: 'Active Badges',
        value: totals.active,
        icon: ShieldCheck,
        color: 'text-green-400',
        bgColor: 'bg-green-400/10',
        description: 'User can claim badges',
      },
      {
        label: 'Categories',
        value: totals.categories,
        icon: LayoutGrid,
        color: 'text-blue-400',
        bgColor: 'bg-blue-400/10',
        description: 'Unique categories',
      },
      {
        label: 'Inactive Badges',
        value: totals.inactive,
        icon: Shield,
        color: 'text-orange-400',
        bgColor: 'bg-orange-400/10',
        description: "User can't claim badges",
      },
    ],
    [totals]
  );

  // Memoize category dot data
  const categoryDotData: CategoryDotProps[] = useMemo(
    () =>
      CATEGORY_OPTIONS.map((category, index) => {
        const count =
          stats?.categories.find((c) => c._id === category)?.count ?? 0;
        const percentage =
          totals.total > 0 ? Math.round((count / totals.total) * 100) : 0;

        return {
          category: category.charAt(0).toUpperCase() + category.slice(1),
          count,
          percentage,
          x: index + 1,
          y: count,
          color: `hsl(${200 + index * 40}, 70%, 50%)`,
        };
      }),
    [stats?.categories, totals.total]
  );

  const rarityData = stats?.rarityDistribution ?? [];
  const hasRarityData = rarityData.length > 0;

  return (
    <div className="w-full space-y-4">
      <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 sm:gap-4 md:mt-[-8px]">
        {statsData.map((stat, index) => (
          <StatsCard
            key={stat.label}
            stat={stat}
            index={index}
            loading={loading}
          />
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {/* Rarity Distribution Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="rounded-xl border-border-color bg-surface-primary p-4 sm:p-6">
            <div className="mb-4 flex items-center gap-2 sm:mb-6">
              <div className="rounded border-border-color bg-yellow-400/10 p-1.5 sm:p-2">
                <ChartNoAxesCombined className="h-4 w-4 text-yellow-400 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-semibold tracking-wide text-text-secondary sm:text-lg">
                  Rarity Distribution
                </h3>
                <p className="text-xs text-text-muted sm:text-sm">
                  Badge rarity breakdown
                </p>
              </div>
            </div>

            <div className="h-[200px] w-full sm:h-[300px]">
              {loading ? (
                <Skeleton className="h-full w-full bg-surface-secondary" />
              ) : hasRarityData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={rarityData}
                      dataKey="count"
                      nameKey="_id"
                      cx="50%"
                      cy="50%"
                      innerRadius="25%"
                      outerRadius="90%"
                      paddingAngle={2}
                      strokeWidth={2}
                      cornerRadius={2}
                      stroke={COLORS.pie}
                    >
                      {rarityData.map((entry, index) => (
                        <Cell
                          key={`rarity-cell-${entry._id}`}
                          fill={
                            rarityColor(entry._id.toLowerCase()).color ||
                            '#6366f1'
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CircleTooltip />} />
                    <Legend
                      wrapperStyle={{
                        color: '#fff',
                        fontSize: isMobile ? '12px' : '14px',
                      }}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[200px] items-center justify-center text-text-secondary sm:h-[300px]">
                  <div className="text-center">
                    <Trophy className="mx-auto mb-2 size-14 text-text-muted sm:size-18" />
                    <p className="text-sm sm:text-lg text-neutral-200">
                      No badges created yet
                    </p>
                    <p className="text-xs sm:text-sm text-text-muted">
                      Create your first badge to see distribution
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Categories Distribution Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="rounded-xl border-border-color bg-surface-primary p-4 sm:p-6">
            <div className="mb-4 flex items-center gap-2 sm:mb-6">
              <div className="rounded border-border-color bg-rose-400/10 p-1.5 sm:p-2">
                <ChartSpline className="h-4 w-4 text-rose-400 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-semibold tracking-wide text-text-secondary sm:text-lg">
                  Categories Distribution
                </h3>
                <p className="text-xs text-text-muted sm:text-sm">
                  6 different badge categories
                </p>
              </div>
            </div>

            <div className="h-[200px] sm:h-[300px]">
              {loading ? (
                <Skeleton className="h-full w-full bg-surface-secondary" />
              ) : categoryDotData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={categoryDotData}
                    margin={{
                      top: 10,
                      bottom: isMobile ? 20 : 25,
                      left: -25,
                    }}
                  >
                    <XAxis
                      dataKey="category"
                      tick={{
                        fill: '#fff',
                        fontSize: isMobile ? 10 : 12,
                      }}
                      angle={-30}
                      padding={{ left: 15, right: 15 }}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis
                      tick={{
                        fill: '#aaa',
                        fontSize: isMobile ? 10 : 12,
                      }}
                      label={{
                        value: 'Count',
                        angle: -90,
                        position: 'outsideLeft',
                        style: {
                          textAnchor: 'middle',
                          fill: '#aaa',
                          fontSize: isMobile ? '10px' : '12px',
                        },
                      }}
                    />
                    <Tooltip content={<DotTooltip />} />

                    {/* Connected Line */}
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke={COLORS.line}
                      strokeWidth={2}
                      dot={false}
                      strokeDasharray={COLORS.lineStroke}
                      opacity={0.6}
                    />

                    {/* Individual Dots */}
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="transparent"
                      strokeWidth={0}
                      dot={({ cx, cy, payload }) => {
                        const index = categoryDotData.findIndex(
                          (d) => d.y === payload.count && d.x === payload.x
                        );
                        return (
                          <circle
                            key={`dot-${index}`}
                            cx={cx}
                            cy={cy}
                            r={isMobile ? 6 : 8}
                            fill={categoryDotData[index]?.color || COLORS.line}
                            stroke={COLORS.pie}
                            strokeWidth={2}
                            className="transition-all duration-200 cursor-pointer hover:r-10"
                          />
                        );
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[200px] items-center justify-center text-text-secondary sm:h-[300px]">
                  <div className="text-center">
                    <Trophy className="mx-auto mb-2 size-14 text-text-muted sm:size-18" />
                    <p className="text-sm sm:text-lg text-neutral-200">
                      No badges created yet
                    </p>
                    <p className="text-xs sm:text-sm text-text-muted">
                      Create your first badge to see distribution
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
