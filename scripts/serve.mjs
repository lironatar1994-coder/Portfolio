import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { watch } from 'node:fs';
import { resolve, sep, extname } from 'node:path';
import { execFile } from 'node:child_process';
import { build, root } from './build.mjs';

const publicRoot = resolve(root, 'dist');
const types = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.svg':'image/svg+xml', '.webp':'image/webp', '.woff2':'font/woff2', '.txt':'text/plain; charset=utf-8', '.xml':'application/xml' };
await build();
const server = createServer(async (request,response) => {
  try {
    let pathname;
    try { pathname = decodeURIComponent(new URL(request.url,'http://localhost').pathname); } catch { response.writeHead(400).end(); return; }
    let target = resolve(publicRoot, `.${pathname}`);
    if (target !== publicRoot && !target.startsWith(publicRoot + sep)) { response.writeHead(403).end(); return; }
    let info;
    try { info = await stat(target); } catch { /* handled below */ }
    if(info?.isDirectory()) {
      if(!pathname.endsWith('/')) { response.writeHead(308,{Location:pathname+'/'}).end(); return; }
      target = resolve(target,'index.html');
    }
    const data = await readFile(target);
    response.writeHead(200, {'Content-Type': types[extname(target)] || 'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});
    response.end(request.method === 'HEAD' ? undefined : data);
  } catch {
    response.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});
    response.end(await readFile(resolve(publicRoot,'404.html')));
  }
});
const port = Number(process.env.PORT || 4173);
server.listen(port,'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${port}`));
let pending;
let rebuilding = false;
let queued = false;
function rebuild() {
  if(rebuilding){queued=true;return;}
  rebuilding=true;
  execFile(process.execPath,[resolve(root,'scripts/build.mjs')],{cwd:root},(error,output)=>{
    rebuilding=false;
    if(error)console.error(error);else console.log(output.trim());
    if(queued){queued=false;rebuild();}
  });
}
for(const folder of ['src','public']) watch(resolve(root,folder),{recursive:true},()=>{clearTimeout(pending);pending=setTimeout(rebuild,180);});
