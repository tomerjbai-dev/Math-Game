# תוכנית — M1: שלד אפליקציה וניווט

**מקורות:** `MILESTONES.md` (M1), `PRD.md` (FR-01, זרימת ניווט), `DESIGN.md` (סעיפים 1, 2), `ARCHITECTURE.md` (סעיפים 1, 2.2, 2.6, 2.9).
**מצב נוכחי:** בפרויקט אין עדיין קוד; קיימים רק `CLAUDE.md`, `.gitignore`, `spec/` ו-Git מחובר ל-GitHub.

## 1. מטרה ותחום

להקים אפליקציית React + TypeScript + Vite שרצה מקומית, עם שלושה מסכים (בית, תרגול, אודות) וסרגל ניווט תחתון, בעברית וב-RTL, בעיצוב בסיסי לפי ה-Style Guide.

**בתחום:** שלד הפרויקט, משתני עיצוב (צבעים, גופן, ריווח), מסך בית מלא, מבנה סטטי של תרגול ואודות, סרגל ניווט.
**מחוץ לתחום (Milestones הבאים):** חוקי משחק, ניקוד, Context/Reducer, בדיקות Vitest (M2–M3); `localStorage` וטבלת הכפל (M4); Manifest, אייקוני PWA, GitHub Actions וליטוש עיצובי מלא (M5).

## 2. התקנה והגדרות

הספרייה אינה ריקה, ולכן **לא** מריצים `npm create vite` בתוכה; יוצרים את קובצי ההגדרה ידנית לפי תבנית `react-ts` הרשמית של Vite.

**תלויות (גרסאות יציבות עדכניות, ננעלות ב-`package-lock.json`):**
- Runtime: `react`, `react-dom`, `@fontsource/fredoka`
- Dev: `vite`, `@vitejs/plugin-react`, `typescript`, `@types/react`, `@types/react-dom`

**Scripts ב-`package.json`:**
- `dev` — `vite`
- `build` — `tsc -b && vite build`
- `typecheck` — `tsc -b`
- `preview` — `vite preview`

**`vite.config.ts`:** Plugin של React, `base: '/Math-Game/'` כבר עכשיו (לפי ARCHITECTURE 2.9), כדי שנתיבי Assets יתנהגו כבר בפיתוח כמו ב-Production. כתובת הפיתוח תהיה `http://localhost:5173/Math-Game/`.

**`.gitignore`:** כבר מכסה `node_modules/` ו-`dist/`; אין צורך בשינוי.

## 3. קבצים ליצירה

```text
index.html
package.json / package-lock.json
tsconfig.json, tsconfig.app.json, tsconfig.node.json
vite.config.ts
src/
  main.tsx                 — React entry, global CSS and font imports
  App.tsx                  — app shell: activeScreen state + screen switch + BottomNav
  App.module.css           — shell layout (scrolling content area + fixed nav)
  vite-env.d.ts            — Vite types (incl. CSS Modules and PNG imports)
  styles/global.css        — reset, CSS variables (colors, radius, spacing), font, body background
  types.ts                 — Screen = 'home' | 'practice' | 'about'
  components/
    BottomNav.tsx / .module.css
    icons.tsx              — inline SVG icons: Home, Times (×), Info
  screens/
    HomeScreen.tsx / .module.css
    PracticeScreen.tsx / .module.css
    AboutScreen.tsx / .module.css
  assets/
    home-illustration.png  — copied from spec/assets/
```

`spec/assets/icon-*.png` אינם נדרשים ב-M1 (יועתקו ל-`public/` ב-M5).

## 4. גישה ומבנה

### 4.1 `index.html`
- `<html lang="he" dir="rtl">`, `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`, `<title>אלופי הכפל</title>`.

### 4.2 עיצוב גלובלי (`global.css`)
- כל צבעי `DESIGN.md` 2.1 כמשתני CSS (כולל Success Text ו-Error Text), ערכי Radius (`8/12/16/24px`) וריווח בסיס `16px`.
- גופן: ייבוא `@fontsource/fredoka` במשקלים 400 ו-700 ב-`main.tsx`; `font-family: 'Fredoka', sans-serif`.
- גדלי טיפוגרפיה H1–Caption לפי DESIGN 2.2.
- `body` ברקע Background; עמודת האפליקציה ברוחב מרבי `480px` במרכז (DESIGN 2.4).
- `box-sizing: border-box`, ללא גלילה אופקית (`overflow-x: hidden` על השורש כרשת ביטחון, אבל הפריסה עצמה לא תחרוג).

### 4.3 App Shell וניווט
- `App.tsx` מחזיק `useState<Screen>('home')` ומציג מסך אחד לפי הערך. אין React Router (ARCHITECTURE 2.2).
- פריסה: אזור תוכן גולל אנכית + `BottomNav` קבוע בתחתית, עם `padding-bottom: env(safe-area-inset-bottom)`. לתוכן יש ריווח תחתון כך שסרגל הניווט לא מסתיר אותו.
- `BottomNav`: שלושה כפתורים מימין לשמאל — **"בית"** (אייקון בית), **"תרגול"** (אייקון ×), **"אודות"** (אייקון i בעיגול). היעד הפעיל בצבע Primary ובמשקל Bold, עם `aria-current="page"`. אזור לחיצה לפחות `48px`.
- כל מסך מקבל פונקציית `onNavigate(screen)` בתור prop לצורך כפתורי קיצור.

### 4.4 מסך בית (מלא כבר ב-M1)
- כותרת H1 **"אלופי הכפל"**, שורת הסבר **"מתרגלים ומשתפרים בלוח הכפל 1–10"**.
- האיור `home-illustration.png` עם `alt` בעברית, ברוחב מוגבל כך שהכפתורים נראים בלי גלילה בטלפון טיפוסי.
- כפתור ראשי (Primary, סגול) **"בואו נתרגל!"** ← מסך תרגול.
- כפתור משני (רקע בהיר, מסגרת) **"אודות"** ← מסך אודות.

### 4.5 מסך תרגול (מבנה בלבד, לא פעיל)
- תג ניקוד **"0 מתוך 55"**, כרטיס תרגיל עם ביטוי לדוגמה בתוך `dir="ltr"` (למשל `? × ? = ?`), שדה תשובה עם `inputMode="numeric"` ותווית נגישה, כפתור **"בדוק תשובה"** וכפתור **"התחל מחדש"**.
- כל הרכיבים מושבתים (`disabled`), ומעליהם הודעה בולטת: **"התרגול ייפתח בשלב הבא של הפיתוח"**, כדי שלא ייראו כפיצ'ר עובד (MILESTONES, כלל 4).

### 4.6 מסך אודות (מבנה בסיסי)
- כותרת **"אודות"**; כרטיס עם **"הניקוד הנוכחי"** ו**"השיא האישי"**, עם ערך זמני "—" והערה שהנתונים יוצגו בהמשך.
- פסקת ההסבר מה-Wireframes: "אלופי הכפל היא אפליקציה לתרגול לוח הכפל 1–10. בכל סבב מופיעים 55 תרגילים ייחודיים. לכל תרגיל יש שתי הזדמנויות. המטרה היא לפתור את כל התרגילים בהצלחה!"
- כותרת **"טבלת הכפל"** עם הערה זמנית שהטבלה תתווסף בהמשך (M4).

### 4.7 עקרונות
- כל טקסטי הממשק בעברית; הערות בקוד באנגלית.
- ביטויים מתמטיים תמיד בתוך אלמנט עם `dir="ltr"` כדי שלא יתהפכו.
- אין קריאות רשת, אין Backend, אין `localStorage` בשלב זה.

## 5. בדיקה עצמית לפני סימון 🟡

1. `npm run typecheck` ו-`npm run build` עוברים ללא שגיאות.
2. `npm run dev`, פתיחה בדפדפן המובנה ברוחב טלפון (375px) ובדיקה:
   - אין שגיאות ב-Console.
   - סרגל הניווט מציג בדיוק בית / תרגול / אודות, מסמן את היעד הפעיל, ומעביר בין המסכים בלי רענון עמוד.
   - **"בואו נתרגל!"** פותח את התרגול; **"אודות"** במסך הבית פותח את אודות.
   - הטקסט מיושר לימין, הביטוי `? × ? = ?` לא מתהפך, והגופן Fredoka מוצג גם בעברית.
   - אין גלילה אופקית (בדיקה ש-`document.documentElement.scrollWidth` אינו גדול מרוחב החלון), וסרגל הניווט לא מסתיר תוכן.
   - בדיקה גם ברוחב מחשב: העמודה ממורכזת ברוחב 480px.
3. סגירת שרת הפיתוח בסיום.
4. עדכון **פקודות הרצה** ב-`CLAUDE.md`: הרצה — `npm run dev`; בדיקות — "אין עדיין (יתווספו ב-M2)".
5. סימון 🟡 ליד כותרת M1 ב-`MILESTONES.md`. ללא commit.

## 6. מיפוי ל-Definition of Done

| תנאי | איך מתקיים |
|---|---|
| `npm run dev` ללא שגיאות; TypeScript ו-Build עוברים | שלב 5.1–5.2 |
| סרגל ניווט בית / תרגול / אודות, יעד פעיל, מעבר | 4.3 + בדיקה 5.2 |
| "בואו נתרגל!" פותח תרגול | 4.4 + בדיקה 5.2 |
| עברית, RTL, ללא גלילה אופקית | 4.1, 4.2, 4.7 + בדיקה 5.2 |
| אין מסכי ניצחון/פסילה נפרדים, אין Backend/Database | `Screen` מכיל רק שלושה ערכים; אין תלויות שרת |
