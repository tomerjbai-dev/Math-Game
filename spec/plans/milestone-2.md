# תוכנית — M2: תרגול כפל עובד

**מקורות:** `MILESTONES.md` (M2), `PRD.md` (זרימת תרגול, FR-02, FR-03, Edge Cases), `DESIGN.md` (1.2, 2.1, 2.3), `ARCHITECTURE.md` (1, 2.2–2.4, 2.6, 2.10, ADR-1).
**מצב נוכחי:** M1 אושר. קיימים שלושת המסכים, `App.tsx` מנהל `activeScreen` ב-`useState`, ו-`PracticeScreen.tsx` הוא מבנה סטטי עם שדה וכפתורים מושבתים והודעת "התרגול ייפתח בשלב הבא". אין עדיין בדיקות אוטומטיות.

## 1. מטרה ותחום

להפוך את מסך התרגול לפעיל: תרגיל אקראי מתוך 55, הזנת תשובה, בדיקה, משוב, ניסיון שני ופסילה — עם מצב סבב משותף (Context + `useReducer`) שאינו מתאפס במעבר בין מסכים, ובדיקות Vitest + React Testing Library.

**בתחום:**
- מאגר 55 הזוגות הקנוניים, ערבוב הסבב וסדר גורמים אקראי לתצוגה (ADR-1).
- Reducer יחיד לחוקי המשחק במבנה ה-`SavedGame.round` + `bestScore` מ-ARCHITECTURE 2.3 (בלי שמירה ל-Storage).
- הזנת תשובה, Validation, הודעות משוב, השהיית 1.5 שניות ומעבר אוטומטי.
- טעות ראשונה / שנייה; מצב סיום **בסיסי** בתוך מסך התרגול.
- הגנה מפני בדיקה כפולה (לחיצות מהירות / Enter חוזר).
- תשתית בדיקות ובדיקות לכל מקרי הליבה.

**מחוץ לתחום (Milestones הבאים):**
- M3: עיצוב מלא של מצבי הפסילה והניצחון, כפתורים **"נסו שוב!"** / **"התחל סבב חדש"** / **"חזרה לבית"**, כפתור **"התחל מחדש"** וחלונית האישור, בדיקות ניקוד ושיא.
- M4: `localStorage`, שחזור, ונתוני מסך אודות.
- M5: ליטוש עיצובי סופי.

> **הערה:** ה-Reducer כבר יחזיק `score` ו-`bestScore` (הם חלק ממודל הנתונים, ו-`score === index`), ולכן תג הניקוד במסך התרגול יציג את המספר האמיתי במקום `0` הקבוע. בדיקות הניקוד והשיא עצמן שייכות ל-M3. ב-M2 אין עדיין דרך להתחיל סבב חדש מתוך הממשק אחרי פסילה — **רענון הדף** יוצר סבב חדש (אין עדיין שמירה).

## 2. תלויות והגדרות

**Dev dependencies חדשות:** `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom` (גרסאות יציבות עדכניות, ננעלות ב-`package-lock.json`).

**`package.json` — Script חדש:** `"test": "vitest"` (כך ש-`npm test -- --run` מ-ARCHITECTURE 2.9 יעבוד ב-CI ב-M5).

**`vite.config.ts`:** להוסיף בלוק `test` (ייבוא `defineConfig` מ-`vitest/config`): `environment: 'jsdom'`, `setupFiles: ['./src/test/setup.ts']`. בלי `globals` — הבדיקות מייבאות `describe/it/expect` מ-`vitest` במפורש.

**`src/test/setup.ts`:** `import '@testing-library/jest-dom/vitest'` + `cleanup` אחרי כל בדיקה.

**TypeScript:** לוודא ש-`tsc -b` עובר גם על קובצי הבדיקה; אם טיפוסי jest-dom לא נטענים מהייבוא ב-setup, להוסיף אותם ל-`types` ב-`tsconfig.app.json`.

**`CLAUDE.md` — פקודות הרצה:** לעדכן את שורת הבדיקות ל-`npm test` (ו-`npm test -- --run` להרצה חד-פעמית).

## 3. קבצים ליצירה ולשינוי

```text
src/
  game/
    exercises.ts          — NEW: catalog of 55 canonical pairs, id helpers
    random.ts             — NEW: crypto-based randomInt + Fisher–Yates shuffle
    gameState.ts          — NEW: types, createRound/createInitialState, reducer, selectors
    answer.ts             — NEW: parseAnswer(text) → number | null (1..100)
    GameContext.tsx       — NEW: GameProvider + useGame() hook
    exercises.test.ts     — NEW
    random.test.ts        — NEW
    gameState.test.ts     — NEW
    answer.test.ts        — NEW
  screens/
    PracticeScreen.tsx         — REWRITE: live practice UI
    PracticeScreen.module.css  — UPDATE: enabled input, feedback message styles, basic end state
    PracticeScreen.test.tsx    — NEW
  App.tsx                 — UPDATE: wrap shell with GameProvider
  App.test.tsx            — NEW: navigation keeps the round
  test/setup.ts           — NEW
vite.config.ts            — UPDATE: test block
package.json              — UPDATE: devDependencies + test script
CLAUDE.md                 — UPDATE: test command only
```

`HomeScreen`, `AboutScreen`, `BottomNav` ו-`types.ts` לא משתנים.

## 4. מבנה הלוגיקה

### 4.1 `exercises.ts` — מאגר התרגילים
- `type ExerciseId = string` (קנוני `"a-b"`, `a ≤ b`), `type DisplayPair = string` (סדר תצוגה, למשל `"7-3"`).
- `ALL_EXERCISE_IDS`: כל `1 ≤ a ≤ b ≤ 10` → בדיוק 55 מזהים.
- `parsePair(pair) → [number, number]`, `canonicalId(pair) → ExerciseId` (מיון שני המספרים), `product(pair) → number`.
- `TOTAL_EXERCISES = 55` כקבוע אחד שישמש גם בתצוגה ("מתוך 55").

### 4.2 `random.ts` — אקראיות
- `type RandomInt = (maxExclusive: number) => number`.
- `cryptoRandomInt`: מבוסס `crypto.getRandomValues` עם Rejection sampling כדי למנוע הטיה (ARCHITECTURE 2.3).
- `shuffle<T>(items, randomInt)`: Fisher–Yates, מחזיר מערך חדש.
- הפונקציות מקבלות `randomInt` כפרמטר, כך שבבדיקות אפשר להזריק מקור דטרמיניסטי.

### 4.3 `gameState.ts` — מצב וחוקים
טיפוסים לפי ARCHITECTURE 2.3 (כבר עכשיו, כדי ש-M4 רק יוסיף שמירה):

```ts
type RoundStatus = 'playing' | 'lost' | 'won'
interface Round {
  status: RoundStatus
  order: DisplayPair[]      // 55 entries, display order chosen per exercise
  index: number             // 0..55
  mistakesOnCurrent: 0 | 1
  score: number             // 0..55, equals index
}
interface GameState { bestScore: number; round: Round }
```

- `createRound(randomInt)`: ערבוב `ALL_EXERCISE_IDS`, ולכל זוג הגרלה (50/50) אם להציג `a-b` או `b-a` → `order`. שאר השדות 0 / `'playing'`.
- `createInitialState(randomInt = cryptoRandomInt)`: `{ bestScore: 0, round: createRound(...) }`.
- `currentPair(state)`: `order[index]` כשה-`status === 'playing'`, אחרת `null`.
- **Action יחיד ב-M2:** `{ type: 'answer', value: number }` (הערך כבר עבר Validation).
- **Reducer:**
  - אם `status !== 'playing'` → מחזיר את אותו state (בדיקה מתאפשרת רק ב-`playing`).
  - נכון → `score+1`, `index+1`, `mistakesOnCurrent=0`, `bestScore = max(bestScore, score)`; אם `score === 55` → `status='won'`.
  - שגוי ו-`mistakesOnCurrent === 0` → `mistakesOnCurrent=1`, אותו תרגיל.
  - שגוי ו-`mistakesOnCurrent === 1` → `status='lost'`, בלי לקדם `index`.
- ה-Reducer טהור (בלי אקראיות ובלי טיימרים); לכן ההגרלה נעשית רק ב-`createRound`. Action של סבב חדש יתווסף ב-M3.

**איך "לא חוזר תרגיל שנפתר":** `order` הוא פרמוטציה של 55 מזהים קנוניים ייחודיים, וההתקדמות היא קידום `index` — לכן תרגיל שנפתר לא יכול לחזור, ו-`5×4` ו-`2×10` נשארים שני פריטים נפרדים.

### 4.4 `answer.ts` — Validation
- `parseAnswer(text)`: חיתוך רווחים; רק ספרות (`/^\d+$/`, כדי לדחות `"3.5"`, `"-4"`, `"1e2"`, ריק); המרה למספר; תקין רק בטווח 1–100. אחרת `null`.
- ספרות שאינן לטיניות (למשל ערביות-הודיות ממקלדת מסוימת) — לא נתמכות במפורש ב-PRD; יחשבו כלא תקינות. (אם תרצה תמיכה בהן — זו החלטה נפרדת.)

### 4.5 `GameContext.tsx`
- `GameProvider`: `useReducer(gameReducer, undefined, () => createInitialState())` — מצב אחד לכל האפליקציה.
- `useGame()` מחזיר `{ state, dispatch }` וזורק שגיאה ברורה אם נקרא מחוץ ל-Provider.
- `App.tsx` עוטף את ה-shell ב-`GameProvider`. מכיוון שה-Provider נמצא **מעל** מתג המסכים, מעבר לבית/אודות וחזרה לא מאפס את הסבב.

## 5. מסך התרגול (`PracticeScreen.tsx`)

**מבנה (לפי DESIGN 1.2, מלמעלה למטה):** תג ניקוד "`n` מתוך 55" ← כרטיס תרגיל `a × b = ?` (`dir="ltr"`) ← שדה תשובה ← הודעת משוב ← כפתור **"בדוק תשובה"** ← כפתור **"התחל מחדש"** (נשאר מושבת עד M3). הודעת "התרגול ייפתח בשלב הבא" נמחקת.

**טופס:** שדה + כפתור בתוך `<form onSubmit>` — כך Enter מבצע בדיקה (DESIGN 1.2). שדה `type="text"`, `inputMode="numeric"`, `pattern="[0-9]*"`, `autoComplete="off"`, `dir="ltr"`, תווית נגישה "התשובה שלך". הכפתור תמיד לחיץ (גם כשהשדה ריק).

**UI state זמני (מקומי ל-מסך, לא בחלק מה-Reducer):** טקסט השדה, הודעת המשוב, ודגל "בתהליך מעבר" + התרגיל שמוצג בזמן הודעת ההצלחה.

**זרימת לחיצה על "בדוק תשובה":**
1. אם בתהליך מעבר → מתעלמים (הגנה מבדיקה כפולה, גם ב-Enter).
2. `parseAnswer` מחזיר `null` → הודעה ניטרלית **"נא להקליד מספר בין 1 ל-100"**; בלי `dispatch`, בלי צריכת ניסיון.
3. מחשבים מראש אם התשובה נכונה מול `product(currentPair)`, ואז `dispatch({ type: 'answer', value })`.
4. **נכון:** שומרים את התרגיל הנוכחי כ"מוצג", מציגים **"כל הכבוד! תשובה נכונה"** (ירוק, ✓), מנקים ומשביתים שדה וכפתור. אחרי `FEEDBACK_DELAY_MS = 1500` (קבוע אחד בקוד) → מנקים הודעה ומשחררים; מוצג התרגיל הבא מה-state, ופוקוס חוזר לשדה.
   - הסיבה לשמירת התרגיל המוצג: ה-Reducer כבר קידם את `index` מיד (עדכון אטומי לפי ARCHITECTURE 2.4), אבל בזמן ההודעה המשתמש צריך להמשיך לראות את התרגיל שפתר.
5. **טעות ראשונה:** הודעה **"לא נורא! יש לך עוד ניסיון אחד"** (אדום, ×), השדה מתנקה, אותו תרגיל, פוקוס נשאר בשדה.
6. **טעות שנייה:** ה-state עובר ל-`lost` → מוצג מצב סיום בסיסי.

**טיימר:** `setTimeout` עם ניקוי ב-cleanup של `useEffect`. אם עוזבים את המסך בזמן ההודעה — הטיימר מתבטל, ובחזרה מוצג ישר התרגיל הבא (לפי ה-state), בלי נקודה נוספת.

**הודעות משוב:** אזור אחד עם `aria-live="polite"` (`role="status"`), בין השדה לכפתור. שלושה גוונים לפי DESIGN 1.2/2.1: הצלחה — רקע ירוק בהיר + טקסט `--color-success-text`; טעות — רקע אדום בהיר + `--color-error-text`; קלט לא תקין — גוון ניטרלי/Info. הסמלים ✓ / × דקורטיביים (`aria-hidden`).

**מצב סיום בסיסי (בתוך מסך התרגול, לא יעד ניווט):**
- `lost`: כותרת **"הסבב הסתיים"** ותג הניקוד; שדה התשובה וכפתור "התחל מחדש" לא מוצגים (DESIGN 1.2).
- `won` (55 נכונות): כותרת **"כל הכבוד!"** וניקוד 55 מתוך 55 — אותו מבנה בסיסי, בלי לנסות לבחור תרגיל 56.
- עיצוב מלא, אייקונים, שורות ההסבר והכפתורים — ב-M3.
- במעבר ל-`won`: הודעת ההצלחה מוצגת 1.5 שניות ואז מופיע מצב הניצחון. במעבר ל-`lost`: מצב הסיום מוצג מיד.

**CSS (`PracticeScreen.module.css`):** שדה פעיל (לבן, מסגרת אפורה, Focus כחול לפי DESIGN 2.3), מצב מושבת בגוון Disabled, סגנונות להודעות, כרטיס סיום בסיסי. הסרת `.notice`. בלי שינוי ב-`global.css` אלא אם חסר משתנה.

## 6. בדיקות אוטומטיות

**`exercises.test.ts`**
- בדיוק 55 מזהים, כולם ייחודיים, כולם `1 ≤ a ≤ b ≤ 10`.
- `canonicalId("7-3") === canonicalId("3-7")`; `canonicalId("5-4") !== canonicalId("2-10")` אף ששניהם 20.

**`random.test.ts`**
- `shuffle` מחזיר פרמוטציה (אותם פריטים, אותו אורך) ולא משנה את המקור.
- `cryptoRandomInt(n)` תמיד בטווח `0..n-1`.

**`answer.test.ts`**
- תקינים: `"1"`, `"42"`, `"100"`, `" 7 "`. לא תקינים: `""`, `"0"`, `"101"`, `"abc"`, `"3.5"`, `"-4"`.

**`gameState.test.ts`**
- `createRound`: `order` באורך 55, המזהים הקנוניים ייחודיים ומכסים את כל המאגר; עם מקור אקראי מוזרק — סדר הגורמים משתנה בין זוגות.
- תשובה נכונה: `index+1`, `score+1`, `mistakesOnCurrent=0`, התרגיל הבא שונה קנונית מכל מה שנפתר.
- פתרון רציף של כל 55 → אין חזרה על מזהה קנוני; ב-55 → `status='won'` ו-`currentPair` הוא `null`.
- טעות ראשונה: אותו `index`, `mistakesOnCurrent=1`.
- טעות שנייה: `status='lost'`, `index` לא זז.
- Action ב-`lost`/`won` לא משנה את ה-state.

**`PracticeScreen.test.tsx`** (RTL + `user-event` + Fake timers; עטוף ב-`GameProvider` עם state התחלתי דטרמיניסטי — ה-Provider יקבל `initialState` אופציונלי לבדיקות)
- תשובה נכונה → הודעת הצלחה, שדה וכפתור מושבתים; אחרי 1.5 שניות מוצג תרגיל אחר בלי לחיצה נוספת, והניקוד עלה.
- לחיצה כפולה מהירה / Enter כפול על תשובה נכונה → רק נקודה אחת.
- טעות ראשונה → אותו תרגיל, שדה ריק, הודעת "לא נורא! יש לך עוד ניסיון אחד".
- טעות שנייה → "הסבב הסתיים", השדה לא מוצג.
- שדה ריק / `0` / `150` / `abc` → הודעת "נא להקליד מספר בין 1 ל-100", ואחריה טעות אחת עדיין משאירה ניסיון (כלומר לא נצרך ניסיון).
- Enter בשדה מפעיל בדיקה.

**`App.test.tsx`**
- טעות ראשונה ← מעבר ל"בית" ← מעבר ל"אודות" ← חזרה ל"תרגול": אותו תרגיל מוצג, וטעות נוספת מסיימת את הסבב (כלומר נשאר בדיוק ניסיון אחד).

## 7. בדיקה ידנית לפני סימון 🟡

1. `npm test -- --run` — כל הבדיקות עוברות; `npm run build` עובר (כולל TypeScript).
2. `npm run dev` ובדיקה בדפדפן (גם ברוחב טלפון 375px): תרגיל מוצג בסדר `a × b = ?` משמאל לימין; תשובה נכונה / טעות / קלט ריק; 1.5 שניות ומעבר; Enter; פסילה; ניווט וחזרה.
3. אין שגיאות Console; אין גלילה אופקית.
4. סגירת שרת הפיתוח בסיום.

## 8. מיפוי ל-Definition of Done

| תנאי | איך מכוסה |
|---|---|
| בדיוק 55 זוגות ייחודיים; החלפת סדר אינה יוצרת כפילות | `exercises.test.ts`, `gameState.test.ts` |
| אין חזרה על תרגיל שנפתר; תוצאה זהה עם גורמים שונים — נפרדים | `order` כפרמוטציה + `gameState.test.ts` (55 פתרונות רצופים) |
| תשובה נכונה → הודעה ומעבר אוטומטי | `PracticeScreen.tsx` (טיימר 1.5 ש') + `PracticeScreen.test.tsx` |
| טעות ראשונה: אותו תרגיל, שדה ריק, הודעת ניסיון נוסף | Reducer + UI + בדיקות |
| טעות שנייה מסיימת; קלט ריק/לא תקין לא צורך ניסיון | Reducer + `answer.ts` + בדיקות |
| ניווט וחזרה שומרים תרגיל וניסיון | `GameProvider` מעל מתג המסכים + `App.test.tsx` |
| בדיקות Vitest + RTL מכסות את הליבה | סעיף 6 |
