# WhatsApp first messages by location

Each button sends its own first message, so a conversation in WhatsApp shows where on the site it started. The `data-cta` value is the same name the consent-based click tracking receives. Source: `prefill` and `wa()` in `scripts/build.mjs`.

| First message | Where | `data-cta` |
|---|---|---|
| היי LA webs, ראיתי את האתר ואשמח לדבר על אתר לעסק שלי | Header pill, hero button, phone contact bar, footer, the service and about pages' button | `header`, `hero`, `bar`, `footer`, `service` |
| היי LA webs, יש לי עסק בתחום … | "משהו אחר? כתבו בוואטסאפ" in the work filters | `chip-other` |
| היי LA webs, ראיתי את [פרויקט] באתר ואשמח למשהו בסגנון הזה לעסק שלי | "רוצים משהו כזה?" under a featured project | `panel` |
| היי LA webs, ראיתי את [פרויקט] באתר ואשמח לאתר כזה לעסק שלי | "רוצים אתר כזה?" on a case page (Pizza: "מערכת כזו") | `case` |
| היי LA webs, ניסיתי את הדגמת ההזמנות באתר ואשמח למערכת כזו לעסק שלי | "רוצים מערכת כזו לעסק?" in the demo chapter | `demo` |
| היי LA webs, אשמח להצעה לאתר תדמית (החל מ-2,500 ₪) | The price ticket | `price` |
| היי לירון, | The founder chapter | `founder` |
| היי LA webs, [כאן שם העסק.] אשמח לשמוע על [צורך] לעסק שלי. [יש לי / עוד אין לי אתר.] | The closing composer (also on service pages, /about/, case pages) | `composer` |
| היי LA webs, אני [שם] ([עסק]). אשמח לשמוע על [צורך] לעסק שלי. | The landing-page chat form (/lp/, /lp/short/) | form |

Phone links carry `header-tel`, `header-call`, `hero-tel`, `bar-tel`, `contact-tel`, `footer-tel`. Live-site links carry `panel-live`, `row-live`, `case-live` and `demo-open`.
