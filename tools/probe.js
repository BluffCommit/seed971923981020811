const { chromium } = require('playwright');
(async () => {
  const opts = [{}, {channel:'chromium',args:['--enable-unsafe-webgpu','--enable-gpu']}, {channel:'chrome',args:['--enable-unsafe-webgpu']}, {headless:false,args:['--enable-unsafe-webgpu']}];
  for (let i=0;i<opts.length;i++) { const opt=opts[i];
    try {
      const b = await chromium.launch(opt); const p = await b.newPage();
      await p.goto('file:///'+require('path').resolve(__dirname,'..','tools/probe.html').split(String.fromCharCode(92)).join('/'));
      const r = await p.evaluate(async () => { if(!navigator.gpu) return 'no navigator.gpu'; const a = await navigator.gpu.requestAdapter(); if(!a) return 'no adapter'; const d = await a.requestDevice(); const c = document.querySelector('canvas'); const x = c.getContext('webgpu'); const f = navigator.gpu.getPreferredCanvasFormat(); x.configure({device:d, format:f}); const e = d.createCommandEncoder(); const ps = e.beginRenderPass({colorAttachments:[{view:x.getCurrentTexture().createView(), clearValue:{r:1,g:0,b:0,a:1}, loadOp:'clear', storeOp:'store'}]}); ps.end(); d.queue.submit([e.finish()]); return 'ok '+(a.info&&a.info.vendor)+' '+(a.info&&a.info.architecture)+' '+f; });
      await p.waitForTimeout(300); await p.screenshot({path:'shots/probe'+i+'.png'});
      console.log(i, JSON.stringify(opt), r); await b.close();
    } catch(e) { console.log(i, JSON.stringify(opt), 'ERR', String(e.message).split('\n')[0]); }
  }
})();
