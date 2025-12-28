import { motion } from 'framer-motion';
import { timeAgo } from '@/lib/timeAgo';
import { Badge } from '@/components/ui/badge';
import CustomButton from '@/components/CustomButton';
import { BadgeDialogProps } from '@/types/small-types/badge';
import { useFetchBadges, useFetchLoading } from '@/store/badge';

import {
  Key,
  Users,
  Coins,
  Award,
  TrendingUp,
  BadgeCheck,
  TriangleAlertIcon,
} from 'lucide-react';

import {
  rarityColor,
  categoryColor,
  timeframeColor,
  conditionToSymbol,
} from '@/lib/small-utils/badge';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function ViewBadgeDialog({
  badge,
  open,
  onOpenChange,
}: BadgeDialogProps) {
  const statsCard = [
    {
      icon: Users,
      label: 'Earned',
      value: 0,
      color: 'text-emerald-600',
    },
    {
      icon: Coins,
      label: 'Points',
      value: badge?.pointsRequired,
      color: 'text-[#2454FF]',
    },
    {
      icon: TrendingUp,
      label: 'XP Bonus',
      value: `+${badge?.rewardData?.xpBonus}`,
      color: 'text-[#E3FF00]',
    },
    {
      icon: BadgeCheck,
      label: 'Profile',
      value: 'Yes',
      color: 'text-[#6F00FF]',
    },
  ];

  const fetchBadges = useFetchBadges();
  const fetchLoading = useFetchLoading();

  const rarityStyle = rarityColor(badge?.rarityLevel ? badge?.rarityLevel : '');
  const isBackdropVisible = open;

  return (
    <>
      {isBackdropVisible && (
        <div
          onClick={() => onOpenChange(false)}
          className="fixed inset-0 z-50 bg-white/5 backdrop-blur-sm"
          aria-hidden="true"
        />
      )}

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className={`${badge ? 'sm:max-w-lg' : 'sm:max-w-sm'} max-h-[90vh] rounded-[4px] border-border-color bg-surface-primary p-6 font-sans`}
        >
          {!badge ? (
            <>
              <div className="text-center text-lg font-bold text-neutral-400 flex flex-col gap-2">
                <motion.div
                  initial={{
                    scale: 1,
                    rotate: 0,
                    opacity: 1,
                    x: 0,
                  }}
                  animate={{
                    scale: [0, 1.2, 1],
                    opacity: 1,
                    rotate: [0, 60, 120, 180, 240, 300, 320, 360],
                    x: [0, 60, 120, 160, 180, 200, 220, 240, 250, 240],
                    y: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20],
                  }}
                  transition={{
                    duration: 2,
                    ease: 'easeInOut',
                    delay: 0.3,
                  }}
                  className="size-4"
                >
                  <TriangleAlertIcon
                    size={18}
                    className="text-accent-warning"
                  />
                </motion.div>

                <span>Badge not found</span>
              </div>

              <CustomButton
                type="button"
                label="Refresh"
                variant="success"
                onClick={fetchBadges}
                loading={fetchLoading}
                className="text-black"
              />
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="relative">
                    {badge?.badgeImage && badge?.badgeImage ? (
                      <img
                        src={badge?.badgeImage || ''}
                        alt={badge?.name}
                        className="size-12 lg:size-14 rounded-lg object-cover read-only:pointer-events-none"
                      />
                    ) : (
                      <div className="size-12 lg:size-14 bg-accent-primary rounded-lg flex items-center justify-center">
                        <Award className="size-4 lg:size-6 text-surface-secondary" />
                      </div>
                    )}
                    {!badge.isActive && (
                      <div className="absolute inset-0 bg-bg-secondary text-text-muted rounded-lg flex items-center justify-center">
                        <span className="text-surface-secondary text-xs font-medium">
                          Inactive
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 text-left flex-1">
                    <h3 className="font-semibold text-xl text-text-secondary truncate group-hover:text-text-primary transition-colors">
                      {badge.name}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <Badge
                        variant="default"
                        className={`text-xs ${rarityStyle.bg} ${rarityStyle.text} rounded border-0 capitalize`}
                      >
                        {badge.rarityLevel}
                      </Badge>
                      <Badge
                        className={`text-xs ${timeframeColor(badge?.criteria?.timeframe ? badge?.criteria?.timeframe : 'allTime')?.bg} ${timeframeColor(badge?.criteria?.timeframe ? badge?.criteria?.timeframe : 'allTime')?.text}   font-medium rounded py-1 px-2 capitalize`}
                      >
                        {badge?.criteria?.timeframe?.replace(/([A-Z])/g, ' $1')}
                      </Badge>
                    </div>
                  </div>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-text-muted line-clamp-2 mb-4">
                  {badge.description}
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  {statsCard.map((stat, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 bg-surface-secondary border border-border-color rounded-[4px] px-3 py-2 hover:bg-hover-overlay transition-all"
                    >
                      <stat.icon className={`size-4 ${stat.color}`} />
                      <span className="text-xs sm:text-sm text-text-primary font-medium">
                        {stat?.label}:
                      </span>
                      <span className="text-sm text-text-secondary">
                        {stat?.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Exclusive Access */}
              {badge?.rewardData?.specialPrivileges?.length !== 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-text-muted font-semibold">
                    <Key className="size-4 text-accent-warning" />
                    <span>Exclusive Perks</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {badge?.rewardData?.specialPrivileges?.map(
                      (privilege: string, i: number) => (
                        <div
                          key={i}
                          className="text-xs font-medium px-3 py-1 rounded bg-surface-primary border capitalize border-border-color text-text-secondary hover:text-text-muted transition-all"
                        >
                          {privilege
                            .replace(/_/g, ' ')
                            .replace(/([A-Z])/g, ' $1')
                            .toLowerCase()}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Unlock Condition */}
              <div className="relative mt-2 border border-border-color rounded bg-surface-secondary p-4 text-center">
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-surface-primary px-2 text-xs sm:text-sm text-accent-warning font-semibold">
                  Unlock Requirement
                </span>
                <div className="text-base font-semibold capitalize text-text-secondary mt-2">
                  {badge?.criteria?.value}
                  {conditionToSymbol(badge?.criteria?.condition)}{' '}
                  {badge?.criteria?.type.replace(/([A-Z])/g, ' $1')}
                </div>
                <div className="text-xs text-text-muted">
                  Complete to earn this badge
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-color">
                <Badge
                  variant="default"
                  className={`text-xs ${categoryColor(badge.category).bg} ${categoryColor(badge.category).text} py-1 rounded capitalize`}
                >
                  {badge.category}
                </Badge>
                <Badge className="text-xs bg-surface-secondary font-medium rounded py-1 px-2 capitalize text-text-secondary">
                  Updated {timeAgo(badge.updatedAt)}
                </Badge>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
