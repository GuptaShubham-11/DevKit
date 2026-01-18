import { ChartProps } from '@/types/small-types/category';
import { TooltipProps } from '@/types/small-types/store/category';
import { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const Chart: React.FC<ChartProps> = ({ data, show }) => {
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

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{
          top: 10,
          bottom: isMobile ? 20 : 25,
          left: -25,
        }}
      >
        <defs>
          <linearGradient id="templatesGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#656d4a" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#656d4a" stopOpacity={0.2} />
          </linearGradient>

          <linearGradient id="clicksGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f7359c" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#f7359c" stopOpacity={0.2} />
          </linearGradient>
        </defs>

        <XAxis
          dataKey="name"
          textAnchor="middle"
          interval={0}
          angle={-30}
          padding={{ left: isMobile ? 15 : 45, right: isMobile ? 15 : 45 }}
          tick={{ fill: '#e5e7eb', fontSize: isMobile ? 10 : 12 }}
        />

        <YAxis
          tick={{ fill: '#9ca3af', fontSize: isMobile ? 10 : 12 }}
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

        <Tooltip content={<ChartTooltip />} />

        {show === 'templates' && (
          <Area
            type="monotone"
            dataKey="templateCount"
            stroke="#656d4a"
            fill="url(#templatesGradient)"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        )}

        {show === 'clicks' && (
          <Area
            type="monotone"
            dataKey="clickCount"
            stroke="#f7359c"
            fill="url(#clicksGradient)"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
};

const ChartTooltip = ({ active, payload }: TooltipProps) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;

  return (
    <div className="rounded-lg border border-border-color bg-surface-secondary px-3 py-2 shadow-xl">
      {'templateCount' in data && (
        <p className="text-sm text-text-primary">
          {data.templateCount} templates
        </p>
      )}
      {'clickCount' in data && (
        <p className="text-sm text-text-primary">{data.clickCount} clicks</p>
      )}
    </div>
  );
};
