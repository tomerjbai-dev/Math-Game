# תוכנית — M4: שמירה מקומית ומסך אודות מלא

**מקורות:** `MILESTONES.md` (M4), `PRD.md` (FR-01, FR-04, FR-05, Edge Cases), `ARCHITECTURE.md` (2.3, 2.4, 2.5, 2.6, 2.10), `DESIGN.md` (1.3), Wireframe "אודות".

## מצב פתיחה (מה כבר קיים בקוד)

- `src/game/gameState.ts` — `GameState = { bestScore, round }`, שכבר תואם ל-`SavedGame` ב-ARCHITECTURE 2.3 (חסר רק `schemaVersion`). ה-Reducer כבר מעדכן את השיא בכל תשובה נכונה ושומר עליו ב-`newRound`.
- `src/game/GameContext.tsx` — `GameProvider` עם `useReducer`, מקבל `initialState` אופציונלי (משמש בבדיקות). אין שמירה.
- `src/screens/AboutScreen.tsx` — מבנה בסיסי מ-M1: מדדים עם "—", פסקת הסבר, וכותרת "טבלת הכפל" עם הודעות "יתווסף בשלב הבא".
- אין שום שימוש ב-`localStorage`.

## גישה כללית

1. Module חדש וטהור `storage.ts` אחראי על קריאה, אימות וכתיבה של `SavedGame` — בלי React.
2. `GameProvider` טוען את המצב השמור בעת האתחול, ושומר אחרי כל שינוי מצב (`useEffect` על `state`) — כלומר תמיד לפי המצב המחושב של ה-Reducer, בלי `beforeunload`.
3. ה-Context חושף גם `storageAvailable`; כשהוא `false` מוצגת הודעת האזהרה מה-PRD.
4. מסך אודות קורא `score` ו-`bestScore` מה-Context ומציג טבלת כפל מלאה כרכיב נפרד.

אין תלויות npm חדשות, אין שינוי ב-Reducer ואין שינוי במסך התרגול.

## קבצים ליצירה / שינוי

### 1. `src/game/storage.ts` (חדש)

```ts
export const STORAGE_KEY = 'multiplication-champions:v1'
export const SCHEMA_VERSION = 1

export interface SavedGame extends GameState { schemaVersion: 1 }

// window.localStorage itself can throw (blocked cookies / some private modes)
export function getStorage(): Storage | null

export function parseSavedGame(raw: string | null): GameState | null
export function loadGame(storage: Storage | null): GameState | null
export function saveGame(storage: Storage | null, state: GameState): boolean
```

- **`getStorage`** — מחזיר `window.localStorage` בתוך `try/catch`; `null` אם הגישה זורקת שגיאה.
- **`loadGame`** — `getItem` בתוך `try/catch`, ואז `parseSavedGame`. כל כשל ← `null`.
- **`parseSavedGame`** — `JSON.parse` בתוך `try/catch`, ואז אימות מלא. מחזיר `GameState` (בלי `schemaVersion`) או `null`. תנאי תקינות:
  - אובייקט עם `schemaVersion === 1` (גרסה אחרת/עתידית ← לא תקין).
  - `bestScore` מספר שלם 0–45.
  - `round.status` אחד מ-`'playing' | 'lost' | 'won'`.
  - `round.order` מערך באורך 45; כל רשומה מחרוזת בפורמט `"a-b"` עם שלמים 2–10; המזהים הקנוניים (`canonicalId`) ייחודיים ← כלומר כל 45 הזוגות קיימים בדיוק פעם אחת.
  - `round.index` ו-`round.score` שלמים 0–45, ו-`score === index` (ARCHITECTURE 2.3).
  - `round.mistakesOnCurrent` הוא 0 או 1.
  - עקביות סטטוס: `won` ⇔ `index === 45`; `playing`/`lost` ⇒ `index < 45`; ב-`won` ‏`mistakesOnCurrent === 0`.
  - `bestScore >= score` (השיא מתעדכן בכל תשובה נכונה, ולכן אינו יכול להיות נמוך מהניקוד).
- **`saveGame`** — `setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: 1, ...state }))` בתוך `try/catch`; מחזיר `true` בהצלחה, `false` אם האחסון חסר או זרק שגיאה (חסום, מכסה מלאה).

נתונים פגומים: `loadGame` מחזיר `null`, נוצר סבב חדש תקין עם שיא 0, והוא נשמר במקום הנתונים הפגומים. כך הנתונים הישנים נקראים ונבדקים לפני שהם מוחלפים (ARCHITECTURE 2.3), ואין קריסה.

### 2. `src/game/GameContext.tsx` (שינוי)

- `GameContextValue` מקבל שדה חדש `storageAvailable: boolean`.
- `GameProvider`:
  - `const storage = useMemo(getStorage)` (פעם אחת).
  - אתחול ה-Reducer: `initialState ?? loadGame(storage) ?? createInitialState()`.
  - `useEffect(() => { setStorageAvailable(saveGame(storage, state)) }, [state])` — שומר אחרי כל שינוי, כולל השמירה הראשונה של סבב חדש (כדי שסדר התרגילים יישמר כבר מההתחלה). אם השמירה נכשלת, הסימון עובר ל-`false` והאזהרה מופיעה; התרגול ממשיך בזיכרון.
  - `storageAvailable` מתחיל כ-`storage !== null`, ומתעדכן לפי תוצאת כל שמירה.
- שימוש ב-`initialState` בבדיקות ממשיך לעבוד; גם במקרה הזה מתבצעת שמירה.

### 3. `src/components/StorageNotice.tsx` + `.module.css` (חדש)

- מוצג רק כש-`storageAvailable === false`.
- טקסט מדויק מה-PRD: **"שימו לב: לא ניתן לשמור את ההתקדמות במכשיר הזה"**.
- `role="status"`, בסגנון הודעת המידע הניטרלית שכבר קיימת בתרגול (רקע Surface, מסגרת Border, טקסט 14px), פינות מעוגלות.
- **מיקום (החלטה שלא מוגדרת ב-DESIGN):** פס הודעה קטן בראש אזור התוכן, מעל המסך הפעיל, כך שהוא נראה בכל שלושת המסכים. אינו מסתיר תוכן ואינו ניתן לסגירה. — **לאישורך**, ראה "נקודות פתוחות".

### 4. `src/App.tsx` (שינוי)

- הוספת `<StorageNotice />` בתוך `<main>` לפני המסך הפעיל. ללא שינוי אחר; ברירת המחדל בפתיחה נשארת מסך הבית (ARCHITECTURE 2.5).

### 5. `src/components/MultiplicationTable.tsx` + `.module.css` (חדש)

- `<table>` אמיתית, 11×11 תאים: שורת כותרת עליונה עם 1–10, עמודת כותרת עם 1–10, ותא פינה עם `×`.
- כותרות כ-`<th scope="col">` / `<th scope="row">`, מודגשות על רקע Surface (DESIGN 1.3); תאי הערכים `<td>` עם `row × column`, על רקע לבן/נייר.
- הטבלה נשארת בכיוון RTL של האפליקציה (עמודת הכותרת מימין, 1 בצד ימין של שורת הכותרת), כמקובל בחומרי לימוד בעברית; הספרות עצמן אינן מתהפכות.
- `aria-label="טבלת הכפל"` לנגישות.
- **התאמה לרוחב 360px ללא גלילה אופקית:** רוחב תוכן זמין ≈ 328px ⇒ כ-29px לתא.
  - `width: 100%`, `table-layout: fixed`, `border-collapse: collapse`.
  - `font-size: var(--font-caption)` (14px; "100" נכנס בתא), `padding: 0`, גובה תא כ-32px, `text-align: center`, גבול דק `var(--color-border)`.
  - מסגרת חיצונית מעוגלת דרך עטיפה עם `overflow: hidden` ו-`border-radius`.
- ממוקמת מתחת לכותרת "טבלת הכפל" במסך אודות.

### 6. `src/screens/AboutScreen.tsx` + `.module.css` (שינוי)

- `useGame()` ← `state.round.score` ו-`state.bestScore`.
- כל מדד בפורמט של ה-Wireframe: מספר גדול ואחריו "מתוך 45", למשל `<span className={styles.statNumber}>12</span> מתוך 45` (אותו מבנה כמו תג הניקוד בתרגול).
- "הניקוד הנוכחי" = ניקוד הסבב הנוכחי (גם במצב פסילה/ניצחון — הניקוד הסופי של הסבב, עד שמתחיל סבב חדש).
- הסרת שתי הודעות "בשלב הבא של הפיתוח" ושל סגנון `.pending`; הוספת `<MultiplicationTable />`.
- סגנון המספר: Bold, גדול (`--font-h1`), בצבע הטקסט העיקרי במקום האפור של ה-placeholder.
- סדר המסך לפי DESIGN 1.3 וה-Wireframe: כותרת ← כרטיס מדדים ← פסקת הסבר ← "טבלת הכפל" ← טבלה. העמוד גולל אנכית.

### 7. ניקיון קטן

- `src/game/gameState.ts` — עדכון ההערה "(persistence arrives in M4)" כך שתפנה ל-`storage.ts`.
- `src/screens/PracticeScreen.test.tsx` — עדכון ההערה של `BestScoreProbe` ("has no UI until M4"); ה-Probe עצמו נשאר.

### 8. `src/test/setup.ts` (שינוי)

- `localStorage.clear()` ב-`beforeEach`, ו-`vi.restoreAllMocks()` ב-`afterEach`, כדי שבדיקות לא ישפיעו זו על זו דרך האחסון (בדיקות `App` עכשיו טוענות מהאחסון).

## בדיקות אוטומטיות

### `src/game/storage.test.ts` (חדש)
- שמירה וטעינה חוזרת מחזירות מצב זהה (סבב באמצע, אחרי טעות ראשונה, `lost`, `won`).
- `loadGame` מחזיר `null` עבור: אין ערך; JSON שבור; `schemaVersion` חסר או 2; `order` באורך שגוי; מזהה כפול (`"3-7"` ו-`"7-3"`); גורם 1 או 11; `index` שלילי/מעל 45; `score !== index`; `mistakesOnCurrent = 2`; `status` לא מוכר; `won` עם `index < 45`; `playing` עם `index = 45`; `bestScore < score`.
- `getItem` שזורק ← `null`, בלי חריגה.
- `saveGame` מחזיר `false` כש-`setItem` זורק או כשה-Storage הוא `null`; `true` בהצלחה, והערך כולל `schemaVersion: 1` תחת `STORAGE_KEY`.

### `src/App.test.tsx` (הרחבה) — סימולציית Reload = `unmount()` ואז `render(<App />)` מחדש
- אחרי פתרון כמה תרגילים ← Reload ← אותו תרגיל (כולל סדר הגורמים), אותו ניקוד.
- אחרי טעות ראשונה ← Reload ← טעות אחת נוספת מסיימת את הסבב ("הסבב הסתיים").
- Reload בזמן הודעת ההצלחה ← מוצג התרגיל הבא, הניקוד לא גדל פעמיים.
- מצב פסילה נשמר אחרי Reload (נכנסים לתרגול ורואים "הסבב הסתיים").
- שיא אישי: שבירת שיא ← "התחל מחדש" ← Reload ← מסך אודות מציג את השיא הקודם וניקוד 0.
- נתונים פגומים מראש ב-`localStorage` ← האפליקציה עולה, סבב חדש בניקוד 0, אין אזהרה.
- `setItem` חסום (`vi.spyOn(Storage.prototype, 'setItem')` שזורק) ← האפליקציה עולה, מוצגת ההודעה "שימו לב: לא ניתן לשמור את ההתקדמות במכשיר הזה", ותרגול עובד (תשובה נכונה מוסיפה נקודה).
- גישה ל-`window.localStorage` שזורקת ← אותה התנהגות.

### `src/screens/AboutScreen.test.tsx` (חדש)
- עם `initialState` של ניקוד 12 ושיא 30 ← "הניקוד הנוכחי" 12 מתוך 45, "השיא האישי" 30 מתוך 45.
- טבלה: 10 כותרות עמודה ו-10 כותרות שורה (1–10), 100 תאי ערכים, ובכל תא `row × column` (בדיקה מלאה בלולאה).
- הודעות "בשלב הבא של הפיתוח" אינן מופיעות.

הבדיקות הקיימות של M2/M3 חייבות להמשיך לעבור ללא שינוי בהתנהגות.

## אימות ידני (בזמן הבנייה, בדפדפן המובנה)

1. `npm run dev`, לפתור 3 תרגילים, לטעות פעם אחת ← רענון ← אותו תרגיל, ניקוד 3, וטעות נוספת מסיימת את הסבב.
2. בדיקת המפתח `multiplication-champions:v1` ב-`localStorage` ושהוא מכיל `schemaVersion: 1`.
3. כתיבת ערך פגום למפתח ← רענון ← אין קריסה, סבב חדש.
4. מסך אודות ברוחב 360px: `document.documentElement.scrollWidth <= 360` (אין גלילה אופקית), הטבלה קריאה, צילום מסך.
5. `npm test -- --run` ו-`npm run build` עוברים.

## ADR לתיעוד ב-ARCHITECTURE.md בזמן הבנייה

**ADR-2: טעינה, אימות ושמירה של `localStorage`** — אימות מלא בעת טעינה ואתחול מלא (כולל שיא) כשהנתונים לא תקינים; שמירה ב-`useEffect` אחרי כל שינוי מצב; `storageAvailable` מתעדכן לפי הצלחת כל שמירה ומפעיל את הודעת האזהרה.

## מיפוי ל-Definition of Done

| תנאי | איך מכוסה |
|---|---|
| רענון/סגירה משחזרים ניקוד, תרגיל, תרגילים שנפתרו וניסיונות | `storage.ts` + `GameProvider`; בדיקות Reload ב-`App.test.tsx`; אימות ידני 1 |
| שחזור אחרי טעות ראשונה מאפשר רק ניסיון אחד | `mistakesOnCurrent` נשמר; בדיקת Reload ייעודית |
| השיא מתעדכן ונשמר אחרי התחלה מחדש ופתיחה חוזרת | Reducer קיים + שמירה; בדיקת שיא ב-`App.test.tsx` |
| אודות מציג ניקוד ושיא נכונים וטבלת 10×10 עם כותרות | `AboutScreen` + `MultiplicationTable`; `AboutScreen.test.tsx`; אימות ידני 4 |
| אחסון חסר/פגום/חסום לא מקריס; משוב כשהשמירה לא זמינה | אימות ב-`parseSavedGame`, `try/catch`, `StorageNotice`; בדיקות ייעודיות; אימות ידני 3 |
| אין חשבון, ענן, Database או API | רק `localStorage`; אין תלויות חדשות |

## נקודות פתוחות לאישורך

1. **מיקום הודעת "לא ניתן לשמור"** — ה-PRD קובע את הטקסט, אבל DESIGN לא מגדיר איפה היא מופיעה. ההצעה: פס הודעה קטן וקבוע בראש המסך, בכל שלושת המסכים.
2. **נתונים פגומים** — ההצעה: מתחילים מאפס לגמרי (גם השיא). חלופה מורכבת יותר: לנסות להציל רק את השיא כשהוא לבדו תקין. ההמלצה היא האפשרות הפשוטה, כי זה מקרה נדיר.
