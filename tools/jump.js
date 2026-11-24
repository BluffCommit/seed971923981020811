// can I leave the ground, and do I come back?
const { chromium } = require('playwright');
(async()=>{
 const b=await chromium.launch({channel:'chromium',args:['--enable-unsafe-webgpu','--enable-gpu']});
 const p=await b.newPage({viewport:{width:1280,height:720}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file:///'+require('path').resolve(__dirname,'..','index.html').split(String.fromCharCode(92)).join('/'));await p.waitForTimeout(800);await p.keyboard.press('Enter');await p.waitForTimeout(700);
 const y=async()=>(await p.evaluate(()=>G.s.P))[1].toFixed(2);
 const y0=await y();await p.keyboard.down('Space');await p.waitForTimeout(220);const y1=await y();await p.keyboard.up('Space');await p.waitForTimeout(900);const y2=await y();
 console.log('jump: ground',y0,'apex~',y1,'landed',y2,'state',await p.evaluate(()=>G.s.st));
 await p.keyboard.press('KeyR');await p.keyboard.press('KeyZ');await p.keyboard.press('KeyH');await p.waitForTimeout(200);
 await p.mouse.click(640,360);await p.waitForTimeout(300);
 console.log('after R,Z,H,click: steps',await p.evaluate(()=>G.s.steps),'errors',errs.length?errs.join('|'):'none');await b.close();
})();
