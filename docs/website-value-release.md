# Website value and portfolio update

The user authorized replacing the studio/process sections with concise website benefits, showing their WhatsApp examples, removing Vee from the portfolio and deploying to production.

## Content and layout

- One heading: למה העסק שלכם צריך אתר?
- Primary benefit: כרטיס הביקור שלכם. בקישור אחד.
- Two supporting benefits: מקום להכיר את העסק; דרך פשוטה לפנות אליכם.
- The first benefit is backed by two actual user-supplied WhatsApp previews. Desktop displays them next to the copy; mobile places a native horizontal preview strip after the primary benefit, before the two shorter benefits. Full-size images open through ordinary accessible links.
- The existing contact section follows directly. No extra call to action or process section.
- Vee is removed from project data, gallery ordering, related-project strips and sitemap. Its old case route is removed on subsequent builds. PDF Studio, which uses the same hostname, remains a separate project.

## Image provenance

Copied without editing or recompression, by explicit user request to show these examples:

- `public/images/whatsapp-koral-example.png`: supplied `Screenshot 2026-09-14 193958.png`, 528×405.
- `public/images/whatsapp-pinhas-example.jpg`: supplied `WhatsApp Image 2026-09-14 at 19.41.31.jpeg`, 780×786.

Both screenshots contain public promotional website information, not a private conversation. No additional personal message context is included.

## Production route

Verified on the server before release: canonical `https://lawebs.co.il`, Nginx root `/opt/lawebs-portfolio/www/current`, release source `/opt/lawebs-portfolio/source.git`. Other applications use explicit Nginx locations and are outside this deployment.

The deployment validates the new build and Nginx configuration before moving the existing root to a timestamped backup. A failure during the root switch or reload restores the previous root. GitHub repository identity is compared case-insensitively because the configured local and server remotes differ only in `Portfolio` capitalization.

Browser QA was not run for this revision under the current Sites instructions. Validation covers build output, references, source syntax, asset sizes/dimensions, removal of Vee, and live HTTP responses after deployment.
