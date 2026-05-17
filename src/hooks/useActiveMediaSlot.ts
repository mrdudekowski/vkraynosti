import { useEffect, useRef, useState } from 'react';
import { GALLERY_GRID_VIDEO_MAX_CONCURRENT_SLOTS } from '../constants/galleryGridVideoLoop';

type ActiveMediaSlotId = symbol;
type ActiveMediaSlotListener = () => void;

const activeMediaSlotHolders = new Set<ActiveMediaSlotId>();
const activeMediaSlotListeners = new Set<ActiveMediaSlotListener>();

const notifyActiveMediaSlotListeners = () => {
  activeMediaSlotListeners.forEach(listener => listener());
};

export function requestActiveMediaSlot(slotId: ActiveMediaSlotId): boolean {
  if (activeMediaSlotHolders.has(slotId)) return true;
  if (activeMediaSlotHolders.size >= GALLERY_GRID_VIDEO_MAX_CONCURRENT_SLOTS) return false;

  activeMediaSlotHolders.add(slotId);
  notifyActiveMediaSlotListeners();
  return true;
}

export function releaseActiveMediaSlot(slotId: ActiveMediaSlotId): boolean {
  if (!activeMediaSlotHolders.has(slotId)) return false;

  activeMediaSlotHolders.delete(slotId);
  notifyActiveMediaSlotListeners();
  return true;
}

/** Для тестов и отладки: число активных держателей слота. */
export function getActiveMediaSlotHolderCount(): number {
  return activeMediaSlotHolders.size;
}

export function resetActiveMediaSlotForTest(): void {
  activeMediaSlotHolders.clear();
  activeMediaSlotListeners.clear();
}

function subscribeActiveMediaSlot(listener: ActiveMediaSlotListener): () => void {
  activeMediaSlotListeners.add(listener);
  return () => {
    activeMediaSlotListeners.delete(listener);
  };
}

export function useActiveMediaSlot(shouldRequestSlot: boolean): boolean {
  const slotIdRef = useRef<ActiveMediaSlotId>(Symbol('active-media-slot'));
  const [slotGranted, setSlotGranted] = useState(false);

  useEffect(() => {
    const slotId = slotIdRef.current;

    if (!shouldRequestSlot) {
      releaseActiveMediaSlot(slotId);
      setSlotGranted(false);
      return;
    }

    const updateSlotGrant = () => {
      setSlotGranted(requestActiveMediaSlot(slotId));
    };

    const unsubscribe = subscribeActiveMediaSlot(updateSlotGrant);
    updateSlotGrant();

    return () => {
      unsubscribe();
      releaseActiveMediaSlot(slotId);
    };
  }, [shouldRequestSlot]);

  return slotGranted;
}
