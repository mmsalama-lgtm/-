const { chromium } = require('playwright');
(async()=>{
  const times=process.argv.slice(3).map(Number); const out=process.argv[2];
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',args:['--allow-file-access-from-files']});
  const p=await b.newPage({viewport:{width:1080,height:1920}});
  p.on('console',m=>console.log('console:',m.text())); p.on('pageerror',e=>console.log('ERR',e.message));
  await p.goto('file://'+__dirname+'/index.html'); await p.waitForFunction(()=>window.READY===true,{timeout:60000});
  for(const t of times){await p.evaluate(t=>window.renderAt(t),t);await p.screenshot({path:`${out}/t${t.toFixed(2)}.jpg`,type:'jpeg',quality:85});}
  const ev=await p.evaluate(()=>window.EVENTS.length); console.log('events',ev);
  await b.close();
})();
