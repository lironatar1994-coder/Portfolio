// Business facts shown on the site.
//
// Anything wrapped in draft() is a PLACEHOLDER: invented so the layout can be built and reviewed. The build marks every
// place a draft value appears with data-placeholder, and `npm run check` and deploy.ps1 refuse to publish while one is
// left. To confirm a fact, replace the value with the real one and remove the draft() wrapper. To drop it, delete it:
// every block that uses an optional fact disappears when the fact is missing.
//
// Never put reviews, testimonials, client quotes, counters or outcome numbers here: those come only from real people,
// with permission, and have no placeholder.

// A draft used as raw text (a template literal, String(), +) fails the build instead of printing '[object Object]'
// unmarked: render drafts with fact()/items()/answer() in build.mjs, which add data-placeholder.
export const draft = value => ({ draft: true, value, [Symbol.toPrimitive]() { throw new Error('A draft fact was used as raw text. Render it with fact() or confirm it in src/facts.mjs.'); } });
export const isDraft = fact => Boolean(fact && typeof fact === 'object' && fact.draft);
export const valueOf = fact => (isDraft(fact) ? fact.value : fact);

export const facts = {
  founder: {
    name: 'לירון עטאר', // already published (about page, accessibility statement, schema)
    role: 'מייסד LA webs · אפיון, עיצוב ופיתוח',
    photo: draft(null), // the placeholder shows until a real photo is set; set null to drop the chapter. e.g. { src: '/images/liron-4x5.webp', width: 1280, height: 1600, alt: 'לירון עטאר' }
    lines: draft([
      'מהשיחה הראשונה ועד אחרי ההשקה, מדברים איתי.',
      'מי שמעצב את האתר הוא מי שעונה לכם בוואטסאפ.',
      'כל פרויקט מתחיל בשאלה מה העסק עושה, ולמי האתר צריך לעבוד.',
    ]),
  },

  // What LA webs commits to. Each must be true in practice before it ships.
  commitments: draft([
    'מי שמעצב הוא מי שעונה',
    'כל אתר נכתב מאפס, בלי תבניות',
    'חוזרים אליכם באותו יום',
    'נגישות ומהירות בנויות פנימה',
  ]),

  business: {
    id: draft('עוסק מורשה 000000000'),
    area: draft('עובדים עם עסקים מכל הארץ'),
    hours: draft('א׳–ה׳, 9:00-19:00'),
    reply: draft('חוזרים אליכם באותו יום'),
    direct: draft('ההודעה מגיעה ישירות ללירון'),
  },

  price: {
    from: '2,500', // published on /lp/ and in the ads
    vat: draft('המחיר לא כולל מע״מ'),
    includes: draft([
      'עיצוב אישי, בלי תבנית',
      'מותאם לטלפון ומהיר',
      'מוכן לגוגל',
      'וואטסאפ וחיוג בלחיצה',
      'דומיין, אחסון ואבטחה לשנה הראשונה',
      'חודש של שינויים קטנים אחרי ההשקה',
    ]),
    changes: 'מספר העמודים, מערכות כמו הזמנות, הרשמה או קטלוג, כתיבת תוכן ותמונות.', // as on the service pages
    fit: draft([
      'אתם עסק או נותני שירות, ולקוחות מחפשים אתכם בטלפון',
      'אתם רוצים עיצוב שנראה כמו העסק, לא כמו תבנית',
      'חשוב לכם לדבר ישירות עם מי שבונה',
    ]),
    notFit: draft([
      'צריך חנות עם מאות מוצרים ותשלום כבר מחר',
      'אתם מעדיפים לבנות את האתר לבד, בכלי כמו Wix',
      'אין לכם זמן לשיחה אחת על העסק',
    ]),
  },

  // Starting prices and typical timelines per service (slugs from src/seo-content.mjs).
  services: {
    websites: { from: '2,500', time: draft('בדרך כלל 2-3 שבועות'), line: 'אתר שמציג את העסק, את העבודות ואת הדרך לפנות.' },
    'landing-pages': { from: draft('1,500'), time: draft('בדרך כלל כשבוע'), line: 'עמוד אחד, מסר אחד ופנייה בלחיצה, לקמפיין או לשירות.' },
    catalogs: { from: draft('4,500'), time: draft('בדרך כלל 3-5 שבועות'), line: 'מוצרים, תמונות ועמוד לכל מוצר, עם בקשת הצעת מחיר.' },
    'web-apps': { from: null, time: null, line: 'הזמנות, הרשמה וכלים שעושים עבודה בשביל העסק.' },
  },

  process: {
    build: draft('בדרך כלל 2-3 שבועות לאתר תדמית'),
  },

  // Answers that state a policy. They ship only once confirmed.
  answers: {
    ownership: draft('הדומיין נרשם על שם העסק, והאתר שלכם. אם תרצו לעבור, מקבלים את כל הקבצים.'),
    changes: draft('בחודש הראשון שינויים קטנים כלולים. אחר כך מתאמים עדכונים לפי הצורך, בהצעה מסודרת.'),
    timeline: draft('אתר תדמית עולה בדרך כלל תוך 2-3 שבועות. מערכות כמו הזמנות או הרשמה לוקחות יותר, ולוח הזמנים נקבע בשיחה הראשונה.'),
  },

  // How each project is presented. Pizza HaTanur is a demo (stated on its case page); Seder and PDF Studio are built and
  // maintained by the studio (stated in src/projects.mjs). Which projects are paying clients is not confirmed yet.
  status: {
    koral: draft('לקוח'), miryam: draft('לקוח'), pinhas: draft('לקוח'), reuven: draft('לקוח'), sos: draft('לקוח'),
    seder: 'מוצר של הסטודיו', pdf: 'מוצר של הסטודיו', pizza: 'פרויקט הדגמה',
  },
};
