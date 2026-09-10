import { readFile, stat, readdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const dist=resolve(root,'dist');
async function walk(folder){const entries=await readdir(folder,{withFileTypes:true});return (await Promise.all(entries.map(entry=>entry.isDirectory()?walk(resolve(folder,entry.name)):resolve(folder,entry.name)))).flat();}
const pages=(await walk(dist)).filter(file=>file.endsWith('.html'));
const failures=[];
for(const page of pages){
 const html=await readFile(page,'utf8');
 if(!html.includes('lang="he" dir="rtl"'))failures.push(`${page}: missing Hebrew/RTL`);
 if((html.match(/<h1\b/g)||[]).length!==1)failures.push(`${page}: must have one h1`);
 if(/<!--(?:HEADER|FOOTER|PROJECTS|CONTACT|MARK|ARROW)-->/u.test(html))failures.push(`${page}: unresolved template`);
 for(const [,reference] of html.matchAll(/(?:src|href)="([^"#]+)(?:#[^"]*)?"/g)){
   if(!reference.startsWith('/') || reference.startsWith('//'))continue;
   const target=resolve(dist,`.${reference.split('?')[0]}`);
   try{await stat(reference.endsWith('/')?resolve(target,'index.html'):target);}catch{failures.push(`${page}: missing ${reference}`);}
 }
}
for(const file of ['src/app.js','src/projects.mjs','scripts/build.mjs','scripts/serve.mjs'])execFileSync(process.execPath,['--check',resolve(root,file)]);
if(failures.length){console.error(failures.join('\n'));process.exitCode=1;}else console.log(`Verified ${pages.length} HTML pages, local references, Hebrew/RTL, and JavaScript syntax.`);
