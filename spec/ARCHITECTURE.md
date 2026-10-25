# ARCHITECTURE — אלופי הכפל

**בסיס הדרישות:** `PRD.md` · **תאריך בדיקת מקורות:** 25.10.2026

## 1. Technology Stack שנבחר

| רכיב | טכנולוגיה | תפקיד |
|---|---|---|
| Frontend | React + TypeScript | ממשק שלושת המסכים, ניהול מצב וחוקי המשחק |
| Build ושרת פיתוח | Vite | פיתוח מקומי מהיר והפקת אתר סטטי |
| Styling | CSS רגיל עם CSS Modules | RTL, עיצוב רספונסיבי, בידוד סגנונות ללא ספריית UI נוספת |
| ניהול מצב | React Context + `useReducer` | מקור אמת יחיד לסבב, ניקוד ומעברי מצב |
| שמירה מקומית | Web Storage `localStorage` | שמירת סבב פעיל ושיא אישי במכשיר בלבד |
| PWA | Web App Manifest + אייקונים מקומיים | התקנה במכשירים תומכים; ללא Offline caching |
| בדיקות | Vitest + React Testing Library | בדיקת חוקי משחק והתנהגות מסכים |
| קוד ו-CI/CD | Git + GitHub + GitHub Actions | Version control, בדיקות ו-Deployment אוטומטי |
| Hosting | GitHub Pages | אירוח HTTPS של קבצים סטטיים |

**לא נדרשים:** Backend, Database בענן, Supabase, Authentication, APIs, אחסון קבצים חיצוני, שירותי AI, Serverless Functions או מערכת Analytics.

### נימוק לבחירה
- **React** נבחר על פני Vue ו-Svelte בגלל בשלות, תיעוד רחב, קהילת מפתחים גדולה והתאמה טובה לקומפוננטות ולפיתוח בסיוע AI. לפרויקט כה קטן גם Vanilla TypeScript אפשרי, אך React מספק ניהול UI עקבי במחיר מורכבות סביר.
- **Vite** נבחר על פני Next.js ופתרון Bundling ידני: המוצר הוא SPA סטטי ואינו זקוק ל-SSR או לשרת. Vite מספק Build פשוט ונתיב פריסה מתועד ל-GitHub Pages.
- **CSS Modules** נבחר על פני Tailwind ו-MUI: שלושה מסכים עם סגנון לימודי מותאם אינם מצדיקים ספריית עיצוב נוספת.
- **localStorage** נבחר על פני IndexedDB ושרת: הנתונים קטנים, סינכרוניים ומקומיים; יש לעטוף את פעולות האחסון בטיפול בשגיאות. אין צורך ב-Migrations של Database, אלא רק בגרסת Schema לנתונים מקומיים.
- **GitHub Pages** נבחר על פני Vercel ו-Cloudflare Pages כיוון שהאתר סטטי ואינו דורש Backend, והקוד כבר מאוחסן ב-GitHub (Repository ציבורי `tomerjbai-dev/Math-Game`). האתר צפוי להתאים למכסת האירוח הסטטית; יש לעקוב אחר תנאי השימוש והמגבלות.
- **PWA ללא Service Worker**: התקנה אינה מחייבת Service Worker בכל הפלטפורמות, וה-PRD דורש אינטרנט. Web App Manifest ו-HTTPS מספקים בסיס להתקנה בדפדפנים תומכים. אין להוסיף Service Worker המאפשר שימוש Offline בניגוד לדרישה.

### סיכונים ומגבלות
1. `localStorage` עשוי להיחסם, להימחק, או לא להישמר ב-Incognito; במקרה כזה תרגול בזיכרון ימשיך, אך יוצג חיווי בעברית שלא ניתן להבטיח שמירה. מחיקת נתוני אתר או שימוש בדפדפן/מכשיר אחר לא תשחזר שיא או סבב.
2. התקנת PWA משתנה לפי מערכת הפעלה ודפדפן; אין להבטיח כפתור התקנה מובנה בכל מכשיר. יש לוודא Manifest, HTTPS ואייקונים מתאימים ולבדוק בפועל ב-Android וב-iOS.
3. GitHub Pages הוא שירות סטטי עם מגבלות שימוש ונפח, ואינו מתאים ל-Backend. אם בעתיד יתווספו חשבונות או סנכרון, יידרש תכנון מחדש.
4. מכיוון שהמשחק מחושב מקומית, הניקוד אינו מוגן מפני שינוי יזום באמצעות כלי הדפדפן; אין צורך באבטחת ניקוד שרתית ללא תחרות או דירוג גלובלי.
5. אתר סטטי שכבר נטען עשוי להמשיך לפעול זמנית בזיכרון גם לאחר אובדן חיבור. אין ליישם Offline support, והפעלת האפליקציה מחדש ללא רשת אינה מובטחת. אם יש צורך באכיפת חיבור רציף כתנאי לתרגול, זו דרישה עסקית נפרדת שאינה מפורשת ב-PRD.

## 2. ארכיטקטורת המערכת

### 2.1 מבנה ואחריות

```text
GitHub Repository
   └── GitHub Actions: typecheck → tests → build → deploy
          └── GitHub Pages (HTTPS, HTML/CSS/JS/manifest/assets)
                  ↓
            דפדפן / PWA מותקן
                  ├── React UI: בית | תרגול | אודות
                  ├── Game Engine: 45 תרגילים, תשובות, ניקוד, מצבי סיום
                  ├── React state: סבב פעיל ושיא אישי
                  └── localStorage: נתונים מקומיים בלבד
```

אין תקשורת עם API ייעודי. הדפדפן מוריד קבצים סטטיים מ-GitHub Pages; כל חישובי המשחק נעשים בצד הלקוח. תמונת מסך הבית ואייקוני האפליקציה נארזים עם האתר ולא נטענים משירות תמונות חיצוני.

### 2.2 חלוקה ל-Modules

| Module | אחריות |
|---|---|
| App Shell / Navigation | שלושת המסכים, סרגל ניווט תחתון קבוע, RTL, מעבר ללא איפוס סבב |
| Home | שם האפליקציה, איור מתמטי, כפתור **"בואו נתרגל!"** |
| Practice | תרגיל, ניקוד בפורמט `n מתוך 45`, שדה מספרי, בדיקה, משוב, התחלה מחדש ואישור |
| About | הסבר, טבלת 1–10, ניקוד נוכחי ושיא אישי |
| Exercise Catalog | יצירת כל הצירופים `2 ≤ a ≤ b ≤ 10` (45 זוגות), עם מזהה קנוני לכל זוג |
| Game Rules | בחירה אקראית ללא חזרות, שתי הזדמנויות, ניקוד, הפסד וניצחון |
| Game State | מצב משותף לכל המסכים, Reducer ופעולות אטומיות |
| Persistence | טעינה, אימות, גרסה ושמירה ב-`localStorage`, טיפול בכשלי אחסון |
| PWA Assets | Manifest, אייקונים והגדרות התקנה ללא Offline caching |

**ניווט:** שלושה Views בתוך SPA. אין צורך ב-React Router; ניתן לנהל `activeScreen` ברמת App Shell. ניווט אינו יוצר או מאפס סבב. מצב סיום וניצחון הם מצבים בתוך View התרגול ולא מסכים ראשיים נוספים.

### 2.3 Data Model

`Exercise` הוא זוג מספרים שלמים `{a, b}` עם `2 ≤ a ≤ b ≤ 10`, ו-`id` יציב בפורמט `a-b`. התשובה הנכונה מחושבת כ-`a*b`, ואינה נשמרת בנפרד. למשל `4-5` ו-`2-10` הם שני מזהים שונים אף ששניהם שווים ל-20; `5×4` ו-`4×5` הם אותו מזהה `4-5`.

**סדר תצוגה:** כל רשומה ב-`order` נשמרת בסדר שבו התרגיל יוצג (`DisplayPair`, למשל `"7-3"` או `"3-7"`), שנבחר באקראי בתחילת הסבב. המזהה הקנוני נגזר ממנה במיון שני המספרים. כך סדר הגורמים נשאר זהה גם אחרי ניווט או Reload (ראה ADR-1).

`SavedGame` (Schema גרסה 1):

```ts
type ExerciseId = string; // canonical, e.g. "4-5"
type DisplayPair = string; // display order, e.g. "5-4"; canonical id = sorted pair
type RoundStatus = 'playing' | 'lost' | 'won';
interface SavedGame {
  schemaVersion: 1;
  bestScore: number; // 0..45
  round: {
    status: RoundStatus;
    order: DisplayPair[]; // full permutation: each of the 45 canonical ids exactly once
    index: number; // 0..45, מיקום בתור
    mistakesOnCurrent: 0 | 1; // מספר טעויות בתרגיל הנוכחי
    score: number; // מספר תרגילים שנפתרו; 0..45
  };
}
```

- `order` נוצר פעם אחת בתחילת סבב באמצעות Fisher–Yates shuffle, ונשמר כדי למנוע חזרות גם אחרי רענון או סגירה. יש להשתמש במקור אקראיות תקין בדפדפן (`crypto.getRandomValues`) כדי למנוע הטיית בחירה; אין צורך באבטחה קריפטוגרפית של המשחק עצמו.
- בסבב פעיל, `score === index` משום שכל תרגיל קודם נפתר בהצלחה. ב-`won`, שניהם 45; ב-`lost`, שניהם מספר התרגילים שהושלמו לפני הפסילה.
- התרגיל הנוכחי נגזר מ-`order[index]` כש-`status === 'playing'`. `mistakesOnCurrent` שווה 0 או 1; טעות שנייה מעבירה ל-`lost` בלי לקדם את `index`.
- השיא מתעדכן בכל תשובה נכונה באמצעות `max(bestScore, score)`; לכן גם שיא של סבב שהופסק באמצע אינו אובד. הגדרה זו משמרת את הניקוד המרבי שהושג, בלי להוסיף היסטוריית סבבים.
- טקסט שהוקלד, הודעת משוב, תזמון מעבר ומצב חלונית האישור הם **UI state זמני** ולא נשמרים. אם סוגרים את האפליקציה במהלך הודעת הצלחה, יש לשחזר את התרגיל הבא לפי המצב השמור, בלי לתת נקודה נוספת.
- Key יחיד מומלץ: `multiplication-champions:v1`. בקריאה יש לאמת Schema, מזהים ייחודיים, טווחים ועקביות; נתונים פגומים יגרמו לאתחול סבב תקין, ולא לקריסה. אין לשכתב נתונים ישנים בשקט לפני ניסיון קריאה/בדיקה.

### 2.4 חוקי פעולה ומעברי מצב

1. **פתיחה:** ניסיון לשחזר `SavedGame`. אם אין נתונים תקינים, יוצרים סבב חדש עם `score=0`, `bestScore=0`, `index=0`, `mistakesOnCurrent=0` ו-`order` מעורבב.
2. **בדיקת תשובה:** מקבלים רק מספר שלם חיובי תקין בטווח 1–100 (כלל מוצר שמוגדר ב-PRD). שדה ריק, קלט לא תקין או ערך מחוץ לטווח אינם צורכים ניסיון; מציגים **"נא להקליד מספר בין 1 ל-100"**. בדיקה מתאפשרת רק במצב `playing`.
3. **תשובה נכונה:** עדכון אטומי של `score+1`, `index+1`, איפוס טעויות ושיא לפי הצורך; שמירה מיידית; הודעת הצלחה **"כל הכבוד! תשובה נכונה"** למשך 1.5 שניות (קבוע אחד בקוד), ואז מעבר אוטומטי לתרגיל הבא. אם `score` הגיע ל-45, `status='won'` ומוצג מצב ניצחון עם ניקוד 45.
4. **טעות ראשונה:** עדכון `mistakesOnCurrent=1`, שמירה, ניקוי השדה והודעת **"לא נורא! יש לך עוד ניסיון אחד"**; אותו תרגיל נשאר.
5. **טעות שנייה:** `status='lost'`, שמירה והצגת מצב סיום עם הניקוד וכפתור **"נסו שוב!"**; אין סבב חדש אוטומטי.
6. **"התחל מחדש":** פתיחת חלונית אישור. ביטול לא משנה נתונים; אישור יוצר סדר חדש ומאפס את נתוני הסבב בלבד, תוך שמירת `bestScore`.
7. **"נסו שוב!" / "התחל סבב חדש" לאחר ניצחון:** סבב חדש ללא מחיקת השיא. **"חזרה לבית"** מחליף View בלבד; מצב `lost`/`won` נשמר עד שמתחילים סבב חדש.
8. **ניווט:** החלפת View בלבד; מצב הסבב נשמר. חזרה ממסך אודות/בית משחזרת את אותו תרגיל ואותה יתרת הזדמנויות.

יש לנטרל בדיקות כפולות בזמן משוב/מעבר, כך שלחיצות מהירות או לחיצה חוזרת על Enter לא יעניקו ניקוד כפול. אירועי המשחק עוברים דרך Reducer יחיד; כתיבה ל-Storage תתרחש בעקבות שינוי מצב מחושב, בלי להסתמך על מצב React שטרם התעדכן.

### 2.5 זרימות מידע

**טעינת אפליקציה:** `GitHub Pages → קבצים סטטיים → React initialization → localStorage validation → App Shell → המסך הפעיל`. בפתיחה חדשה ברירת המחדל היא מסך הבית; הסבב הפעיל משוחזר בנפרד.

**תרגול:** `Practice input → validation → Game Rules / reducer → updated state → persistence → UI feedback → next exercise or result`. אין בקשות רשת לבדיקת תשובות.

**אודות:** `Game State → bestScore + round.score → About UI`; טבלת הכפל נוצרת מחישוב `row × column` עבור 1–10 ואינה תלויה בשמירת הסבב.

**סגירה וחזרה:** השינויים החשובים נשמרים מיד לאחר כל תשובה או התחלה מחדש. בטעינה הבאה משחזרים את המצב השמור. אין להסתמך רק על אירוע `beforeunload` לשמירה.

### 2.6 ממשק, נגישות ושפה

- הגדרת `lang="he"` ו-`dir="rtl"` ברמת המסמך; כפל ומספרים מוצגים בסדר חזותי ברור, עם `dir="ltr"` באזורי ביטויים מתמטיים לפי הצורך.
- שדה קלט עם `inputMode="numeric"`, תווית נגישה ופעולת בדיקה מפורשת. אין להסתמך על `type="number"` בלבד: יש לבצע Validation לוגי גם בקוד.
- כפתורים גדולים, פוקוס גלוי, תמיכה במקלדת, ניגודיות מספקת, והודעות משוב נגישות באמצעות אזור `aria-live` בלי להפריע להקלדה.
- מסך אודות יציג טבלת 10×10 עם כותרות שורה ועמודה ברורות, שנכנסת ברוחב טלפון (360px ומעלה) ללא גלילה אופקית וללא צמצום טקסט קיצוני; העמוד גולל אנכית.
- הגופן `Fredoka` נארז מקומית (למשל באמצעות חבילת `@fontsource/fredoka`), ללא טעינה מ-Google Fonts.
- סרגל הניווט התחתון אינו מסתיר את השדה או את הכפתורים כאשר המקלדת פתוחה; יש להתחשב ב-safe areas של מכשירים.
- כל טקסטי UI יהיו בעברית בלבד. אין להוסיף מסכים או תכונות מעבר ל-PRD.

### 2.7 PWA והתקנה

- להגדיר `manifest.webmanifest` עם `name: "אלופי הכפל"`, `short_name: "אלופי הכפל"`, `lang: "he"`, `dir: "rtl"`, `display: "standalone"`, `start_url` ו-`scope` התואמים לנתיב הפריסה, `theme_color`, `background_color`, ואייקוני PNG בגדלים 192×192 ו-512×512.
- GitHub Pages מספק HTTPS. ה-Manifest, האייקונים וכתובות ה-Assets יכבדו את `base` של Vite. אין להגדיר `start_url: '/'` אם האתר מתארח תחת `/<REPO>/`.
- אין להתקין `vite-plugin-pwa` או Service Worker כברירת מחדל: ל-PRD אין דרישת Offline. אם מתברר שבדפדפן יעד נדרש Service Worker לצורך התקנה, יש להוסיף Service Worker **NetworkOnly** מינימלי בלי Precache או Offline fallback, ולבדוק שלא נוצר מצב Offline נתמך בטעות.
- אין להבטיח חוויית התקנה זהה בכל מערכת; ב-iOS עשויה להידרש פעולת **"הוסף למסך הבית"** מתוך תפריט השיתוף.

### 2.8 אבטחה ופרטיות

- אין חשבונות, פרטים אישיים, Cookies לזיהוי, שירותי מעקב או שליחת תוצאות לשרת.
- `localStorage` נשאר באותו Origin; אין לשמור בו סודות. נתונים מקומיים אינם מוצפנים ואין להציגם כמאובטחים מפני משתמש בעל גישה למכשיר.
- אין להזריק HTML מתשובות משתמש; React מבצע escaping ברירת מחדל, ויש להימנע מ-`dangerouslySetInnerHTML`.
- כל תמונה, גופן ואייקון ייטענו מקומית כדי לצמצם תלות בגורמי צד שלישי; אין צורך ב-API keys או Environment secrets.
- להקפיד על תלות בגרסאות יציבות, `package-lock.json`, בדיקות CI ועדכוני אבטחה. GitHub Pages אינו מספק בקרת גישה לאתר ציבורי; קוד Frontend הוא גלוי מטבעו.

### 2.9 GitHub, Hosting, Configuration ו-Deployment

- Repository אחד ב-GitHub עם ענף `main` כענף Production. לשמור את קוד המקור, בדיקות, Assets, `package.json`, `package-lock.json`, הגדרות Vite ו-Workflow. לא להעלות `node_modules`, `dist` או קבצי סודות.
- להגדיר GitHub Pages: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
- Workflow ב-`.github/workflows/deploy.yml` ירוץ על `push` ל-`main` (ואפשר ידנית), ויבצע `checkout`, התקנת Node.js LTS, `npm ci`, בדיקות TypeScript, `npm test -- --run`, `npm run build`, העלאת תיקיית `dist` באמצעות `actions/upload-pages-artifact` ופריסה באמצעות `actions/deploy-pages`.
- להשתמש בהרשאות Workflow מינימליות: `contents: read`, `pages: write`, `id-token: write`, ולהגדיר `concurrency` כדי למנוע פריסות מתנגשות. Pull Requests יריצו בדיקות ו-Build ללא פריסה ל-Production.
- ב-Vite להגדיר `base='/Math-Game/'` (Project Pages; הכתובת הצפויה `https://tomerjbai-dev.github.io/Math-Game/`). להשתמש בנתיבי Assets יחסיים לבסיס.
- נכסים גרפיים מוכנים נמצאים ב-`spec/assets/` (איור הבית ואייקוני PWA) ויועתקו לתיקיית הקוד בעת הבנייה.
- Development מקומי: `npm install` ולאחר מכן `npm run dev`; Production מתעדכן אוטומטית לאחר Push תקין ל-`main`. בדיקות Production מתבצעות בכתובת GitHub Pages על מכשיר נייד.
- אין Database ולכן אין Database Migrations, שני פרויקטי Supabase או מפתחות גישה ל-Production. עדכוני Schema של `localStorage` יבוצעו בתוך הקוד עם Versioning, בדיקות תאימות ואפשרות לאתחול בטוח.
- **עלות צפויה:** עבור פרויקט אישי קטן ב-Public Repository, GitHub Free ו-GitHub Pages עשויים להספיק ללא עלות Hosting חודשית; דומיין מותאם, אם יירכש, יהיה בתשלום נפרד. עלויות ותנאים עשויים להשתנות ויש לבדוק זכאות ומגבלות לפני העלאה.

### 2.10 בדיקות ואימות הארכיטקטורה

בדיקות אוטומטיות צריכות לכסות: בדיוק 45 זוגות קנוניים; `4×5` ו-`5×4` זהים אך `2×10` נפרד; ערבוב ללא חזרות; תשובה נכונה אחת מוסיפה נקודה אחת בלבד; ניסיון ראשון לא מחליף תרגיל; טעות שנייה מסיימת סבב; ניצחון ב-45; ביטול התחלה מחדש; שמירת שיא; שחזור אחרי Reload; נתוני Storage פגומים או חסומים; ניווט בין שלושת המסכים. יש לבצע גם בדיקות ידניות של RTL, מקלדת מספרית, PWA installability ופריסה בנתיב GitHub Pages.

## 3. מקורות רשמיים להחלטות

1. [React — Quick Start](https://react.dev/learn) ו-[Managing State](https://react.dev/learn/managing-state) — קומפוננטות, Hooks וניהול מצב.
2. [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) — Type Checking ותיעוד השפה.
3. [Vite — Deploying a Static Site](https://vite.dev/guide/static-deploy) — הגדרת `base`, GitHub Pages ו-GitHub Actions.
4. [MDN — Making PWAs installable](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable) — Manifest, HTTPS, אייקונים והבדלי התקנה בין פלטפורמות.
5. [MDN — Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API) ו-[Using Web Storage](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API) — אחסון מקומי ומגבלותיו.
6. [GitHub Docs — GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits) ו-[GitHub Pricing](https://github.com/pricing) — מגבלות Hosting ותמחור.

> **גבול המסמך:** הארכיטקטורה מתרגמת את דרישות ה-PRD הקיימות בלבד; אינה כוללת Milestones, לוחות זמנים או תכונות עתידיות.

## החלטות מרכזיות (ADRs)

### ADR-1: שמירת סדר הגורמים בתוך `order`
**הקשר:** ה-PRD דורש שסדר הגורמים בתצוגה יהיה אקראי ויישאר קבוע לאותו תרגיל בסבב, גם אחרי ניווט או פתיחה מחדש.
**החלטה:** כל רשומה ב-`order` נשמרת כזוג בסדר התצוגה (`"7-3"`), שנקבע באקראי בעת ערבוב הסבב. הזהות הקנונית לבדיקת ייחודיות נגזרת במיון הזוג.
**השלכות:** אין צורך בשדה נוסף ב-Schema; אימות הנתונים בטעינה בודק ייחודיות לפי המזהה הקנוני ושכל 45 הזוגות קיימים.

### ADR-2: טעינה, אימות ושמירה של `localStorage`
**הקשר:** ה-PRD דורש לשחזר את הסבב והשיא אחרי סגירה ופתיחה מחדש, בלי לקרוס כשהאחסון פגום או חסום, ולהציג הודעה כשאי אפשר לשמור.
**החלטה:** `src/game/storage.ts` קורא את המפתח `multiplication-champions:v1` ומאמת את כל ה-Schema (גרסה, טווחים, 45 זוגות ייחודיים, `score === index`, עקביות סטטוס, `bestScore >= score`). נתונים לא תקינים מתעלמים מהם לגמרי — כולל השיא — ומתחיל סבב חדש שנשמר במקומם. `GameProvider` שומר ב-`useEffect` אחרי כל שינוי מצב של ה-Reducer; תוצאת השמירה קובעת את `storageAvailable`, שמציג פס אזהרה בראש התוכן בכל המסכים.
**השלכות:** אין צורך באירוע `beforeunload`; כשל שמירה באמצע השימוש (למשל מכסה מלאה) מציג את האזהרה מיד. שינוי עתידי במבנה הנתונים יחייב גרסת Schema חדשה; גרסה לא מוכרת מתאפסת בבטחה.

### ADR-3: הסתרת סרגל הניווט בזמן הקלדה
**הקשר:** במובייל, כשהמקלדת פתוחה, סרגל הניווט הקבוע עלול לעלות מעל המקלדת ולכסות את שדה התשובה או את "בדוק תשובה" (ARCHITECTURE 2.6).
**החלטה:** במכשירי מגע (`pointer: coarse`) סרגל הניווט מוסתר ב-CSS כל עוד שדה קלט בפוקוס (`body:has(input:focus) [data-nav]`). בנוסף `interactive-widget=resizes-content` ב-viewport (אנדרואיד) ו-`scroll-margin-bottom` לשדה, כדי שהכפתור יישאר גלוי מעל המקלדת.
**השלכות:** בלי JavaScript ובלי מעקב אחרי גודל המקלדת. בזמן הקלדה אין גישה לסרגל; נגיעה מחוץ לשדה סוגרת את המקלדת ומחזירה אותו. במחשב (עכבר) הסרגל תמיד מוצג.

### ADR-4: PWA בלי Service Worker
**הקשר:** ARCHITECTURE 2.7 מתיר Service Worker מינימלי רק אם נדרש להתקנה.
**החלטה:** Manifest ב-`public/manifest.webmanifest` עם נתיבים יחסיים (`./`), אייקונים ב-`public/icons/`, ו-`apple-touch-icon` ל-iOS. אין Service Worker, כי כרום מאפשר התקנה עם Manifest, HTTPS ואייקונים בלבד, וב-iOS ההתקנה היא "הוסף למסך הבית".
**השלכות:** אין מצב Offline. אם בדיקה במכשיר תראה שדפדפן יעד לא מציע התקנה, יתווסף Service Worker מסוג NetworkOnly בלבד.
