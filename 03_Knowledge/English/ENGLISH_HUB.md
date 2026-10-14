# 🇬🇧 English B1 // Главный Терминал

```dataviewjs
const bugs = dv.pages('"03_Knowledge/Englich/Error_Tracker"');
const open = bugs.where(b => b.status === "open").length;
const fixed = bugs.where(b => b.status === "fixed").length;
const rules = dv.pages('"03_Knowledge/Englich/Grammar_Engine"').length;
const chunks = dv.pages('"03_Knowledge/Englich/Chunks_Vocabulary"');
const ammo = chunks.where(c => c.status === "active").length;

dv.span(`<span style="font-family: monospace; font-size: 14px;">` +
`<b>ТЕЛЕМЕТРИЯ:</b> Движков: <b>${rules}</b> | ` +
`Активных багов: <b style="color:#EF4444;">${open}</b> | ` +
`Устранено: <b style="color:#10B981;">${fixed}</b> | ` +
`Патронов в обойме: <b style="color:#F59E0B;">${ammo}</b>` +
`</span>`);
```

***

### 🔫 Тактическая обойма (Чанки в активной прокачке)
```dataview
TABLE Триггер as "Мысль в голове", fired as "Выстрелов"
FROM "03_Knowledge/English/Chunks_Vocabulary"
WHERE status = "active"
SORT fired ASC
LIMIT 6
```

### 🛠️ Ремонтный цех (Открытые баги)
```dataview
TABLE Ляпнул, Надо, file.outlinks[0] as "Правило"
FROM "03_Knowledge/English/Error_Tracker"
WHERE status = "open"
```

### 📉 Топ нестабильных модулей (Где ты ошибаешься чаще всего)
```dataview
TABLE length(file.inlinks) as "Связанных багов"
FROM "03_Knowledge/English/Grammar_Engine"
SORT length(file.inlinks) DESC
LIMIT 5
```

***

## 🎯 Боевой протокол: STEM English (20 минут в день)

> **Цель:** Поднять технический и разговорный английский с B1-пассива до уверенного B2 для грантового собеседования и лекций в Иннополисе.  
> **Формат:** 10 минут фокусного просмотра + 5 минут фиксации терминов + 5 минут говорения вслух. Никаких 90-минутных лекций.

```
┌─────────────────────────┬─────────────────────────┬─────────────────────────┐
│   10 МИНУТ: ВХОД        │   5 МИНУТ: ФИКСАЦИЯ     │   5 МИНУТ: ВЫХОД (РЕЧЬ) │
│ Просмотр 1 видео с EN   │ Выписать ровно 3-4      │ 2-3 простых предложения │
│ субтитрами из трека     │ термина в словарь       │ вслух: пересказ или код │
└─────────────────────────┴─────────────────────────┴─────────────────────────┘
```

---

### 📺 Треклист источников (Что конкретно смотреть)

#### Трек А: Математика на английском (Khan Academy & 3Blue1Brown)
*Идеальная связка со Школково: ты уже понимаешь смысл, мозг учит только английские слова.*
1. **Khan Academy // Geometry (Circles & Angles)**:
   - Поиск: `Khan Academy circle properties`, `Khan Academy inscribed angles`, `Khan Academy tangent lines`.
   - *Почему:* Сэл Хан говорит медленно, четко, рисует на черной доске. Идеальный американский акцент, 0 стресса.
   - *Лексика:* `tangent line` (касательная), `chord` (хорда), `inscribed angle` (вписанный угол), `arc` (дуга), `radius / radii` (радиус/радиусы).
2. **3Blue1Brown // Essence of Linear Algebra / Calculus**:
   - Плейлисты: *Essence of Linear Algebra*, *Essence of Calculus*.
   - *Почему:* Лучшая визуализация абстрактных понятий (матрицы, векторы, производные), спокойный темп речи.

#### Трек B: Computer Science & Алгоритмы (Fireship & Computerphile)
*Связка с задачами №26-27 ЕГЭ и контестами Иннополиса.*
1. **Fireship // Серия "In 100 Seconds"**:
   - Ролики: `Go in 100 seconds`, `Big-O Notation in 100 seconds`, `Binary Search in 100 seconds`, `SQL in 100 seconds`, `Docker in 100 seconds`.
   - *Почему:* Коротко, динамично, с юмором, чистый IT-вокабуляр без воды.
2. **Computerphile**:
   - Поиск: `Computerphile Sorting Algorithms`, `Computerphile Binary Trees`, `Computerphile How Garbage Collection Works`.
   - *Почему:* Британские профессора рисуют фломастером на бумаге. Очень наглядно объясняют логику систем.
3. **NeetCode**:
   - Разборы базовых алгоритмов: *Two Pointers*, *Sliding Window*, *Binary Search*.
   - *Почему:* Простой, прикладной разговорный английский разработчика.

#### Трек C: Бэкенд и Инженерия (Hussein Nasser)
*Для собеседования в Иннополисе: уметь говорить про свои проекты.*
1. **Hussein Nasser**:
   - Короткие разборы баз данных, сетевых протоколов (TCP vs UDP, HTTP/2, Indexes).
   - Очень живая, эмоциональная подача, много схем.

---

### 📝 Словарь STEM-патронов дня
<!-- Сюда в 5-минутном блоке пишем 3-4 слова дня: Слово -> Перевод -> Контекст -->
- `tangent line` -> касательная к окружности (*The tangent line is perpendicular to the radius*)
- `chord` -> хорда (*A chord connects two points on a circle*)
- `inscribed angle` -> вписанный угол (*The inscribed angle is half of the central angle*)
- `constraint` -> ограничение (*Check the time and memory constraints of the task*)

---

### 🎙️ 5 минут речи: Алгоритм «Резиновой уточки»
1. Открываешь свой код на Go (LifeHub) или только что решенную задачу по планиметрии.
2. Включаешь таймер на 3-4 минуты.
3. Говоришь **вслух на английском** короткими предложениями:
   - *«Today I studied circles. A tangent line touches the circle at one point. The angle between the radius and the tangent is 90 degrees.»*
   - *«In this Go function, I declare a map to store user sessions. If the key exists, I return the value, otherwise I return an error.»*
4. Запинаешься? Пофиг. Главное — шевелить языком и связывать слова без страха.