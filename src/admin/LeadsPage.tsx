import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  CRM_LIST_VIEWS,
  isBuiltInContactFolder,
  listContactPeople,
  listDealRows,
  searchDealRows,
  searchPeople,
  type CrmFile,
  type CrmListView,
} from '../crm/crmDocument';
import { adminAddCrmTouch, adminGetCrm, adminUpdateCrmDeal } from './api';
import CrmCreateModal from './components/CrmCreateModal';
import CrmPersonPanel from './components/CrmPersonPanel';
import AdminAlert from './components/AdminAlert';
import AdminBadge from './components/AdminBadge';
import AdminButton from './components/AdminButton';
import AdminEmptyState from './components/AdminEmptyState';
import { AdminTextInput } from './components/AdminFields';
import AdminPageHeader from './components/AdminPageHeader';
import { ADMIN_UI } from './constants/ui';
import { crmDealStatusTone } from './crmAppearance';

function folderLabel(folder: string): string {
  return isBuiltInContactFolder(folder) ? ADMIN_UI.crmFolders[folder] : folder;
}

const LeadsPage = () => {
  const navigate = useNavigate();
  const { personId } = useParams<{ personId?: string }>();
  const [file, setFile] = useState<CrmFile | null>(null);
  const [view, setView] = useState<CrmListView>('leads');
  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void adminGetCrm()
      .then((next) => {
        if (!cancelled) {
          setFile(next);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(ADMIN_UI.crmError);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selected = file?.people.find((person) => person.id === personId) ?? null;
  const dealRows = useMemo(() => {
    if (file == null || view === 'contacts') {
      return [];
    }
    return searchDealRows(listDealRows(file, view), query);
  }, [file, query, view]);
  const contacts = useMemo(() => {
    if (file == null) {
      return [];
    }
    return searchPeople(listContactPeople(file), query);
  }, [file, query]);

  if (file == null && error != null) {
    return <p className="p-6 text-sm text-difficulty-hard-fg">{error}</p>;
  }
  if (file == null) {
    return (
      <p className="p-6 text-sm text-text-muted" role="status">
        {ADMIN_UI.loading}
      </p>
    );
  }

  const empty =
    view === 'contacts'
      ? contacts.length === 0
      : dealRows.length === 0;

  return (
    <div className="flex min-h-full flex-col gap-4 p-4 lg:flex-row">
      <div className={`min-w-0 flex-1 ${selected != null ? 'hidden lg:flex lg:flex-col' : 'flex flex-col'} gap-4`}>
        <AdminPageHeader
          title={ADMIN_UI.crmTitle}
          description={ADMIN_UI.crmDescription}
          action={
            <AdminButton type="button" onClick={() => setCreating(true)}>
              {ADMIN_UI.crmAdd}
            </AdminButton>
          }
        />
        <div className="flex flex-wrap gap-1" role="tablist" aria-label={ADMIN_UI.crmTitle}>
          {CRM_LIST_VIEWS.map((item) => (
            <AdminButton
              key={item}
              type="button"
              variant={view === item ? 'primary' : 'ghost'}
              onClick={() => setView(item)}
            >
              {ADMIN_UI.crmViews[item]}
            </AdminButton>
          ))}
        </div>
        <label className="flex max-w-md flex-col gap-1">
          <span className="text-sm font-medium text-text-primary">{ADMIN_UI.crmSearch}</span>
          <AdminTextInput
            id="admin-crm-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        {error != null ? <AdminAlert tone="danger">{error}</AdminAlert> : null}
        {empty ? (
          <AdminEmptyState
            title={
              view === 'leads'
                ? ADMIN_UI.crmEmptyLeads
                : view === 'potential'
                  ? ADMIN_UI.crmEmptyPotential
                  : ADMIN_UI.crmEmptyContacts
            }
            description={view === 'contacts' ? ADMIN_UI.crmEmptyContactsHint : ADMIN_UI.crmEmptyLeadsHint}
          />
        ) : view === 'contacts' ? (
          <ul className="flex flex-col">
            {contacts.map((person) => (
              <li key={person.id} className="border-b border-divider last:border-b-0">
                <button
                  type="button"
                  className="flex min-h-11 w-full items-center justify-between gap-2 px-2 py-2 text-left"
                  onClick={() => void navigate(`/leads/${person.id}`)}
                >
                  <span className="min-w-0 truncate font-medium text-text-primary">{person.name}</span>
                  <span className="shrink-0 text-sm text-text-muted">
                    {person.folder != null ? folderLabel(person.folder) : person.phone}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="flex flex-col">
            {dealRows.map(({ person, deal }) => (
              <li key={deal.id} className="border-b border-divider py-2 last:border-b-0">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="min-h-11 min-w-0 flex-1 truncate text-left font-medium text-text-primary"
                    onClick={() => void navigate(`/leads/${person.id}`)}
                  >
                    {person.name}
                  </button>
                  <AdminBadge tone={crmDealStatusTone(deal.status)}>
                    {ADMIN_UI.crmStatuses[deal.status]}
                  </AdminBadge>
                </div>
                <p className="text-sm text-text-muted">
                  {deal.tourTitle} · {deal.date}
                  {deal.nextStep.length > 0 ? ` · ${deal.nextStep}` : ''}
                </p>
                {deal.comment.length > 0 || deal.pauseReason.length > 0 ? (
                  <p className="text-sm text-text-primary">{deal.pauseReason || deal.comment}</p>
                ) : null}
                <div className="mt-1 flex flex-wrap gap-2">
                  <AdminButton
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      void adminAddCrmTouch(deal.id, file.rev, 'called')
                        .then(setFile)
                        .catch(() => setError(ADMIN_UI.crmError));
                    }}
                  >
                    {ADMIN_UI.crmCalled}
                  </AdminButton>
                  <AdminButton
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      void adminUpdateCrmDeal(deal.id, file.rev, {
                        status: deal.status === 'in_progress' ? 'new' : 'in_progress',
                      })
                        .then(setFile)
                        .catch(() => setError(ADMIN_UI.crmError));
                    }}
                  >
                    {ADMIN_UI.crmStatuses.in_progress}
                  </AdminButton>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {selected != null ? (
        <div className="min-w-0 flex-1 border-divider lg:max-w-md lg:border-l lg:pl-4">
          <CrmPersonPanel
            key={selected.id}
            file={file}
            person={selected}
            onFile={setFile}
            onBack={() => void navigate('/leads')}
          />
        </div>
      ) : null}
      {creating ? (
        <CrmCreateModal
          rev={file.rev}
          onClose={() => setCreating(false)}
          onCreated={(id) => {
            setCreating(false);
            void adminGetCrm().then(setFile);
            void navigate(`/leads/${id}`);
          }}
        />
      ) : null}
    </div>
  );
};

export default LeadsPage;
