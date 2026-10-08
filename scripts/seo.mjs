import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { services, projectSearchTitles, projectService } from '../src/seo-content.mjs';
import { projects, studio } from '../src/projects.mjs';

const esc = s => String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const json = x => JSON.stringify(x).replaceAll('<','\\u003c');
const homeTitle = 'בניית אתרים לעסקים ופיתוח אפליקציות | LA webs';
const homeDescription = 'LA webs — בניית אתרים לעסקים, דפי נחיתה, קטלוגים ואפליקציות ווב בעיצוב אישי. אפיון, עיצוב ופיתוח עם לירון עטאר. צפו בעבודות ודברו איתנו.';
const absolute = (path, origin) => new URL(path, origin).href;
const crumbs = parts => `<nav class="seo-breadcrumb" aria-label="מיקום באתר">${parts.map(([name,path],i) => `${i ? '<span aria-hidden="true">/</span>' : ''}${path ? `<a href="${esc(path)}">${esc(name)}</a>` : `<span aria-current="page">${esc(name)}</span>`}`).join('')}</nav>`;
const serviceLinks = () => `<aside class="seo-aside"><h2>עוד דרכים לבנות</h2><ul>${services.map(s=>`<li><a href="/services/${s.slug}/">${esc(s.name)}</a></li>`).join('')}</ul></aside>`;
const rows = () => `<div class="seo-service-list">${services.map(s=>`<article class="seo-service-row"><h3>${esc(s.name)}</h3><p>${esc(s.intro)}</p><a href="/services/${s.slug}/">מה כולל השירות</a></article>`).join('')}</div>`;
const serviceSection = `<section class="seo-home wrap" id="services" data-seo="services"><h2>בניית אתרים ואפליקציות סביב העסק שלכם</h2><p>מאתר שמציג את השירותים ועד מערכת שמבצעת את העבודה. מתחילים במה שהעסק צריך ובדרך שבה הלקוחות משתמשים בו.</p>${rows()}</section>`;
const aboutNote = `<section class="seo-about-note wrap" data-seo="about"><p>מאחורי <bdi>LA webs</bdi> עומד לירון עטאר, שעוסק באפיון, עיצוב ופיתוח אתרים ואפליקציות ווב. <a href="/about/">על הסטודיו ועל דרך העבודה</a></p></section>`;
const contactAction = `<a class="pill pill-cta" href="${esc(studio.whatsapp)}" target="_blank" rel="noopener noreferrer">נדבר על הפרויקט שלכם</a>`;

function serviceBody(s) {
  const examples = s.examples.map(slug => projects.find(p=>p.slug===slug)).filter(Boolean);
  return `<section class="seo-hero wrap">${crumbs([['בית','/'],['שירותים','/services/'],[s.name,null]])}<h1>${esc(s.name)}<span class="period">.</span></h1><p class="seo-lead">${esc(s.intro)}</p>${contactAction}</section>
  <div class="seo-layout wrap"><article class="seo-copy"><h2>למי זה מתאים?</h2><p>${esc(s.fit)}</p>${s.sections.map(([h,p])=>`<h2>${esc(h)}</h2><p>${esc(p)}</p>`).join('')}</article>${serviceLinks()}</div>
  <section class="seo-examples"><div class="wrap"><h2>מהעבודות שלנו</h2><div class="seo-example-list">${examples.map(p=>`<article class="seo-example"><a href="/work/${p.slug}/"><img src="/images/${p.slug}-desktop-20261004.webp" width="720" height="500" loading="lazy" decoding="async" alt="${esc(p.kicker)} — ${esc(p.hebrew)}"><h3>${esc(p.hebrew)}</h3><p>${esc(p.kicker)}</p></a></article>`).join('')}</div></div></section>
  <section class="seo-faq wrap"><h2>לפני שמתחילים</h2>${s.questions.map(([q,a])=>`<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</section>`;
}

function metadata(html, {title,description,path,origin,nodes=[],image='/images/la-webs-share-studio-20261006.jpg'}) {
  if(origin)html=html.replace(/<meta name="robots" content="noindex,nofollow">/g,'');
  html=html.replace(/<script type="application\/ld\+json" data-seo="schema">[\s\S]*?<\/script>/g,'');
  html=html.replace(/<link rel="stylesheet" href="\/seo\.css[^\"]*">/g,'');
  html=html.replace(/<title>[\s\S]*?<\/title>/,`<title>${esc(title)}</title>`);
  html=html.replace(/<meta name="description" content="[^"]*">/,`<meta name="description" content="${esc(description)}">`);
  html=html.replace(/<meta property="og:title" content="[^"]*">/,`<meta property="og:title" content="${esc(title)}">`).replace(/<meta property="og:description" content="[^"]*">/,`<meta property="og:description" content="${esc(description)}">`);
  html=html.replace(/<link rel="canonical" href="[^"]*">/g,'').replace(/<meta property="og:url" content="[^"]*">/g,'').replace(/<meta property="og:image" content="[^"]*">/g,'');
  if(origin) html=html.replace('</head>',`<link rel="canonical" href="${esc(absolute(path,origin))}"><meta property="og:url" content="${esc(absolute(path,origin))}"><meta property="og:image" content="${esc(absolute(image,origin))}">${nodes.length ? `<script type="application/ld+json" data-seo="schema">${json({'@context':'https://schema.org','@graph':nodes})}</script>` : ''}</head>`);
  return html.replace('</head>','<link rel="stylesheet" href="/seo.css?v=20261004"></head>').replace(/[\t ]+$/gm,'');
}

function schemaPage(path,name,description,origin,extra={}) {
  if(!origin)return [];
  return [{'@type':'WebPage','@id':absolute(path,origin)+'#page',url:absolute(path,origin),name,description,inLanguage:'he-IL',isPartOf:{'@id':absolute('/#website',origin)},publisher:{'@id':absolute('/#organization',origin)},...extra}];
}
function breadcrumbSchema(parts,origin) {
  return {'@type':'BreadcrumbList',itemListElement:parts.map(([name,path],i)=>({'@type':'ListItem',position:i+1,name,item:absolute(path,origin)}))};
}

export async function enhanceSite(folder,{origin=process.env.SITE_ORIGIN || null}={}) {
  let home=await readFile(resolve(folder,'index.html'),'utf8');
  const rawHead=home.match(/<head>([\s\S]*?)<\/head>/)?.[1];
  const header=home.match(/<header class="site-header"[\s\S]*?<\/header>/)?.[0];
  const footer=home.match(/<footer class="site-footer"[\s\S]*?(?=<\/body>)/)?.[0];
  const contact=home.match(/<section class="contact"[\s\S]*?<\/section>/)?.[0] || '';
  if(!rawHead || !header || !footer)throw new Error('Portfolio shell missing: stop before modifying files.');
  const makePage=(body,options)=>metadata(`<!doctype html><html lang="he" dir="rtl"><head>${rawHead}</head><body class="seo-page"><a class="skip-link" href="#main">דלגו לתוכן</a>${header}<main id="main">${body}${contact}</main>${footer}</body></html>`,options);
  const writePage=async(path,html)=>{const dest=resolve(folder,`.${path}`,'index.html');await mkdir(dirname(dest),{recursive:true});await writeFile(dest,html);};
  const nodes=origin ? [
    {'@type':'Organization','@id':absolute('/#organization',origin),name:studio.name,url:origin+'/',logo:absolute('/la-monogram-192-v2.png',origin),telephone:studio.tel,founder:{'@type':'Person',name:'לירון עטאר'}},
    {'@type':'WebSite','@id':absolute('/#website',origin),name:'LA webs',alternateName:'LA Webs',url:origin+'/',inLanguage:'he-IL',publisher:{'@id':absolute('/#organization',origin)}},
    ...schemaPage('/',homeTitle,homeDescription,origin)
  ] : [];
  home=home.replace(/<section class="seo-home wrap"[^>]*data-seo="services"[\s\S]*?<\/section>/g,'').replace(/<section class="seo-about-note wrap" data-seo="about">[\s\S]*?<\/section>/g,'');
  if(!home.includes('<section class="contact"'))throw new Error('Homepage contact insertion anchor missing.');
  home=home.replace('<section class="contact"',`${serviceSection}${aboutNote}<section class="contact"`);
  home=home.replace('אתרים ומערכות בעיצוב אישי, שנבנים מאפס ונראים מושלם בטלפון.','בניית אתרים לעסקים ופיתוח אפליקציות בעיצוב אישי, עם חוויית שימוש נוחה במחשב ובנייד.');
  home=home.replace(/<nav class="footer-links"([^>]*)>(?!<a href="\/services\/")/g,'<nav class="footer-links"$1><a href="/services/">השירותים</a><a href="/about/">על הסטודיו</a>');
  await writeFile(resolve(folder,'index.html'),metadata(home,{title:homeTitle,description:homeDescription,path:'/',origin,nodes}));
  for(const s of services) {
    const path=`/services/${s.slug}/`;
    const schema=origin ? [...schemaPage(path,s.title,s.description,origin,{mainEntity:{'@id':absolute(path,origin)+'#service'}}),{'@type':'Service','@id':absolute(path,origin)+'#service',name:s.name,serviceType:s.name,description:s.intro,url:absolute(path,origin),provider:{'@id':absolute('/#organization',origin)}},breadcrumbSchema([['בית','/'],['שירותים','/services/'],[s.name,path]],origin)] : [];
    await writePage(path,makePage(serviceBody(s),{title:s.title,description:s.description,path,origin,nodes:schema}));
  }
  const hubPath='/services/', hubTitle='שירותי בניית אתרים ופיתוח אפליקציות | LA webs',hubDescription='אתרי תדמית, דפי נחיתה, קטלוגים דיגיטליים ואפליקציות ווב. הכירו את שירותי LA webs, את דרך העבודה ואת הפרויקטים הרלוונטיים לעסק שלכם.';
  await writePage(hubPath,makePage(`<section class="seo-hero wrap">${crumbs([['בית','/'],['שירותים',null]])}<h1>מה צריך לבנות?<span class="period">.</span></h1><p class="seo-lead">אתר שמציג את העסק, קטלוג שעושה סדר במוצרים או מערכת שמפשטת תהליך עבודה. בוחרים את המבנה לפי הצורך, ואחר כך את העיצוב ואת הפיתוח.</p></section><section class="wrap seo-faq" aria-label="שירותי בניית אתרים ופיתוח">${rows()}</section><section class="seo-layout wrap"><article class="seo-copy"><h2>לא בטוחים מה מתאים?</h2><p>כדאי להתחיל במה שצריך לקרות באתר: להכיר את העסק, לבחור מוצר, להירשם או לנהל מידע. ספרו לנו על הפעילות ועל מי שישתמש באתר. בשיחה נגדיר את המסלול המרכזי ואת האפשרויות שמתאימות לו.</p><p>היקף העבודה, לוח הזמנים והחיבורים נקבעים אחרי אפיון. אפשר להתחיל בגרסה ממוקדת ולהרחיב אותה בהמשך לפי הצורך.</p>${contactAction}</article>${serviceLinks()}</section>`,{title:hubTitle,description:hubDescription,path:hubPath,origin,nodes:origin?[...schemaPage(hubPath,hubTitle,hubDescription,origin),breadcrumbSchema([['בית','/'],['שירותים',hubPath]],origin)]:[]}));
  const aboutPath='/about/',aboutTitle='על LA webs — לירון עטאר, עיצוב ופיתוח אתרים',aboutDescription='לירון עטאר, מאחורי LA webs: אפיון, עיצוב ופיתוח אתרים ואפליקציות ווב. הכירו את דרך העבודה וצפו בפרויקטים שבנינו.';
  await writePage(aboutPath,makePage(`<section class="seo-hero wrap">${crumbs([['בית','/'],['על הסטודיו',null]])}<h1>מהרעיון שלכם,<br>עד לאתר שעובד<span class="period">.</span></h1><p class="seo-lead">מאחורי <bdi>LA webs</bdi> עומד לירון עטאר. אני עוסק באפיון, עיצוב ופיתוח אתרים ואפליקציות ווב, ומחבר בין איך שהמוצר נראה לבין מה שהוא צריך לעשות.</p>${contactAction}</section><section class="seo-layout wrap"><article class="seo-copy"><h2>העבודות הן נקודת ההיכרות</h2><p>בתיק העבודות נמצאים אתרי תדמית, קטלוגים, מערכת הרשמה ומוצרים דיגיטליים. אפשר לראות את גרסאות המחשב והטלפון, לקרוא מה נבנה ולהיכנס לאתר הפעיל. כל פרויקט מציג צורך אחר, ולכן גם המבנה והעיצוב שונים.</p><h2>מגדירים את הצורך לפני המסכים</h2><p>מתחילים בהיכרות עם העסק, הקהל והתהליך שצריך לעבוד באתר. אחר כך מסכימים על היקף העבודה, התוכן והחיבורים. העיצוב והפיתוח מתקדמים מתוך האפיון, כדי שההחלטות יהיו קשורות למטרה של הפרויקט.</p><h2>בודקים גם את הפרטים הקטנים</h2><p>קריאות בעברית, שימוש בנייד, ניווט ויצירת קשר הם חלק מהמוצר. במערכת עם הרשמה, נתונים או תשלום, מגדירים גם את המצבים ואת הבדיקות הנדרשים לכל חיבור. היקף תחזוקה ושינויים אחרי ההשקה נקבע בהצעה של הפרויקט.</p><h2>איך מתחילים?</h2><p>שלחו בוואטסאפ כמה מילים על העסק ועל מה שאתם רוצים לבנות. אם יש אתר קיים, אפשר לצרף קישור. משם נוכל להבין מה כדאי לשמור, מה צריך לשפר ומה דורש אפיון נוסף.</p><p><a class="seo-inline-link" href="/#work">לתיק העבודות</a> · <a class="seo-inline-link" href="tel:${studio.tel}"><bdi>${studio.phone}</bdi></a></p></article>${serviceLinks()}</section>`,{title:aboutTitle,description:aboutDescription,path:aboutPath,origin,nodes:origin?[...schemaPage(aboutPath,aboutTitle,aboutDescription,origin,{'@type':'AboutPage',about:{'@id':absolute('/#organization',origin)}}),breadcrumbSchema([['בית','/'],['על הסטודיו',aboutPath]],origin)]:[]}));
  const workDir=resolve(folder,'work');
  for(const entry of await readdir(workDir,{withFileTypes:true})) {
    if(!entry.isDirectory())continue;
    const p=projects.find(p=>p.slug===entry.name);
    if(!p)continue;
    const path=`/work/${p.slug}/`,file=resolve(workDir,p.slug,'index.html');
    let html=await readFile(file,'utf8');
    html=html.replace(/<section class="seo-story wrap" data-seo="story">[\s\S]*?<\/section>/g,'');
    const svc=services.find(s=>s.slug===projectService[p.slug]);
    const story=`<section class="seo-story wrap" data-seo="story"><div class="seo-layout"><article class="seo-copy"><h2>${esc(p.kicker)}</h2><h3>הרעיון מאחורי האתר</h3><p>${esc(p.idea)}</p><h3>מה פיתחנו</h3><p>${esc(p.build)}</p><ul>${p.scope.map(s=>`<li>${esc(s)}</li>`).join('')}</ul>${p.slug==='pizza'?'<p>האתר המוצג הוא הדגמה של חוויית הזמנה, ללא תשלום או הזמנה אמיתיים.</p>':''}<p class="seo-related">לפרויקט דומה: <a class="seo-inline-link" href="/services/${svc.slug}/">${esc(svc.name)}</a>.</p></article>${serviceLinks()}</div></section>`;
    if(!html.includes('<section class="catalog"'))throw new Error(`Project ${p.slug}: story insertion anchor missing.`);
    html=html.replace('<section class="catalog"',`${story}<section class="catalog"`);
    const description=`פרויקט ${p.hebrew} של LA webs: ${p.kicker}. ${p.build}`;
    const schema=origin?[...schemaPage(path,projectSearchTitles[p.slug],description,origin,{about:{'@type':'CreativeWork',name:p.hebrew,url:p.url,creator:{'@id':absolute('/#organization',origin)}}}),breadcrumbSchema([['בית','/'],['עבודות','/#work'],[p.hebrew,path]],origin)]:[];
    await writeFile(file,metadata(html,{title:projectSearchTitles[p.slug],description,path,origin,nodes:schema,image:`/images/${p.slug}-desktop-20261004.webp`}));
  }
  // Update the links in every footer, including generated service pages.
  const indexable=['/',...projects.map(p=>`/work/${p.slug}/`),'/services/',...services.map(s=>`/services/${s.slug}/`),'/about/'];
  const actual=[];
  for(const path of indexable) {
    const file=resolve(folder,`.${path}`,'index.html');
    let html;
    try {html=await readFile(file,'utf8');} catch {continue;}
    html=html.replace(/<nav class="footer-links"([^>]*)>(?!<a href="\/services\/")/g,'<nav class="footer-links"$1><a href="/services/">השירותים</a><a href="/about/">על הסטודיו</a>');
    html=html.replace(/<img ([^>]*src="(\/images\/[^"/]+-card-20261004)\.webp"[^>]*)>/g, (tag,attrs,base)=>attrs.includes('srcset=') ? tag : `<img ${attrs} srcset="${base}-150w.webp 150w, ${base}-300w.webp 300w, ${base}.webp 585w" sizes="${attrs.includes('loading="lazy"') ? 'auto, ' : ''}(max-width:760px) 300px, 220px">`);
    await writeFile(file,html);actual.push(path);
  }
  if(origin) {
    await writeFile(resolve(folder,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${actual.map(path=>`<url><loc>${esc(absolute(path,origin))}</loc></url>`).join('')}</urlset>`);
    await writeFile(resolve(folder,'robots.txt'),`User-agent: *\nAllow: /\nSitemap: ${absolute('/sitemap.xml',origin)}\nSitemap: ${absolute('/seder/sitemap.xml',origin)}\nSitemap: ${absolute('/cv/sitemap.xml',origin)}\nSitemap: ${absolute('/alenu/sitemap.xml',origin)}\n`);
  }
  console.log(`SEO: ${actual.length} indexable pages, service content and structured data.`);
  const scriptFile=resolve(folder,'app.js');
  const script=await readFile(scriptFile,'utf8');
  // Older live hero markup has no peek element; keep that optional entrance from throwing.
  if(script.includes("peek.classList.add('is-gone')")) {
    await writeFile(scriptFile,script.replaceAll("peek.classList.add('is-gone')","peek?.classList.add('is-gone')"));
    for(const path of actual){const file=resolve(folder,`.${path}`,'index.html');const html=await readFile(file,'utf8');await writeFile(file,html.replace(/src="\/app\.js\?v=([a-f0-9]+)"/g,'src="/app.js?v=$1-seo20261004"'));}
  }
}

if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  await enhanceSite(resolve(process.argv[2] || 'dist'),{origin:process.env.SITE_ORIGIN || 'https://lawebs.co.il'});
}
