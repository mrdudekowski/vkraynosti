import { useEffect, useState } from 'react';
import { EDITOR_SECTION_IDS, type AdminEditorSectionId } from './tourEditorTabs';

export type { AdminEditorSectionId };

export function useAdminSectionSpy(enabled: boolean): AdminEditorSectionId {
  const [active, setActive] = useState<AdminEditorSectionId>('admin-catalog');

  useEffect(() => {
    if (!enabled) {
      return;
    }
    const nodes = EDITOR_SECTION_IDS.map((id) => window.document.getElementById(id)).filter(
      (node): node is HTMLElement => node != null,
    );
    if (nodes.length === 0) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio);
        const top = visible[0]?.target.id;
        if (top != null && (EDITOR_SECTION_IDS as readonly string[]).includes(top)) {
          setActive(top as AdminEditorSectionId);
        }
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0.15, 0.35, 0.6] },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [enabled]);

  return active;
}
