import type { LucideIcon } from 'lucide-react';

type AdminIconProps = {
  icon: LucideIcon;
  size?: 16 | 20 | 24;
  className?: string;
};

const AdminIcon = ({ icon: Icon, size = 20, className }: AdminIconProps) => (
  <Icon size={size} strokeWidth={1.75} className={className} aria-hidden />
);

export default AdminIcon;
