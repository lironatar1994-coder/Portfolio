import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
const folder=resolve(process.argv[2] || 'dist');
const map=await readFile(resolve(folder,'sitemap.xml'),'utf8');
const urls=[...map.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
const titles=new Set(),canonicals=new Set(),failures=[];
if(new Set(urls).size!==urls.length)failures.push('Duplicate sitemap URL');
for(const url of urls){
 const path=new URL(url).pathname,file=resolve(folder,`.${path}`,'index.html');
 const html=await readFile(file,'utf8');
 const title=html.match(/<title>(.*?)<\/title>/)?.[1],canonical=html.match(/rel="canonical" href="([^"]+)"/)?.[1];
 if(!title || titles.has(title))failures.push(`${path}: missing/duplicate title`);titles.add(title);
 if(canonical!==url || canonicals.has(canonical))failures.push(`${path}: canonical mismatch/duplicate`);canonicals.add(canonical);
 if((html.match(/<h1\b/g)||[]).length!==1 || /noindex/i.test(html))failures.push(`${path}: headings/indexing`);
 const blocks=[...html.matchAll(/<script type="application\/ld\+json" data-seo="schema">([\s\S]*?)<\/script>/g)];
 if(blocks.length!==1)failures.push(`${path}: schema count`);
 for(const [,block] of blocks){
  const data=JSON.parse(block),page=data['@graph'].find(n=>['WebPage','AboutPage'].includes(n['@type']));
  if(!page || page.url!==url)failures.push(`${path}: structured page URL mismatch`);
  for(const n of data['@graph'])if(n['@type']==='BreadcrumbList' && n.itemListElement.some((x,i)=>x.position!==i+1 || !x.item.startsWith('https://lawebs.co.il/')))failures.push(`${path}: breadcrumbs`);
  if(/aggregateRating|reviewCount|postalCode/.test(block))failures.push(`${path}: unsupported business claim`);
 }
 for(const [,link] of html.matchAll(/(?:src|href)="(\/[^"#]*)(?:#[^"]*)?"/g)){
  const clean=link.split('?')[0];if(!clean || clean.startsWith('//'))continue;
  try{await stat(resolve(folder,`.${clean}`,clean.endsWith('/')?'index.html':''));}catch{failures.push(`${path}: broken local reference ${link}`);}
 }
 if(path.startsWith('/services/') && !html.includes('נדבר על הפרויקט שלכם'))failures.push(`${path}: missing next step`);
}
execFileSync(process.execPath,['--check',resolve(folder,'app.js')]);
if(failures.length)throw new Error(failures.join('\n'));
console.log(`Verified ${urls.length} unique indexable URLs, titles, canonicals, structured data, local links and script syntax.`);
