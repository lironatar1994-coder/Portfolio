// Google Ads search campaign for LA webs: one source of truth for ad groups, keywords, ads and assets.
// `node scripts/ads-campaign.mjs` validates every length against Google's limits and writes
// docs/ads/google-ads-editor.csv (Google Ads Editor import) and docs/ads/campaign-summary.md.
import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const base = 'https://lawebs.co.il/lp/';
const campaign = 'LA webs | חיפוש | בניית אתרים';

// Every ad group lands on the landing page variant that repeats its words in the headline (?t=…).
const shared = {
  headlines: [
    'עיצוב ופיתוח מאפס, בלי תבניות',
    'מושלם בטלפון, מהיר ומוכן לגוגל',
    'שיחת היכרות בלי עלות',
    'דברו איתנו בוואטסאפ',
    'צפו בעבודות אמיתיות באוויר',
    'LA webs | סטודיו לאתרים',
    'הצעת מחיר מסודרת מראש',
    'וואטסאפ וחיוג בלחיצה אחת',
    'ליווי גם אחרי ההשקה',
  ],
  descriptions: [
    'עיצוב אישי ופיתוח מאפס, בלי תבניות. אתר מהיר שנראה מושלם בטלפון ומוביל לקוחות לשיחה.',
    'ספרו לנו על העסק בהודעה אחת בוואטסאפ ונחזור עם כיוון ראשון לאתר. בלי עלות ובלי התחייבות.',
    'אנחנו דואגים להכול: דומיין, אחסון, אבטחה והעלאה לאוויר. וזמינים לשינויים גם אחרי ההשקה.',
  ],
};
const groups = [
  {
    name: 'בניית אתר לעסק', path: '', paths: ['בניית-אתרים', 'לעסקים'],
    keywords: ['"בניית אתר לעסק"', '"בניית אתרים לעסקים"', '"בניית אתר לעסק קטן"', '"חברת בניית אתרים"', '"בניית אתר מקצועי"', '[בניית אתרים]', '"עיצוב אתר לעסק"', '"סטודיו לבניית אתרים"', '"מעצב אתרים לעסקים"'],
    headlines: ['בניית אתר לעסק בעיצוב אישי', 'אתר לעסק החל מ-2,500 ₪', 'אתר שמביא פניות לעסק שלך', 'בניית אתרים לעסקים קטנים', 'אתר שנראה כמו העסק שלך', 'אתרים, מערכות וקטלוגים', 'אתר לעסק, בלי כאב ראש'],
    descriptions: ['אתרי תדמית, מערכות הזמנה, הרשמה לאירועים וקטלוגים. צפו בעבודות אמיתיות שבאוויר עכשיו.'],
  },
  {
    name: 'אתר תדמית', path: '?t=tadmit', paths: ['אתר-תדמית', 'לעסק'],
    keywords: ['"בניית אתר תדמית"', '"אתר תדמית לעסק"', '"עיצוב אתר תדמית"', '"אתר תדמית מעוצב"', '"כמה עולה אתר תדמית"', '"אתר תדמית לעסק קטן"'],
    headlines: ['בניית אתר תדמית לעסק', 'אתר תדמית החל מ-2,500 ₪', 'אתר תדמית בעיצוב אישי', 'אתר תדמית שנראה כמו העסק', 'אתר תדמית שמביא פניות', 'תדמית מקצועית מהטלפון'],
    descriptions: ['אתר תדמית החל מ-2,500 ₪: מציג את העסק והעבודות שלו ומוביל לפנייה. עיצוב אישי, בלי תבניות.'],
  },
  {
    name: 'מערכת הזמנות', path: '?t=hazmanot', paths: ['מערכת-הזמנות', 'אונליין'],
    keywords: ['"מערכת הזמנות למסעדה"', '"מערכת הזמנות אונליין"', '"אתר הזמנות למסעדה"', '"אתר הזמנות לפיצרייה"', '"הזמנות אונליין למסעדה"', '"אתר משלוחים למסעדה"', '"מערכת הזמנות לעסק"'],
    headlines: ['מערכת הזמנות אונליין לעסק', 'הזמנות אונליין למסעדה', 'אתר הזמנות לפיצרייה', 'הזמנה בכמה הקשות מהטלפון', 'תפריט, סל וקופה במקום אחד', 'משלוח או איסוף, אצלכם באתר'],
    descriptions: ['מערכת הזמנות בעיצוב שלכם: תפריט, הרכבת מנה, סל וקופה. הלקוחות מזמינים ישירות מכם.', 'ראו את פיצת התנור: פיצה שמשתנה מול העיניים עם כל תוספת, ומשלוח או איסוף בכמה הקשות.'],
  },
  {
    name: 'הרשמה לאירועים', path: '?t=events', paths: ['הרשמה', 'לאירועים'],
    keywords: ['"אתר הרשמה לאירועים"', '"מערכת הרשמה לאירועים"', '"אתר לאירועים"', '"דף הרשמה לאירוע"', '"הרשמה לאירוע אונליין"', '"מערכת רישום לאירועים"'],
    headlines: ['אתר והרשמה לאירועים', 'מערכת הרשמה לאירועים', 'הרשמה לאירוע מהטלפון', 'כל האירועים במקום אחד', 'אתר לאירועים בעיצוב אישי', 'מהתעניינות להרשמה'],
    descriptions: ['האירועים הקרובים, התמונות וההרשמה במקום אחד, נוח מהטלפון. ראו את האתר של קורל אירועים.'],
  },
  {
    name: 'קטלוג דיגיטלי', path: '?t=catalog', paths: ['קטלוג', 'דיגיטלי'],
    keywords: ['"קטלוג דיגיטלי לעסק"', '"בניית קטלוג מוצרים"', '"אתר קטלוג"', '"קטלוג אונליין לעסק"', '"קטלוג מוצרים אונליין"', '"אתר קטלוג מוצרים"'],
    headlines: ['קטלוג דיגיטלי לעסק', 'קטלוג מוצרים אונליין', 'קטלוג שעושה סדר במוצרים', 'מהקטלוג ישר להצעת מחיר', 'קטלוג מעוצב, נוח בטלפון', 'אתר קטלוג בעיצוב אישי'],
    descriptions: ['מוצרים, מידע ותמונות במקום אחד, עם דרך קצרה לבקשת הצעת מחיר. נבנה בדיוק לעסק שלכם.'],
  },
];
// Searches that look for free tools, learning or jobs, not a studio.
const negatives = ['חינם', 'בחינם', 'wix', 'וויקס', 'ויקס', 'google sites', 'גוגל סייטס', 'קורס', 'קורסים', 'ללמוד', 'לימודי', 'מדריך', 'בעצמי', 'לבד', 'תבנית', 'תבניות', 'משרה', 'משרות', 'דרושים', 'עבודה מהבית', 'שכר', 'בינה מלאכותית', 'ai', 'chatgpt', 'יוטיוב', 'youtube', 'pdf', 'מחולל אתרים'];
const sitelinks = [
  ['העבודות שלנו', 'https://lawebs.co.il/#work', 'פיצה, אירועים, עורך דין ועוד', 'אתרים אמיתיים שבאוויר עכשיו'],
  ['איך זה עובד', `${base}#process`, 'שיחה, עיצוב ובנייה, השקה', 'ובכל אתר: מה כלול'],
  ['שאלות נפוצות', `${base}#faq`, 'זמנים, מחיר, דומיין ואחסון', 'תשובות קצרות וברורות'],
  ['מערכת הזמנות', `${base}?t=hazmanot`, 'תפריט, סל וקופה במקום אחד', 'ראו את פיצת התנור'],
];
const callouts = ['אתר תדמית החל מ-2,500 ₪', 'עיצוב אישי מאפס', 'מושלם בטלפון', 'שיחת היכרות בלי עלות', 'ליווי אחרי ההשקה', 'וואטסאפ וחיוג בלחיצה', 'מהיר ומוכן לגוגל'];
const snippet = { header: 'שירותים', values: ['אתרי תדמית', 'מערכות הזמנה', 'הרשמה לאירועים', 'קטלוגים דיגיטליים', 'דפי נחיתה'] };

// Google limits (characters): headline 30, description 90, path 15, sitelink text 25 / lines 35, callout 25, snippet value 25.
const len = s => [...s].length;
const problems = [];
const limit = (kind, s, max) => { if (len(s) > max) problems.push(`${kind} (${len(s)}/${max}): ${s}`); };
for (const g of groups) {
  // group-specific lines first; the shared ones fill up to the limit (15 headlines, 4 descriptions)
  const hs = [...g.headlines, ...shared.headlines].slice(0, 15), ds = [...g.descriptions, ...shared.descriptions].slice(0, 4);
  if (hs.length > 15) problems.push(`${g.name}: ${hs.length} headlines (max 15)`);
  if (ds.length > 4) problems.push(`${g.name}: ${ds.length} descriptions (max 4)`);
  hs.forEach(h => limit('headline', h, 30)); ds.forEach(d => limit('description', d, 90)); g.paths.forEach(p => limit('path', p, 15));
}
sitelinks.forEach(([t, , a, b]) => { limit('sitelink', t, 25); limit('sitelink line', a, 35); limit('sitelink line', b, 35); });
callouts.forEach(c => limit('callout', c, 25)); snippet.values.forEach(v => limit('snippet', v, 25));
if (problems.length) { console.error(problems.join('\n')); process.exit(1); }

// Google Ads Editor CSV (one sheet with typed rows).
const q = v => `"${String(v).replaceAll('"', '""')}"`;
const H = ['Campaign', 'Ad Group', 'Keyword', 'Criterion Type', 'Final URL', 'Path 1', 'Path 2', ...Array.from({ length: 15 }, (_, i) => `Headline ${i + 1}`), ...Array.from({ length: 4 }, (_, i) => `Description ${i + 1}`)];
const rows = [H];
const blank = () => Array(H.length).fill('');
for (const g of groups) {
  for (const k of g.keywords) {
    const r = blank();
    r[0] = campaign; r[1] = g.name; r[2] = k.replace(/^["[]|["\]]$/g, ''); r[3] = k.startsWith('[') ? 'Exact' : k.startsWith('"') ? 'Phrase' : 'Broad';
    rows.push(r);
  }
  const r = blank();
  r[0] = campaign; r[1] = g.name; r[4] = base + g.path; r[5] = g.paths[0]; r[6] = g.paths[1];
  [...g.headlines, ...shared.headlines].slice(0, 15).forEach((h, i) => { r[7 + i] = h; });
  [...g.descriptions, ...shared.descriptions].slice(0, 4).forEach((d, i) => { r[22 + i] = d; });
  rows.push(r);
}
for (const n of negatives) { const r = blank(); r[0] = campaign; r[2] = n; r[3] = 'Campaign Negative Phrase'; rows.push(r); }

const out = fileURLToPath(new URL('../docs/ads/', import.meta.url));
await mkdir(out, { recursive: true });
await writeFile(out + 'google-ads-editor.csv', '﻿' + rows.map(r => r.map(q).join(',')).join('\r\n'));
const md = [`# ${campaign}`, '', 'Generated by scripts/ads-campaign.mjs. All lengths validated against Google limits.', '',
  ...groups.flatMap(g => [`## ${g.name} → ${base}${g.path}`, '', `Keywords: ${g.keywords.join(', ')}`, '', 'Headlines:', ...[...g.headlines, ...shared.headlines].map(h => `- ${h} (${len(h)})`), '', 'Descriptions:', ...[...g.descriptions, ...shared.descriptions].slice(0, 4).map(d => `- ${d} (${len(d)})`), '']),
  '## Negative keywords (campaign, phrase)', '', negatives.join(', '), '',
  '## Sitelinks', '', ...sitelinks.map(([t, u, a, b]) => `- ${t} → ${u} — ${a} / ${b}`), '',
  '## Callouts', '', callouts.join(' · '), '',
  `## Structured snippet (${snippet.header})`, '', snippet.values.join(' · '), ''].join('\n');
await writeFile(out + 'campaign-summary.md', md);
console.log(`OK: ${groups.length} ad groups, ${groups.reduce((n, g) => n + g.keywords.length, 0)} keywords, ${negatives.length} negatives -> docs/ads/`);
