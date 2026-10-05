```dataviewjs
// 1. Укажи тут точную дату своего экзамена (Год-Месяц-День)
const target = moment("2027-06-01"); 
const daysLeft = target.diff(moment(), 'days');

// 2. Выгребаем все заметки для подсчета часов и тоннажа
const pages = dv.pages().where(p => p.ege_time || p.work_time || p.gym_weight);

let tEge = 0, tWork = 0, tGym = 0;

pages.forEach(p => {
    tEge += Number(p.ege_time) || 0;
    tWork += Number(p.work_time) || 0;
    tGym += Number(p.gym_weight) || 0;
});

// 3. Выгребаем баллы ЕГЭ (из папки 02_Log/Week), сортируем по хронологии
const weekPages = dv.pages('"02_Log/Week"').where(p => p.rus_score || p.math_score || p.inf_score).sort(p => p.file.name, 'asc');

const extractNums = (v) => {
    if (v === null || v === undefined || v === "") return [];
    if (Array.isArray(v)) return v.map(n => Number(n)).filter(n => !isNaN(n));
    if (typeof v === 'string' && v.includes(',')) return v.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
    const n = Number(v);
    return isNaN(n) ? [] : [n];
};

let allRus = [], allMath = [], allInf = [];
weekPages.forEach(p => {
    allRus.push(...extractNums(p.rus_score));
    allMath.push(...extractNums(p.math_score));
    allInf.push(...extractNums(p.inf_score));
});

// Функция расчета среднего балла строго по ПОСЛЕДНИМ 10 пробникам
const getAvgLast10 = (arr) => {
    if (arr.length === 0) return 0;
    const slice = arr.slice(-10); // Берем только последние 10 элементов
    return Math.round(slice.reduce((a, b) => a + b, 0) / slice.length);
};

const totalAvgScore = getAvgLast10(allRus) + getAvgLast10(allMath) + getAvgLast10(allInf);

// Функция очистки кривых дробей JS (чтобы вместо 14.30000001ч выводилось 14.3ч)
const clean = (num) => Number(num.toFixed(1));

const style = document.createElement("style");
style.innerHTML = `
@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');
.nothing-widget {
    font-family: 'Space Mono', monospace;
    font-size: 13px;
    line-height: 1.6;
    background-color: #000;
    color: #fff;
    border: 1px dashed #444;
    border-radius: 12px;
    padding: 18px;
    position: relative;
    overflow: hidden;
    margin: 8px 0;
    box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.02);
}
.nothing-widget::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background-image: radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px);
    background-size: 8px 8px;
    z-index: 0;
    pointer-events: none;
}
.nothing-content {
    position: relative;
    z-index: 1;
}
.nothing-header {
    font-size: 18px;
    font-weight: 700;
    letter-spacing: 2px;
    color: #fff;
    margin-bottom: 16px;
    text-transform: uppercase;
    display: flex;
    align-items: center;
    gap: 12px;
    border-bottom: 1px dashed #444;
    padding-bottom: 12px;
}
.nothing-header::before {
    content: '';
    display: block;
    width: 12px;
    height: 12px;
    background-color: #e50914;
    border-radius: 50%;
    box-shadow: 0 0 10px rgba(229, 9, 20, 0.6);
}
.nothing-stat {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
    padding-bottom: 6px;
    align-items: center;
}
.nothing-stat:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
}
.nothing-label {
    color: rgba(255,255,255,0.6);
    text-transform: uppercase;
    font-size: 11px;
    letter-spacing: 1.5px;
}
.nothing-val {
    font-weight: 700;
    font-size: 14px;
}
.nothing-val.red {
    color: #e50914;
    text-shadow: 0 0 8px rgba(229, 9, 20, 0.4);
}
`;

const widget = document.createElement("div");
widget.className = "nothing-widget";
widget.innerHTML = `
    <div class="nothing-content">
        <div class="nothing-header">SYS.TLMTRY</div>
        <div class="nothing-stat">
            <span class="nothing-label">ЕГЭ (ЧАСЫ)</span>
            <span class="nothing-val">${clean(tEge)} h</span>
        </div>
        <div class="nothing-stat">
            <span class="nothing-label">СРЕДНИЙ БАЛЛ</span>
            <span class="nothing-val">${totalAvgScore}/275</span>
        </div>
        <div class="nothing-stat">
            <span class="nothing-label">КОД / CEO</span>
            <span class="nothing-val">${clean(tWork)} h</span>
        </div>
        <div class="nothing-stat">
            <span class="nothing-label">ЗАЛ (ТОННАЖ)</span>
            <span class="nothing-val">${tGym.toLocaleString('ru-RU')} kg</span>
        </div>
        <div class="nothing-stat">
            <span class="nothing-label">ДО ЭКЗАМЕНА</span>
            <span class="nothing-val red">${daysLeft+1} d</span>
        </div>
    </div>
`;

dv.container.appendChild(style);
dv.container.appendChild(widget);
```
