import type { MouseEvent, ReactNode } from 'react';
import { getLegalDocumentUrl, resolveFooterPdfHref, type LegalDocumentId } from '../../constants/legalDocuments';
import { useSitePolicy } from '../../context/SiteContentContext';

type LegalPdfLinkProps = {
  documentId: LegalDocumentId;
  className?: string;
  children: ReactNode;
  /** Accessible name when children are not plain text. */
  ariaLabel?: string;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
};

/**
 * Opens a legal PDF in a new tab; `download` suggests saving the official copy.
 */
const LegalPdfLink = ({ documentId, className, children, ariaLabel, onClick }: LegalPdfLinkProps) => {
  const policy = useSitePolicy(documentId);
  const href =
    resolveFooterPdfHref({ documentId, asset: policy?.asset }) ?? getLegalDocumentUrl(documentId);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      download
      className={className}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      {children}
    </a>
  );
};

export default LegalPdfLink;
