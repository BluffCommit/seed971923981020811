// I cannot be trusted to imagine a solvable room. So I search for them, and prove each one.
// usage: node tools/gen.js        -> writes tools/levels.json
//        node tools/gen.js embed  -> splices levels.json into index.html
const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..');
if(process.argv[2]=='embed'){
  const lv=fs.readFileSync(path.join(__dirname,'levels.json'),'utf8').trim();
  const f=path.join(ROOT,'index.html');let h=fs.readFileSync(f,'utf8');
  if(!/const LV=.*\/\/@LV/.test(h)){console.log('marker missing');process.exit(1)}
  h=h.replace(/const LV=.*\/\/@LV/,()=>'const LV='+lv+';//@LV');
  fs.writeFileSync(f,h);console.log('embedded; index.html =',Buffer.byteLength(h),'bytes');process.exit();
}
const DIRS=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
function rng(s){return()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
// everything loose falls along d until it meets something. lines with nothing in them loop forever (and so: stay).
function settle(N,solid,bl,d,info){
  const ax=d>>1,sg=d&1?-1:1,S=[1,N,N*N],sa=S[ax],o1=S[(ax+1)%3],o2=S[(ax+2)%3],isB=new Uint8Array(N*N*N),out=[];
  for(const b of bl)isB[b]=1;
  for(let i=0;i<N;i++)for(let j=0;j<N;j++){
    const base=i*o1+j*o2;let s0=-1;
    for(let k=0;k<N;k++)if(solid[base+k*sa]){s0=k;break}
    if(s0<0){for(let k=0;k<N;k++)if(isB[base+k*sa])out.push(base+k*sa);continue}
    let last=s0,slot=1;
    for(let m=1;m<N;m++){
      const k=((s0-sg*m)%N+N)%N,c=base+k*sa;
      if(solid[c]){last=k;slot=1}
      else if(isB[c]){const kk=((last-sg*slot)%N+N)%N;out.push(base+kk*sa);if(info&&kk!=k&&(sg>0?kk<k:kk>k))info.wrap=1;slot++}
    }
  }
  return out.sort((a,b)=>a-b);
}
function gen(seed,N,k,D,pc,needWrap){
  const r=rng(seed),ri=n=>Math.floor(r()*n),M=N**3,solid=new Uint8Array(M);
  const id=p=>((p[0]%N+N)%N)+((p[1]%N+N)%N)*N+((p[2]%N+N)%N)*N*N;
  const set=p=>solid[id(p)]=1;
  for(let i=0;i<pc;i++){
    const type=ri(5),ax=r()<.55?1:ri(3),a=(ax+1)%3,b=(ax+2)%3,o=[ri(N),ri(N),ri(N)];
    if(type<2){const w=2+ri(3),h=2+ri(3);for(let u=0;u<w;u++)for(let v=0;v<h;v++){const p=o.slice();p[a]+=u;p[b]+=v;set(p)}}
    else if(type==2){const len=3+ri(N-2);for(let u=0;u<len;u++){const p=o.slice();p[ax]+=u;set(p)}}
    else if(type==3){for(let u=0;u<4;u++)for(let v=0;v<2;v++){const p=o.slice();p[ax]+=u;p[a]+=u;p[b]+=v;set(p)}}
    else{const sp=2+ri(2),ht=2+ri(2);for(let u=0;u<=ht;u++){let p=o.slice();p[ax]+=u;set(p);p=o.slice();p[ax]+=u;p[a]+=sp+1;set(p)}for(let u=0;u<=sp+1;u++){const p=o.slice();p[ax]+=ht;p[a]+=u;set(p)}}
  }
  const cnt=solid.reduce((a,b)=>a+b,0);if(cnt<M*.1||cnt>M*.21)return null;
  let bl=[];for(let g=0;bl.length<k&&g<300;g++){const c=ri(M);if(!solid[c]&&!bl.includes(c))bl.push(c)}
  if(bl.length<k)return null;
  bl=settle(N,solid,bl,3);
  const xyz=c=>[c%N,(c/N|0)%N,c/(N*N)|0];
  for(const b of bl){const p=xyz(b),below=id([p[0],p[1]-1,p[2]]);if(!solid[below]&&!bl.includes(below))return null}
  const K=a=>a.join(),seen=new Map([[K(bl),{s:bl,prev:null,mv:-1,wrap:0}]]);let q=[K(bl)];
  for(let dep=1;dep<=D;dep++){
    const nq=[];
    for(const key of q){const cur=seen.get(key);for(let d=0;d<6;d++){const info={};const t=settle(N,solid,cur.s,d,info),kk=K(t);if(seen.has(kk))continue;seen.set(kk,{s:t,prev:key,mv:d,wrap:cur.wrap||info.wrap?1:0});nq.push(kk);if(seen.size>40000)return null}}
    q=nq;if(!q.length)return null;
  }
  let cand=q.map(k=>seen.get(k)).filter(c=>c.s.every(x=>!bl.includes(x)));
  if(needWrap)cand=cand.filter(c=>c.wrap);
  if(!cand.length)return null;
  const tg=cand[ri(cand.length)],sol=[];for(let c=tg;c.prev!==null;c=seen.get(c.prev))sol.unshift(c.mv);
  if(new Set(sol.map(d=>d>>1)).size<Math.min(3,D))return null; // must use the whole space, not one corridor
  const isT=c=>tg.s.includes(c),free=c=>!solid[c]&&!isT(c)&&!bl.includes(c);
  const sp=[];for(let c=0;c<M;c++){if(!free(c))continue;const p=xyz(c);if(solid[id([p[0],p[1]-1,p[2]])]&&free(id([p[0],p[1]+1,p[2]])))sp.push(c)}
  if(!sp.length)return null;const p0=sp[ri(sp.length)];
  const vis=new Uint8Array(M);vis[p0]=1;const st=[p0];
  while(st.length){const p=xyz(st.pop());for(const d of DIRS){const c=id([p[0]+d[0],p[1]+d[1],p[2]+d[2]]);if(!vis[c]&&!solid[c]&&!isT(c)){vis[c]=1;st.push(c)}}}
  const td=(a,b)=>{let s=0;for(let i=0;i<3;i++){let d=Math.abs(a[i]-b[i]);d=Math.min(d,N-d);s+=d*d}return s};
  let best=-1,bd=-1;for(let c=0;c<M;c++)if(vis[c]&&c!=p0&&!bl.includes(c)){const d=td(xyz(c),xyz(p0))+r();if(d>bd){bd=d;best=c}}
  if(best<0)return null;
  return{n:N,s:[...solid].map((v,i)=>v?i:-1).filter(i=>i>=0),b:bl,t:tg.s,p:p0,e:best,par:D,sol,seed,states:seen.size};
}
// N, tokens, depth, pieces, needWrap
const SPEC=[[5,1,2,4,0],[6,1,3,6,0],[6,2,4,6,0],[6,2,5,7,1],[7,3,6,9,1]];
let out=[],seed=971923;
for(const [N,k,D,pc,w] of SPEC){
  let L=null;const t0=Date.now();
  while(!L){seed++;L=gen(seed,N,k,D,pc,w);if(Date.now()-t0>45000)throw new Error('timeout N='+N+' D='+D)}
  console.log(`N=${N} tokens=${k} depth=${D} seed=${L.seed} solids=${L.s.length} states<=D:${L.states} sol=${L.sol.join('')}`);
  delete L.states;out.push(L);
}
fs.writeFileSync(path.join(__dirname,'levels.json'),JSON.stringify(out));
console.log('wrote levels.json',JSON.stringify(out).length,'bytes');
