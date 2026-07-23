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

  const canGenerate = Boolean(mapping?.subjectCode && mapping?.scheduleString);

  if (headers.length === 0) {
    return (
      <div className="stack">
        <FileDropzone onFileSelected={handleFileSelected} isLoading={isLoading} />

        <div className="row" style={{ justifyContent: 'center' }}>
          <span className="format-chip">.xlsx</span>
          <span className="format-chip">.xls</span>
        </div>

        {readError && (
          <div className="alert alert-error" role="alert">
            <strong>Couldn't read that file.</strong>&nbsp;{readError}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="stack" style={{ gap: '1.5rem' }}>
      <section className="card card-pad">
        <div className="row-between">
          <h2 style={{ fontSize: 18, fontFamily: 'var(--font-display)' }}>
            Raw data preview
          </h2>
          <button onClick={resetUpload} className="btn btn-secondary">
            Start over
          </button>
        </div>
        <div style={{ marginTop: 12 }}>
          <div className="table-scroll">
            <RawPreviewTable headers={headers} rows={rawRows} />
          </div>
        </div>
      </section>

      <section className="card card-pad">
        <div className="section-heading">
          <h2 style={{ fontFamily: 'var(--font-display)' }}>Column mapping</h2>
          {unmatchedColumns.length > 0 && (
            <span className="badge badge-amber">
              {unmatchedColumns.length} unmatched
            </span>
          )}
        </div>
        <ColumnMappingTable
          headers={headers}
          mapping={mapping!}
          unmatchedColumns={unmatchedColumns}
          onChange={setMapping}
        />
      </section>

      <div className="stack" style={{ gap: '0.5rem' }}>
        <button
          onClick={confirmMapping}
          disabled={!canGenerate}
          className="btn btn-primary"
          style={{ alignSelf: 'flex-start' }}
        >
          Generate schedule
        </button>
        {!canGenerate && (
          <p className="section-hint">
            Subject Code and Schedule must be mapped to continue.
          </p>
        )}
      </div>
    </div>
  );
}