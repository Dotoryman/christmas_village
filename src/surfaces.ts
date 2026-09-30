import type { Scene } from './animation';
type Point = { x: number; y: number };
type Stroke = { points: Point[]; age: number };
const panes = [
  [[.625,.247],[.705,.254],[.705,.310],[.625,.305]],
  [[.719,.255],[.811,.262],[.811,.316],[.719,.311]],
  [[.625,.320],[.705,.325],[.706,.369],[.625,.364]],
  [[.719,.325],[.812,.331],[.812,.374],[.719,.369]],
  [[.625,.379],[.707,.384],[.707,.454],[.625,.450]],
  [[.720,.384],[.812,.391],[.812,.462],[.720,.456]],
];

/** Drawings stay in portrait coordinates across resize. A shared village loop
 * ages marks; no timers or independent animation loops run per gesture. */
export class SurfacePlay {
  private ctx: CanvasRenderingContext2D;
  private frost = document.createElement('canvas');
  private working = document.createElement('canvas');
  private marks: Record<Scene, Stroke[]> = { outside: [], inside: [] };
  private scene: Scene = 'outside';
  private active?: Stroke;
  private width = 1; private height = 1;
  constructor(private canvas: HTMLCanvasElement) {
    this.ctx=canvas.getContext('2d')!;
    this.frost.width=this.working.width=256;
    this.frost.height=this.working.height=448;
    const ctx=this.frost.getContext('2d')!;
    const veil=ctx.createRadialGradient(128,205,20,128,205,280);
    veil.addColorStop(0,'rgba(206,229,239,.22)');veil.addColorStop(1,'rgba(218,241,248,.72)');
    ctx.fillStyle=veil;ctx.fillRect(0,0,256,448);
    // Deterministic ice grain and feathered crystal veins, concentrated at edges.
    let seed=17;const rand=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
    ctx.fillStyle='#effaff26';for(let i=0;i<3000;i++)ctx.fillRect(rand()*256,rand()*448,.5+rand()*1.2,.5+rand()*1.2);
    ctx.strokeStyle='#eefaff3a';ctx.lineWidth=.65;
    for(let i=0;i<75;i++){
      const x=rand()<.5?rand()*45:211+rand()*45,y=rand()*448,a=x<128?-.8:.8,length=18+rand()*35;
      ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.sin(a)*length,y-length);
      for(let j=1;j<6;j++){const u=j/6,px=x+Math.sin(a)*length*u,py=y-length*u;ctx.moveTo(px,py);ctx.lineTo(px+(x<128?1:-1)*7,py-7);ctx.moveTo(px,py);ctx.lineTo(px-(x<128?1:-1)*4,py-9);}ctx.stroke();
    }
  }
  setScene(scene:Scene){this.scene=scene;this.active=undefined;this.draw(0);}
  private point(event:PointerEvent):Point {const box=this.canvas.getBoundingClientRect();return{x:Math.max(0,Math.min(1,(event.clientX-box.left)/box.width)),y:Math.max(0,Math.min(1,(event.clientY-box.top)/box.height))};}
  bind(button:HTMLButtonElement,onTouch:()=>void){
    let pointer:number|undefined;
    button.onpointerdown=event=>{
      if(!event.isPrimary || event.pointerType==='mouse'&&event.button!==0)return;
      event.preventDefault();pointer=event.pointerId;button.setPointerCapture(pointer);
      this.active={points:[this.point(event)],age:0};this.marks[this.scene].push(this.active);
      this.marks[this.scene]=this.marks[this.scene].slice(-48);onTouch();this.draw(0);
    };
    button.onpointermove=event=>{
      if(event.pointerId!==pointer||!this.active)return;
      const point=this.point(event),last=this.active.points.at(-1)!;
      if(Math.hypot(point.x-last.x,point.y-last.y)>.0015){this.active.points.push(point);if(this.active.points.length>350)this.active.points.splice(0,1);this.active.age=0;this.draw(0);}
    };
    const finish=()=>{pointer=undefined;this.active=undefined;};
    button.onpointerup=finish;button.onpointercancel=finish;button.onlostpointercapture=finish;
    button.onclick=event=>{
      // Enter/Space provide an equivalent mark without requiring a drag gesture.
      if(event.detail!==0)return;
      const points:Point[]=[];
      if(this.scene==='inside')points.push({x:.667,y:.286},{x:.762,y:.351},{x:.669,y:.423});
      else for(let i=0;i<=60;i++){const t=i/60*Math.PI*2;points.push({x:.34+Math.pow(Math.sin(t),3)*.063,y:.885-(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))*.0035});}
      this.marks[this.scene].push({points,age:0});this.marks[this.scene]=this.marks[this.scene].slice(-48);onTouch();this.draw(0);
    };
  }
  draw(dt:number){
    const box=this.canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);
    if(box.width!==this.width||box.height!==this.height){this.width=box.width;this.height=box.height;this.canvas.width=Math.max(1,Math.round(box.width*dpr));this.canvas.height=Math.max(1,Math.round(box.height*dpr));this.ctx.setTransform(dpr,0,0,dpr,0,0);}
    const ctx=this.ctx,w=this.width,h=this.height;ctx.clearRect(0,0,w,h);
    const duration=this.scene==='outside'?52:40;
    for(const mark of this.marks[this.scene])if(mark!==this.active)mark.age+=dt;
    this.marks[this.scene]=this.marks[this.scene].filter(mark=>mark.age<duration);
    this.canvas.dataset.marks=String(this.marks[this.scene].length);
    if(this.scene==='inside'){
      const work=this.working.getContext('2d')!;work.clearRect(0,0,256,448);work.drawImage(this.frost,0,0);
      work.globalCompositeOperation='destination-out';work.lineCap=work.lineJoin='round';
      for(const mark of this.marks.inside){work.globalAlpha=Math.max(0,Math.min(1,(40-mark.age)/28));work.lineWidth=38;
        work.beginPath();mark.points.forEach((p,i)=>{const x=(p.x-.615)/.21*256,y=(p.y-.245)/.225*448;i?work.lineTo(x,y):work.moveTo(x,y);});
        if(mark.points.length===1){const p=mark.points[0];work.lineTo((p.x-.615)/.21*256+.01,(p.y-.245)/.225*448);}work.stroke();
      }work.globalAlpha=1;work.globalCompositeOperation='source-over';
      ctx.save();ctx.beginPath();for(const pane of panes){pane.forEach(([x,y],i)=>i?ctx.lineTo(x*w,y*h):ctx.moveTo(x*w,y*h));ctx.closePath();}ctx.clip();ctx.drawImage(this.working,.615*w,.245*h,.21*w,.225*h);ctx.restore();
    }else{
      ctx.save();ctx.beginPath();ctx.moveTo(.17*w,.81*h);ctx.lineTo(.84*w,.81*h);ctx.lineTo(.92*w,.98*h);ctx.lineTo(.15*w,.98*h);ctx.closePath();ctx.clip();ctx.lineCap=ctx.lineJoin='round';
      for(const mark of this.marks.outside){ctx.globalAlpha=Math.max(0,Math.min(1,(52-mark.age)/30));
        const trace=(offset:number)=>{ctx.beginPath();mark.points.forEach((p,i)=>i?ctx.lineTo(p.x*w,p.y*h+offset):ctx.moveTo(p.x*w,p.y*h+offset));if(mark.points.length===1)ctx.lineTo(mark.points[0].x*w+.01,mark.points[0].y*h+offset);};
        ctx.strokeStyle='#253c535c';ctx.lineWidth=Math.max(2,w*.009);trace(0);ctx.stroke();
        ctx.strokeStyle='#ffe8c43d';ctx.lineWidth=Math.max(.65,w*.0022);trace(-1.1);ctx.stroke();
      }ctx.restore();
    }
  }
}
