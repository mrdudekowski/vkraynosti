import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { ContactsContentDocument, FooterContentDocument, ModalContentDocument, TeamContentDocument } from '../cms/siteContentDocument';
import { loadPublishedSiteContent } from '../cms/loadSiteContent';
import { seedSiteContentDocuments } from '../cms/siteContentSeed';
import { TEAM_HERO_PAGES } from '../data/teamData';

type SiteContentValue = { team: TeamContentDocument; contacts: ContactsContentDocument; footer: FooterContentDocument; modal: ModalContentDocument };
const seeded = seedSiteContentDocuments();
const fallback: SiteContentValue = { team: { ...seeded.team, members: TEAM_HERO_PAGES.flat().filter((member, index, all) => all.findIndex((candidate) => candidate.id === member.id) === index).map((member, order) => ({ ...(seeded.team.members.find((candidate) => candidate.id === member.id) ?? seeded.team.members[order]), order })) }, contacts: seeded.contacts, footer: seeded.footer, modal: seeded.modal };
const SiteContentContext = createContext<SiteContentValue>(fallback);

export const SiteContentProvider = ({ children }: { children: ReactNode }) => {
  const [value, setValue] = useState<SiteContentValue>(fallback);
  useEffect(() => {
    let alive = true;
    void Promise.all([
      loadPublishedSiteContent('team'),
      loadPublishedSiteContent('contacts'),
      loadPublishedSiteContent('footer'),
      loadPublishedSiteContent('modal'),
    ]).then(([team, contacts, footer, modal]) => {
      if (!alive) return;
      setValue({
        team: team?.kind === 'team' ? team : fallback.team,
        contacts: contacts?.kind === 'contacts' ? contacts : fallback.contacts,
        footer: footer?.kind === 'footer' ? footer : fallback.footer,
        modal: modal?.kind === 'modal' ? modal : fallback.modal,
      });
    }).catch(() => undefined);
    return () => { alive = false; };
  }, []);
  const stable = useMemo(() => value, [value]);
  return <SiteContentContext.Provider value={stable}>{children}</SiteContentContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSiteContent = () => useContext(SiteContentContext);
