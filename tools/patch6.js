// one-off: iteration 7 edits applied to index.html (kept in the log so the change is reproducible)
const fs=require('fs'),path=require('path'),F=path.join(__dirname,'..','index.html');
let h=fs.readFileSync(F,'utf8'),n=0,miss=0;
const rep=(a,b)=>{if(!h.includes(a)){console.log('MISSING',a.slice(0,70));miss++;return}h=h.replace(a,()=>b);n++};
// shaders: kind 5 = landing preview outline, kind 6 = stray pixel
rep("if(k==4){col=vec3f(.85);}","if(k==4){col=vec3f(.85);}\n if(k==5){col=vec3f(.35,.8,1.)*(.6+.3*sin(t*9.));}\n if(k==6){col=mix(u.col.rgb,vec3f(1.),.65+.35*sin(t*5.+i.c.x*3.+i.c.y*5.));}");
rep("if(k>0&&k<4){fg=fg*.5;}","if(k>0&&k!=4){fg=fg*.5;}");
rep("if(k==2&&e>.07){discard;}","if((k==2&&e>.07)||(k==5&&e>.045)){discard;}");
rep("if(k==4)c=vec3(.85);","if(k==4)c=vec3(.85);\n if(k==5)c=vec3(.35,.8,1.)*(.6+.3*sin(t*9.));\n if(k==6)c=mix(col.rgb,vec3(1.),.65+.35*sin(t*5.+C.x*3.+C.y*5.));");
rep("if(k>0&&k<4)fg*=.5;","if(k>0&&k!=4)fg*=.5;");
rep("if(k==2&&e>.07)discard;","if((k==2&&e>.07)||(k==5&&e>.045))discard;");
// state
rep("K={},airT=0,fk=0,msgT=0","K={},airT=0,fk=0,pvA=-1,pv=[],px=[],PXM=[],nt=3,msgT=0");
rep("anim=0;solved=0;R=0;Rp=0;hintD=-1;since=0;","anim=0;solved=0;R=0;Rp=0;hintD=-1;since=0;pvA=-1;px=strays(i);PXM[i]=PXM[i]||px.map(()=>0);");
rep("blocks=nb;anim={t:0,d};hintD=-1;","blocks=nb;anim={t:0,d};hintD=-1;pvA=-1;");
rep("steps--;total--;hintD=-1;","steps--;total--;hintD=-1;pvA=-1;");
rep("function start(){audio();total=0;Lf=0;load(0);","function start(){audio();total=0;Lf=0;PXM=[];load(0);");
// level intro text
{const a=h.indexOf('say(META[i].t+'),m=h.indexOf('i?9:20',a);if(a<0||m<0){console.log('MISSING say');miss++}else{const b=h.indexOf(');',m)+2;h=h.slice(0,a)+"say(META[i].t+(TIP[i]?'\\n\\n'+TIP[i]:''),i>1?9:22);"+h.slice(b);n++}}
rep("function load(i){",`// What I tell myself on arriving. Only as much as I need.
const TIP=['Everything loose falls the way you fall. Bring each bright token to rest inside a hollow frame.\\nBlue outlines show where tokens would land. Small lights are stray pixels: touch them.','This room repeats forever: what you see in the distance is this same room, and you.',0,'Some tokens only arrive by falling off one edge and returning from the other.'];
// Stray pixels: bits of the picture that came loose. Three per room, placed far apart in space I can actually reach.
// They are optional. Every one I recover becomes a star in the finished sky.
function strays(i){
  const L=LV[i],M=N*N*N,seen=new Uint8Array(M),stk=[L.p],cand=[];seen[L.p]=1;
  while(stk.length){const c=stk.pop(),p=xyz(c);if(!L.t.includes(c)&&!L.b.includes(c)&&c!=L.p&&c!=L.e)cand.push(p);for(const d of DIRS){const q=md(p[0]+d[0])+md(p[1]+d[1])*N+md(p[2]+d[2])*N*N;if(!seen[q]&&!solid[q]){seen[q]=1;stk.push(q)}}}
  const td=(a,b)=>{let s=0;for(let k=0;k<3;k++){let d=Math.abs(a[k]-b[k]);d=Math.min(d,N-d);s+=d*d}return s},pick=[xyz(L.p),xyz(L.e)],out=[];
  let s=i*7919+17;const rnd=()=>(s=(s*48271+11)%2147483647)/2147483647;
  for(let n=0;n<3&&cand.length;n++){let b=0,bd=-1;cand.forEach((c,j)=>{const d=Math.min(...pick.map(p=>td(p,c)))+rnd()*1.5;if(d>bd){bd=d;b=j}});pick.push(cand[b]);out.push(cand.splice(b,1)[0])}
  return out;
}
function load(i){`);
// render: preview + strays
rep("if(solved){const c=xyz(LV[li].e);add(c[0]+.5,c[1]+.5,c[2]+.5,.42+.07*Math.sin(tm*3),3)}",`if(solved){const c=xyz(LV[li].e);add(c[0]+.5,c[1]+.5,c[2]+.5,.42+.07*Math.sin(tm*3),3)}
  // before I commit to a fall, I imagine where each token would come to rest, and draw that
  if(st=='PLAY'&&!solved&&!anim){const a=aim();if(a!=grav){if(a!=pvA){pvA=a;pv=settle(blocks,a).filter(m=>m[2]>0&&m[2]<N).map(m=>xyz(m[1]))}for(const c of pv)add(c[0]+.5,c[1]+.5,c[2]+.5,.72,5)}}
  px.forEach((c,j)=>{if(!PXM[li][j])add(c[0]+.5,c[1]+.5,c[2]+.5,.15+.03*Math.sin(tm*4+j),6)});`);
// tick: collect strays, generative notes
rep("  if(st=='END')lt+=dt;",`  if(st=='PLAY')px.forEach((c,j)=>{if(PXM[li][j])return;let d2=0;for(let k=0;k<3;k++){let d=Math.abs(c[k]+.5-P[k]);d=Math.min(d,N-d);d2+=d*d}if(d2<.45){PXM[li][j]=1;sfx(5)}});
  // a melody I do not plan: single notes from the scale of the drone, more often as more of the image exists
  if(AC&&st!='MENU'&&(nt-=dt)<0){nt=(1.2+Math.random()*4)/(1+li*.3);const sc=[220,246.94,277.18,329.63,369.99,440];tone(sc[Math.random()*6|0]*(Math.random()<.35?2:1),2.6,'sine',.03+.008*li)}
  if(st=='END')lt+=dt;`);
// hud
{const k="'/'+targets.length}",a=h.indexOf(k);if(a<0){console.log('MISSING hud');miss++}else{h=h.slice(0,a+k.length)+"\\nstray pixels ${PXM[li].filter(Boolean).length}/${px.length}"+h.slice(a+k.length);n++}}
// picture: stars are the stray pixels I recovered
rep("const d=idt.data,ts=Math.floor(t*9);","const d=idt.data,ts=Math.floor(t*9),SF=PXM.flat().filter(Boolean).length/15;");
rep("if(v<.45&&hs(x,y)>.99)c=[255,255,240];","if(v<.5&&hs(x,y)>1-.015*SF)c=[255,255,240];");
rep("const best=LV.reduce((a,l)=>a+l.par,0);","const best=LV.reduce((a,l)=>a+l.par,0),g=PXM.flat().filter(Boolean).length;");
rep("sampling steps (optimal ${best})</small>","sampling steps (optimal ${best})<br>${g}/15 stray pixels recovered${g?' — they became the stars':' — the sky stayed empty'}</small>");
// sound
rep("if(k==4)tone(160,.12,'square',.05,120);","if(k==4)tone(160,.12,'square',.05,120);\n  if(k==5){tone(1318.5,.5,'sine',.12);tone(1975.5,.7,'sine',.07,0,.08)}\n  if(k==6)tone(62,.2,'sine',.3,36);");
rep("const g=DIRS[grav],ga=grav>>1,f=look(),","const g=DIRS[grav],ga=grav>>1,was=ground,vf=Math.abs(V[ga]),f=look(),");
rep("ground=hit(q);","ground=hit(q);if(ground&&!was&&vf>6)sfx(6);");
rep("get s(){return{gl:!!gl,st,","get s(){return{gl:!!gl,px,got:PXM.flat().filter(Boolean).length,st,");
fs.writeFileSync(F,h);
const s=h.slice(h.indexOf('<script>')+8,h.indexOf('</script>'));fs.writeFileSync(path.join(process.env.TEMP,'chk.js'),s);
console.log('edits',n,'missing',miss,'bytes',Buffer.byteLength(h));
// teach the test observer to gather the stray pixels too
const T=path.join(__dirname,'test.js');let t=fs.readFileSync(T,'utf8');
if(!t.includes('G.s.px')){
  const k="  await p.waitForTimeout(2200);",a=t.indexOf(k);
  t=t.slice(0,a)+"  for(let j=0;j<3;j++){await p.evaluate(j=>{const c=G.s.px[j],q=G.s.P;if(c){q[0]=c[0]+.5;q[1]=c[1]+.5;q[2]=c[2]+.5}},j);await p.waitForTimeout(150)}\n"+t.slice(a);
  t=t.replace("({st:G.s.st,total:G.s.total})","({st:G.s.st,total:G.s.total,strays:G.s.got})");
  fs.writeFileSync(T,t);
}
