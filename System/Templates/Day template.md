<%*
let key = tp.file.title;
if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) {
    key = window.moment().format("YYYY-MM-DD");
    try { await tp.file.rename(key); } catch (_) {}
}
const d = window.moment(key, "YYYY-MM-DD", true);
const dow = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"][d.day()];
const wk = `${d.isoWeekYear()}-W${String(d.isoWeek()).padStart(2, "0")}`;
tR += `---
type: day
cssclasses: [space-note]
tags: [day]
week: "[[02_Log/Week/${wk}]]"
work_time: 0
ege_time: 0
gym_weight: 0
english_done: false
cns_status: ok
---
# ${dow} / ${key}

[[Dashboard|← SPACE]] · [[02_Log/Week/${wk}|План недели]]

## План из недели
![[02_Log/Week/${wk}#${dow} — ${key}]]

### 🎯 Оперативные задачи

## Заметки

## Вечерний чекаут · 30 секунд
- **Главный результат:**
- **Что мешало:**
- **Первый шаг завтра:**
`;
%>
