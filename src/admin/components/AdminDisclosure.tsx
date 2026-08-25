import { useState, type ReactNode, type SyntheticEvent } from 'react';

type AdminDisclosureProps = {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
};

const AdminDisclosure = ({ title, defaultOpen = false, children }: AdminDisclosureProps) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <details
      className="rounded-card border border-divider bg-surface-light p-3"
      open={open}
      onToggle={(event: SyntheticEvent<HTMLDetailsElement>) => {
        setOpen(event.currentTarget.open);
      }}
    >
      <summary className="min-h-11 cursor-pointer list-none text-sm font-semibold text-text-primary">
        {title}
      </summary>
      <div className="mt-3 flex flex-col gap-3">{children}</div>
    </details>
  );
};

export default AdminDisclosure;
