// A second observer walks through the image and reports whether it holds together.
const { chromium } = require('playwright');
(async()=>{
 const GLM=process.argv[2]=='gl',PX=GLM?'gl-':'';
 const b=await chromium.launch(GLM?{}:{channel:'chromium',args:['--enable-unsafe-webgpu','--enable-gpu','--autoplay-policy=no-user-gesture-required']});
 const p=await b.newPage({viewport:{width:1280,height:720}});
 const errs=[];p.on('console',m=>{if(m.type()=='error'||m.type()=='warning')errs.push(m.text())});p.on('pageerror',e=>errs.push('PAGEERR '+e.message));
 await p.goto('file:///'+require('path').resolve(__dirname,'..','index.html').split(String.fromCharCode(92)).join('/'));await p.waitForTimeout(1500);
 await p.screenshot({path:'shots/'+PX+'0-menu.png'});
 await p.click('#ov');await p.waitForTimeout(1200);
 console.log(GLM?'WEBGL2 run':'WEBGPU run','after start',JSON.stringify(await p.evaluate(()=>G.s)));
 for(let L=0;L<5;L++){
  await p.screenshot({path:`shots/${PX}${L+1}a-start.png`});
  let n=0;while(n++<20){const s=await p.evaluate(()=>G.s);if(s.solved)break;const h=await p.evaluate(()=>G.hint());if(h<0){console.log('NO PATH at level',L+1);break}await p.evaluate(d=>G.shift(d),h);await p.waitForTimeout(1500);if(n==1)await p.screenshot({path:`shots/${PX}${L+1}b-mid.png`})}
  const s=await p.evaluate(()=>G.s);console.log('level',L+1,'solved',s.solved,'steps',s.steps,'scale',s.scale,'P',s.P.map(v=>v.toFixed(2)).join(','));
  await p.waitForTimeout(2200);await p.screenshot({path:`shots/${PX}${L+1}c-solved.png`});
  await p.evaluate(()=>G.next());await p.waitForTimeout(2700);await p.screenshot({path:`shots/${PX}${L+1}d-layer.png`});await p.waitForTimeout(2600);
 }
 await p.waitForTimeout(600);console.log('final',JSON.stringify(await p.evaluate(()=>({st:G.s.st,total:G.s.total}))));
 await p.screenshot({path:'shots/'+PX+'9-end.png'});
 await p.waitForTimeout(1800);await p.click('#ov');await p.waitForTimeout(900);console.log('restart',JSON.stringify(await p.evaluate(()=>({st:G.s.st,li:G.s.li,total:G.s.total}))));
 console.log('errors:',errs.length?errs.join('\n'):'none');await b.close();
})();
