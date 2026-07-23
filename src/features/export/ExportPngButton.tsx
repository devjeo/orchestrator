import { useCallback, useState, type RefObject } from 'react';
import { exportGridAsPng } from './exportPng';

interface ExportPngButtonProps {
    /** Ref to the DOM node to capture — pass WeeklyGrid's forwarded ref. */
    targetRef: RefObject<HTMLElement>;
    disabled?: boolean;
}

type Status = 'idle' | 'exporting' | 'error';

export function ExportPngButton({ targetRef, disabled }: ExportPngButtonProps) {
    const [status, setStatus] = useState<Status>('idle');

    const handleExport = useCallback(async () => {
        if (!targetRef.current) return;
        console.log('Exporting grid as PNG…');
        setStatus('exporting');
        try {
            await exportGridAsPng(targetRef.current);
            setStatus('idle');
        } catch (err) {
            console.error('PNG export failed:', err);
            setStatus('error');
        }
    }, [targetRef]);

    return (
        <button
            type="button"
            className="btn btn-secondary"
            onClick={handleExport}
            disabled={disabled || status === 'exporting'}
            aria-busy={status === 'exporting'}
        >
            {status === 'exporting' ? 'Exporting…' : 'Export as PNG'}
            {status === 'error' && (
                <span className="export-btn__error-dot" role="alert" title="Export failed — try again" />
            )}
        </button>
    );
}