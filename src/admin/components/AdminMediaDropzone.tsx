import { useRef, type ChangeEvent, type DragEvent, type ReactNode } from 'react';
import { CMS_MEDIA_ACCEPT } from '../../cms/cmsMediaAccept';
import { useAdminStorage } from '../adminStorageContext';
import { ADMIN_UI } from '../constants/ui';

type AdminMediaDropzoneProps = {
  id: string;
  label: string;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  onFiles: (files: File[]) => void;
  children?: ReactNode;
};

const filesFromList = (list: FileList | null): File[] => (list == null ? [] : [...list]);

const AdminMediaDropzone = ({
  id,
  label,
  accept = CMS_MEDIA_ACCEPT,
  multiple = true,
  disabled = false,
  className = '',
  onFiles,
  children,
}: AdminMediaDropzoneProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { storage } = useAdminStorage();
  const blocked = disabled || storage !== 'closed';

  const emit = (files: File[]) => {
    if (blocked || files.length === 0) {
      return;
    }
    onFiles(files);
    if (inputRef.current != null) {
      inputRef.current.value = '';
    }
  };

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    emit(filesFromList(event.target.files));
  };

  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    emit(filesFromList(event.dataTransfer.files));
  };

  return (
    <label
      htmlFor={id}
      className={`admin-dropzone ${blocked ? 'pointer-events-none opacity-50' : ''} ${className}`.trim()}
      title={storage !== 'closed' ? ADMIN_UI.storageUnavailable : undefined}
      onDragOver={(event) => event.preventDefault()}
      onDrop={onDrop}
    >
      <input
        ref={inputRef}
        id={id}
        type="file"
        className="sr-only"
        accept={accept}
        multiple={multiple}
        disabled={blocked}
        aria-label={label}
        onChange={onChange}
      />
      {children ?? <span>{label}</span>}
    </label>
  );
};

export default AdminMediaDropzone;
