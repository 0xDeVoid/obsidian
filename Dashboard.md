```dataviewjs
// 1. Встраиваем стили (они применятся глобально, но затронут только наши классы)
const style = document.createElement("style");
style.innerHTML = `
.dash-container { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 10px; }
@media (max-width: 768px) { .dash-container { grid-template-columns: 1fr; } }
.dash-col { display: flex; flex-direction: column; gap: 24px; }

/* Brutalist Nothing Cards */
.dash-card {
    background-color: #000;
    border: 2px solid #333;
    border-radius: 16px;
    padding: 22px;
    position: relative;
    overflow: hidden;
    box-shadow: 4px 4px 0px rgba(255, 255, 255, 0.05); /* Brutalist shadow */
}
.dash-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background-image: radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px);
    background-size: 8px 8px;
    z-index: 0;
    pointer-events: none;
}
.dash-card > * {
    position: relative;
    z-index: 1;
}

/* Nothing Headings */
.dash-card h3 { 
    margin-top: 0; margin-bottom: 18px; font-size: 1.15em; 
    color: #fff; 
    font-family: 'Space Mono', monospace;
    text-transform: uppercase;
    letter-spacing: 2px;
    border-bottom: 1px dashed #444; 
    padding-bottom: 10px; display: flex; align-items: center; gap: 8px; 
}

/* Brutalist Buttons */
.dv-btn { 
    padding: 8px 14px; 
    background: #000; 
    color: #fff; 
    border: 1px solid #555; 
    border-radius: 4px; font-weight: 700; cursor: pointer; transition: all 0.2s; font-size: 0.9em;
    font-family: 'Space Mono', monospace;
    text-transform: uppercase;
}
.dv-btn:hover { 
    background: #e50914; 
    border-color: #e50914; 
    color: #fff;
}
.dv-btn-active { 
    background: #e50914; 
    color: #fff; 
    border: 1px solid #e50914;
}

/* Progress Ring */
.progress-ring { transform: rotate(-90deg); transform-origin: 50% 50%; filter: drop-shadow(0 0 6px rgba(229, 9, 20, 0.5)); }
.progress-ring__circle-bg { stroke: #222; }
.progress-ring__circle { stroke: #e50914; transition: stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1); }

/* Quick Nav */
.quick-nav { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.quick-nav-btn { 
    display: flex; align-items: center; justify-content: center; padding: 14px; 
    background: #000; 
    border: 1px solid #444; 
    border-radius: 8px; text-decoration: none !important; color: #fff; font-weight: bold; font-size: 0.95em; transition: all 0.2s; 
    font-family: 'Space Mono', monospace;
}
.quick-nav-btn:hover { 
    background: #e50914; 
    border-color: #e50914; color: #fff; 
}

/* Daily Summary Panel */
.daily-summary { 
    display: flex; align-items: center; justify-content: space-between; 
    background: #000; 
    padding: 18px; border-radius: 12px; margin-bottom: 20px; 
    border: 1px dashed #444;
}
`;
dv.container.appendChild(style);

// 2. Создаем структуру сетки
const container = document.createElement("div");
container.className = "dash-container";

const col1 = document.createElement("div");
col1.className = "dash-col";
const col2 = document.createElement("div");
col2.className = "dash-col";

container.appendChild(col1);
container.appendChild(col2);
dv.container.appendChild(container);


// ==========================================
// КОЛОНКА 1
// ==========================================

// Карточка 1: Сводка дня
const card1 = document.createElement("div");
card1.className = "dash-card";
card1.innerHTML = `<h3>⚡ Сводка дня</h3>`;
col1.appendChild(card1);

const today = window.moment().format("YYYY-MM-DD");
const dailyPath = `02_Log/Days/${today}.md`;
const tFile = app.vault.getAbstractFileByPath(dailyPath);
const page = dv.page(dailyPath);

let completed = 0;
let total = 0;
let engDone = false;
let egeTime = 0;

if (page) {
    if (page.file && page.file.tasks) {
        total = page.file.tasks.length;
        completed = page.file.tasks.filter(t => t.completed).length;
    }
    engDone = page.english_done || false;
    egeTime = page.ege_time || 0;
}

const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
const radius = 24;
const circ = 2 * Math.PI * radius;
const offset = circ - (pct / 100) * circ;

const greet = window.moment().hour() < 12 ? "🌅 Доброе утро" : window.moment().hour() < 18 ? "☀️ Добрый день" : "🌙 Добрый вечер";

const summaryWrapper = document.createElement("div");
summaryWrapper.innerHTML = `
<div class="daily-summary">
    <div>
        <div style="font-size: 1.2em; font-weight: bold; margin-bottom: 4px; color: #fff;">${greet}, Rayten!</div>
        <div style="font-size: 0.85em; color: var(--text-muted);">
            ${page ? `Задачи на день: <b style="color: #e50914">${completed} / ${total}</b>` : `⚠️ Заметка за сегодня не создана`}
        </div>
    </div>
    <div style="position: relative; width: 60px; height: 60px;">
        <svg width="60" height="60" class="progress-ring" xmlns="http://www.w3.org/2000/svg">
            <circle class="progress-ring__circle-bg" stroke-width="5" fill="transparent" r="${radius}" cx="30" cy="30" />
            <circle class="progress-ring__circle" stroke-width="5" fill="transparent" r="${radius}" cx="30" cy="30" 
                    stroke-dasharray="${circ} ${circ}" stroke-dashoffset="${offset}" stroke-linecap="round"/>
        </svg>
        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 0.8em; font-weight: bold; color: #fff;">
            ${pct}%
        </div>
    </div>
</div>
`;
card1.appendChild(summaryWrapper);

if (page && tFile) {
    const actsTitle = document.createElement("div");
    actsTitle.style.cssText = "font-size: 0.9em; margin-bottom: 8px; font-weight: bold; color: var(--text-muted);";
    actsTitle.innerHTML = "🕹️ Быстрые действия:";
    card1.appendChild(actsTitle);
    
    const acts = document.createElement("div");
    acts.style.cssText = "display: flex; gap: 8px; flex-wrap: wrap;";
    
    const engBtn = document.createElement("button");
    engBtn.className = engDone ? "dv-btn dv-btn-active" : "dv-btn";
    engBtn.innerHTML = engDone ? "🇬🇧 English ✅" : "🇬🇧 English ❌";
    engBtn.onclick = async () => {
        await app.fileManager.processFrontMatter(tFile, fm => { fm.english_done = !fm.english_done; });
    };
    acts.appendChild(engBtn);
    
    const egeBtn = document.createElement("button");
    egeBtn.className = "dv-btn";
    egeBtn.innerHTML = `⏱️ ЕГЭ: ${egeTime} мин <span style="font-size:0.8em; opacity:0.7;">(+30)</span>`;
    egeBtn.onclick = async () => {
        await app.fileManager.processFrontMatter(tFile, fm => { 
            fm.ege_time = (fm.ege_time || 0) + 30; 
        });
    };
    acts.appendChild(egeBtn);
    
    card1.appendChild(acts);
}

// Карточка 2: Навигация
const card2 = document.createElement("div");
card2.className = "dash-card";
card2.innerHTML = `<h3>🧭 Навигация</h3>`;
col1.appendChild(card2);

const thisWeek = window.moment().format("YYYY-[W]WW");
const navWrapper = document.createElement("div");
navWrapper.className = "quick-nav";
const links = [
    { title: "📝 Сегодня", file: `02_Log/Days/${today}.md` },
    { title: "🗓️ Неделя", file: `02_Log/Week/${thisWeek}.md` },
    { title: "🎯 Все задачи", file: `Tasks.md` },
    { title: "🇬🇧 English", file: `03_Knowledge/English/ENGLISH_HUB.md` }
];
links.forEach(l => {
    const btn = document.createElement("a");
    btn.className = "quick-nav-btn";
    btn.innerText = l.title;
    btn.onclick = (e) => {
        e.preventDefault();
        app.workspace.openLinkText(l.file, "", false);
    };
    navWrapper.appendChild(btn);
});
card2.appendChild(navWrapper);


// Карточка 3: Фокус (Q1)
const card3 = document.createElement("div");
card3.className = "dash-card";
card3.innerHTML = `<h3>🎯 Фокус (Q1)</h3>`;
col1.appendChild(card3);

// Рендерим задачи в основной контейнер dv.container, а затем переносим в карточку
const tasksStart = dv.container.childNodes.length;
dv.taskList(dv.pages().file.tasks.where(t => !t.completed && t.text.includes("#q1")), false);
setTimeout(() => {
    // Timeout is small hack to let dataview finish rendering if it uses async microtasks
    while(dv.container.childNodes.length > tasksStart) {
        card3.appendChild(dv.container.childNodes[tasksStart]);
    }
}, 0);


// ==========================================
// КОЛОНКА 2
// ==========================================

// Карточка 4: Стена дисциплины
const card4 = document.createElement("div");
card4.className = "dash-card";
card4.innerHTML = `<h3>📅 Стена дисциплины</h3>`;
col2.appendChild(card4);

const weekPages = dv.pages('"02_Log/Week"');
const dateStats = {}; 

for (let p of weekPages) {
    for (let t of p.file.tasks) {
        const subpath = (t.section ? t.section.subpath : "") || (t.header || "");
        const match = subpath.match(/\d{4}-\d{2}-\d{2}/);
        if (match) {
            const d = match[0];
            if (!dateStats[d]) dateStats[d] = { total: 0, completed: 0 };
            dateStats[d].total++;
            if (t.completed) dateStats[d].completed++;
        }
    }
}

const isDateDone = (dStr) => {
    const s = dateStats[dStr];
    return s && s.total > 0 && s.completed === s.total;
};

let currentStreak = 0;
let checkDate = window.moment();
if (!isDateDone(checkDate.format("YYYY-MM-DD"))) {
    checkDate.subtract(1, 'days');
}
while (isDateDone(checkDate.format("YYYY-MM-DD"))) {
    currentStreak++;
    checkDate.subtract(1, 'days');
}

const daysCount = 180;
const wallContainer = document.createElement("div");

let headerHtml = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <span style="font-weight: bold; font-size: 14px; color: #fff;">АКТИВНЫЙ СТРИК: <span style="color: #e50914; font-size: 16px;">🔥 ${currentStreak} ДН.</span></span>
        <span style="font-size: 12px; color: var(--text-muted);">180 дней</span>
    </div>
`;

let gridHtml = `<div style="display: flex; flex-wrap: wrap; gap: 4px; justify-content: flex-start;">`;

for (let i = daysCount - 1; i >= 0; i--) {
    const dStr = window.moment().subtract(i, 'days').format("YYYY-MM-DD");
    const isDone = isDateDone(dStr);
    const isToday = dStr === today;
    const stats = dateStats[dStr];
    
    let tooltip = 'Нет задач';
    if (stats && stats.total > 0) tooltip = `Задач: ${stats.completed}/${stats.total}`;

    let bg = isDone ? '#e50914' : 'var(--background-secondary)';
    let border = isToday ? '2px solid #e50914' : '1px solid var(--background-modifier-border)';
    let color = isDone ? '#000' : 'transparent';

    gridHtml += `
        <div title="${dStr} | ${tooltip}" style="
            width: 16px; height: 16px; border-radius: 4px;
            background: ${bg}; border: ${border};
            display: flex; align-items: center; justify-content: center;
            font-size: 10px; color: ${color}; font-weight: bold;
        ">${isDone ? '✓' : ''}</div>
    `;
}

gridHtml += `</div>`;
wallContainer.innerHTML = headerHtml + gridHtml;
card4.appendChild(wallContainer);


// Карточка 5: График результатов
const card5 = document.createElement("div");
card5.className = "dash-card";
card5.innerHTML = `<h3>📈 График результатов</h3>`;
col2.appendChild(card5);

const weekPagesChart = dv.pages('"02_Log/Week"').where(p => p.rus_score || p.math_score || p.inf_score).sort(p => p.file.name, 'asc');

if (weekPagesChart.length < 1) {
    const emptyMsg = document.createElement("p");
    emptyMsg.innerHTML = "🔻 *График пуст. Заполни свойства rus_score, math_score или inf_score вверху файлов 02_Log/Week*";
    card5.appendChild(emptyMsg);
} else {
    const records = weekPagesChart.values;
    const width = 620;
    const height = 240;
    const padding = 45;
    
    const stepX = records.length > 1 ? (width - padding * 2) / (records.length - 1) : 0;
    const getValuesY = (val) => height - padding - (val / 100) * (height - padding * 2);

    const extractNums = (v) => {
        if (v === null || v === undefined || v === "") return [];
        if (Array.isArray(v)) return v.map(n => Number(n)).filter(n => !isNaN(n));
        if (typeof v === 'string' && v.includes(',')) return v.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
        const n = Number(v);
        return isNaN(n) ? [] : [n];
    };

    const cleanVal = (v) => {
        const nums = extractNums(v);
        return nums.length ? Math.min(100, Math.max(0, Math.round(nums.reduce((a,b)=>a+b,0)/nums.length))) : null;
    };

    let xLabels = "";
    let rusPoints = [], mathPoints = [], infPoints = [];
    let allPointsByX = {};
    let allRusNums = [], allMathNums = [], allInfNums = [];

    records.forEach((p, idx) => {
        const x = padding + idx * stepX;
        const label = p.file.name.replace(".md", "").split("-W")[1] || p.file.name;
        
        allRusNums.push(...extractNums(p.rus_score));
        allMathNums.push(...extractNums(p.math_score));
        allInfNums.push(...extractNums(p.inf_score));

        const r = cleanVal(p.rus_score);
        const m = cleanVal(p.math_score);
        const inf = cleanVal(p.inf_score);

        allPointsByX[x] = [];
        if (r !== null) { rusPoints.push({x, y: getValuesY(r), val: r}); allPointsByX[x].push({y: getValuesY(r), val: r, color: "#e50914"}); }
        if (m !== null) { mathPoints.push({x, y: getValuesY(m), val: m}); allPointsByX[x].push({y: getValuesY(m), val: m, color: "#ffffff"}); }
        if (inf !== null) { infPoints.push({x, y: getValuesY(inf), val: inf}); allPointsByX[x].push({y: getValuesY(inf), val: inf, color: "#888888"}); }
        
        xLabels += `<text x="${x}" y="${height - 12}" font-size="11" font-weight="bold" fill="var(--text-muted)" text-anchor="middle">W${label}</text>`;
    });

    const getAvgLast10 = (arr) => {
        if (arr.length === 0) return "-";
        const slice = arr.slice(-10);
        return Math.round(slice.reduce((a, b) => a + b, 0) / slice.length);
    };

    const rusAvg = getAvgLast10(allRusNums);
    const mathAvg = getAvgLast10(allMathNums);
    const infAvg = getAvgLast10(allInfNums);

    const makePath = (pts) => pts.length > 0 ? pts.map((p, i) => `${i===0?'M':'L'}${p.x},${p.y}`).join(" ") : "";
    
    let circlesAndLabels = "";
    Object.keys(allPointsByX).forEach(x => {
        let pts = allPointsByX[x];
        pts.sort((a, b) => a.y - b.y);
        
        pts.forEach((p, i) => {
            circlesAndLabels += `<circle cx="${x}" cy="${p.y}" r="4.5" fill="${p.color}" stroke="var(--background-primary-alt)" stroke-width="1.5"></circle>`;
            let labelY = p.y - 8;
            if (i > 0 && Math.abs(pts[i-1].y - p.y) < 14) {
                labelY = p.y + 16;
            }
            circlesAndLabels += `<text x="${x}" y="${labelY}" font-size="10" font-weight="bold" fill="var(--text-normal)" text-anchor="middle">${p.val}</text>`;
        });
    });

    const chartInner = document.createElement("div");

    let yGrid = "";
    [0, 25, 50, 75, 100].forEach(val => {
        const y = getValuesY(val);
        yGrid += `
            <line x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}" stroke="var(--background-modifier-border)" stroke-width="1" stroke-dasharray="4,4"></line>
            <text x="${padding - 10}" y="${y + 4}" font-size="10" fill="var(--text-muted)" text-anchor="end">${val}</text>
        `;
    });

    chartInner.innerHTML = `
        <div style="display: flex; gap: 16px; margin-bottom: 15px; font-size: 12px; font-weight: bold; justify-content: center; flex-wrap: wrap;">
            <span style="color: #e50914;">● Русский (${rusAvg})</span>
            <span style="color: #ffffff;">● Математика (${mathAvg})</span>
            <span style="color: #e50914;">● Информатика (${infAvg})</span>
        </div>
        <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: auto; overflow: visible;" xmlns="http://www.w3.org/2000/svg">
            ${yGrid}
            ${xLabels}
            <path d="${makePath(rusPoints)}" fill="none" stroke="#e50914" stroke-width="2.5"></path>
            <path d="${makePath(mathPoints)}" fill="none" stroke="#ffffff" stroke-width="2.5"></path>
            <path d="${makePath(infPoints)}" fill="none" stroke="#888888" stroke-width="2.5"></path>
            ${circlesAndLabels}
        </svg>
    `;
    card5.appendChild(chartInner);
}
```

