/** Delicate steam and smoke with continuous curves instead of separate blobs. */
export function wisp(ctx: CanvasRenderingContext2D, width: number, height: number, x: number, y: number, rise: number, time: number, strength: number, cool = false) {
  ctx.save();
  for (let strand = 0; strand < 3; strand++) {
    const phase = time * .34 + strand * 2.1;
    const opacity = (.024 + Math.sin(time * .6 + strand) * .006) * strength;
    const gradient = ctx.createLinearGradient(0, y * height, 0, (y - rise) * height);
    gradient.addColorStop(0, `rgba(${cool ? '184,205,232' : '255,239,215'},0)`);
    gradient.addColorStop(.28, `rgba(${cool ? '184,205,232' : '255,239,215'},${opacity})`);
    gradient.addColorStop(.7, `rgba(${cool ? '184,205,232' : '255,239,215'},${opacity * .7})`);
    gradient.addColorStop(1, 'rgba(255,245,230,0)');
    ctx.strokeStyle = gradient; ctx.lineWidth = width * (cool ? .011 : .005); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x * width, y * height);
    for (let i = 1; i <= 24; i++) {
      const u = i / 24;
      const sway = Math.sin(u * 7 - phase) * u * (cool ? .028 : .009);
      ctx.lineTo((x + sway + strand * .002) * width, (y - rise * u) * height);
    }
    // A wide, faint veil plus a narrow core softens the old thread-like trails.
    ctx.globalAlpha=.28;ctx.lineWidth*=2.6;ctx.stroke();
    ctx.globalAlpha=.55;ctx.lineWidth/=2.6;ctx.stroke();ctx.globalAlpha=1;
  }
  ctx.restore();
}

/** Tiny photographic displacement at the outer branches only. Attachment points
 * remain still; the camera, cabin and interactive light plates never move. */
export function branchSway(ctx:CanvasRenderingContext2D,art:HTMLImageElement,width:number,height:number,time:number,gust:boolean) {
  const drift=(Math.sin(time*.62)+.33*Math.sin(time*1.17+.8))*.0014*(gust?1.6:1);
  const patches=[
    {pivot:[0,.10],sign:1,points:[[0,0],[.105,0],[.15,.045],[.10,.09],[.135,.16],[.08,.22],[.13,.31],[.06,.35],[0,.36]]},
    {pivot:[1,.025],sign:-1,points:[[1,0],[.92,0],[.94,.075],[.865,.12],[.92,.16],[.88,.215],[.95,.245],[1,.24]]},
  ];
  for(const patch of patches){ctx.save();ctx.beginPath();patch.points.forEach(([x,y],i)=>i?ctx.lineTo(x*width,y*height):ctx.moveTo(x*width,y*height));ctx.closePath();ctx.clip();
    const x=patch.pivot[0]*width,y=patch.pivot[1]*height;ctx.translate(x,y);ctx.rotate(drift*patch.sign);ctx.translate(-x,-y);
    ctx.drawImage(art,0,0,width,height);ctx.restore();
  }
}

export function starShimmer(ctx:CanvasRenderingContext2D,width:number,height:number,time:number){
  // Fixed points in the existing clear sky; no new star field or flashing pattern.
  const stars=[[.578,.028],[.614,.056],[.539,.087],[.872,.053],[.829,.024],[.481,.105]];
  ctx.save();ctx.globalCompositeOperation='screen';
  stars.forEach(([x,y],i)=>{
    const alpha=.035+Math.pow(.5+.5*Math.sin(time*(.36+i*.031)+i*2.3),4)*.22;
    const r=Math.max(.6,width*.0018),gradient=ctx.createRadialGradient(x*width,y*height,0,x*width,y*height,r*2.6);
    gradient.addColorStop(0,`rgba(230,240,255,${alpha})`);gradient.addColorStop(1,'rgba(230,240,255,0)');
    ctx.fillStyle=gradient;ctx.fillRect(x*width-r*2.6,y*height-r*2.6,r*5.2,r*5.2);
  });ctx.restore();
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
