import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons/faChevronDown';
import { faChevronUp } from '@fortawesome/free-solid-svg-icons/faChevronUp';
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus';
import { faTrash } from '@fortawesome/free-solid-svg-icons/faTrash';
import { UI } from '../../constants/ui';
import { ADMIN_UI } from '../constants/ui';
import { moveItem } from '../moveItem';
import AdminButton from './AdminButton';
import { AdminTextArea, AdminTextInput } from './AdminFields';
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

const ProgramSection = ({ program, notes, onProgram, onNotes }: ProgramSectionProps) => (
  <section className="flex flex-col gap-2 rounded-card border border-divider bg-surface-light p-3">
    <h2 className="text-base font-semibold text-text-primary">{ADMIN_UI.programHeading}</h2>
    <p className="text-tooltip text-text-muted">{UI.tourDetail.programTimeDisclaimer}</p>
    <ol className="flex flex-col gap-1">
      {program.map((step, index) => (
        <li key={`step-${index}`} className="flex items-start gap-1">
          <AdminTextInput
            id={`program-time-${index}`}
            className="w-20 shrink-0"
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
          <AdminTextArea
            id={`program-step-${index}`}
            className="min-h-11 flex-1"
            rows={2}
            aria-label={ADMIN_UI.stepLabel}
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
            icon={faChevronUp}
            label={ADMIN_UI.moveUp}
            onClick={() => onProgram(moveItem(program, index, -1))}
          />
          <AdminIconButton
            icon={faChevronDown}
            label={ADMIN_UI.moveDown}
            onClick={() => onProgram(moveItem(program, index, 1))}
          />
          <AdminIconButton
            icon={faTrash}
            label={ADMIN_UI.removeItem}
            danger
            onClick={() => onProgram(program.filter((_, stepIndex) => stepIndex !== index))}
          />
        </li>
      ))}
    </ol>
    <AdminButton
      variant="secondary"
      className="self-start"
      onClick={() => onProgram([...program, { timeLabel: '', description: '' }])}
    >
      <FontAwesomeIcon icon={faPlus} className="mr-2" aria-hidden />
      {ADMIN_UI.addStep}
    </AdminButton>

    <h3 className="mt-2 text-sm font-semibold text-text-primary">{ADMIN_UI.notesHeading}</h3>
    <ul className="flex flex-col gap-1">
      {notes.map((note, index) => (
        <li key={`note-${index}`} className="flex items-start gap-1">
          <AdminTextArea
            id={`program-note-${index}`}
            className="min-h-11 flex-1"
            rows={2}
            aria-label={`${ADMIN_UI.noteLabel} ${index + 1}`}
            value={note}
            onChange={(event) => {
              const next = [...notes];
              next[index] = event.target.value;
              onNotes(next);
            }}
          />
          <AdminIconButton
            icon={faTrash}
            label={ADMIN_UI.removeItem}
            danger
            onClick={() => onNotes(notes.filter((_, noteIndex) => noteIndex !== index))}
          />
        </li>
      ))}
    </ul>
    <AdminButton variant="secondary" className="self-start" onClick={() => onNotes([...notes, ''])}>
      <FontAwesomeIcon icon={faPlus} className="mr-2" aria-hidden />
      {ADMIN_UI.addNote}
    </AdminButton>
  </section>
);

export default ProgramSection;
