import { useContext } from 'react';
import { CmsToursRevisionContext } from './cms-tours-revision-context';

export function useCmsToursRevision(): number {
  return useContext(CmsToursRevisionContext);
}
