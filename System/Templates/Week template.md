<%*
const match = /^(\d{4})-W(\d{2})$/.exec(tp.file.title);
const start = match
  ? window.moment().isoWeekYear(Number(match[1])).isoWeek(Number(match[2])).startOf('isoWeek')
  : window.moment().startOf('isoWeek');
const wk = `${start.isoWeekYear()}-W${String(start.isoWeek()).padStart(2, '0')}`;
if (tp.file.title !== wk) { try { await tp.file.rename(wk); } catch (_) {} }
const first = start.format('YYYY-MM-DD');
const last = start.clone().add(6, 'days').format('YYYY-MM-DD');
const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
tR += `---
type: week
cssclasses: [space-note]
tags: [week]
rus_score:
math_score:
inf_score:
---
# Неделя ${String(start.isoWeek()).padStart(2, '0')} / ${first} — ${last}

[[Dashboard|← SPACE]]

> [!focus] Главное на неделю
> Один результат, который сделает эту неделю полезной.

## Ритм недели

`;
tR += '\x60\x60\x60dataview\n';
tR += `TABLE work_time AS "Код, ч", ege_time AS "Учёба, ч", english_done AS "English"
FROM "02_Log/Days"
WHERE file.name >= "${first}" AND file.name <= "${last}"
SORT file.name ASC
`;
tR += '\x60\x60\x60\n\n## План по дням\n\n';
for (let i = 0; i < 7; i++) {
  tR += `#### ${days[i]} — ${start.clone().add(i, 'days').format('YYYY-MM-DD')}\n\n`;
}
tR += `## Итоги
- **Получилось:**
- **Изменить на следующей неделе:**
`;
%>
