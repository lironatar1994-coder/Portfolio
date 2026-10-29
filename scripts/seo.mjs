import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { services, projectSearchTitles, projectService } from '../src/seo-content.mjs';
import { projects, studio } from '../src/projects.mjs';
import { facts, isDraft } from '../src/facts.mjs';

const esc = s => String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const json = x => JSON.stringify(x).replaceAll('<','\\u003c');
const homeTitle = 'בניית אתרים לעסקים ופיתוח אפליקציות | LA webs';
const homeDescription = 'LA webs — בניית אתרים לעסקים, דפי נחיתה, קטלוגים ואפליקציות ווב בעיצוב אישי. אפיון, עיצוב ופיתוח עם לירון עטאר. צפו בעבודות, נסו את הדגמת ההזמנות וראו מחירים.';
const absolute = (path, origin) => new URL(path, origin).href;
const crumbs = parts => `<nav class="seo-breadcrumb" aria-label="מיקום באתר">${parts.map(([name,path],i) => `${i ? '<span aria-hidden="true">/</span>' : ''}${path ? `<a href="${esc(path)}">${esc(name)}</a>` : `<span aria-current="page">${esc(name)}</span>`}`).join('')}</nav>`;
const serviceLinks = () => `<aside class="seo-aside"><h2>עוד דרכים לבנות</h2><ul>${services.map(s=>`<li><a href="/services/${s.slug}/">${esc(s.name)}</a></li>`).join('')}</ul></aside>`;
const rows = () => `<div class="seo-service-list">${services.map(s=>`<article class="seo-service-row"><h3>${esc(s.name)}</h3><p>${esc(s.intro)}</p><a href="/services/${s.slug}/">מה כולל השירות</a></article>`).join('')}</div>`;
// Starting price and typical timeline from src/facts.mjs; invented values stay marked so they are never published.
const plus = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
const keepRanges = html => html.replace(/\d[\d:,]*-\d[\d:,]*/g, m => `<span class="keep-together">${m}</span>`);
const factText = f => isDraft(f) ? `<span data-placeholder>${keepRanges(esc(f.value))}</span>` : keepRanges(esc(f));
const serviceFacts = slug => {
  const info = facts.services[slug] || {};
  const price = info.from ? (isDraft(info.from) ? `<span data-placeholder>החל מ־${esc(info.from.value)} ₪</span>` : `החל מ־${esc(info.from)} ₪`) : info.time ? 'מחיר לפי אפיון' : 'מחיר וזמנים לפי אפיון';
  return `<p class="seo-facts">${[price, info.time ? factText(info.time) : ''].filter(Boolean).join(' · ')}</p>`;
};
const waLink = text => `https://wa.me/${studio.tel.replace('+','')}?text=${encodeURIComponent(text)}`;
const contactAction = `<a class="pill pill-cta" href="${esc(waLink('היי LA webs, ראיתי את האתר ואשמח לדבר על אתר לעסק שלי'))}" target="_blank" rel="noopener noreferrer" data-cta="service" aria-label="נדבר על הפרויקט שלכם — נפתח בחלון חדש">נדבר על הפרויקט שלכם</a>`;

function serviceBody(s) {
  const examples = s.examples.map(slug => projects.find(p=>p.slug===slug)).filter(Boolean);
  return `<section class="seo-hero wrap">${crumbs([['בית','/'],['שירותים','/services/'],[s.name,null]])}<h1>${esc(s.name)}<span class="period">.</span></h1><p class="seo-lead">${esc(s.intro)}</p>${serviceFacts(s.slug)}${contactAction}</section>
  <div class="seo-layout wrap"><article class="seo-copy"><h2>למי זה מתאים?</h2><p>${esc(s.fit)}</p>${s.sections.map(([h,p])=>`<h2>${esc(h)}</h2><p>${esc(p)}</p>`).join('')}</article>${serviceLinks()}</div>
  <section class="seo-examples"><div class="wrap"><h2>דוגמאות מהעבודות</h2><div class="seo-example-list">${examples.map(p=>`<article class="seo-example"><a href="/work/${p.slug}/">${p.mobileFirst ? `<img src="/images/${p.slug}-card-20261004.webp" width="585" height="820" loading="lazy" decoding="async" alt="${esc(p.kicker)} — ${esc(p.hebrew)}" style="object-position:50% 45%;background:${p.colors.bg}">` : `<img src="/images/${p.slug}-desktop-20261004.webp" width="720" height="500" loading="lazy" decoding="async" alt="${esc(p.kicker)} — ${esc(p.hebrew)}">`}<h3>${esc(p.hebrew)}</h3><p>${esc(p.kicker)}</p></a></article>`).join('')}</div></div></section>
  <section class="seo-faq wrap"><h2>לפני שמתחילים</h2><div class="faq-list">${s.questions.map(([q,a])=>`<details class="qa"><summary><span>${esc(q)}</span>${plus}</summary><p>${esc(a)}</p></details>`).join('')}</div></section>`;
}

const pdfDiscoveryLinks = '<p class="seo-related">לעבודה עם קבצים: <a class="seo-inline-link" href="https://vee-app.co.il/pdf-studio/">כלי PDF Studio בעברית</a> · <a class="seo-inline-link" href="https://vee-app.co.il/pdf-studio/pdf-editor">עורך PDF בעברית</a>.</p>';

function metadata(html, {title,description,path,origin,nodes=[],image='/images/portfolio-shares-20261008/lawebs.png'}) {
  if (origin) for (const node of nodes) {
    if (['WebPage','AboutPage'].includes(node['@type'])) {
      node.inLanguage = 'he-IL';
      node.primaryImageOfPage = {'@type':'ImageObject', url:absolute(image,origin)};
    }
  }
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
  const htmlOpen=home.match(/<html[^>]*>/)?.[0] || '<html lang="he" dir="rtl">';
  const founder=home.match(/<section class="founder"[\s\S]*?<\/section>/)?.[0] || '';
  const makePage=(body,options)=>metadata(`<!doctype html>${htmlOpen}<head>${rawHead}</head><body class="seo-page"><a class="skip-link" href="#main">דלגו לתוכן</a>${header}<main id="main">${body}${contact}</main>${footer}</body></html>`,options);
  const writePage=async(path,html)=>{const dest=resolve(folder,`.${path}`,'index.html');await mkdir(dirname(dest),{recursive:true});await writeFile(dest,html);};
  const nodes=origin ? [
    {'@type':'Organization','@id':absolute('/#organization',origin),name:studio.name,url:origin+'/',logo:absolute('/la-monogram-192-v2.png',origin),telephone:studio.tel,founder:{'@type':'Person',name:'לירון עטאר'}},
    {'@type':'WebSite','@id':absolute('/#website',origin),name:'LA webs',alternateName:'LA Webs',url:origin+'/',inLanguage:'he-IL',publisher:{'@id':absolute('/#organization',origin)}},
    ...schemaPage('/',homeTitle,homeDescription,origin)
  ] : [];
  home=home.replace(/<section class="seo-home wrap"[^>]*data-seo="services"[\s\S]*?<\/section>/g,'').replace(/<section class="seo-about-note wrap" data-seo="about">[\s\S]*?<\/section>/g,'');
  // The homepage renders its own service rows (#services) and founder chapter; service pages and /about/ reuse its contact.
  if(!contact)throw new Error('Homepage contact section missing: service pages need it.');
  home=home.replace(/<nav class="footer-links"([^>]*)>(?!<a href="\/services\/")/g,'<nav class="footer-links"$1><a href="/services/">השירותים</a><a href="/about/">על הסטודיו</a>');
  await writeFile(resolve(folder,'index.html'),metadata(home,{title:homeTitle,description:homeDescription,path:'/',origin,nodes}));
  for(const s of services) {
    const path=`/services/${s.slug}/`;
    const schema=origin ? [...schemaPage(path,s.title,s.description,origin,{mainEntity:{'@id':absolute(path,origin)+'#service'}}),{'@type':'Service','@id':absolute(path,origin)+'#service',name:s.name,serviceType:s.name,description:s.intro,url:absolute(path,origin),provider:{'@id':absolute('/#organization',origin)}},breadcrumbSchema([['בית','/'],['שירותים','/services/'],[s.name,path]],origin)] : [];
    await writePage(path,makePage(serviceBody(s),{title:s.title,description:s.description,path,origin,nodes:schema}));
  }
  const hubPath='/services/', hubTitle='שירותי בניית אתרים ופיתוח אפליקציות | LA webs',hubDescription='אתרי תדמית, דפי נחיתה, קטלוגים דיגיטליים ואפליקציות ווב. הכירו את שירותי LA webs, את דרך העבודה ואת הפרויקטים הרלוונטיים לעסק שלכם.';
  await writePage(hubPath,makePage(`<section class="seo-hero wrap">${crumbs([['בית','/'],['שירותים',null]])}<h1>מה צריך לבנות?</h1><p class="seo-lead">אתר שמציג את העסק, קטלוג שעושה סדר במוצרים או מערכת שמפשטת תהליך עבודה. בוחרים את המבנה לפי הצורך, ואחר כך את העיצוב ואת הפיתוח.</p></section><section class="wrap seo-faq" aria-labelledby="services-list-title"><h2 id="services-list-title" class="sr-only">שירותי בניית אתרים ופיתוח</h2>${rows()}</section><section class="seo-layout wrap"><article class="seo-copy"><h2>לא בטוחים מה מתאים?</h2><p>כדאי להתחיל במה שצריך לקרות באתר: להכיר את העסק, לבחור מוצר, להירשם או לנהל מידע. ספרו על הפעילות ועל מי שישתמש באתר. בשיחה מגדירים את המסלול המרכזי ואת האפשרויות שמתאימות לו.</p><p>היקף העבודה, לוח הזמנים והחיבורים נקבעים אחרי אפיון. אפשר להתחיל בגרסה ממוקדת ולהרחיב אותה בהמשך לפי הצורך.</p>${contactAction}</article>${serviceLinks()}</section>`,{title:hubTitle,description:hubDescription,path:hubPath,origin,nodes:origin?[...schemaPage(hubPath,hubTitle,hubDescription,origin),breadcrumbSchema([['בית','/'],['שירותים',hubPath]],origin)]:[]}));
  const aboutPath='/about/',aboutTitle='על LA webs — לירון עטאר, עיצוב ופיתוח אתרים',aboutDescription='לירון עטאר, מאחורי LA webs: אפיון, עיצוב ופיתוח אתרים ואפליקציות ווב. הכירו את דרך העבודה וצפו בפרויקטים שנבנו ב־LA webs.';
  await writePage(aboutPath,makePage(`<section class="seo-hero wrap">${crumbs([['בית','/'],['על הסטודיו',null]])}<h1>מהרעיון שלכם,<br>עד לאתר שעובד<span class="period">.</span></h1><p class="seo-lead">מאחורי <bdi>LA webs</bdi> עומד לירון עטאר. אני עוסק באפיון, עיצוב ופיתוח אתרים ואפליקציות ווב, ומחבר בין איך שהמוצר נראה לבין מה שהוא צריך לעשות.</p>${contactAction}</section>${founder.replace('class="founder"','class="founder founder-about"')}<section class="seo-layout wrap"><article class="seo-copy"><h2>העבודות הן נקודת ההיכרות</h2><p>בתיק העבודות נמצאים אתרי תדמית, קטלוגים, מערכת הרשמה ומוצרים דיגיטליים. אפשר לראות את גרסאות המחשב והטלפון, לקרוא מה נבנה ולהיכנס לאתר הפעיל. כל פרויקט מציג צורך אחר, ולכן גם המבנה והעיצוב שונים.</p><h2>מגדירים את הצורך לפני המסכים</h2><p>מתחילים בהיכרות עם העסק, הקהל והתהליך שצריך לעבוד באתר. אחר כך מסכימים על היקף העבודה, התוכן והחיבורים. העיצוב והפיתוח מתקדמים מתוך האפיון, כדי שההחלטות יהיו קשורות למטרה של הפרויקט.</p><h2>בודקים גם את הפרטים הקטנים</h2><p>קריאות בעברית, שימוש בנייד, ניווט ויצירת קשר הם חלק מהמוצר. במערכת עם הרשמה, נתונים או תשלום, מגדירים גם את המצבים ואת הבדיקות הנדרשים לכל חיבור. היקף תחזוקה ושינויים אחרי ההשקה נקבע בהצעה של הפרויקט.</p><h2>איך מתחילים?</h2><p>שלחו בוואטסאפ כמה מילים על העסק ועל מה שאתם רוצים לבנות. אם יש אתר קיים, אפשר לצרף קישור. משם אפשר להבין מה כדאי לשמור, מה צריך לשפר ומה דורש אפיון נוסף.</p><p><a class="seo-inline-link" href="/#work">לתיק העבודות</a> · <a class="seo-inline-link" href="tel:${studio.tel}"><bdi>${studio.phone}</bdi></a></p></article>${serviceLinks()}</section>`,{title:aboutTitle,description:aboutDescription,path:aboutPath,origin,nodes:origin?[...schemaPage(aboutPath,aboutTitle,aboutDescription,origin,{'@type':'AboutPage',about:{'@id':absolute('/#organization',origin)}}),breadcrumbSchema([['בית','/'],['על הסטודיו',aboutPath]],origin)]:[]}));
  const workDir=resolve(folder,'work');
  for(const entry of await readdir(workDir,{withFileTypes:true})) {
    if(!entry.isDirectory())continue;
    const p=projects.find(p=>p.slug===entry.name);
    if(!p)continue;
    const path=`/work/${p.slug}/`,file=resolve(workDir,p.slug,'index.html');
    let html=await readFile(file,'utf8');
    html=html.replace(/<section class="seo-story wrap" data-seo="story">[\s\S]*?<\/section>/g,'');
    const svc=services.find(s=>s.slug===projectService[p.slug]);
    const story=`<section class="seo-story wrap" data-seo="story"><div class="seo-layout"><article class="seo-copy"><h2>${esc(p.kicker)}</h2><h3>הרעיון מאחורי האתר</h3><p>${esc(p.idea)}</p><h3>מה נבנה</h3><p>${esc(p.build)}</p>${p.slug==='pdf'?pdfDiscoveryLinks:''}<ul>${p.scope.map(s=>`<li>${esc(s)}</li>`).join('')}</ul>${p.slug==='pizza'?'<p>האתר המוצג הוא הדגמה של חוויית הזמנה, ללא תשלום או הזמנה אמיתיים.</p>':''}<p class="seo-related">לפרויקט דומה: <a class="seo-inline-link" href="/services/${svc.slug}/">${esc(svc.name)}</a>.</p></article>${serviceLinks()}</div></section>`;
    if(!html.includes('<section class="catalog"'))throw new Error(`Project ${p.slug}: story insertion anchor missing.`);
    html=html.replace('<section class="catalog"',`${story}<section class="catalog"`);
    const description=p.slug==='pizza' ? `${p.hebrew}, פרויקט הדגמה של LA webs: ${p.kicker}. ${p.build} שום הזמנה לא נשלחת.` : `פרויקט ${p.hebrew} של LA webs: ${p.kicker}. ${p.build}`;
    const schema=origin?[...schemaPage(path,projectSearchTitles[p.slug],description,origin,{about:{'@type':'CreativeWork',name:p.hebrew,url:p.url,creator:{'@id':absolute('/#organization',origin)}}}),breadcrumbSchema([['בית','/'],['עבודות','/#work'],[p.hebrew,path]],origin)]:[];
    await writeFile(file,metadata(html,{title:projectSearchTitles[p.slug],description,path,origin,nodes:schema,image:['miryam','pinhas','koral','seder','pdf','pizza'].includes(p.slug) ? `/images/portfolio-shares-20261008/${p.slug}.png` : `/images/${p.slug}-desktop-20261004.webp`}));
  }
  // The full sales page is canonical; its short campaign variant shares that identity.
  const landingPath='/lp/', landingTitle='בניית אתר לעסק — עיצוב אישי, מושלם בטלפון | LA webs';
  const landingDescription='אתר שמציג את העסק שלכם ומקל על הלקוחות לפנות: אפיון, עיצוב ופיתוח בהתאמה אישית. צפו בעבודות של LA webs ושלחו בוואטסאפ כמה מילים על האתר הבא שלכם.';
  for(const path of ['/lp/','/lp/short/']) {
    const file=resolve(folder,`.${path}`,'index.html');let html;
    try{html=await readFile(file,'utf8');}catch{continue;}
    if(origin)html=html.replace(/<meta name="robots" content="noindex,follow">/g,'<meta name="robots" content="index,follow">');
    html=metadata(html,{title:landingTitle,description:landingDescription,path:landingPath,origin,image:'/images/portfolio-shares-20261008/lp.png',nodes:schemaPage(landingPath,landingTitle,landingDescription,origin)});
    // These pages retain their own design stylesheet; no service-page styles are needed.
    html=html.replace(/<link rel="stylesheet" href="\/seo\.css[^\"]*">/g,'');
    await writeFile(file,html);
  }
  // Update the links in every footer, including generated service pages.
  const indexable=['/',...projects.map(p=>`/work/${p.slug}/`),'/services/',...services.map(s=>`/services/${s.slug}/`),'/about/','/lp/'];
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
    await writeFile(resolve(folder,'robots.txt'),`User-agent: *\nAllow: /\nSitemap: ${absolute('/sitemap.xml',origin)}\nSitemap: ${absolute('/seder/sitemap.xml',origin)}\nSitemap: ${absolute('/cv/sitemap.xml',origin)}\nSitemap: ${absolute('/alenu/sitemap.xml',origin)}\nSitemap: ${absolute('/Koralevents/sitemap.xml',origin)}\nSitemap: ${absolute('/sitemap-sites.xml',origin)}\n`);
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
