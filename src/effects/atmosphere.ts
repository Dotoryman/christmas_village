/** Delicate steam and smoke with continuous curves instead of separate blobs. */
export function wisp(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  x: number,
  y: number,
  rise: number,
  time: number,
  strength: number,
  cool = false,
) {
  ctx.save();
  for (let strand = 0; strand < 3; strand++) {
    const phase = time * 0.34 + strand * 2.1;
    const opacity = (0.024 + Math.sin(time * 0.6 + strand) * 0.006) * strength;
    const gradient = ctx.createLinearGradient(0, y * height, 0, (y - rise) * height);
    gradient.addColorStop(0, `rgba(${cool ? '184,205,232' : '255,239,215'},0)`);
    gradient.addColorStop(0.28, `rgba(${cool ? '184,205,232' : '255,239,215'},${opacity})`);
    gradient.addColorStop(0.7, `rgba(${cool ? '184,205,232' : '255,239,215'},${opacity * 0.7})`);
    gradient.addColorStop(1, 'rgba(255,245,230,0)');
    ctx.strokeStyle = gradient;
    ctx.lineWidth = width * (cool ? 0.011 : 0.005);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x * width, y * height);
    for (let i = 1; i <= 24; i++) {
      const u = i / 24;
      const sway = Math.sin(u * 7 - phase) * u * (cool ? 0.028 : 0.009);
      ctx.lineTo((x + sway + strand * 0.002) * width, (y - rise * u) * height);
    }
    // A wide, faint veil plus a narrow core softens the old thread-like trails.
    ctx.globalAlpha = 0.28;
    ctx.lineWidth *= 2.6;
    ctx.stroke();
    ctx.globalAlpha = 0.55;
    ctx.lineWidth /= 2.6;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

/** Tiny photographic displacement at the outer branches only. Attachment points
 * remain still; the camera, cabin and interactive light plates never move. */
export function branchSway(
  ctx: CanvasRenderingContext2D,
  art: HTMLImageElement,
  width: number,
  height: number,
  time: number,
  gust: boolean,
) {
  const drift =
    (Math.sin(time * 0.62) + 0.33 * Math.sin(time * 1.17 + 0.8)) * 0.0014 * (gust ? 1.6 : 1);
  const patches = [
    {
      pivot: [0, 0.1],
      sign: 1,
      points: [
        [0, 0],
        [0.105, 0],
        [0.15, 0.045],
        [0.1, 0.09],
        [0.135, 0.16],
        [0.08, 0.22],
        [0.13, 0.31],
        [0.06, 0.35],
        [0, 0.36],
      ],
    },
    {
      pivot: [1, 0.025],
      sign: -1,
      points: [
        [1, 0],
        [0.92, 0],
        [0.94, 0.075],
        [0.865, 0.12],
        [0.92, 0.16],
        [0.88, 0.215],
        [0.95, 0.245],
        [1, 0.24],
      ],
    },
  ];
  for (const patch of patches) {
    ctx.save();
    ctx.beginPath();
    patch.points.forEach(([x, y], i) =>
      i ? ctx.lineTo(x * width, y * height) : ctx.moveTo(x * width, y * height),
    );
    ctx.closePath();
    ctx.clip();
    const x = patch.pivot[0] * width,
      y = patch.pivot[1] * height;
    ctx.translate(x, y);
    ctx.rotate(drift * patch.sign);
    ctx.translate(-x, -y);
    ctx.drawImage(art, 0, 0, width, height);
    ctx.restore();
  }
}

export function starShimmer(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
) {
  // Fixed points in the existing clear sky; no new star field or flashing pattern.
  const stars = [
    [0.578, 0.028],
    [0.614, 0.056],
    [0.539, 0.087],
    [0.872, 0.053],
    [0.829, 0.024],
    [0.481, 0.105],
  ];
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  stars.forEach(([x, y], i) => {
    const alpha =
      0.035 + Math.pow(0.5 + 0.5 * Math.sin(time * (0.36 + i * 0.031) + i * 2.3), 4) * 0.22;
    const r = Math.max(0.6, width * 0.0018),
      gradient = ctx.createRadialGradient(x * width, y * height, 0, x * width, y * height, r * 2.6);
    gradient.addColorStop(0, `rgba(230,240,255,${alpha})`);
    gradient.addColorStop(1, 'rgba(230,240,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(x * width - r * 2.6, y * height - r * 2.6, r * 5.2, r * 5.2);
  });
  ctx.restore();
}

export function windowSnow(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0.622 * width, 0.25 * height);
  ctx.lineTo(0.812 * width, 0.264 * height);
  ctx.lineTo(0.818 * width, 0.463 * height);
  ctx.lineTo(0.617 * width, 0.458 * height);
  ctx.closePath();
  ctx.clip();
  ctx.fillStyle = '#dceeff80';
  for (let i = 0; i < 22; i++) {
    const phase = i * 1.618;
    const x = 0.618 + ((i * 0.037) % 0.2) + Math.sin(time * 0.3 + phase) * 0.003;
    const y = 0.25 + ((i * 0.043 + time * (0.014 + (i % 3) * 0.004)) % 0.22);
    ctx.beginPath();
    ctx.arc(x * width, y * height, 0.45 + (i % 3) * 0.18, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
