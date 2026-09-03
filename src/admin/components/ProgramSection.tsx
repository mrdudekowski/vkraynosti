import { useRef, useState } from 'react';
import { Clock, GripVertical, ListOrdered, Plus, StickyNote, Trash2 } from 'lucide-react';
import { UI } from '../../constants/ui';
import { TOUR_DURATION_DAY_OPTIONS } from '../../cms/durationDays';
import { ADMIN_UI } from '../constants/ui';
import { moveItem } from '../moveItem';
import { useAdminToast } from '../toast/adminToastContext';
import { pushAdminUndo } from '../toast/pushAdminUndo';
import AdminButton from './AdminButton';
import AdminEditorSurface from './AdminEditorSurface';
import AdminEmptyState from './AdminEmptyState';
import { AdminTextArea } from './AdminFields';
import AdminIcon from './AdminIcon';
import AdminIconButton from './AdminIconButton';
import AdminSelect from './AdminSelect';

export type ProgramDraftStep = {
  day?: number;
  timeLabel: string;
  description: string;
};

type ProgramSectionProps = {
  durationDays?: number;
  program: ProgramDraftStep[];
  notes: string[];
  onProgram: (program: ProgramDraftStep[]) => void;
  onNotes: (notes: string[]) => void;
};

const STEP_DRAG = 'application/x-vkr-program-step';
const TIME_OPTIONS = Array.from({ length: 48 }, (_, index) => {
  const hour = String(Math.floor(index / 2)).padStart(2, '0');
  const minute = index % 2 === 0 ? '00' : '30';
  return `${hour}:${minute}`;
});

const ProgramSection = ({ durationDays, program, notes, onProgram, onNotes }: ProgramSectionProps) => {
  const { push } = useAdminToast();
  const [movingIndex, setMovingIndex] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState(1);
  const holdTimer = useRef<number | null>(null);
  const held = useRef(false);
  const programReady = program.some((step) => step.description.trim().length > 0);
  const maxDay = durationDays != null && durationDays >= 1 ? durationDays : 1;
  const availableDays = TOUR_DURATION_DAY_OPTIONS.filter((day) => day <= maxDay);
  const activeDay = Math.min(selectedDay, maxDay);
  const visibleProgram = program
    .map((step, sourceIndex) => ({ step, sourceIndex, day: step.day ?? 1 }))
    .filter((entry) => entry.day === activeDay);
  const overflowCount = durationDays != null
    ? program.filter((step) => (step.day ?? 1) > durationDays).length
    : 0;

  const replaceProgram = (next: ProgramDraftStep[], message: string) => {
    if (next === program) {
      return;
    }
    const previous = program;
    onProgram(next);
    pushAdminUndo(push, message, () => onProgram(previous));
  };

  const replaceNotes = (next: string[], message: string) => {
    if (next === notes) {
      return;
    }
    const previous = notes;
    onNotes(next);
    pushAdminUndo(push, message, () => onNotes(previous));
  };

  const addStep = () => {
    const nextIndex = program.length;
    onProgram([...program, { day: activeDay, timeLabel: '', description: '' }]);
    window.requestAnimationFrame(() => {
      window.document.getElementById(`program-time-${nextIndex}`)?.focus();
    });
  };

  const moveTo = (fromIndex: number, toIndex: number) => {
    const positions = program
      .map((step, index) => ((step.day ?? 1) === activeDay ? index : -1))
      .filter((index) => index >= 0);
    const fromPosition = positions.indexOf(fromIndex);
    const toPosition = positions.indexOf(toIndex);
    if (fromPosition < 0 || toPosition < 0 || fromPosition === toPosition) return;
    let reordered = visibleProgram.map(({ step }) => step);
    const moveDirection = fromPosition < toPosition ? 1 : -1;
    let current = fromPosition;
    while (current !== toPosition) {
      reordered = moveItem(reordered, current, moveDirection);
      current += moveDirection;
    }
    const next = [...program];
    positions.forEach((sourceIndex, position) => {
      next[sourceIndex] = reordered[position]!;
    });
    replaceProgram(next, ADMIN_UI.listReordered);
    setMovingIndex(positions[toPosition] ?? null);
  };

  const startHold = (index: number) => {
    holdTimer.current = window.setTimeout(() => {
      held.current = true;
      setMovingIndex(index);
    }, 350);
  };
  const clearHold = () => {
    if (holdTimer.current != null) window.clearTimeout(holdTimer.current);
    holdTimer.current = null;
  };

  return (
    <div className="grid gap-3 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] xl:items-start">
      <AdminEditorSurface
        icon={ListOrdered}
        title={ADMIN_UI.programHeading}
        hint={`${ADMIN_UI.requiredForPublish}. ${UI.tourDetail.programTimeDisclaimer}`}
      >
        {program.length === 0 ? (
          <AdminEmptyState
            title={ADMIN_UI.programEmpty}
            description={ADMIN_UI.programEmptyHint}
            action={
              <AdminButton variant="secondary" onClick={addStep}>
                <Plus className="mr-2" size={16} strokeWidth={1.75} aria-hidden />
                {ADMIN_UI.addStep}
              </AdminButton>
            }
          />
        ) : (
          <ol className="admin-editor-list flex flex-col gap-0.5">
            {visibleProgram.map(({ step, sourceIndex: index }) => (
              <li
                key={`step-${index}`}
                className="admin-editor-row flex-wrap items-start gap-2 admin-desktop:flex-nowrap admin-desktop:gap-1"
                onClick={(event) => {
                  if (movingIndex == null || event.target instanceof HTMLElement && event.target.closest('button, input, textarea')) return;
                  moveTo(movingIndex, index);
                }}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  const fromIndex = Number.parseInt(event.dataTransfer.getData(STEP_DRAG), 10);
                  if (!Number.isInteger(fromIndex) || fromIndex === index) {
                    return;
                  }
                  moveTo(fromIndex, index);
                }}
              >
                <button
                  type="button"
                  draggable
                  className="admin-icon-btn mt-0.5 cursor-grab"
                  aria-label={ADMIN_UI.dragItem}
                  aria-pressed={movingIndex === index}
                  onClick={() => {
                    if (held.current) {
                      held.current = false;
                      return;
                    }
                    setMovingIndex((current) => (current === index ? null : index));
                  }}
                  onPointerDown={() => startHold(index)}
                  onPointerUp={clearHold}
                  onPointerCancel={clearHold}
                  onPointerLeave={clearHold}
                  onDragStart={(event) => {
                    event.dataTransfer.setData(STEP_DRAG, String(index));
                    event.dataTransfer.effectAllowed = 'move';
                  }}
                >
                  <GripVertical aria-hidden size={16} strokeWidth={1.75} />
                </button>
                <div className="relative w-24 shrink-0">
                  <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-text-muted">
                    <AdminIcon icon={Clock} size={16} />
                  </span>
                  <AdminSelect
                    id={`program-time-${index}`}
                    className="pl-8"
                    aria-label={ADMIN_UI.timeLabel}
                    value={step.timeLabel}
                    onChange={(event) => {
                      const next = [...program];
                      const current = next[index];
                      if (current == null) return;
                      next[index] = { ...current, timeLabel: event.target.value };
                      onProgram(next);
                    }}
                  >
                    <option value="">—:—</option>
                    {TIME_OPTIONS.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </AdminSelect>
                </div>
                  <AdminTextArea
                  id={`program-step-${index}`}
                  className="order-4 min-h-11 basis-full flex-1 admin-desktop:order-none admin-desktop:basis-auto"
                  rows={1}
                  aria-label={ADMIN_UI.stepLabel}
                  hasError={!programReady && step.description.trim().length === 0}
                  value={step.description}
                  onChange={(event) => {
                    const next = [...program];
                    const current = next[index];
                    if (current == null) return;
                    next[index] = { ...current, description: event.target.value };
                    onProgram(next);
                  }}
                />
                <AdminIconButton
                  icon={Trash2}
                  label={ADMIN_UI.removeItem}
                  danger
                  onClick={() =>
                    replaceProgram(
                      program.filter((_, stepIndex) => stepIndex !== index),
                      ADMIN_UI.listItemRemoved,
                    )
                  }
                />
              </li>
            ))}
          </ol>
        )}
        {overflowCount > 0 ? <p className="text-sm text-difficulty-medium-fg">{ADMIN_UI.programOverflow}</p> : null}
        {availableDays.length > 1 ? (
          <div className="grid min-w-0 grid-cols-2 gap-2 pb-1 admin-desktop:flex" role="tablist" aria-label={ADMIN_UI.programHeading}>
            {availableDays.map((day) => (
              <AdminButton
                key={day}
                type="button"
                variant={day === activeDay ? 'primary' : 'secondary'}
                role="tab"
                aria-selected={day === activeDay}
                onClick={() => {
                  setSelectedDay(day);
                  setMovingIndex(null);
                }}
              >
                {ADMIN_UI.programDay(day)}
              </AdminButton>
            ))}
          </div>
        ) : null}
        {program.length > 0 ? (
          <AdminButton variant="secondary" className="self-start" onClick={addStep}>
            <Plus className="mr-2" size={16} strokeWidth={1.75} aria-hidden />
            {ADMIN_UI.addStep}
          </AdminButton>
        ) : null}
        {movingIndex != null ? (
          <AdminButton variant="secondary" className="self-start" onClick={() => setMovingIndex(null)}>
            {ADMIN_UI.saveOrder}
          </AdminButton>
        ) : null}
      </AdminEditorSurface>
      <AdminEditorSurface icon={StickyNote} title={ADMIN_UI.notesHeading}>
        {notes.length === 0 ? (
          <AdminEmptyState
            title={ADMIN_UI.notesEmpty}
            description={ADMIN_UI.notesEmptyHint}
            action={
              <AdminButton variant="secondary" onClick={() => onNotes([''])}>
                <Plus className="mr-2" size={16} strokeWidth={1.75} aria-hidden />
                {ADMIN_UI.addNote}
              </AdminButton>
            }
          />
        ) : (
          <ul className="admin-editor-list flex flex-col gap-0.5">
            {notes.map((note, index) => (
              <li key={`note-${index}`} className="admin-editor-row items-start">
                <AdminTextArea
                  id={`program-note-${index}`}
                  className="min-h-11 flex-1"
                  rows={1}
                  aria-label={`${ADMIN_UI.noteLabel} ${index + 1}`}
                  value={note}
                  onChange={(event) => {
                    const next = [...notes];
                    next[index] = event.target.value;
                    onNotes(next);
                  }}
                />
                <AdminIconButton
                  icon={Trash2}
                  label={ADMIN_UI.removeItem}
                  danger
                  onClick={() =>
                    replaceNotes(
                      notes.filter((_, noteIndex) => noteIndex !== index),
                      ADMIN_UI.listItemRemoved,
                    )
                  }
                />
              </li>
            ))}
          </ul>
        )}
        {notes.length > 0 ? (
          <AdminButton variant="secondary" className="self-start" onClick={() => onNotes([...notes, ''])}>
            <Plus className="mr-2" size={16} strokeWidth={1.75} aria-hidden />
            {ADMIN_UI.addNote}
          </AdminButton>
        ) : null}
      </AdminEditorSurface>
    </div>
  );
};

export default ProgramSection;
