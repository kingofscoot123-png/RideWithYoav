# RideWithYoav

דף נחיתה ל"יום הקהילה" — אירוע רכיבה קהילתי עם יואב לוי.

## הרצה מקומית

```bash
npx serve -l 5173
```

פתחו `http://localhost:5173` בדפדפן.

## מבנה

- `index.html` — דף נחיתה RTL בעברית
- `css/styles.css` — עיצוב, glassmorphism, רספונסיבי
- `js/main.js` — אינטראקציות, טופס, fallback לתמונות
- `js/images.js` — מפת URLs מרכזית לכל התמונות (Unsplash)

## תמונות

כל התמונות מוגדרות ב-`js/images.js` ונטענות אוטומטית לפי `data-key` ב-HTML. במקרה של כשל בטעינה, `main.js` מחליף ל-URL גיבוי.
