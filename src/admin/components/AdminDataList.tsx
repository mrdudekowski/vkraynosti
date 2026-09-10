import type { ReactNode } from 'react';

export type AdminDataListItem = {
  id: string;
  title: ReactNode;
  status?: ReactNode;
  meta?: ReactNode;
  action?: ReactNode;
  label?: string;
  onActivate?: () => void;
};

type AdminDataListProps = {
  titleHeader: string;
  statusHeader?: string;
  metaHeader?: string;
  items: AdminDataListItem[];
  stickyHeader?: boolean;
};

const AdminDataList = ({
  titleHeader,
  statusHeader,
  metaHeader,
  items,
  stickyHeader = false,
}: AdminDataListProps) => (
  <div>
    <div
      className={`mb-2 hidden grid-cols-[minmax(0,1.4fr)_auto_minmax(0,1fr)_auto] gap-3 px-1 text-xs font-medium text-text-muted admin-desktop:grid ${
        stickyHeader ? 'sticky top-0 z-stack-base bg-surface-light py-2' : ''
      }`}
    >
      <span>{titleHeader}</span>
      <span>{statusHeader ?? ''}</span>
      <span>{metaHeader ?? ''}</span>
      <span />
    </div>
    <ul className="flex flex-col gap-2 admin-desktop:gap-0">
      {items.map((item) => {
        const cells = (
          <>
            <div className="min-w-0 font-medium text-text-primary">{item.title}</div>
            {item.status != null ? (
              <div className="mt-1 admin-desktop:mt-0">{item.status}</div>
            ) : (
              <span className="hidden admin-desktop:block" />
            )}
            {item.meta != null ? (
              <div className="mt-1 text-sm text-text-muted admin-desktop:mt-0">{item.meta}</div>
            ) : (
              <span className="hidden admin-desktop:block" />
            )}
          </>
        );

        if (item.onActivate != null) {
          return (
            <li key={item.id}>
              <div className="flex items-stretch gap-1">
                <button
                  type="button"
                  aria-label={item.label}
                  onClick={item.onActivate}
                  className="admin-data-row min-w-0 flex-1 cursor-pointer text-left"
                >
                  {cells}
                  {item.action == null ? <span /> : null}
                </button>
                {item.action != null ? (
                  <div className="flex items-center self-center">{item.action}</div>
                ) : null}
              </div>
            </li>
          );
        }

        return (
          <li key={item.id}>
            <div className="admin-data-row">
              {cells}
              {item.action != null ? <div className="mt-2 admin-desktop:mt-0">{item.action}</div> : <span />}
            </div>
          </li>
        );
      })}
    </ul>
  </div>
);

export default AdminDataList;
