import { ChevronDown, ChevronUp, Clock, GripVertical, ListOrdered, Plus, StickyNote, Trash2 } from 'lucide-react';
import { UI } from '../../constants/ui';
import { ADMIN_UI } from '../constants/ui';
import { moveItem } from '../moveItem';
import { useAdminToast } from '../toast/adminToastContext';
import { pushAdminUndo } from '../toast/pushAdminUndo';
import AdminButton from './AdminButton';
import AdminEditorSurface from './AdminEditorSurface';
import AdminEmptyState from './AdminEmptyState';
import { AdminTextArea, AdminTextInput } from './AdminFields';
import AdminIcon from './AdminIcon';
import AdminIconButton from './AdminIconButton';

export type ProgramDraftStep = {
  timeLabel: string;
  description: string;
};

type ProgramSectionProps = {
  program: ProgramDraftStep[];
  notes: string[];
  onProgram: (program: ProgramDraftStep[]) => void;
  onNotes: (notes: string[]) => void;
};

const STEP_DRAG = 'application/x-vkr-program-step';

const ProgramSection = ({ program, notes, onProgram, onNotes }: ProgramSectionProps) => {
  const { push } = useAdminToast();
  const programReady = program.some((step) => step.description.trim().length > 0);

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
    onProgram([...program, { timeLabel: '', description: '' }]);
    window.requestAnimationFrame(() => {
      window.document.getElementById(`program-time-${nextIndex}`)?.focus();
    });
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
            {program.map((step, index) => (
              <li
                key={`step-${index}`}
                className="admin-editor-row items-start"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  const fromIndex = Number.parseInt(event.dataTransfer.getData(STEP_DRAG), 10);
                  if (!Number.isInteger(fromIndex) || fromIndex === index) {
                    return;
                  }
                  const direction = fromIndex < index ? 1 : -1;
                  let next = program;
                  let current = fromIndex;
                  while (current !== index) {
                    next = moveItem(next, current, direction);
                    current += direction;
                  }
                  replaceProgram(next, ADMIN_UI.listReordered);
                }}
              >
                <button
                  type="button"
                  draggable
                  className="admin-icon-btn mt-0.5 cursor-grab"
                  aria-label={ADMIN_UI.dragItem}
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
                  <AdminTextInput
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
                  />
                </div>
                <AdminTextArea
                  id={`program-step-${index}`}
                  className="min-h-11 flex-1"
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
                  icon={ChevronUp}
                  label={ADMIN_UI.moveUp}
                  disabled={index === 0}
                  onClick={() => replaceProgram(moveItem(program, index, -1), ADMIN_UI.listReordered)}
                />
                <AdminIconButton
                  icon={ChevronDown}
                  label={ADMIN_UI.moveDown}
                  disabled={index === program.length - 1}
                  onClick={() => replaceProgram(moveItem(program, index, 1), ADMIN_UI.listReordered)}
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
        {program.length > 0 ? (
          <AdminButton variant="secondary" className="self-start" onClick={addStep}>
            <Plus className="mr-2" size={16} strokeWidth={1.75} aria-hidden />
            {ADMIN_UI.addStep}
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
