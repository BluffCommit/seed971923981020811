// do I really draw where a token would land before I let it fall?
const { chromium } = require('playwright');
(async()=>{
 const b=await chromium.launch({channel:'chromium',args:['--enable-unsafe-webgpu','--enable-gpu']});
 const p=await b.newPage({viewport:{width:1280,height:720}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file:///'+require('path').resolve(__dirname,'..','index.html').split(String.fromCharCode(92)).join('/'));await p.waitForTimeout(800);await p.keyboard.press('Enter');await p.waitForTimeout(700);
 // level 1: the first correct step is "up". Tilt the view until the dominant axis is up, but keep the token on screen.
 await p.keyboard.down('ArrowUp');await p.waitForTimeout(480);await p.keyboard.up('ArrowUp');await p.waitForTimeout(150);
 console.log('aim',await p.evaluate(()=>aim()),'grav',await p.evaluate(()=>grav),'preview cells',JSON.stringify(await p.evaluate(()=>pv)),'strays',JSON.stringify(await p.evaluate(()=>px)));
 await p.screenshot({path:'shots/pv.png'});
 console.log('errors',errs.length?errs.join('|'):'none');await b.close();
})();
