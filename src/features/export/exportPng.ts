import { toPng } from 'html-to-image';

export interface ExportPngOptions {
  /** Defaults to `schedule-YYYY-MM-DD.png` */
  filename?: string;
  /** Defaults to the app's --paper token so transparent PNG regions don't turn black on open */
  backgroundColor?: string;
  /** 2 = retina-quality export. Bump to 3 for print use, at the cost of file size. */
  pixelRatio?: number;
}

/**
 * Rasterizes a DOM node (the weekly grid) to a PNG and triggers a
 * browser download. Live-state UI that doesn't belong in a static
 * snapshot — the current-time line, hover tooltips — is filtered out.
 */
export async function exportGridAsPng(
  node: HTMLElement,
  options: ExportPngOptions = {},
): Promise<void> {
  const {
    filename = `schedule-${new Date().toISOString().slice(0, 10)}.png`,
    backgroundColor = '#faf8f2', // --paper
    pixelRatio = 2,
  } = options;

  const dataUrl = await toPng(node, {
    backgroundColor,
    pixelRatio,
    cacheBust: true,
    filter: (el) => {
      if (!(el instanceof HTMLElement)) return true;
      // Both are live/interactive UI, not part of a static export.
      if (el.classList.contains('now-line')) return false;
      if (el.classList.contains('day-header__tooltip')) return false;
      return true;
    },
  });

  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}