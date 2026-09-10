import { useRef, type PointerEvent, type ReactNode } from 'react';
import {
  formatMediaFocalPoint,
  parseMediaFocalPoint,
} from '../../utils/mediaObjectPosition';
import { ADMIN_UI } from '../constants/ui';

type AdminFocalPointProps = {
  objectPosition?: string;
  onChange: (objectPosition: string) => void;
  /** `frame` — клик и перетаскивание по всему превью; `handle` — только маркер. */
  capture?: 'frame' | 'handle';
  children: ReactNode;
};

const DEFAULT_POINT = { x: 50, y: 50 };

const AdminFocalPoint = ({
  objectPosition,
  onChange,
  capture = 'frame',
  children,
}: AdminFocalPointProps) => {
  const frameRef = useRef<HTMLDivElement>(null);
  const point = parseMediaFocalPoint(objectPosition) ?? DEFAULT_POINT;

  const updateFromPointer = (event: PointerEvent<HTMLElement>) => {
    const frame = frameRef.current;
    if (frame == null) {
      return;
    }
    const rect = frame.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      return;
    }
    const x = Math.min(100, Math.max(0, ((event.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((event.clientY - rect.top) / rect.height) * 100));
    onChange(formatMediaFocalPoint({ x, y }));
  };

  const onFramePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (capture !== 'frame') {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    if (typeof event.currentTarget.setPointerCapture === 'function') {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    updateFromPointer(event);
  };

  const onHandlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (typeof event.currentTarget.setPointerCapture === 'function') {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    updateFromPointer(event);
  };

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (
      typeof event.currentTarget.hasPointerCapture === 'function' &&
      !event.currentTarget.hasPointerCapture(event.pointerId)
    ) {
      return;
    }
    if (event.buttons === 0) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    updateFromPointer(event);
  };

  return (
    <div
      ref={frameRef}
      className="relative h-full min-h-0 w-full overflow-hidden"
      onPointerDown={onFramePointerDown}
      onPointerMove={onPointerMove}
    >
      {children}
      <button
        type="button"
        className="absolute z-stack-base h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-text-inverse bg-brand-primary/80"
        style={{ left: `${point.x}%`, top: `${point.y}%` }}
        aria-label={ADMIN_UI.focalPoint}
        onPointerDown={onHandlePointerDown}
        onPointerMove={onPointerMove}
      />
    </div>
  );
};

export default AdminFocalPoint;
