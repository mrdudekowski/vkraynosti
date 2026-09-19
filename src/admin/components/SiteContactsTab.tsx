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
import AdminEditorSurface from './AdminEditorSurface';
import AdminEmptyState from './AdminEmptyState';
import { AdminFieldLabel, AdminTextInput } from './AdminFields';
import AdminIconButton from './AdminIconButton';
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
      className="flex flex-col gap-3"
    >
      <AdminEditorSurface
        icon={ContactRound}
        title={ADMIN_UI.siteTabContacts}
        hint={ADMIN_UI.siteContactsHint}
      >
        <label className="inline-flex min-h-11 items-center gap-2 text-sm text-text-primary">
          <input
            type="checkbox"
            checked={value.sectionVisible}
            onChange={(event) => onChange({ ...value, sectionVisible: event.target.checked })}
          />
          <span>{ADMIN_UI.siteShowSection}</span>
        </label>
        {channels.length === 0 ? (
          <AdminEmptyState
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
          <ul className="flex flex-col gap-2">
            {channels.map((channel, index) => (
              <li
                key={channel.id}
                className="admin-editor-row flex-wrap items-end gap-2 p-2 admin-desktop:flex-nowrap"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-1 basis-full sm:basis-40">
                  <AdminFieldLabel htmlFor={`${channel.id}-type`}>
                    {ADMIN_UI.siteChannelType}
                  </AdminFieldLabel>
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
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-1 basis-full sm:basis-40">
                  <AdminFieldLabel htmlFor={`${channel.id}-label`}>
                    {ADMIN_UI.siteChannelLabel}
                  </AdminFieldLabel>
                  <AdminTextInput
                    id={`${channel.id}-label`}
                    value={channel.label}
                    onChange={(event) => patchChannel(channel.id, { label: event.target.value })}
                  />
                </div>
                <div className="flex min-w-0 flex-[1.4] flex-col gap-1 basis-full sm:basis-56">
                  <AdminFieldLabel htmlFor={`${channel.id}-href`}>
                    {ADMIN_UI.siteChannelHref}
                  </AdminFieldLabel>
                  <AdminTextInput
                    id={`${channel.id}-href`}
                    inputMode={siteChannelInputMode(channel.type)}
                    value={channel.href}
                    onChange={(event) => patchChannel(channel.id, { href: event.target.value })}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  <label className="inline-flex min-h-11 items-center gap-2 text-sm text-text-primary">
                    <input
                      type="checkbox"
                      aria-label={ADMIN_UI.siteShowChannel(channel.label)}
                      checked={channel.visible}
                      onChange={(event) =>
                        patchChannel(channel.id, { visible: event.target.checked })
                      }
                    />
                    <span>{ADMIN_UI.siteShowRow}</span>
                  </label>
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
      </AdminEditorSurface>
    </section>
  );
};

export default SiteContactsTab;
