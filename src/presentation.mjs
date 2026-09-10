// Curated windows into the existing, verified live-site captures. Coordinates are
// in source-image pixels; the original screenshots remain untouched.
export const presentation = {
  koral: {
    summary: 'אירועי נשים, אווירה וקהילה — עם הרשמה פשוטה מהטלפון.',
    moments: [
      { title: 'מהאווירה אל האירוע הבא', text: 'צילום רחב ופרטי אירוע ברורים, עם ההרשמה קרובה לעין.', crop: [60, 1080, 1320, 1220] },
      { title: 'מקום לקהילה', text: 'טיפוגרפיה עברית וצבעים עמוקים ממשיכים את התחושה של הערב.', crop: [80, 2420, 1280, 680] },
    ],
  },
  libi: {
    summary: 'תכשיטי יהלומים במרכז, עם קטלוג נקי ודרך ישירה לייעוץ.',
    moments: [
      { title: 'התכשיט במרכז', text: 'צילום קרוב, חומר וצורה על רקע עמוק.', mobile: true, crop: [0, 160, 585, 720] },
      { title: 'מבט מקרוב על הקולקציה', text: 'מוצרים, פרטים ומחירים בממשק בהיר ונגיש.', mobile: true, crop: [0, 940, 585, 620] },
    ],
  },
  miryam: {
    summary: 'צילומי איפור, השוואת לפני ואחרי ופנייה אישית לבדיקת זמינות.',
    moments: [
      { title: 'העבודות מובילות', text: 'גלריה עם מסגרות קשת וריווח שנותן לכל מראה מקום.', crop: [110, 790, 1220, 520] },
      { title: 'היכרות לפני הפנייה', text: 'צילום אישי ותוכן קצר יוצרים תחושה של שיחה.', crop: [110, 3620, 1220, 510] },
    ],
  },
  pinhas: {
    summary: 'נוכחות מקצועית למשרד עורכי דין, עם תחומי עיסוק ברורים ופנייה ישירה.',
    moments: [
      { title: 'נוכחות אישית, מסר ברור', text: 'דיוקן וטיפוגרפיה בולטים יוצרים פתיחה ממוקדת.', crop: [0, 90, 1440, 880] },
      { title: 'סדר בתוך המורכבות', text: 'חלוקה לשאלות מוכרות עוזרת למצוא את תחום העיסוק המתאים.', crop: [110, 1880, 1220, 1150] },
    ],
  },
  sos: { summary: 'מנעולן שמגיע אליכם: מסך אחד, מסר אחד וכפתור חיוג.', moments: [] },
  vee: { summary: 'מנהל משימות אישי בעברית: ללכוד, לסדר, להתמקד.', moments: [] },
  seder: { summary: 'מנהל משימות שנכתב בעברית מההתחלה, לא תורגם אליה.', moments: [] },
  pdf: { summary: 'עורך PDF חינמי בעברית: כל הכלים במקום אחד, בלי הרשמה.', moments: [] },
  reuven: {
    summary: 'מוצרי דפוס, מידע ממוקד ודרך נוחה לבקשת הצעת מחיר.',
    moments: [
      { title: 'מוצרים שאפשר לדמיין ביד', text: 'צילומי נייר, צבע וגימור מובילים את קטלוג המוצרים.', crop: [130, 1020, 1180, 990] },
      { title: 'החומר והאנשים שמאחוריו', text: 'צילום מתוך עולם הדפוס לצד הסבר קצר על העבודה.', crop: [110, 3070, 1220, 800] },
    ],
  },
};

// Capture dimensions the crop coordinates above were authored against. The build refuses to run if a
// recapture changed them, so a client site update cannot silently shift a crop onto the wrong region.
// After checking every crop against the new capture, update these numbers.
export const basis = {
  "koral": {
    "desktop": [
      1440,
      3452
    ],
    "mobile": [
      585,
      7863
    ]
  },
  "libi": {
    "desktop": [
      1440,
      6400
    ],
    "mobile": [
      585,
      9000
    ]
  },
  "miryam": {
    "desktop": [
      1440,
      5487
    ],
    "mobile": [
      585,
      7819
    ]
  },
  "pinhas": {
    "desktop": [
      1440,
      6400
    ],
    "mobile": [
      585,
      9000
    ]
  },
  "reuven": {
    "desktop": [
      1440,
      6227
    ],
    "mobile": [
      585,
      9000
    ]
  }
};
