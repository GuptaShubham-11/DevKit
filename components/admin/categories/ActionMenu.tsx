import { Button } from '@/components/ui/button';
import { ActionMenuProps } from '@/types/small-types/category';
import { motion } from 'framer-motion';
import { Edit, MoreVertical, Trash2 } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const ActionMenu = ({
  category,
  onUpdate,
  onDelete,
}: ActionMenuProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <motion.div whileTap={{ scale: 0.95 }}>
        <Button
          variant="ghost"
          size="icon"
          className="size-6 rounded transition-all hover:bg-hover-overlay hover:text-text-primary text-text-muted"
        >
          <MoreVertical size={16} />
        </Button>
      </motion.div>
    </DropdownMenuTrigger>
    <DropdownMenuContent
      align="end"
      className="border-border-color bg-surface-primary rounded shadow-xl"
    >
      <DropdownMenuItem
        onClick={() => onUpdate(category)}
        className="cursor-pointer rounded text-text-secondary focus:bg-hover-overlay focus:text-text-primary"
      >
        <Edit className="size-4" />
        Edit
      </DropdownMenuItem>
      <DropdownMenuSeparator className="bg-border-color/30" />
      <DropdownMenuItem
        onClick={() => onDelete(category)}
        className="cursor-pointer rounded text-text-secondary focus:bg-red-500/10 focus:text-red-500"
      >
        <Trash2 className="size-4 text-red-500" />
        Delete
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);
