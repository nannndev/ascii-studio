import type { ImageTransformAction } from '../types/studio';

export interface PreprocessedBuffers {
  rgbBuf: Uint8ClampedArray;
  finalLum: Float32Array;
}

export function preprocessSampleBuffer(
  imgData: Uint8ClampedArray,
  w: number,
  h: number,
  contrast: number,
  brightness: number,
  sharpen: number,
  edgeDetect: boolean
): PreprocessedBuffers {
  const total = w * h;
  const rgbBuf = new Uint8ClampedArray(total * 3);
  const lumBuf = new Float32Array(total);

  for (let i = 0; i < total; i++) {
    const idx = i * 4;
    const a = imgData[idx + 3] / 255;
    let r = imgData[idx] * a;
    let g = imgData[idx + 1] * a;
    let b = imgData[idx + 2] * a;

    r = Math.min(255, Math.max(0, (r - 128) * contrast + 128 + brightness));
    g = Math.min(255, Math.max(0, (g - 128) * contrast + 128 + brightness));
    b = Math.min(255, Math.max(0, (b - 128) * contrast + 128 + brightness));

    rgbBuf[i * 3] = r;
    rgbBuf[i * 3 + 1] = g;
    rgbBuf[i * 3 + 2] = b;
    lumBuf[i] = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  let sharpLum = lumBuf;
  if (sharpen > 0 && w > 2 && h > 2) {
    const amount = sharpen * 1.45;
    sharpLum = new Float32Array(lumBuf);
    const sharpRgb = new Uint8ClampedArray(rgbBuf);
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const i = y * w + x;
        const blurL =
          (lumBuf[i - w] + lumBuf[i + w] + lumBuf[i - 1] + lumBuf[i + 1]) * 0.25;
        sharpLum[i] = Math.min(
          255,
          Math.max(0, lumBuf[i] + (lumBuf[i] - blurL) * amount)
        );

        for (let c = 0; c < 3; c++) {
          const ci = i * 3 + c;
          const blurC =
            (rgbBuf[(i - w) * 3 + c] +
              rgbBuf[(i + w) * 3 + c] +
              rgbBuf[(i - 1) * 3 + c] +
              rgbBuf[(i + 1) * 3 + c]) *
            0.25;
          sharpRgb[ci] = Math.min(
            255,
            Math.max(0, rgbBuf[ci] + (rgbBuf[ci] - blurC) * amount)
          );
        }
      }
    }
    rgbBuf.set(sharpRgb);
  }

  let finalLum = sharpLum;
  if (edgeDetect && w > 2 && h > 2) {
    finalLum = new Float32Array(total);
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const tl = sharpLum[(y - 1) * w + (x - 1)];
        const tc = sharpLum[(y - 1) * w + x];
        const tr = sharpLum[(y - 1) * w + (x + 1)];
        const ml = sharpLum[y * w + (x - 1)];
        const mr = sharpLum[y * w + (x + 1)];
        const bl = sharpLum[(y + 1) * w + (x - 1)];
        const bc = sharpLum[(y + 1) * w + x];
        const br = sharpLum[(y + 1) * w + (x + 1)];

        const gx = -tl - 2 * ml - bl + tr + 2 * mr + br;
        const gy = -tl - 2 * tc - tr + bl + 2 * bc + br;
        finalLum[y * w + x] = Math.min(255, Math.sqrt(gx * gx + gy * gy) * 1.15);
      }
    }
  }

  return { rgbBuf, finalLum };
}

export function transformCanvasImage(
  sourceCanvas: HTMLCanvasElement,
  action: ImageTransformAction
): boolean {
  const w = sourceCanvas.width;
  const h = sourceCanvas.height;
  if (!w || !h) return false;

  const tmp = document.createElement('canvas');
  const tctx = tmp.getContext('2d');
  if (!tctx) return false;

  if (action === 'flipH') {
    tmp.width = w;
    tmp.height = h;
    tctx.translate(w, 0);
    tctx.scale(-1, 1);
    tctx.drawImage(sourceCanvas, 0, 0);
  } else if (action === 'flipV') {
    tmp.width = w;
    tmp.height = h;
    tctx.translate(0, h);
    tctx.scale(1, -1);
    tctx.drawImage(sourceCanvas, 0, 0);
  } else if (action === 'rotateCw') {
    tmp.width = h;
    tmp.height = w;
    tctx.translate(h, 0);
    tctx.rotate(Math.PI / 2);
    tctx.drawImage(sourceCanvas, 0, 0);
  } else if (action === 'cropSquare') {
    const side = Math.min(w, h);
    tmp.width = side;
    tmp.height = side;
    tctx.drawImage(
      sourceCanvas,
      (w - side) / 2,
      (h - side) / 2,
      side,
      side,
      0,
      0,
      side,
      side
    );
  }

  sourceCanvas.width = tmp.width;
  sourceCanvas.height = tmp.height;
  const sctx = sourceCanvas.getContext('2d');
  if (!sctx) return false;
  sctx.drawImage(tmp, 0, 0);
  return true;
}
