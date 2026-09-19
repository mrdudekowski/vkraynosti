import { ChevronDown, ChevronUp, ContactRound, Plus, Trash2 } from 'lucide-react';
import type { ContactsContentDocument, SiteContactChannel } from '../../cms/siteContentDocument';
import { ADMIN_UI } from '../constants/ui';
import {
  SITE_CHANNEL_TYPES,
  isSiteChannelType,
  siteChannelInputMode,
  siteChannelPresetIcon,
  siteChannelTypeLabel,
} from '../siteChannelVisual';
import { moveOrdered, withOrder } from '../siteContentOrder';
import { useAdminToast } from '../toast/adminToastContext';
import { pushAdminUndo } from '../toast/pushAdminUndo';
import AdminButton from './AdminButton';
import AdminEmptyState from './AdminEmptyState';
import { AdminTextInput } from './AdminFields';
import AdminIconButton from './AdminIconButton';
import { AdminOnSiteToggle } from './AdminOnSiteStatus';
import AdminSelect from './AdminSelect';

type SiteContactsTabProps = {
  value: ContactsContentDocument;
  onChange: (value: ContactsContentDocument) => void;
};

const emptyChannel = (order: number): SiteContactChannel => ({
  id: `channel-${Date.now()}`,
  label: ADMIN_UI.siteNewChannelLabel,
  href: 'https://',
  type: 'link',
  icon: siteChannelPresetIcon('link'),
  visible: true,
  order,
});

const CHANNEL_ROW_CLASS =
  'flex flex-col gap-2 rounded-admin-control border border-divider bg-surface-light p-3 admin-desktop:grid admin-desktop:grid-cols-[8rem_minmax(0,1fr)_minmax(0,1.3fr)_auto_auto] admin-desktop:items-center admin-desktop:gap-2 admin-desktop:border-0 admin-desktop:bg-transparent admin-desktop:p-1';

const SiteContactsTab = ({ value, onChange }: SiteContactsTabProps) => {
  const { push } = useAdminToast();
  const channels = [...value.channels].sort((left, right) => left.order - right.order);

  const replace = (nextChannels: SiteContactChannel[], message?: string) => {
    const previous = value.channels;
    onChange({ ...value, channels: nextChannels });
    if (message != null) {
      pushAdminUndo(push, message, () => onChange({ ...value, channels: previous }));
    }
  };

  const patchChannel = (channelId: string, patch: Partial<SiteContactChannel>) => {
    onChange({
      ...value,
      channels: value.channels.map((channel) =>
        channel.id === channelId ? { ...channel, ...patch } : channel,
      ),
    });
  };

  return (
    <section
      id="admin-panel-contacts"
      role="tabpanel"
      aria-labelledby="admin-tab-contacts"
      className="flex flex-col gap-5"
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <p className="text-sm text-text-muted">{ADMIN_UI.siteContactsHint}</p>
        <AdminOnSiteToggle
          visible={value.sectionVisible}
          label={ADMIN_UI.siteShowSection}
          onChange={(sectionVisible) => onChange({ ...value, sectionVisible })}
        />
      </header>
      {channels.length === 0 ? (
        <AdminEmptyState
          icon={ContactRound}
          title={ADMIN_UI.siteContactsEmpty}
          description={ADMIN_UI.siteContactsEmptyHint}
          action={
            <AdminButton
              variant="secondary"
              onClick={() => replace([...value.channels, emptyChannel(value.channels.length)])}
            >
              <Plus className="mr-2" size={16} strokeWidth={1.75} aria-hidden />
              {ADMIN_UI.siteAddChannel}
            </AdminButton>
          }
        />
      ) : (
        <div>
          <div className="mb-1 hidden grid-cols-[8rem_minmax(0,1fr)_minmax(0,1.3fr)_auto_auto] gap-2 px-1 text-xs font-medium text-text-muted admin-desktop:grid">
            <span>{ADMIN_UI.siteChannelType}</span>
            <span>{ADMIN_UI.siteChannelLabel}</span>
            <span>{ADMIN_UI.siteChannelHref}</span>
            <span />
            <span />
          </div>
          <ul className="flex flex-col gap-2 admin-desktop:gap-0">
            {channels.map((channel, index) => (
              <li key={channel.id} className={CHANNEL_ROW_CLASS}>
                <AdminSelect
                  id={`${channel.id}-type`}
                  aria-label={ADMIN_UI.siteChannelType}
                  value={channel.type}
                  onChange={(event) => {
                    const type = event.target.value;
                    patchChannel(channel.id, { type, icon: siteChannelPresetIcon(type) });
                  }}
                >
                  {SITE_CHANNEL_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {siteChannelTypeLabel(type)}
                    </option>
                  ))}
                  {isSiteChannelType(channel.type) ? null : (
                    <option value={channel.type}>{channel.type}</option>
                  )}
                </AdminSelect>
                <AdminTextInput
                  id={`${channel.id}-label`}
                  aria-label={ADMIN_UI.siteChannelLabel}
                  value={channel.label}
                  onChange={(event) => patchChannel(channel.id, { label: event.target.value })}
                />
                <AdminTextInput
                  id={`${channel.id}-href`}
                  aria-label={ADMIN_UI.siteChannelHref}
                  inputMode={siteChannelInputMode(channel.type)}
                  value={channel.href}
                  onChange={(event) => patchChannel(channel.id, { href: event.target.value })}
                />
                <AdminOnSiteToggle
                  visible={channel.visible}
                  label={ADMIN_UI.siteShowChannel(channel.label)}
                  onChange={(visible) => patchChannel(channel.id, { visible })}
                />
                <div className="flex flex-wrap items-center gap-1">
                  <AdminIconButton
                    icon={ChevronUp}
                    label={ADMIN_UI.moveUp}
                    disabled={index === 0}
                    onClick={() => replace(moveOrdered(channels, index, -1))}
                  />
                  <AdminIconButton
                    icon={ChevronDown}
                    label={ADMIN_UI.moveDown}
                    disabled={index === channels.length - 1}
                    onClick={() => replace(moveOrdered(channels, index, 1))}
                  />
                  <AdminIconButton
                    icon={Trash2}
                    label={ADMIN_UI.removeItem}
                    danger
                    onClick={() =>
                      replace(
                        withOrder(channels.filter((item) => item.id !== channel.id)),
                        ADMIN_UI.listItemRemoved,
                      )
                    }
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      {channels.length > 0 ? (
        <AdminButton
          variant="secondary"
          className="self-start"
          onClick={() => replace([...value.channels, emptyChannel(value.channels.length)])}
        >
          <Plus className="mr-2" size={16} strokeWidth={1.75} aria-hidden />
          {ADMIN_UI.siteAddChannel}
        </AdminButton>
      ) : null}
    </section>
  );
};

export default SiteContactsTab;
