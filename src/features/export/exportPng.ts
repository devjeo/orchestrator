import { toPng } from 'html-to-image';

export interface ExportPngOptions {
  /** Defaults to `schedule-YYYY-MM-DD.png` */
  filename?: string;
  /** Defaults to the app's --paper token so transparent PNG regions don't turn black on open */
  backgroundColor?: string;
  /** 2 = retina-quality export. Bump to 3 for print use, at the cost of file size. */
  pixelRatio?: number;
}

interface StyleOverride {
  el: HTMLElement;
  prevCssText: string;
}

/**
 * Walks from `node` up to (but not including) `document.body`, and for
 * any ancestor whose computed style would clip or scroll its content
 * (overflow other than visible, or a constrained height/max-height),
 * temporarily forces it open so the full content is present in the
 * DOM's layout box. Returns a restore function that puts every
 * touched element's inline style back exactly as it was.
 *
 * This exists because `toPng` rasterizes whatever is actually laid
 * out — it doesn't know about content sitting below a scrollable
 * container's fold. Without this, any ancestor with e.g.
 * `max-height` + `overflow-y: auto` (a common pattern so a tall
 * weekly grid doesn't blow out page length) causes the export to be
 * cut off at the same point the on-screen scroll would be, even
 * though the full grid is present in the DOM.
 */
function suspendClipping(node: HTMLElement): () => void {
  const overrides: StyleOverride[] = [];

  let el: HTMLElement | null = node;
  while (el && el !== document.body && el !== document.documentElement) {
    const computed = window.getComputedStyle(el);
    const clips =
      computed.overflow !== 'visible' ||
      computed.overflowX !== 'visible' ||
      computed.overflowY !== 'visible' ||
      (computed.maxHeight !== 'none' && computed.maxHeight !== '') ||
      (computed.height !== 'auto' && el !== node && computed.overflowY !== 'visible');

    if (clips) {
      overrides.push({ el, prevCssText: el.style.cssText });
      el.style.setProperty('overflow', 'visible', 'important');
      el.style.setProperty('overflow-x', 'visible', 'important');
      el.style.setProperty('overflow-y', 'visible', 'important');
      el.style.setProperty('max-height', 'none', 'important');
      // Let height be determined by content instead of a fixed/percentage value.
      el.style.setProperty('height', 'auto', 'important');
    }

    el = el.parentElement;
  }

  return () => {
    for (const { el, prevCssText } of overrides) {
      el.style.cssText = prevCssText;
    }
  };
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
    pixelRatio = 6,
  } = options;

  // Force any clipping/scrolling ancestor open so the whole grid is
  // actually present in the layout before we measure/capture it.
  const restore = suspendClipping(node);

  try {
    // Re-measure after un-clipping — scrollWidth/scrollHeight now
    // reflect the *full* content size, not just the visible box.
    const width = node.scrollWidth;
    const height = node.scrollHeight;

    const dataUrl = await toPng(node, {
      backgroundColor,
      pixelRatio,
      cacheBust: true,
      width,
      height,
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
  } finally {
    // Always put the page back the way it was, even if toPng throws.
    restore();
  }
}