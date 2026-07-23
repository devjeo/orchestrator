/**
 * Assigns each subject code a soft, eye-friendly pastel color, deterministically
 * (same code -> same color every time, no state needed) using OKLCH — which
 * keeps perceived lightness/chroma constant while only hue varies, unlike
 * plain HSL where e.g. yellow and blue don't feel equally "pastel."
 */

const GOLDEN_ANGLE = 137.508; // degrees — spreads hues evenly, avoids clustering

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0; // 32-bit
  }
  return Math.abs(hash);
}

/** Fixed lightness/chroma for a consistent pastel look; only hue changes per subject. */
const PASTEL_LIGHTNESS = 0.85;
const PASTEL_CHROMA = 0.08;

const COLORBLIND_SAFE_PALETTE = [
  'oklch(0.85 0.10 250)', // blue
  'oklch(0.85 0.12 85)', // yellow
  'oklch(0.80 0.12 55)', // orange
];

export function colorForSubject(
  subjectCode: string,
  colorblindSafe = false,
): string {
  if (colorblindSafe) {
    const index = hashString(subjectCode) % COLORBLIND_SAFE_PALETTE.length;
    return COLORBLIND_SAFE_PALETTE[index];
  }
  const hue = (hashString(subjectCode) * GOLDEN_ANGLE) % 360;
  return `oklch(${PASTEL_LIGHTNESS} ${PASTEL_CHROMA} ${hue.toFixed(1)})`;
}
