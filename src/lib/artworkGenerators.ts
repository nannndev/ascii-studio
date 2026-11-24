import type {
  AnimPreset,
  BannerStyle,
  Object3DType,
  SampleArtworkName,
} from '../types/studio';

export function drawSampleArtwork(
  canvas: HTMLCanvasElement,
  name: SampleArtworkName
): void {
  canvas.width = 480;
  canvas.height = 360;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.fillStyle = '#050508';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (name === 'sphere') {
    const bgGrad = ctx.createRadialGradient(240, 180, 20, 240, 180, 240);
    bgGrad.addColorStop(0, '#1e1b4b');
    bgGrad.addColorStop(1, '#050508');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 480, 360);

    const g = ctx.createRadialGradient(195, 130, 15, 240, 180, 135);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.28, '#38bdf8');
    g.addColorStop(0.65, '#6366f1');
    g.addColorStop(1, '#09090b');
    ctx.beginPath();
    ctx.arc(240, 180, 130, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();

    ctx.strokeStyle = 'rgba(244,114,182,0.85)';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.ellipse(240, 185, 195, 42, -0.22, 0, Math.PI * 2);
    ctx.stroke();
  } else if (name === 'sunset') {
    const sky = ctx.createLinearGradient(0, 0, 0, 220);
    sky.addColorStop(0, '#1e1b4b');
    sky.addColorStop(0.55, '#a21caf');
    sky.addColorStop(1, '#f97316');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 480, 220);

    const sun = ctx.createLinearGradient(0, 60, 0, 210);
    sun.addColorStop(0, '#fef08a');
    sun.addColorStop(1, '#ec4899');
    ctx.beginPath();
    ctx.arc(240, 165, 82, 0, Math.PI * 2);
    ctx.fillStyle = sun;
    ctx.fill();

    ctx.fillStyle = '#09090b';
    for (let y = 145; y < 220; y += 14) {
      ctx.fillRect(140, y, 200, (y - 135) * 0.12);
    }

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 220, 480, 140);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    for (let i = 0; i < 9; i++) {
      const y = 225 + i * i * 2.1;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(480, y);
      ctx.stroke();
    }
    for (let x = -240; x <= 720; x += 60) {
      ctx.beginPath();
      ctx.moveTo(240, 220);
      ctx.lineTo(x, 360);
      ctx.stroke();
    }
  } else if (name === 'wave') {
    for (let y = 0; y < 360; y += 6) {
      for (let x = 0; x < 480; x += 6) {
        const v =
          Math.sin(x * 0.03) * Math.cos(y * 0.035) +
          Math.sin((x + y) * 0.02);
        const n = (v + 2) / 4;
        ctx.fillStyle = `rgb(${Math.round(n * 255)}, ${Math.round(
          (1 - Math.abs(n - 0.5) * 2) * 230
        )}, ${Math.round((1 - n) * 255)})`;
        ctx.fillRect(x, y, 6, 6);
      }
    }
  } else {
    const bg = ctx.createLinearGradient(0, 0, 480, 360);
    bg.addColorStop(0, '#09090b');
    bg.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 480, 360);

    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.roundRect(140, 65, 200, 210, 36);
    ctx.fill();

    const visor = ctx.createLinearGradient(165, 125, 315, 175);
    visor.addColorStop(0, '#22d3ee');
    visor.addColorStop(1, '#a855f7');
    ctx.fillStyle = visor;
    ctx.beginPath();
    ctx.roundRect(165, 125, 150, 52, 16);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(205, 151, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(275, 151, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(195, 215, 90, 14);
    ctx.fillStyle = '#475569';
    ctx.fillRect(195, 275, 90, 65);
  }
}

export function drawTextBanner(
  canvas: HTMLCanvasElement,
  bannerText: string,
  bannerFont: string,
  bannerStyle: BannerStyle
): void {
  canvas.width = 720;
  canvas.height = 220;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const txt = (bannerText || 'ASCII').toUpperCase();
  ctx.font = bannerFont;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (bannerStyle === 'shadow') {
    ctx.fillStyle = '#6366f1';
    ctx.fillText(txt, canvas.width / 2 + 8, canvas.height / 2 + 8);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(txt, canvas.width / 2, canvas.height / 2);
  } else if (bannerStyle === 'outline') {
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.strokeText(txt, canvas.width / 2, canvas.height / 2);
  } else {
    const g = ctx.createLinearGradient(120, 40, 600, 180);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.5, '#38bdf8');
    g.addColorStop(1, '#e879f9');
    ctx.fillStyle = g;
    ctx.fillText(txt, canvas.width / 2, canvas.height / 2);
  }
}

export function drawProceduralAnimationFrame(
  canvas: HTMLCanvasElement,
  preset: AnimPreset,
  now: number
): void {
  canvas.width = 360;
  canvas.height = 240;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const t = now * 0.0018;
  ctx.fillStyle = '#040407';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (preset === 'orbit') {
    for (let i = 0; i < 48; i++) {
      const a = t * 1.4 + (i / 48) * Math.PI * 2;
      const x = 180 + Math.cos(a) * 120;
      const z = Math.sin(a);
      const y = 120 + Math.sin(a * 2) * 45 + z * 28;
      const r = 4 + (z + 1) * 7;
      ctx.fillStyle = `hsl(${(i * 7 + t * 50) % 360}, 90%, ${45 + z * 25}%)`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    const core = ctx.createRadialGradient(170, 110, 6, 180, 120, 46);
    core.addColorStop(0, '#ffffff');
    core.addColorStop(0.5, '#818cf8');
    core.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(180, 120, 44, 0, Math.PI * 2);
    ctx.fill();
  } else if (preset === 'plasma') {
    for (let y = 0; y < 240; y += 8) {
      for (let x = 0; x < 360; x += 8) {
        const v =
          Math.sin(x * 0.03 + t) +
          Math.sin(y * 0.04 - t * 1.2) +
          Math.sin((x + y) * 0.025 + t);
        const n = (v + 3) / 6;
        ctx.fillStyle = `hsl(${Math.round(n * 300 + t * 40) % 360}, 95%, ${Math.round(
          n * 75
        )}%)`;
        ctx.fillRect(x, y, 8, 8);
      }
    }
  } else if (preset === 'rain') {
    for (let i = 0; i < 36; i++) {
      const x = i * 10;
      const y = ((t * 110 * (1 + (i % 4) * 0.35) + i * 37) % 280) - 40;
      const g = ctx.createLinearGradient(x, y - 65, x, y);
      g.addColorStop(0, 'rgba(34,197,94,0)');
      g.addColorStop(0.8, '#22c55e');
      g.addColorStop(1, '#ffffff');
      ctx.fillStyle = g;
      ctx.fillRect(x + 1, y - 65, 7, 65);
    }
  } else if (preset === 'radar') {
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 2;
    for (let r = 30; r <= 105; r += 25) {
      ctx.beginPath();
      ctx.arc(180, 120, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    const ang = t * 2.2;
    for (let k = 0; k < 22; k++) {
      ctx.strokeStyle = `rgba(74, 222, 128, ${(22 - k) / 24})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(180, 120);
      ctx.lineTo(
        180 + Math.cos(ang - k * 0.04) * 105,
        120 + Math.sin(ang - k * 0.04) * 105
      );
      ctx.stroke();
    }
  } else if (preset === 'bars') {
    const count = 18;
    const bw = 360 / count;
    for (let i = 0; i < count; i++) {
      const amp = (Math.sin(t * 3.5 + i * 0.55) * 0.5 + 0.5) * 170 + 25;
      const g = ctx.createLinearGradient(0, 230 - amp, 0, 230);
      g.addColorStop(0, '#f472b6');
      g.addColorStop(0.5, '#38bdf8');
      g.addColorStop(1, '#4f46e5');
      ctx.fillStyle = g;
      ctx.fillRect(i * bw + 3, 230 - amp, bw - 6, amp);
    }
  } else {
    const verts: [number, number, number][] = [
      [-1, -1, -1],
      [1, -1, -1],
      [1, 1, -1],
      [-1, 1, -1],
      [-1, -1, 1],
      [1, -1, 1],
      [1, 1, 1],
      [-1, 1, 1],
    ];
    const edges: [number, number][] = [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [4, 5],
      [5, 6],
      [6, 7],
      [7, 4],
      [0, 4],
      [1, 5],
      [2, 6],
      [3, 7],
    ];
    const ca = Math.cos(t);
    const sa = Math.sin(t);
    const cb = Math.cos(t * 0.7);
    const sb = Math.sin(t * 0.7);
    const proj = verts.map(([x, y, z]) => {
      const x1 = x * ca - z * sa;
      const z1 = x * sa + z * ca;
      const y2 = y * cb - z1 * sb;
      const z2 = y * sb + z1 * cb;
      const s = 170 / (z2 + 3.4);
      return [180 + x1 * s, 120 + y2 * s] as [number, number];
    });
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 6;
    edges.forEach(([a, b]) => {
      ctx.beginPath();
      ctx.moveTo(proj[a][0], proj[a][1]);
      ctx.lineTo(proj[b][0], proj[b][1]);
      ctx.stroke();
    });
  }
}

export function draw3DObject(
  canvas: HTMLCanvasElement,
  obj3d: Object3DType,
  rotX: number,
  rotY: number
): void {
  canvas.width = 320;
  canvas.height = 240;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.fillStyle = '#030306';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const cosX = Math.cos(rotX);
  const sinX = Math.sin(rotX);
  const cosY = Math.cos(rotY);
  const sinY = Math.sin(rotY);

  interface ProjectedPoint {
    sx: number;
    sy: number;
    z: number;
    lum: number;
    hue: number;
  }

  const points: ProjectedPoint[] = [];

  const pushPoint = (
    x: number,
    y: number,
    z: number,
    nx: number,
    ny: number,
    nz: number,
    hue: number
  ) => {
    const x1 = x * cosY + z * sinY;
    const z1 = -x * sinY + z * cosY;
    const y2 = y * cosX - z1 * sinX;
    const z2 = y * sinX + z1 * cosX;

    const nx1 = nx * cosY + nz * sinY;
    const nz1 = -nx * sinY + nz * cosY;
    const ny2 = ny * cosX - nz1 * sinX;
    const nz2 = ny * sinX + nz1 * cosX;

    const lum = Math.max(0.12, nx1 * 0.45 - ny2 * 0.55 + nz2 * 0.7);
    const depth = z2 + 4.2;
    if (depth <= 0.4) return;
    const scale = 250 / depth;
    points.push({ sx: 160 + x1 * scale, sy: 120 + y2 * scale, z: z2, lum, hue });
  };

  if (obj3d === 'donut') {
    const R = 1.15;
    const r = 0.48;
    for (let u = 0; u < Math.PI * 2; u += 0.16) {
      for (let v = 0; v < Math.PI * 2; v += 0.24) {
        const cu = Math.cos(u);
        const su = Math.sin(u);
        const cv = Math.cos(v);
        const sv = Math.sin(v);
        pushPoint(
          (R + r * cv) * cu,
          (R + r * cv) * su,
          r * sv,
          cv * cu,
          cv * su,
          sv,
          210 + (u / (Math.PI * 2)) * 120
        );
      }
    }
  } else if (obj3d === 'globe') {
    const R = 1.35;
    for (let lat = -Math.PI / 2; lat <= Math.PI / 2; lat += 0.14) {
      for (let lon = 0; lon < Math.PI * 2; lon += 0.18) {
        const x = R * Math.cos(lat) * Math.cos(lon);
        const y = R * Math.sin(lat);
        const z = R * Math.cos(lat) * Math.sin(lon);
        const isGrid =
          Math.abs(lat * 4) % 1 < 0.22 || Math.abs(lon * 3) % 1 < 0.18;
        if (isGrid) pushPoint(x, y, z, x / R, y / R, z / R, 165 + lat * 45);
      }
    }
  } else if (obj3d === 'knot') {
    for (let t = 0; t < Math.PI * 2; t += 0.045) {
      const x = (Math.sin(t) + 2 * Math.sin(2 * t)) * 0.45;
      const y = (Math.cos(t) - 2 * Math.cos(2 * t)) * 0.45;
      const z = -Math.sin(3 * t) * 0.55;
      pushPoint(
        x,
        y,
        z,
        Math.cos(t),
        Math.sin(t),
        0.7,
        (t / (Math.PI * 2)) * 360
      );
    }
  } else {
    const verts: [number, number, number][] = [
      [0, -1.35, 0],
      [-1.2, 1.0, -1.2],
      [1.2, 1.0, -1.2],
      [1.2, 1.0, 1.2],
      [-1.2, 1.0, 1.2],
    ];
    const faces: [number, number, number][] = [
      [0, 1, 2],
      [0, 2, 3],
      [0, 3, 4],
      [0, 4, 1],
    ];
    faces.forEach((f, fi) => {
      const [a, b, d] = f.map((idx) => verts[idx]);
      for (let u = 0; u <= 1; u += 0.08) {
        for (let v = 0; v <= 1 - u; v += 0.08) {
          const w = 1 - u - v;
          const x = a[0] * u + b[0] * v + d[0] * w;
          const y = a[1] * u + b[1] * v + d[1] * w;
          const z = a[2] * u + b[2] * v + d[2] * w;
          pushPoint(x, y, z, x * 0.5, -0.4, z * 0.5, 25 + fi * 65);
        }
      }
    });
  }

  points.sort((a, b) => a.z - b.z);
  for (const p of points) {
    const light = Math.min(92, Math.round(p.lum * 78));
    ctx.fillStyle = `hsl(${Math.round(p.hue) % 360}, 92%, ${light}%)`;
    ctx.fillRect(p.sx - 4, p.sy - 4, 8, 8);
  }
}
