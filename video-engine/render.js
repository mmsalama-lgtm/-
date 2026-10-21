const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{
  const [out,start,end]=[process.argv[2],+process.argv[3],+process.argv[4]];
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',args:['--allow-file-access-from-files']});
  const p=await b.newPage({viewport:{width:+(process.env.VW||1080),height:+(process.env.VH||1920)}});
  p.on('pageerror',e=>console.log('ERR',e.message));
  await p.goto('file://'+__dirname+'/'+(process.env.PAGE||'index.html')); await p.waitForFunction(()=>window.READY===true,{timeout:60000});
  if(start===0){fs.writeFileSync(out+'/../events.json',JSON.stringify(await p.evaluate(()=>({events:window.EVENTS,caps:window.CAPS}))))}
  for(let f=start;f<end;f++){await p.evaluate(t=>window.renderAt(t),f/30);
    await p.screenshot({path:`${out}/f${String(f).padStart(5,'0')}.jpg`,type:'jpeg',quality:94});}
  await b.close(); console.log('done',start,end);
})();
