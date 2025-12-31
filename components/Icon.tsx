import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type Props = {
  name: string;
  className?: string;
  style?: React.CSSProperties;
};

export default function Icon({ name, className, style }: Props) {
  const LucideIcon = Icons[name as keyof typeof Icons] as
    | LucideIcon
    | undefined;

  if (!LucideIcon) {
    return <Icons.HelpCircle style={style} className={className} />;
  }

  return <LucideIcon style={style} className={className} />;
}
