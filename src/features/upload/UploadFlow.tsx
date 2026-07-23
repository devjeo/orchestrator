import { useState } from 'react';
import { useStore } from '@/store';
import { readWorkbook } from '@/lib/parsing';
import { FileDropzone } from './FileDropzone';
import { ColumnMappingTable } from './ColumnMappingTable';
import { RawPreviewTable } from './RawPreviewTable';

export function UploadFlow() {
  const [isLoading, setIsLoading] = useState(false);
  const [readError, setReadError] = useState<string | null>(null);

  const headers = useStore((s) => s.headers);
  const rawRows = useStore((s) => s.rawRows);
  const mapping = useStore((s) => s.mapping);
  const unmatchedColumns = useStore((s) => s.unmatchedColumns);
  const setUpload = useStore((s) => s.setUpload);
  const setMapping = useStore((s) => s.setMapping);
  const confirmMapping = useStore((s) => s.confirmMapping);
  const resetUpload = useStore((s) => s.resetUpload);

  const handleFileSelected = async (file: File) => {
    setIsLoading(true);
    setReadError(null);
    try {
      const result = await readWorkbook(file);
      if (result.headers.length === 0) {
        setReadError('This file has no readable header row.');
        return;
      }
      setUpload(result);
    } catch {
      setReadError(
        'Could not read this file. Make sure it is a valid .xlsx or .xls file.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (headers.length === 0) {
    return (
      <div>
        <FileDropzone onFileSelected={handleFileSelected} isLoading={isLoading} />
        {readError && (
          <p role="alert" style={{ color: '#dc2626', marginTop: 8 }}>
            {readError}
          </p>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2 style={{ margin: 0, fontSize: 18 }}>Raw data preview</h2>
          <button onClick={resetUpload} style={secondaryButtonStyle}>
            Start over
          </button>
        </div>
        <div style={{ marginTop: 8 }}>
          <RawPreviewTable headers={headers} rows={rawRows} />
        </div>
      </div>

      <div>
        <h2 style={{ margin: 0, fontSize: 18 }}>Column mapping</h2>
        <div style={{ marginTop: 8 }}>
          <ColumnMappingTable
            headers={headers}
            mapping={mapping!}
            unmatchedColumns={unmatchedColumns}
            onChange={setMapping}
          />
        </div>
      </div>

      <button
        onClick={confirmMapping}
        disabled={!mapping?.subjectCode || !mapping?.scheduleString}
        style={primaryButtonStyle}
      >
        Generate schedule
      </button>
      {(!mapping?.subjectCode || !mapping?.scheduleString) && (
        <p style={{ color: '#64748b', fontSize: 13, marginTop: -8 }}>
          Subject Code and Schedule must be mapped to continue.
        </p>
      )}
    </div>
  );
}

const primaryButtonStyle = {
  background: '#6366f1',
  color: 'white',
  border: 'none',
  borderRadius: 8,
  padding: '0.6rem 1.2rem',
  fontWeight: 600,
  cursor: 'pointer',
  alignSelf: 'flex-start' as const,
};

const secondaryButtonStyle = {
  background: 'transparent',
  color: '#64748b',
  border: '1px solid #cbd5e1',
  borderRadius: 8,
  padding: '0.4rem 0.9rem',
  cursor: 'pointer',
};
