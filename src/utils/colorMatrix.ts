// 4×5 color matrix (20 floats) applied per-pixel: out = matrix * [R, G, B, A, 1]

type Matrix = number[];

function multiply(a: Matrix, b: Matrix): Matrix {
  const out: number[] = new Array(20).fill(0);
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 5; col++) {
      let sum = 0;
      for (let k = 0; k < 4; k++) {
        sum += a[row * 5 + k] * b[k * 5 + col];
      }
      // offset column (col=4) is additive, not multiplied
      if (col === 4) sum += a[row * 5 + 4];
      out[row * 5 + col] = sum;
    }
  }
  return out;
}

const identity: Matrix = [
  1, 0, 0, 0, 0,
  0, 1, 0, 0, 0,
  0, 0, 1, 0, 0,
  0, 0, 0, 1, 0,
];

// b > 1 = brighter, b < 1 = darker, b = 1 = no change
function brightnessMatrix(b: number): Matrix {
  return [
    b, 0, 0, 0, 0,
    0, b, 0, 0, 0,
    0, 0, b, 0, 0,
    0, 0, 0, 1, 0,
  ];
}

// c > 1 = more contrast, c < 1 = flat, c = 1 = no change
function contrastMatrix(c: number): Matrix {
  const t = (1 - c) * 0.5;
  return [
    c, 0, 0, 0, t,
    0, c, 0, 0, t,
    0, 0, c, 0, t,
    0, 0, 0, 1, 0,
  ];
}

// s = 1 normal, s = 0 greyscale, s > 1 oversaturated
// Uses ITU-R BT.601 luminance weights
function saturationMatrix(s: number): Matrix {
  const Rw = 0.299;
  const Gw = 0.587;
  const Bw = 0.114;
  const inv = 1 - s;
  return [
    Rw * inv + s, Gw * inv,     Bw * inv,     0, 0,
    Rw * inv,     Gw * inv + s, Bw * inv,     0, 0,
    Rw * inv,     Gw * inv,     Bw * inv + s, 0, 0,
    0,            0,            0,            1, 0,
  ];
}

// W3C hue-rotate matrix (luma weights: Rw=0.213, Gw=0.715, Bw=0.072)
function hueMatrix(degrees: number): Matrix {
  const rad = (degrees * Math.PI) / 180;
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  return [
    0.213 + c * 0.787 - s * 0.213,  0.715 - c * 0.715 - s * 0.715,  0.072 - c * 0.072 + s * 0.928,  0, 0,
    0.213 - c * 0.213 + s * 0.143,  0.715 + c * 0.285 + s * 0.140,  0.072 - c * 0.072 - s * 0.283,  0, 0,
    0.213 - c * 0.213 - s * 0.787,  0.715 - c * 0.715 + s * 0.715,  0.072 + c * 0.928 + s * 0.072,  0, 0,
    0, 0, 0, 1, 0,
  ];
}

/**
 * Returns a single 20-element ColorMatrix combining brightness, contrast, saturation, and hue.
 * brightness/contrast/saturation use 0.0–2.0 scale (1.0 = no change).
 * hue is in degrees (-180 to 180, 0 = no change).
 */
export function buildColorMatrix(
  brightness: number,
  contrast: number,
  saturation: number,
  hue: number = 0
): number[] {
  let m = identity;
  m = multiply(brightnessMatrix(brightness), m);
  m = multiply(contrastMatrix(contrast), m);
  m = multiply(saturationMatrix(saturation), m);
  if (hue !== 0) m = multiply(hueMatrix(hue), m);
  return m;
}

export function isIdentityAdjustment(
  brightness: number,
  contrast: number,
  saturation: number,
  hue: number = 0
): boolean {
  return brightness === 1.0 && contrast === 1.0 && saturation === 1.0 && hue === 0;
}
