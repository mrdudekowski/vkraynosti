import { useEffect, useRef, useState } from 'react';

type ActiveMediaSlotId = symbol;
type ActiveMediaSlotListener = () => void;

let activeMediaSlotId: ActiveMediaSlotId | null = null;
const activeMediaSlotListeners = new Set<ActiveMediaSlotListener>();

const notifyActiveMediaSlotListeners = () => {
  activeMediaSlotListeners.forEach(listener => listener());
};

export function requestActiveMediaSlot(slotId: ActiveMediaSlotId): boolean {
  if (activeMediaSlotId === slotId) return true;
  if (activeMediaSlotId != null) return false;

  activeMediaSlotId = slotId;
  notifyActiveMediaSlotListeners();
  return true;
}

export function releaseActiveMediaSlot(slotId: ActiveMediaSlotId): boolean {
  if (activeMediaSlotId !== slotId) return false;

  activeMediaSlotId = null;
  notifyActiveMediaSlotListeners();
  return true;
}

export function getActiveMediaSlotId(): ActiveMediaSlotId | null {
  return activeMediaSlotId;
}

export function resetActiveMediaSlotForTest(): void {
  activeMediaSlotId = null;
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
