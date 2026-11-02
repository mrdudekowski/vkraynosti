import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type {
  ContactsContentDocument,
  FooterContentDocument,
  ModalContentDocument,
  PolicyContentDocument,
  SitePolicyDocumentId,
  SitePolicyKind,
  TeamContentDocument,
} from '../cms/siteContentDocument';
import {
  SITE_POLICY_KINDS,
  isPolicyContentDocument,
  policyKindFromDocumentId,
} from '../cms/siteContentDocument';
import type { SiteSeoDocument } from '../cms/siteSeoDocument';
import { loadPublishedSiteContent } from '../cms/loadSiteContent';
import { seedSiteContentDocuments } from '../cms/siteContentSeed';
import { TEAM_HERO_PAGES } from '../data/teamData';

type SiteContentValue = {
  team: TeamContentDocument;
  contacts: ContactsContentDocument;
  footer: FooterContentDocument;
  modal: ModalContentDocument;
  seo: SiteSeoDocument;
  policies: Record<SitePolicyKind, PolicyContentDocument>;
};
const seeded = seedSiteContentDocuments();
const seededPolicies = Object.fromEntries(
  SITE_POLICY_KINDS.map((kind) => [kind, seeded[kind] as PolicyContentDocument]),
) as Record<SitePolicyKind, PolicyContentDocument>;
const fallback: SiteContentValue = {
  team: {
    ...seeded.team,
    members: TEAM_HERO_PAGES.flat()
      .filter((member, index, all) => all.findIndex((candidate) => candidate.id === member.id) === index)
      .map((member, order) => ({
        ...(seeded.team.members.find((candidate) => candidate.id === member.id) ?? seeded.team.members[order]),
        order,
      })),
  },
  contacts: seeded.contacts,
  footer: seeded.footer,
  modal: seeded.modal,
  seo: seeded.seo,
  policies: seededPolicies,
};
const SiteContentContext = createContext<SiteContentValue>(fallback);

const policiesFromLoaded = (loaded: Array<Awaited<ReturnType<typeof loadPublishedSiteContent>>>) => {
  const next = { ...fallback.policies };
  for (const document of loaded) {
    if (document != null && isPolicyContentDocument(document)) {
      next[document.kind] = document;
    }
  }
  return next;
};

export const SiteContentProvider = ({ children }: { children: ReactNode }) => {
  const [value, setValue] = useState<SiteContentValue>(fallback);
  useEffect(() => {
    let alive = true;
    void Promise.all([
      loadPublishedSiteContent('team'),
      loadPublishedSiteContent('contacts'),
      loadPublishedSiteContent('footer'),
      loadPublishedSiteContent('modal'),
      loadPublishedSiteContent('seo'),
      ...SITE_POLICY_KINDS.map((kind) => loadPublishedSiteContent(kind)),
    ]).then(([team, contacts, footer, modal, seo, ...policyDocuments]) => {
      if (!alive) return;
      setValue({
        team: team?.kind === 'team' ? team : fallback.team,
        contacts: contacts?.kind === 'contacts' ? contacts : fallback.contacts,
        footer: footer?.kind === 'footer' ? footer : fallback.footer,
        modal: modal?.kind === 'modal' ? modal : fallback.modal,
        seo: seo?.kind === 'seo' ? seo : fallback.seo,
        policies: policiesFromLoaded(policyDocuments),
      });
    }).catch(() => undefined);
    return () => { alive = false; };
  }, []);
  const stable = useMemo(() => value, [value]);
  return <SiteContentContext.Provider value={stable}>{children}</SiteContentContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSiteContent = () => useContext(SiteContentContext);

// eslint-disable-next-line react-refresh/only-export-components
export const useSiteSeoPage = (key: SiteSeoDocument['pages'][number]['key']) =>
  useContext(SiteContentContext).seo.pages.find((page) => page.key === key);

// eslint-disable-next-line react-refresh/only-export-components
export const useSitePolicy = (documentId: SitePolicyDocumentId) =>
  useContext(SiteContentContext).policies[policyKindFromDocumentId(documentId)];
