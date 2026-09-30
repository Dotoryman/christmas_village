/** Delicate steam and smoke with continuous curves instead of separate blobs. */
export function wisp(ctx: CanvasRenderingContext2D, width: number, height: number, x: number, y: number, rise: number, time: number, strength: number, cool = false) {
  ctx.save();
  for (let strand = 0; strand < 3; strand++) {
    const phase = time * .34 + strand * 2.1;
    const opacity = (.035 + Math.sin(time * .6 + strand) * .009) * strength;
    const gradient = ctx.createLinearGradient(0, y * height, 0, (y - rise) * height);
    gradient.addColorStop(0, `rgba(${cool ? '184,205,232' : '255,239,215'},0)`);
    gradient.addColorStop(.28, `rgba(${cool ? '184,205,232' : '255,239,215'},${opacity})`);
    gradient.addColorStop(.7, `rgba(${cool ? '184,205,232' : '255,239,215'},${opacity * .7})`);
    gradient.addColorStop(1, 'rgba(255,245,230,0)');
    ctx.strokeStyle = gradient; ctx.lineWidth = width * (cool ? .007 : .0035); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x * width, y * height);
    for (let i = 1; i <= 24; i++) {
      const u = i / 24;
      const sway = Math.sin(u * 7 - phase) * u * (cool ? .028 : .009);
      ctx.lineTo((x + sway + strand * .002) * width, (y - rise * u) * height);
    }
    ctx.stroke();
  }
  ctx.restore();
}

export function windowSnow(ctx: CanvasRenderingContext2D, width: number, height: number, time: number) {
  ctx.save();
  ctx.beginPath(); ctx.moveTo(.622 * width,.25 * height); ctx.lineTo(.812 * width,.264 * height); ctx.lineTo(.818 * width,.463 * height); ctx.lineTo(.617 * width,.458 * height); ctx.closePath(); ctx.clip();
  ctx.fillStyle = '#dceeff80';
  for(let i=0;i<22;i++) {
    const phase = i * 1.618;
    const x = .618 + (i * .037 % .20) + Math.sin(time * .3 + phase) * .003;
    const y = .25 + ((i * .043 + time * (.014 + i % 3 * .004)) % .22);
    ctx.beginPath(); ctx.arc(x * width,y * height, .45 + i % 3 * .18,0,Math.PI*2); ctx.fill();
  }
  ctx.restore();
}
