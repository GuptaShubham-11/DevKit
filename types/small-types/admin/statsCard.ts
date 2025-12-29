// Stat Props
export type StatProps = {
  label: string;
  value: number | string;
  icon: any;
  color: string;
  bgColor: string;
  description: string;
  format?: (val: number) => string | undefined;
};

// Stats Card Props
export type StatsCardProps = {
  stat: StatProps;
  index: number;
  loading?: boolean;
};
