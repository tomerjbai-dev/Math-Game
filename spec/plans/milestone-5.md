# Milestone 5 — עיצוב סופי, PWA ופריסה

**מקורות:** `MILESTONES.md` (M5), `DESIGN.md` (כל המסמך + `style-guide.png`, `mockups.png`, `wireframes.png`), `ARCHITECTURE.md` (2.6, 2.7, 2.9), `PRD.md`.
**נקודת פתיחה (מהקוד):** M1–M4 עובדים. כבר קיימים: Design tokens ב-`src/styles/global.css`, Fredoka מקומי (כולל subset עברי) ב-`main.tsx`, `base: '/Math-Game/'` ב-`vite.config.ts`, `lang="he" dir="rtl"`, `viewport-fit=cover` ו-`theme-color` ב-`index.html`, אייקוני SVG בסיסיים ב-`src/components/icons.tsx`, Safe area תחתון בסרגל הניווט. **חסרים:** ליטוש חזותי לפי ה-Mockups, טיפול במקלדת פתוחה, Manifest ואייקוני PWA, Workflow של GitHub Actions והפריסה עצמה.

**עקרון:** אין שינוי התנהגות, אין מסכים או פיצ'רים חדשים, אין תלויות חדשות. כל השינויים ב-CSS, ב-SVG, ב-`index.html`, בקבצים סטטיים וב-Workflow.

---

## חלק א — עיצוב סופי

### א.1 שפה חזותית כללית (`src/styles/global.css`)
- **כותרות עם משיכת הדגשה:** מחלקה משותפת `.highlight` — `::before` מאחורי הטקסט, בצבע Highlight (`#FCD34D`), פינות מעוגלות וסיבוב קל (~‑2°) לתחושת מרקר ידני, כמו ב-Mockups. גרסת `.highlight-pink` (Pink, בשקיפות) לכותרת "הסבב הסתיים". בשימוש ב: "אלופי הכפל", "כל הכבוד!", "הסבב הסתיים", "אודות".
- **כפתורים:** תחושת "ציור ידני" עדינה — מסגרת בגוון כהה יותר של צבע הכפתור (Primary/Secondary), `border-radius: var(--radius-lg)`, הצללה רכה, מצב `:active` (הזזה קלה למטה). כפתור משני: רקע Surface/לבן, מסגרת Secondary. טקסט לבן על Primary/Secondary נשאר 18px Bold (כלל ניגודיות).
- **אייקון בתוך כפתור:** תמיכה ב-SVG לפני התווית (`gap` קיים). אייקונים דקורטיביים בלבד (`aria-hidden`), התווית תמיד קיימת.
- **כרטיסים:** גבול עדין יותר (`Border` בשקיפות / גוון Surface כהה), הצללה רכה, רדיוס 24px. כרטיס ניקוד בסיום ובאודות על רקע נייר חם/Surface כמו ב-Mockup.
- **Focus נגיש:** `:focus-visible` קיים (מסגרת כחולה 3px) — לוודא שהוא גלוי על כל הרקעים, כולל בתוך החלונית וסרגל הניווט.
- **`prefers-reduced-motion`:** ביטול אנימציות קלות שיתווספו (ראה א.3).

### א.2 אייקונים (`src/components/icons.tsx`)
- לשדרג את האייקונים לסגנון ה-Style Guide: צבעוניים, קו מעוגל ועבה, מילוי בהיר.
  - **בית / תרגול (×) / אודות (i)** בסרגל הניווט — נשארים `currentColor` כדי שהיעד הפעיל יקבל Primary; היעד הפעיל מקבל גרסה ממולאת (כמו במוקאפ: בית ממולא כשפעיל, i בעיגול ממולא כשפעיל).
  - **גביע** (ניצחון, שיא אישי) ו**פסילה** (× בעיגול אדום) — קיימים; ליטוש קל לפי ה-Mockup (קרני אור קצרות סביב הגביע).
  - **כוכב** (חדש) — בצבע Accent/Highlight, בתג הניקוד בתרגול ובכרטיס הניקוד בניצחון, כמו ב-Mockup.
  - אייקונים קטנים לכפתורים, לפי ה-Mockups: **הפעלה (▶)** ב"בואו נתרגל!", **i** ב"אודות", **חץ סיבובי** ב"התחל מחדש", **בית** ב"חזרה לבית".
- אין טעינת אייקונים משירות חיצוני.
- **לא מוסיפים** את אייקון גרף העמודות שבכרטיס "הניקוד הנוכחי" במוקאפ (לא ברשימת האייקונים ב-DESIGN) — במקומו כוכב, ולשיא — גביע.

### א.3 מסכים ומצבים
**בית (`HomeScreen.module.css`):** כותרת H1 עם הדגשה צהובה; שורת הסבר בטקסט Primary; איור הילד בגודל בולט (מוגבל בגובה כדי שהכפתורים ייכנסו במסך טלפון 360×640 בלי גלילה, אם אפשר); כפתור ראשי עם אייקון ▶, כפתור משני "אודות" עם אייקון i.

**תרגול (`PracticeScreen.module.css`):**
- תג ניקוד: רקע Surface, כוכב בצד, מספר בולט — "12 מתוך 45".
- כרטיס תרגיל: רקע נייר חם, ספרות גדולות מאוד (‎~56–64px) בצבע Text Primary, `dir="ltr"` נשמר.
- שדה תשובה: לבן, מסגרת 2px, Focus כחול (קיים) — ליטוש רדיוס/גודל.
- הודעות משוב: בסגנון Message/Alert מה-Style Guide (קיים ברובו — סמל בעיגול צבעוני, רקע בהיר, טקסט כהה). אנימציית כניסה קצרה (fade/scale ‎~150ms) שמכובדת ע"י `prefers-reduced-motion`.
- כפתור "התחל מחדש" — משני, צר יותר וממורכז כמו במוקאפ, עם אייקון חץ סיבובי.
- קישוטים מתמטיים (× / ÷ / משולש) מהמוקאפ — **לא** מוסיפים; DESIGN מבקש שקישוטים לא יפריעו, והם תופסים מקום שנחוץ כשהמקלדת פתוחה.

**חלונית אישור (`ConfirmDialog.module.css`):** כרטיס ממורכז, רדיוס 24px, רקע מוחשך — ליטוש לפי שפת הכרטיסים; Focus נשאר בתוך החלונית (בדיקה שקיים).

**מצבי סיום (`RoundResult.tsx` + CSS):**
- ניצחון: גביע עם קרניים וכוכבים, "כל הכבוד!" עם הדגשה צהובה, כרטיס ניקוד עם כוכבים משני הצדדים, מספר 45 בצבע Primary.
- פסילה: סמל × בעיגול אדום, "הסבב הסתיים" עם הדגשה ורודה, מספר הניקוד ב-Error Text (`#B91C1C`).
- כפתורים: "נסו שוב!" / "התחל סבב חדש" (Primary) ו"חזרה לבית" (משני + אייקון בית).

**אודות (`AboutScreen.module.css`, `MultiplicationTable.module.css`):** כותרת עם הדגשה צהובה; כרטיס מדדים עם קו מפריד, כוכב ליד "הניקוד הנוכחי" וגביע ליד "השיא האישי"; פסקת הסבר; טבלת הכפל — כותרות שורה/עמודה ברקע Surface ובולד, קווי רשת עדינים, ספרות בגודל קריא (≥14px) ברוחב 360px ללא גלילה אופקית (לוודא מחדש אחרי השינויים).

**סרגל ניווט (`BottomNav.module.css`):** רקע נייר בהיר (כמו במוקאפ) עם קו עליון עדין, יעד פעיל ב-Primary + Bold + אייקון ממולא. שלושה יעדים (לא שניים כמו במוקאפ).

### א.4 מקלדת פתוחה ו-Safe Areas
- **הבעיה:** במובייל, כשהמקלדת פתוחה, סרגל הניווט הקבוע עלול "לעלות" מעל המקלדת ולכסות את שדה התשובה או את "בדוק תשובה".
- **פתרון פשוט:** הסתרת סרגל הניווט בזמן ששדה התשובה בפוקוס, רק במכשירי מגע: ב-CSS הגלובלי — `@media (pointer: coarse) { body:has(input:focus) [data-nav] { display: none } }` (או מחלקה מקבילה). בנוסף `scroll-margin` לשדה כדי שהדפדפן ימקם את השדה והכפתור מעל המקלדת.
- ב-`index.html`: הוספת `interactive-widget=resizes-content` ל-meta viewport, כדי שבכרום לאנדרואיד המקלדת תקטין את אזור התוכן במקום לכסות אותו.
- Safe areas: לשמור על `env(safe-area-inset-bottom)` בסרגל ובריפוד התוכן (קיים); להוסיף `env(safe-area-inset-top)` לריפוד העליון של התוכן (רלוונטי כשהאפליקציה מותקנת ב-iOS במצב standalone).
- **ADR-3** ב-ARCHITECTURE.md: "הסתרת סרגל הניווט בזמן הקלדה" — הקשר, החלטה, השלכות.

### א.5 בדיקת גופן עברי
- לוודא בדפדפן (computed style + צילום) שהטקסט העברי מוצג ב-Fredoka ולא בגופן חלופי. הקבצים `fredoka-hebrew-*` קיימים בחבילה, כך שצפוי שזה תקין.

---

## חלק ב — PWA

### ב.1 קבצים חדשים (תיקיית `public/`, מועתקת כמו שהיא ל-`dist/`)
- `public/icons/icon-192.png`, `public/icons/icon-512.png` — עותק של `spec/assets/icon-192.png` ו-`icon-512.png`.
- `public/apple-touch-icon.png` — עותק של icon-192 (לאייקון במסך הבית ב-iOS).
- `public/manifest.webmanifest`:
  ```json
  {
    "name": "אלופי הכפל",
    "short_name": "אלופי הכפל",
    "description": "מתרגלים ומשתפרים בלוח הכפל 1–10",
    "lang": "he",
    "dir": "rtl",
    "display": "standalone",
    "start_url": "./",
    "scope": "./",
    "theme_color": "#6C63FF",
    "background_color": "#FFFBF5",
    "icons": [
      { "src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
      { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" }
    ]
  }
  ```
  נתיבים יחסיים לקובץ ה-Manifest — כך הם תקינים גם ב-`/Math-Game/` וגם בהרצה מקומית (`start_url` לא `/`, לפי ARCHITECTURE 2.7).
- לבדוק אם האייקונים מתאימים גם ל-`maskable` (סימן × עם שוליים מספיקים). אם כן — להוסיף `"purpose": "any maskable"`; אם לא — להשאיר `any` בלבד (בלי ליצור גרפיקה חדשה).

### ב.2 `index.html`
- `<link rel="manifest" href="/manifest.webmanifest">`, `<link rel="icon" href="/icons/icon-192.png">`, `<link rel="apple-touch-icon" href="/apple-touch-icon.png">` — Vite משכתב נתיבים אלה ל-`/Math-Game/...` בבנייה.
- `<meta name="apple-mobile-web-app-title" content="אלופי הכפל">`, `<meta name="mobile-web-app-capable" content="yes">`, `<meta name="description" ...>`.

### ב.3 Service Worker
- **לא מוסיפים.** כרום (אנדרואיד ומחשב) מאפשר התקנה עם Manifest + HTTPS + אייקונים, בלי Service Worker; ב-iOS ההתקנה היא "הוסף למסך הבית". רק אם בבדיקה בפועל יתברר שדפדפן יעד לא מציע התקנה בגללו — עוצרים, מדווחים, ומוסיפים Service Worker מינימלי מסוג NetworkOnly (ללא Precache), לפי ARCHITECTURE 2.7.

### ב.4 בדיקה אוטומטית
- `src/pwa.test.ts`: קורא את `public/manifest.webmanifest` ומוודא את השדות הנדרשים (`name`, `short_name`, `lang: "he"`, `dir: "rtl"`, `display: "standalone"`), ש-`start_url`/`scope` אינם מתחילים ב-`/`, ושכל קובץ אייקון שמוזכר קיים ב-`public/`.

---

## חלק ג — CI/CD ופריסה ל-GitHub Pages

### ג.1 `.github/workflows/deploy.yml`
- טריגרים: `push` ל-`main`, `pull_request` ל-`main`, `workflow_dispatch`.
- `permissions: contents: read, pages: write, id-token: write`; `concurrency: { group: pages, cancel-in-progress: false }`.
- Job `build`: `actions/checkout`, `actions/setup-node` (`node-version: lts/*`, `cache: npm`), `npm ci`, `npm run typecheck`, `npm test -- --run`, `npm run build`, ואז `actions/configure-pages` + `actions/upload-pages-artifact` (`path: dist`) — שני האחרונים רק כשזה לא PR.
- Job `deploy`: `needs: build`, רק ב-`push`/`workflow_dispatch` על `main`, `environment: github-pages` עם `url` מה-step, `actions/deploy-pages`.
- גרסאות Actions עדכניות ויציבות (major tags).

### ג.2 בדיקה מקומית של נתיב הפריסה
- `npm run build` ואז `npm run preview` — לפתוח `http://localhost:4173/Math-Game/` ולוודא: האפליקציה נטענת, האיור והגופן נטענים, `manifest.webmanifest` והאייקונים מחזירים 200 בנתיב `/Math-Game/`, ואין שגיאות בקונסול.
- להוסיף ל-`.claude/launch.json` תצורת `preview` (פורט 4173) לבדיקה הזו.

### ג.3 הפריסה עצמה (דורש אישור ופעולה שלך)
הבנייה מסתיימת **לפני** ה-push. בסיום הבנייה המקומית:
1. אעצור, אסמן 🟡, ואבקש את אישורך ל-push (ה-Push הוא שמפעיל את הפריסה).
2. אדריך אותך צעד אחר צעד להגדרה ב-GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. אחרי האישור — commit + push ל-`main`, מעקב אחרי הרצת ה-Workflow (`gh run watch`), ובדיקה שהאתר עולה ב-`https://tomerjbai-dev.github.io/Math-Game/` ב-HTTPS, כולל Manifest ואייקונים.
4. בדיקות בגרסה הפרוסה (אני בדפדפן המובנה, בגודל מובייל): תרגול, ניסיון נוסף, פסילה, ניצחון, התחלה מחדש, ניווט, שיא אישי ושחזור אחרי רענון. לניצחון — מילוי מצב שמור ב-localStorage דרך כלי הפיתוח במקום לפתור 45 תרגילים ידנית.
5. **בדיקה בטלפון אמיתי — אתה:** פתיחת הכתובת, מקלדת מספרית, שהמקלדת לא מכסה את השדה/הכפתור, התקנה כ-PWA (אנדרואיד: "התקן אפליקציה"; אייפון: שיתוף → "הוסף למסך הבית"), ושחזור הסבב אחרי סגירה ופתיחה. אכין לך רשימת בדיקה פשוטה.

> **שים לב:** אחרי שהפריסה האוטומטית פועלת, כל push ל-`main` מפרסם גרסה חיה (MILESTONES, כלל 6). לא אדחוף שום דבר בלי בקשה שלך.

### ג.4 עדכוני מסמכים
- `CLAUDE.md` → "פקודות הרצה": הוספת `npm run preview` (בדיקת Build מקומית, `http://localhost:4173/Math-Game/`) וכתובת האתר החי.
- `ARCHITECTURE.md` → ADR-3 (א.4); ADR נוסף רק אם יתברר שנדרש Service Worker.
- `MILESTONES.md` → 🟡 ליד M5 בסיום הבנייה המקומית.

---

## רשימת קבצים

| קובץ | פעולה |
|---|---|
| `src/styles/global.css` | ליטוש כפתורים/כרטיסים, `.highlight`, הסתרת ניווט בהקלדה, reduced-motion |
| `src/App.module.css` | Safe area עליון |
| `src/components/icons.tsx` | שדרוג אייקונים, כוכב, ▶, חץ סיבובי, גרסאות ממולאות לניווט |
| `src/components/BottomNav.tsx` + `.module.css` | אייקון ממולא ליעד פעיל, `data-nav`, עיצוב |
| `src/screens/HomeScreen.tsx` + `.module.css` | הדגשת כותרת, אייקונים בכפתורים, פריסה |
| `src/screens/PracticeScreen.tsx` + `.module.css` | כוכב בתג, אייקון בכפתור, עיצוב משוב, `scroll-margin` |
| `src/components/RoundResult.tsx` + `.module.css` | עיצוב מצבי ניצחון/פסילה |
| `src/components/ConfirmDialog.module.css` | ליטוש |
| `src/screens/AboutScreen.tsx` + `.module.css`, `MultiplicationTable.module.css` | עיצוב כרטיס מדדים וטבלה |
| `index.html` | manifest, icons, meta, `interactive-widget` |
| `public/manifest.webmanifest`, `public/icons/*`, `public/apple-touch-icon.png` | חדש |
| `src/pwa.test.ts` | חדש |
| `.github/workflows/deploy.yml` | חדש |
| `.claude/launch.json` | תצורת preview |
| `CLAUDE.md`, `spec/ARCHITECTURE.md`, `spec/MILESTONES.md` | עדכונים לפי ג.4 |

## איך אבדוק בעצמי (לפני ה-push)
1. `npm run typecheck`, `npm test -- --run`, `npm run build` — הכל עובר; בדיקות קיימות לא נשברות משינויי markup (טקסטים ו-roles נשמרים).
2. `npm run dev` בדפדפן המובנה בגודל מובייל (375×812) ובגודל 360px: צילום של בית, תרגול (רגיל/הצלחה/טעות/קלט לא תקין/חלונית אישור), ניצחון, פסילה, אודות — השוואה ל-Mockups; אין גלילה אופקית; הטבלה קריאה.
3. מסך רחב: תצוגת מחשב — עמודה של 480px במרכז.
4. גופן: computed `font-family` ובדיקה ש-`document.fonts` טען את Fredoka העברי.
5. ניגודיות: בדיקה נקודתית של צבעי טקסט על רקעים (במיוחד Text Secondary על Surface, לבן על Primary/Secondary).
6. Focus: מעבר Tab על כל המסכים — מסגרת גלויה.
7. `npm run preview` בנתיב `/Math-Game/` — Manifest ואייקונים נטענים (בדיקת network), ופאנל Manifest תקין.
8. סגירת כל ההרצות בסיום.

## מחוץ ל-scope
Offline / Precache, Service Worker (אלא אם נדרש — ראה ב.3), פס התקדמות, קישוטי רקע מהמוקאפ, דומיין מותאם, Analytics, כל שינוי בחוקי המשחק או בטקסטים.
