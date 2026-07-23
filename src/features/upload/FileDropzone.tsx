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
  const [selectedFileName, setSelectedFileName] = useState<string | null>(
    null,
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0];
      if (!file) return;
      if (!isAcceptedFile(file)) {
        setError(
          `"${file.name}" isn't a spreadsheet file. Upload a .xlsx or .xls export instead.`,
        );
        return;
      }
      setError(null);
      setSelectedFileName(file.name);
      onFileSelected(file);
    },
    [onFileSelected],
  );

  return (
    <div className="stack">
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload schedule file"
        aria-busy={isLoading || undefined}
        className={`dropzone${isDragOver ? ' is-active' : ''}`}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
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
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS.join(',')}
          style={{ display: 'none' }}
          onChange={(e) => handleFiles(e.target.files)}
        />

        <svg
          className="dropzone-icon"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M12 15V4M12 4l-4 4M12 4l4 4"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <p className="dropzone-title">
          {isLoading
            ? 'Reading your file…'
            : selectedFileName
              ? 'Drop a new file to replace it'
              : 'Drop your class schedule here'}
        </p>
        <p className="dropzone-hint">
          {isLoading
            ? 'This only takes a moment.'
            : 'or click anywhere in this box to browse'}
        </p>

        {!isLoading && (
          <div className="row" style={{ gap: '0.4rem' }}>
            {ACCEPTED_EXTENSIONS.map((ext) => (
              <span key={ext} className="format-chip">
                {ext}
              </span>
            ))}
          </div>
        )}
      </div>

      {selectedFileName && !error && !isLoading && (
        <p
          className="row"
          style={{ color: 'var(--ink-500)', fontSize: 13.5 }}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M20 6 9 17l-5-5"
              stroke="var(--sage)"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Loaded <strong style={{ color: 'var(--ink-700)' }}>
            {selectedFileName}
          </strong>
        </p>
      )}

      {error && (
        <p role="alert" className="alert alert-error">
          {error}
        </p>
      )}
    </div>
  );
}