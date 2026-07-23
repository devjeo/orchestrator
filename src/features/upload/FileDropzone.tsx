import { useCallback, useRef, useState } from 'react';

interface FileDropzoneProps {
  onFileSelected: (file: File) => void;
  isLoading?: boolean;
}

const ACCEPTED_EXTENSIONS = ['.xlsx', '.xls'];

function isAcceptedFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext));
}

export function FileDropzone({
  onFileSelected,
  isLoading,
}: FileDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0];
      if (!file) return;
      if (!isAcceptedFile(file)) {
        setError('Please upload a .xlsx or .xls file.');
        return;
      }
      setError(null);
      onFileSelected(file);
    },
    [onFileSelected],
  );

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload schedule file"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        style={{
          border: `2px dashed ${isDragOver ? '#6366f1' : '#cbd5e1'}`,
          borderRadius: 12,
          padding: '3rem 1.5rem',
          textAlign: 'center',
          cursor: 'pointer',
          background: isDragOver ? '#eef2ff' : '#f8fafc',
          transition: 'background 0.15s, border-color 0.15s',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS.join(',')}
          style={{ display: 'none' }}
          onChange={(e) => handleFiles(e.target.files)}
        />
        <p style={{ margin: 0, fontWeight: 600 }}>
          {isLoading
            ? 'Reading file…'
            : 'Drag & drop your schedule file, or click to browse'}
        </p>
        <p style={{ margin: '0.5rem 0 0', color: '#64748b', fontSize: 14 }}>
          .xlsx or .xls
        </p>
      </div>
      {error && (
        <p role="alert" style={{ color: '#dc2626', marginTop: 8 }}>
          {error}
        </p>
      )}
    </div>
  );
}
