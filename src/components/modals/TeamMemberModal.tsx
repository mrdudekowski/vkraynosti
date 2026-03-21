import { useEffect, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';
import type { TeamMember } from '../../types';
import { useModal } from '../../context/ModalContext';
import { UI } from '../../constants/ui';
import PlaceholderImage from '../shared/PlaceholderImage';

interface TeamMemberModalProps {
  member: TeamMember;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const getFocusableIn = (root: HTMLElement): HTMLElement[] =>
  Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(el => {
    const t = el.getAttribute('tabindex');
    if (t === '-1') return false;
    return el.offsetParent !== null || el.getClientRects().length > 0;
  });

const TeamMemberModal = ({ member }: TeamMemberModalProps) => {
  const { closeModal } = useModal();
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    closeBtnRef.current?.focus();
  }, [member.id]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeModal();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;

      const nodes = getFocusableIn(panelRef.current);
      if (nodes.length === 0) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (active === first || (active && !panelRef.current.contains(active))) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [closeModal]);

  return createPortal(
    <>
      <div
        className="fixed inset-0 bg-black/70 z-overlay"
        onClick={closeModal}
        aria-hidden="true"
      />

      <div
        className="fixed inset-0 z-modal flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-label={member.name}
      >
        <div
          ref={panelRef}
          className="bg-white rounded-modal max-w-lg w-full animate-scale-in overflow-hidden max-h-[90vh] flex flex-col"
        >
          <div className="relative h-64 shrink-0">
            <PlaceholderImage src={member.imageUrl} alt={member.name} className="w-full h-full" />
            <button
              ref={closeBtnRef}
              type="button"
              onClick={closeModal}
              className="absolute top-4 right-4 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-hover"
              aria-label={UI.modal.close}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          <div className="p-8 overflow-y-auto">
            <h2 className="font-heading text-2xl font-bold text-text-primary mb-1">
              {member.name}
            </h2>
            <p className="text-brand-primary font-medium mb-4">{member.role}</p>
            <p className="text-text-muted text-sm leading-relaxed mb-6">{member.bio}</p>

            <div className="mb-4">
              <h4 className="font-semibold text-text-primary text-sm mb-2">
                {UI.teamModal.specialtiesHeading}
              </h4>
              <ul className="flex flex-col gap-1">
                {member.specialties.map(spec => (
                  <li key={spec} className="flex items-center gap-2 text-sm text-text-muted">
                    <FontAwesomeIcon icon={faCheck} className="text-brand-primary text-xs" />
                    {spec}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-brand-accent rounded-lg px-4 py-2 inline-block">
              <span className="text-sm text-brand-primary font-medium">
                {UI.teamModal.experienceLabel}: {member.experience}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default TeamMemberModal;
