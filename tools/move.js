const { chromium } = require('playwright');
(async()=>{
 const b=await chromium.launch({channel:'chromium',args:['--enable-unsafe-webgpu','--enable-gpu']});
 const p=await b.newPage({viewport:{width:1280,height:720}});const errs=[];p.on('console',m=>{if(m.type()=='error'||m.type()=='warning')errs.push(m.text())});p.on('pageerror',e=>errs.push('PAGEERR '+e.message));
 await p.goto('file:///D:/Projects/Untitled/index.html');await p.waitForTimeout(800);await p.click('#ov');await p.waitForTimeout(600);
 const P=async t=>console.log(t,(await p.evaluate(()=>G.s.P)).map(v=>v.toFixed(2)).join(','),'ground',await p.evaluate(()=>G.s.ground));
 await P('spawn');await p.keyboard.down('KeyW');await p.waitForTimeout(500);await p.keyboard.up('KeyW');await P('after W');
 await p.keyboard.down('KeyD');await p.waitForTimeout(400);await p.keyboard.up('KeyD');await P('after D');
 await p.keyboard.down('Space');await p.waitForTimeout(180);await P('jump');await p.keyboard.up('Space');await p.waitForTimeout(900);await P('landed');
 await p.keyboard.down('ArrowUp');await p.waitForTimeout(900);await p.keyboard.up('ArrowUp');await p.keyboard.press('KeyF');await p.waitForTimeout(400);await p.screenshot({path:'shots/m-flip.png'});await p.waitForTimeout(1200);await P('after look-up+F (should fall up)');
 console.log('state',JSON.stringify(await p.evaluate(()=>({g:G.s.grav,steps:G.s.steps}))));
 await p.keyboard.press('KeyH');await p.waitForTimeout(300);await p.screenshot({path:'shots/m-hint.png'});
 await p.keyboard.press('KeyZ');await p.waitForTimeout(800);await P('after undo');
 const h=await p.evaluate(()=>G.hint());await p.evaluate(d=>G.shift(d),h);await p.waitForTimeout(1500);await p.screenshot({path:'shots/m-part.png'});
 const h2=await p.evaluate(()=>G.hint());await p.evaluate(d=>G.shift(d),h2);await p.waitForTimeout(2500);await p.screenshot({path:'shots/m-solved.png'});
 console.log('errors:',errs.length?errs.join('\n'):'none');await b.close();
})();
