import { useEffect, useState, type FormEvent } from 'react';
import {
  CRM_CONTACT_FOLDERS,
  CRM_MESSENGERS,
  type CrmMessenger,
} from '../../crm/crmDocument';
import {
  adminCreateCrmPerson,
  adminListTours,
  type AdminCrmDealDraft,
  type AdminTourListItem,
} from '../api';
import { ADMIN_UI } from '../constants/ui';
import AdminAlert from './AdminAlert';
import AdminButton from './AdminButton';
import AdminDialog from './AdminDialog';
import { AdminTextInput } from './AdminFields';
import AdminSelect from './AdminSelect';

type CreateKind = 'lead' | 'contact';

type CrmCreateModalProps = {
  rev: number;
  onClose: () => void;
  onCreated: (personId: string) => void;
};

const CrmCreateModal = ({ rev, onClose, onCreated }: CrmCreateModalProps) => {
  const [kind, setKind] = useState<CreateKind>('lead');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [messenger, setMessenger] = useState<CrmMessenger>('telegram');
  const [handle, setHandle] = useState('');
  const [folder, setFolder] = useState<string>('tour_bases');
  const [customFolder, setCustomFolder] = useState('');
  const [tourId, setTourId] = useState('');
  const [date, setDate] = useState('');
  const [comment, setComment] = useState('');
  const [tours, setTours] = useState<AdminTourListItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void adminListTours()
      .then(setTours)
      .catch(() => setTours([]));
  }, []);

  const selectedTour = tours.find((tour) => tour.id === tourId);
  const resolvedFolder = folder === '__custom__' ? customFolder.trim() : folder;

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      let deal: AdminCrmDealDraft | undefined;
      if (kind === 'lead') {
        if (selectedTour == null || date.length === 0) {
          setError(ADMIN_UI.crmError);
          return;
        }
        deal = {
          tourId: selectedTour.id,
          tourTitle: selectedTour.title,
          date,
          comment,
        };
      }
      const created = await adminCreateCrmPerson(
        rev,
        {
          name: name.trim(),
          phone: phone.trim(),
          messenger,
          messengerHandle: handle.trim(),
          folder: kind === 'contact' ? resolvedFolder : null,
        },
        deal,
      );
      onCreated(created.personId);
    } catch (caught) {
      setError(
        caught instanceof Error && caught.message === 'rev_conflict'
          ? ADMIN_UI.crmConflict
          : ADMIN_UI.crmError,
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminDialog
      title={ADMIN_UI.crmAddTitle}
      titleId="admin-crm-create-heading"
      closeLabel={ADMIN_UI.cancel}
      onClose={onClose}
      initialFocusId="admin-crm-name"
    >
      <form className="flex flex-col gap-3" onSubmit={(event) => void onSubmit(event)}>
        <div className="flex gap-2">
          <AdminButton
            type="button"
            variant={kind === 'lead' ? 'primary' : 'secondary'}
            onClick={() => setKind('lead')}
          >
            {ADMIN_UI.crmKindLead}
          </AdminButton>
          <AdminButton
            type="button"
            variant={kind === 'contact' ? 'primary' : 'secondary'}
            onClick={() => setKind('contact')}
          >
            {ADMIN_UI.crmKindContact}
          </AdminButton>
        </div>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-text-primary">{ADMIN_UI.crmName}</span>
          <AdminTextInput
            id="admin-crm-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-text-primary">{ADMIN_UI.crmPhone}</span>
          <AdminTextInput
            id="admin-crm-phone"
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            required
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-text-primary">{ADMIN_UI.crmMessenger}</span>
          <AdminSelect
            value={messenger}
            onChange={(event) => setMessenger(event.target.value as CrmMessenger)}
          >
            {CRM_MESSENGERS.map((item) => (
              <option key={item} value={item}>
                {ADMIN_UI.crmMessengers[item]}
              </option>
            ))}
          </AdminSelect>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-text-primary">{ADMIN_UI.crmHandle}</span>
          <AdminTextInput value={handle} onChange={(event) => setHandle(event.target.value)} />
        </label>
        {kind === 'contact' ? (
          <>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-text-primary">{ADMIN_UI.crmFolder}</span>
              <AdminSelect value={folder} onChange={(event) => setFolder(event.target.value)}>
                {CRM_CONTACT_FOLDERS.map((item) => (
                  <option key={item} value={item}>
                    {ADMIN_UI.crmFolders[item]}
                  </option>
                ))}
                <option value="__custom__">{ADMIN_UI.crmFolderCustom}</option>
              </AdminSelect>
            </label>
            {folder === '__custom__' ? (
              <AdminTextInput
                value={customFolder}
                onChange={(event) => setCustomFolder(event.target.value)}
                required
              />
            ) : null}
          </>
        ) : (
          <>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-text-primary">{ADMIN_UI.crmTour}</span>
              <AdminSelect
                value={tourId}
                onChange={(event) => setTourId(event.target.value)}
                required
              >
                <option value="">{ADMIN_UI.crmTour}</option>
                {tours.map((tour) => (
                  <option key={tour.id} value={tour.id}>
                    {tour.title}
                  </option>
                ))}
              </AdminSelect>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-text-primary">{ADMIN_UI.crmDate}</span>
              <AdminTextInput
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                required
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-text-primary">{ADMIN_UI.crmComment}</span>
              <AdminTextInput value={comment} onChange={(event) => setComment(event.target.value)} />
            </label>
          </>
        )}
        {error != null ? <AdminAlert tone="danger">{error}</AdminAlert> : null}
        <div className="flex flex-wrap gap-2">
          <AdminButton
            type="submit"
            disabled={
              busy ||
              name.trim().length === 0 ||
              phone.trim().length === 0 ||
              (kind === 'contact' && resolvedFolder.length === 0)
            }
          >
            {ADMIN_UI.crmAdd}
          </AdminButton>
          <AdminButton type="button" variant="secondary" onClick={onClose} disabled={busy}>
            {ADMIN_UI.cancel}
          </AdminButton>
        </div>
      </form>
    </AdminDialog>
  );
};

export default CrmCreateModal;
