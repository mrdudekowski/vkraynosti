import { useEffect, useState } from 'react';
import {
  CRM_CONTACT_FOLDERS,
  CRM_DEAL_STATUSES,
  CRM_MESSENGERS,
  dealsForPerson,
  isBuiltInContactFolder,
  type CrmDeal,
  type CrmDealStatus,
  type CrmFile,
  type CrmMessenger,
  type CrmPerson,
} from '../../crm/crmDocument';
import { crmCallHref, crmMessengerHref } from '../../crm/crmMessengerHref';
import {
  adminAddCrmTouch,
  adminCreateCrmDeal,
  adminListTours,
  adminUpdateCrmDeal,
  adminUpdateCrmPerson,
  type AdminTourListItem,
} from '../api';
import { ADMIN_UI } from '../constants/ui';
import { crmDealStatusTone } from '../crmAppearance';
import AdminAlert from './AdminAlert';
import AdminBadge from './AdminBadge';
import AdminButton from './AdminButton';
import { AdminTextInput } from './AdminFields';
import AdminSelect from './AdminSelect';

type CrmPersonPanelProps = {
  file: CrmFile;
  person: CrmPerson;
  onFile: (file: CrmFile) => void;
  onBack: () => void;
};

function folderLabel(folder: string): string {
  return isBuiltInContactFolder(folder) ? ADMIN_UI.crmFolders[folder] : folder;
}

const CrmPersonPanel = ({ file, person, onFile, onBack }: CrmPersonPanelProps) => {
  const [name, setName] = useState(person.name);
  const [phone, setPhone] = useState(person.phone);
  const [messenger, setMessenger] = useState(person.messenger);
  const [handle, setHandle] = useState(person.messengerHandle);
  const [note, setNote] = useState(person.note);
  const [folder, setFolder] = useState(person.folder ?? '');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [addingDeal, setAddingDeal] = useState(false);
  const [tours, setTours] = useState<AdminTourListItem[] | null>(null);
  const [newTourId, setNewTourId] = useState('');
  const [newDate, setNewDate] = useState('');

  useEffect(() => {
    setName(person.name);
    setPhone(person.phone);
    setMessenger(person.messenger);
    setHandle(person.messengerHandle);
    setNote(person.note);
    setFolder(person.folder ?? '');
  }, [person]);

  const deals = dealsForPerson(file, person.id);
  const chatHref = crmMessengerHref(messenger, phone, handle);
  const callHref = crmCallHref(phone);

  const fail = (caught: unknown) => {
    setError(
      caught instanceof Error && caught.message === 'rev_conflict'
        ? ADMIN_UI.crmConflict
        : ADMIN_UI.crmError,
    );
  };

  const savePerson = async () => {
    setBusy(true);
    setError(null);
    try {
      onFile(
        await adminUpdateCrmPerson(person.id, file.rev, {
          name: name.trim(),
          phone: phone.trim(),
          messenger,
          messengerHandle: handle.trim(),
          note,
          folder: folder.trim().length > 0 ? folder.trim() : null,
        }),
      );
    } catch (caught) {
      fail(caught);
    } finally {
      setBusy(false);
    }
  };

  const patchDeal = async (dealId: string, patch: Parameters<typeof adminUpdateCrmDeal>[2]) => {
    setBusy(true);
    setError(null);
    try {
      onFile(await adminUpdateCrmDeal(dealId, file.rev, patch));
    } catch (caught) {
      fail(caught);
    } finally {
      setBusy(false);
    }
  };

  const addTouch = async (dealId: string, kind: 'called' | 'wrote') => {
    setBusy(true);
    setError(null);
    try {
      onFile(await adminAddCrmTouch(dealId, file.rev, kind));
    } catch (caught) {
      fail(caught);
    } finally {
      setBusy(false);
    }
  };

  const startAddDeal = () => {
    setAddingDeal(true);
    if (tours == null) {
      void adminListTours()
        .then(setTours)
        .catch(() => setTours([]));
    }
  };

  const submitDeal = async () => {
    const tour = (tours ?? []).find((item) => item.id === newTourId);
    if (tour == null || newDate.length === 0) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      onFile(
        await adminCreateCrmDeal(person.id, file.rev, {
          tourId: tour.id,
          tourTitle: tour.title,
          date: newDate,
        }),
      );
      setAddingDeal(false);
      setNewTourId('');
      setNewDate('');
    } catch (caught) {
      fail(caught);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="flex flex-col gap-4">
      <AdminButton type="button" variant="ghost" className="lg:hidden self-start" onClick={onBack}>
        {ADMIN_UI.crmBackToList}
      </AdminButton>
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="min-w-0 truncate text-lg font-semibold text-text-primary">{person.name}</h2>
        {person.folder != null ? <AdminBadge>{folderLabel(person.folder)}</AdminBadge> : null}
        <a className="admin-btn-ghost no-underline" href={callHref}>
          {ADMIN_UI.crmCall}
        </a>
        {chatHref != null ? (
          <a className="admin-btn-ghost no-underline" href={chatHref} target="_blank" rel="noreferrer">
            {ADMIN_UI.crmOpenChat}
          </a>
        ) : null}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-text-primary">{ADMIN_UI.crmName}</span>
          <AdminTextInput value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-text-primary">{ADMIN_UI.crmPhone}</span>
          <AdminTextInput type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} />
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
        <label className="flex flex-col gap-1 sm:col-span-2">
          <span className="text-sm font-medium text-text-primary">{ADMIN_UI.crmNote}</span>
          <AdminTextInput value={note} onChange={(event) => setNote(event.target.value)} />
        </label>
        <label className="flex flex-col gap-1 sm:col-span-2">
          <span className="text-sm font-medium text-text-primary">{ADMIN_UI.crmFolder}</span>
          <AdminSelect value={folder} onChange={(event) => setFolder(event.target.value)}>
            <option value="">{ADMIN_UI.crmFolderNone}</option>
            {CRM_CONTACT_FOLDERS.map((item) => (
              <option key={item} value={item}>
                {ADMIN_UI.crmFolders[item]}
              </option>
            ))}
            {file.folders.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </AdminSelect>
        </label>
      </div>
      <AdminButton type="button" variant="secondary" disabled={busy} onClick={() => void savePerson()}>
        {ADMIN_UI.crmSavePerson}
      </AdminButton>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-text-primary">{ADMIN_UI.crmDeals}</h3>
        <AdminButton type="button" variant="ghost" onClick={startAddDeal}>
          {ADMIN_UI.crmAddDeal}
        </AdminButton>
      </div>
      {addingDeal ? (
        <div className="flex flex-col gap-2 border-t border-divider pt-3">
          <AdminSelect value={newTourId} onChange={(event) => setNewTourId(event.target.value)}>
            <option value="">{ADMIN_UI.crmTour}</option>
            {(tours ?? []).map((tour) => (
              <option key={tour.id} value={tour.id}>
                {tour.title}
              </option>
            ))}
          </AdminSelect>
          <AdminTextInput type="date" value={newDate} onChange={(event) => setNewDate(event.target.value)} />
          <AdminButton type="button" disabled={busy} onClick={() => void submitDeal()}>
            {ADMIN_UI.crmAddDeal}
          </AdminButton>
        </div>
      ) : null}
      <ul className="flex flex-col">
        {deals.map((deal) => (
          <DealEditor
            key={deal.id}
            deal={deal}
            disabled={busy}
            onPatch={(patch) => void patchDeal(deal.id, patch)}
            onTouch={(kind) => void addTouch(deal.id, kind)}
          />
        ))}
      </ul>
      {error != null ? <AdminAlert tone="danger">{error}</AdminAlert> : null}
    </section>
  );
};

type DealEditorProps = {
  deal: CrmDeal;
  disabled: boolean;
  onPatch: (patch: Parameters<typeof adminUpdateCrmDeal>[2]) => void;
  onTouch: (kind: 'called' | 'wrote') => void;
};

const DealEditor = ({ deal, disabled, onPatch, onTouch }: DealEditorProps) => (
  <li className="flex flex-col gap-2 border-b border-divider py-3 last:border-b-0">
    <div className="flex flex-wrap items-center gap-2">
      <p className="min-w-0 font-medium text-text-primary">
        {deal.tourTitle}
        <span className="ml-2 text-sm text-text-muted">{deal.date}</span>
      </p>
      <AdminBadge tone={crmDealStatusTone(deal.status)}>
        {ADMIN_UI.crmStatuses[deal.status]}
      </AdminBadge>
    </div>
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-text-primary">{ADMIN_UI.crmStatus}</span>
      <AdminSelect
        value={deal.status}
        disabled={disabled}
        onChange={(event) => onPatch({ status: event.target.value as CrmDealStatus })}
      >
        {CRM_DEAL_STATUSES.map((status) => (
          <option key={status} value={status}>
            {ADMIN_UI.crmStatuses[status]}
          </option>
        ))}
      </AdminSelect>
    </label>
    <label className="flex min-h-11 items-center gap-2">
      <input
        type="checkbox"
        checked={deal.paid}
        disabled={disabled}
        onChange={(event) => onPatch({ paid: event.target.checked })}
      />
      <span className="text-sm text-text-primary">{ADMIN_UI.crmPaid}</span>
    </label>
    <label className="flex min-h-11 items-center gap-2">
      <input
        type="checkbox"
        checked={deal.doubts}
        disabled={disabled}
        onChange={(event) => onPatch({ doubts: event.target.checked })}
      />
      <span className="text-sm text-text-primary">{ADMIN_UI.crmDoubts}</span>
    </label>
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-text-primary">{ADMIN_UI.crmPauseReason}</span>
      <AdminTextInput
        defaultValue={deal.pauseReason}
        disabled={disabled}
        onBlur={(event) => {
          if (event.target.value !== deal.pauseReason) {
            onPatch({ pauseReason: event.target.value });
          }
        }}
      />
    </label>
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-text-primary">{ADMIN_UI.crmComment}</span>
      <AdminTextInput
        defaultValue={deal.comment}
        disabled={disabled}
        onBlur={(event) => {
          if (event.target.value !== deal.comment) {
            onPatch({ comment: event.target.value });
          }
        }}
      />
    </label>
    <div className="grid gap-2 sm:grid-cols-2">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-text-primary">{ADMIN_UI.crmNextStep}</span>
        <AdminTextInput
          defaultValue={deal.nextStep}
          disabled={disabled}
          onBlur={(event) => {
            if (event.target.value !== deal.nextStep) {
              onPatch({ nextStep: event.target.value });
            }
          }}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-text-primary">{ADMIN_UI.crmNextStepAt}</span>
        <AdminTextInput
          type="date"
          value={deal.nextStepAt ?? ''}
          disabled={disabled}
          onChange={(event) =>
            onPatch({ nextStepAt: event.target.value.length > 0 ? event.target.value : null })
          }
        />
      </label>
    </div>
    <div className="flex flex-wrap gap-2">
      <AdminButton type="button" variant="ghost" disabled={disabled} onClick={() => onTouch('called')}>
        {ADMIN_UI.crmCalled}
      </AdminButton>
      <AdminButton type="button" variant="ghost" disabled={disabled} onClick={() => onTouch('wrote')}>
        {ADMIN_UI.crmWrote}
      </AdminButton>
    </div>
  </li>
);

export default CrmPersonPanel;
