import { BadgeCard } from './BadgeCard';
import { useBadges } from '@/store/badge';
import { Card, CardContent } from '@/components/ui/card';

export function BadgeGrid() {
  const badges = useBadges();
  return (
    <Card className="bg-bg-primary border-bg-primary pt-0 mt-[-1rem]">
      <CardContent className="p-2 sm:p-4 lg:p-6 font-sans">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {badges.map((badge, index) => (
            <BadgeCard key={index} badge={badge} index={index} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
