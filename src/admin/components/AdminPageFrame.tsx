import type { ReactNode } from 'react';

export type AdminPageFrameVariant = 'compact' | 'content' | 'wide' | 'fluid';

type AdminPageFrameProps = {
  variant?: AdminPageFrameVariant;
  density?: 'default' | 'compact';
  className?: string;
  children: ReactNode;
};

const FRAME_CLASS: Record<AdminPageFrameVariant, string> = {
  compact: 'max-w-admin-compact',
  content: 'max-w-admin-content',
  wide: 'max-w-admin-wide',
  fluid: 'max-w-none',
};

const DENSITY_CLASS: Record<NonNullable<AdminPageFrameProps['density']>, string> = {
  default: 'gap-6 py-6',
  compact: 'gap-3 py-3',
};

const AdminPageFrame = ({
  variant = 'content',
  density = 'default',
  className,
  children,
}: AdminPageFrameProps) => (
  <div
    className={`mx-auto flex w-full flex-col ${DENSITY_CLASS[density]} ${FRAME_CLASS[variant]} px-4 md:px-6 ${className ?? ''}`.trim()}
  >
    {children}
  </div>
);

export default AdminPageFrame;
