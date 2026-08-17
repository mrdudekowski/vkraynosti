import { useRef, type ChangeEvent, type DragEvent, type ReactNode } from 'react';
import { CMS_MEDIA_ACCEPT } from '../../cms/cmsMediaAccept';

type AdminMediaDropzoneProps = {
  id: string;
  label: string;
  multiple?: boolean;
  disabled?: boolean;
  onFiles: (files: File[]) => void;
  children?: ReactNode;
};

const filesFromList = (list: FileList | null): File[] => (list == null ? [] : [...list]);

const AdminMediaDropzone = ({
  id,
  label,
  multiple = true,
  disabled = false,
  onFiles,
  children,
}: AdminMediaDropzoneProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const emit = (files: File[]) => {
    if (disabled || files.length === 0) {
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
      className={`admin-dropzone ${disabled ? 'pointer-events-none opacity-50' : ''}`.trim()}
      onDragOver={(event) => event.preventDefault()}
      onDrop={onDrop}
    >
      <input
        ref={inputRef}
        id={id}
        type="file"
        className="sr-only"
        accept={CMS_MEDIA_ACCEPT}
        multiple={multiple}
        disabled={disabled}
        onChange={onChange}
      />
      {children ?? <span>{label}</span>}
    </label>
  );
};

export default AdminMediaDropzone;
