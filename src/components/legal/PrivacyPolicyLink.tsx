import type { MouseEvent, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { getPrivacyPolicyPagePath } from '../../constants/legalDocuments';

type PrivacyPolicyLinkProps = {
  className?: string;
  children: ReactNode;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
};

/** In-app route to the privacy policy page (not a direct PDF download). */
const PrivacyPolicyLink = ({ className, children, onClick }: PrivacyPolicyLinkProps) => (
  <Link to={getPrivacyPolicyPagePath()} className={className} onClick={onClick} prefetch="none">
    {children}
  </Link>
);

export default PrivacyPolicyLink;
