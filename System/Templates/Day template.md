<%*
let title = tp.file.title;
if (title.includes("Untitled") || title.includes("Без названия") || title.includes("Новая заметка")) {
    title = window.moment().format("YYYY-MM-DD");
    try { await tp.file.rename(title); } catch(e) {}
}

const noteDate = window.moment(title, "YYYY-MM-DD");
const wn = noteDate.isoWeek();
const year = noteDate.isoWeekYear();
const weekFileName = `${year}-W${wn < 10 ? '0' + wn : wn}`;

const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const dayName = dayNames[noteDate.day()]; 
const headingName = `${dayName} — ${title}`;
-%>
---
type: day
tags:
  - day
week: "[[<% weekFileName %>]]"
work_time: 0
ege_time: 0
gym_weight: 0
english_done: false
cns_status: ok
---
# 🗓 <% dayName %>, <% title %>
> *[[System/Agents/Swarm Protocols|🗡️ Протоколы Мусаси]] • [[System/Agents/Active Context|Оперативный журнал Swarm]]*

### 🎯 Главный фокус дня (Топ-3)
- [ ] 
- [ ] 
- [ ] 

### 📅 План из недели:
![[<% weekFileName %>#<% headingName %>]]

### 💪 База & Здоровье
- [ ] Тренировка / Зал
- [ ] Креатин / Протеин
- [ ] Английский (English Hub)

---

### ⚡ Лог спринтов (CLI: track)
<!-- Сюда через утилиту track пишутся завершенные спринты -->

---

### 🌙 Вечерний чекаут (30 сек)
- **Главный результат дня (EV)**: 
- **Ловушка (гиммики / потеря фокуса)**: 
- [ ] Отбой по графику (восстановление ЦНС)