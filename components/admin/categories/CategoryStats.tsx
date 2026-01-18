import { StatsCard } from '../StatsCard';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Chart } from './Chart';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useCategoryStats, useCharts, useFetchLoading } from '@/store/category';

import {
  Tally5,
  ShieldCheck,
  Shield,
  ChartArea,
  MousePointerClick,
  LayoutList,
  CircleOff,
} from 'lucide-react';

export default function CategoryStats() {
  const stats = useCategoryStats();
  const loading = useFetchLoading();
  const charts = useCharts();
  const [showTemplates, setShowTemplates] = useState(false);

  const topTemplates = charts?.topByTemplates ?? [];
  const topClicks = charts?.topByClicks ?? [];

  const statsData = [
    {
      label: 'Total Categories',
      value: stats?.totalCategories || 0,
      icon: Tally5,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      description: 'Total number of categories',
    },
    {
      label: 'Active Categories',
      value: stats?.totalActive || 0,
      icon: ShieldCheck,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      description: 'Total number of active',
    },
    {
      label: 'Total Clicks',
      value: stats?.totalClickCount || 0,
      icon: MousePointerClick,
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
      description: 'Total number of clicks',
      format: (val: number) => val.toLocaleString(),
    },
    {
      label: 'Inactive Categories',
      value: stats?.totalInactive || 0,
      icon: Shield,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      description: 'Total number of inactive',
    },
  ];

  return (
    <section id="stats" className="w-full space-y-4">
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
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="rounded-xl border-border-color bg-surface-primary p-4 sm:p-6">
          <div className="flex flex-col items-start justify-between sm:flex-row">
            <div className="mb-4 flex items-center gap-2 sm:mb-6">
              <div className="rounded border-border-color bg-cyan-400/10 p-1.5 sm:p-2">
                <ChartArea className="h-4 w-4 text-cyan-400 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-semibold tracking-wide text-text-secondary sm:text-lg">
                  Categories Distribution
                </h3>
                <p className="text-xs text-text-muted sm:text-sm">
                  The most templates and clicks
                </p>
              </div>
            </div>
            <div className="flex items-center justify-center  bg-surface-secondary rounded-[4px] gap-1 p-1 border border-border-color w-fit mx-auto sm:mx-0">
              <MousePointerClick
                size={20}
                className="text-pink-500 border-r-1"
              />
              <Switch
                checked={showTemplates}
                onCheckedChange={setShowTemplates}
                className={`${showTemplates ? `data-[state=checked]:bg-[#4f772d]` : `data-[state=unchecked]:bg-pink-500`} cursor-pointer`}
              />
              <LayoutList size={20} className="text-[#4f772d] border-l-1" />
            </div>
          </div>
          <div className="h-[250px] sm:h-[300px]">
            {loading ? (
              <Skeleton className="h-full w-full bg-surface-secondary" />
            ) : topTemplates.length > 0 && topClicks.length > 0 ? (
              <Chart
                data={showTemplates ? topTemplates : topClicks}
                show={showTemplates ? 'templates' : 'clicks'}
              />
            ) : (
              <div className="flex h-[200px] items-center justify-center text-text-secondary sm:h-[300px]">
                <div className="text-center">
                  <CircleOff className="mx-auto mb-2 size-14 text-text-muted sm:size-18" />
                  <p className="text-sm sm:text-lg text-neutral-200">
                    No categories created yet
                  </p>
                  <p className="text-xs sm:text-sm text-text-muted">
                    Create your first few categories to see distribution
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </section>
  );
}
