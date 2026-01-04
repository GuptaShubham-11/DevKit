import { useState } from 'react';
import { motion } from 'framer-motion';
import { timeAgo } from '@/lib/timeAgo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import EditBadgeDialog from './UpdateBadgeDialog';
import ViewBadgeDialog from './ViewBadgeDialog';
import { Card, CardContent } from '@/components/ui/card';
import { ConfirmPopup } from '@/components/ConfirmPopup';
import { Badge as SharedBadge } from '@/types/shared/badge';

import { useBadgeActions, useBadgeLoading } from '@/store/badge';

import {
  Edit,
  Award,
  Coins,
  Users,
  Trash2,
  MoreVertical,
  Trophy,
  View,
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { categoryColor, rarityColor } from '@/lib/small-utils/badge';
import { BadgeCardProps, MenuDropdownProps } from '@/types/small-types/badge';

export function BadgeCard({ badge }: BadgeCardProps) {
  const actions = useBadgeActions();
  const loading = useBadgeLoading();
  const rarityStyle = rarityColor(badge.rarityLevel);

  const [selectedBadge, setSelectedBadge] = useState<SharedBadge | null>(null);
  const [isViewBadgeDialogOpen, setIsViewBadgeDialogOpen] = useState(false);
  const [isEditBadgeDialogOpen, setIsEditBadgeDialogOpen] = useState(false);
  const [isDeleteConfirmPopupOpen, setIsDeleteConfirmPopupOpen] =
    useState(false);

  const ensureSelected = () => selectedBadge ?? badge;

  const handleEdit = () => {
    setSelectedBadge(badge);
    setIsEditBadgeDialogOpen(true);
  };

  const handleView = () => {
    setSelectedBadge(badge);
    setIsViewBadgeDialogOpen(true);
  };

  const handleDelete = () => {
    setSelectedBadge(badge);
    setIsDeleteConfirmPopupOpen(true);
  };

  const current = ensureSelected();

  return (
    <motion.div
      layoutId={badge._id}
      key={badge._id}
      transition={{ duration: 0.75, ease: 'easeInOut' }}
    >
      <Card className="group border-border-color bg-surface-primary transition-all">
        <CardContent className="border-border-color pl-6 pr-6">
          <div className="mb-2 flex items-start justify-between">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <div className="relative">
                {badge.badgeImage ? (
                  <img
                    src={badge.badgeImage}
                    alt={badge.name}
                    className="size-12 rounded-lg object-cover lg:size-14"
                  />
                ) : (
                  <div className="flex size-12 items-center justify-center rounded-lg bg-accent-primary lg:size-14">
                    <Award className="h-6 w-6 text-white lg:h-7 lg:w-7" />
                  </div>
                )}
                {!badge.isActive && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-bg-secondary text-text-muted">
                    <span className="text-xs font-medium text-white">
                      Inactive
                    </span>
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="truncate font-semibold text-text-secondary transition-colors group-hover:text-text-primary">
                  {badge.name}
                </h3>
                <div className="mt-1 flex flex-wrap gap-2">
                  <Badge
                    variant="secondary"
                    className={`rounded border-0 text-xs capitalize ${rarityStyle.bg} ${rarityStyle.text}`}
                  >
                    {badge.rarityLevel}
                  </Badge>
                </div>
              </div>
            </div>

            <MenuDropdown
              handleEdit={handleEdit}
              handleView={handleView}
              handleDelete={handleDelete}
            />
          </div>

          {/* Description */}
          <p className="mb-4 line-clamp-2 text-sm text-text-muted">
            {badge.description}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 text-center text-sm">
            <div>
              <div className="text-xl font-bold text-text-primary">0</div>
              <div className="flex items-center justify-center gap-1 text-xs text-text-muted">
                <Users size={14} className="text-emerald-600" />
                Earned
              </div>
            </div>
            <div>
              <div className="text-xl font-bold text-text-primary">
                {badge.pointsRequired || 0}
              </div>
              <div className="flex items-center justify-center gap-1 text-xs text-text-muted">
                <Coins size={14} className="text-[#2454FF]" />
                Points
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 flex items-center justify-end gap-2 border-t border-border-color pt-3">
            <Badge
              variant="default"
              className={`rounded py-1 text-xs capitalize ${
                categoryColor(badge.category).bg
              } ${categoryColor(badge.category).text}`}
            >
              {badge.category}
            </Badge>
            <Badge className="cursor-pointer rounded bg-surface-secondary px-2 py-1 text-xs font-medium capitalize text-text-secondary">
              {timeAgo(badge.createdAt)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Edit dialog */}
      <EditBadgeDialog
        open={isEditBadgeDialogOpen}
        onOpenChange={setIsEditBadgeDialogOpen}
        badge={selectedBadge}
      />

      {/* View dialog */}
      <ViewBadgeDialog
        badge={current}
        open={isViewBadgeDialogOpen}
        onOpenChange={setIsViewBadgeDialogOpen}
      />

      {/* Delete confirm */}
      <ConfirmPopup
        open={isDeleteConfirmPopupOpen}
        onOpenChange={setIsDeleteConfirmPopupOpen}
        title="Delete badge"
        subtitle="Are you sure you want to delete this badge?"
        confirmationType="type-name"
        buttonLabels={{ confirm: 'Delete', cancel: 'Cancel' }}
        item={{
          id: current._id,
          name: current.name,
          affectedUsers: 0,
          description: current.description,
          image: current.badgeImage,
          isActive: current.isActive,
          type: 'badge',
        }}
        dangerLevel="high"
        variant="destructive"
        showImpactWarning
        key={current._id}
        onConfirm={() => actions.deleteBadge(current._id)}
        loading={loading.deleting}
      />
    </motion.div>
  );
}

const MenuDropdown = ({
  handleEdit,
  handleView,
  handleDelete,
}: MenuDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-6 cursor-pointer rounded text-text-muted transition-opacity hover:bg-hover-overlay hover:text-text-primary"
        >
          <MoreVertical size={14} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-32 rounded border border-border-color bg-surface-primary p-1 shadow-xl"
      >
        <DropdownMenuItem
          className="cursor-pointer rounded text-text-secondary focus:bg-hover-overlay focus:text-text-primary"
          onClick={handleEdit}
        >
          <Edit className="size-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer rounded text-text-secondary focus:bg-hover-overlay focus:text-text-primary">
          <Trophy className="size-4" />
          Award
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleView}
          className="cursor-pointer rounded text-text-secondary focus:bg-hover-overlay focus:text-text-primary"
        >
          <View className="size-4" />
          View
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-border-color" />
        <DropdownMenuItem
          onClick={handleDelete}
          className="cursor-pointer rounded text-red-500 focus:bg-red-500/10 focus:text-red-500"
        >
          <Trash2 className="size-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
