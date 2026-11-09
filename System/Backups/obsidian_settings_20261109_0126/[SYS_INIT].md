```dataviewjs
// ==============================================================================
// NOTHING MISSION CONTROL & SYSTEM TELEMETRY HUD // 0xDeVoid Musashi Edition
// Curated by: Obsidian Curator
// Target: EGE 300 Points // Innopolis University
// ==============================================================================

// Helper: Open file strictly in the central main workspace
const openInMain = (path) => {
    // 1. Check if there are markdown leaves in the root split
    const rootLeaves = app.workspace.getLeavesOfType("markdown").filter(l => l.getRoot() === app.workspace.rootSplit);
    if (rootLeaves.length > 0) {
        app.workspace.setActiveLeaf(rootLeaves[0], { focus: true });
        app.workspace.openLinkText(path, "", false);
    } else {
        // 2. Open as a new tab in the root split
        const newLeaf = app.workspace.getLeaf('tab');
        app.workspace.setActiveLeaf(newLeaf, { focus: true });
        app.workspace.openLinkText(path, "", false);
    }
};

// 1. Target Countdown Calculation
const targetDate = moment("2027-06-01"); 
const now = moment();
const daysLeft = targetDate.diff(now, 'days');

// 2. Aggregate Study, Code, and Gym Metrics
const pages = dv.pages().where(p => p.ege_time || p.work_time || p.gym_weight);
let tEge = 0, tWork = 0, tGym = 0;

pages.forEach(p => {
    tEge += Number(p.ege_time) || 0;
    tWork += Number(p.work_time) || 0;
    tGym += Number(p.gym_weight) || 0;
});

// 3. Score Breakdown (Last 10 Mock Exams from 02_Log/Week)
const weekPages = dv.pages('"02_Log/Week"')
    .where(p => p.rus_score || p.math_score || p.inf_score)
    .sort(p => p.file.name, 'asc');

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

const getAvgLast10 = (arr) => {
    if (arr.length === 0) return 0;
    const slice = arr.slice(-10);
    return Math.round(slice.reduce((a, b) => a + b, 0) / slice.length);
};

const rusAvg = getAvgLast10(allRus);
const mathAvg = getAvgLast10(allMath);
const infAvg = getAvgLast10(allInf);
const totalScore = rusAvg + mathAvg + infAvg;

const clean = (num) => Number(num.toFixed(1));

// 4. Calculate 14-Day Activity Streak
const streakDays = [];
for (let i = 13; i >= 0; i--) {
    const d = moment().subtract(i, 'days');
    const dStr = d.format("YYYY-MM-DD");
    const dayPage = dv.page(`"02_Log/Days/${dStr}.md"`);
    const hasStudy = dayPage && (Number(dayPage.ege_time) > 0 || Number(dayPage.work_time) > 0);
    streakDays.push({
        date: d.format("DD.MM"),
        dayNum: d.format("D"),
        active: !!hasStudy,
        isToday: i === 0
    });
}

// 5. Extract Top Active Tasks from Tasks.md (Q1 / Q2 Priority)
const allTasks = dv.pages('"Tasks.md"').file.tasks.where(t => !t.completed && (t.text.includes("#q1") || t.text.includes("#q2")));
const topTasks = allTasks.slice(0, 3);

// 6. Stylesheet Injection
const styleId = "nothing-cockpit-hud-v3";
let existingStyle = document.getElementById(styleId);
if (existingStyle) existingStyle.remove();

const style = document.createElement("style");
style.id = styleId;
style.innerHTML = `
@import url('https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;600;700&display=swap');

@keyframes nothing-led-pulse {
    0%, 100% { opacity: 1; filter: drop-shadow(0 0 6px #e50914); }
    50% { opacity: 0.35; filter: drop-shadow(0 0 2px #e50914); }
}

.cockpit-card {
    font-family: 'Space Mono', monospace;
    background-color: #000000;
    color: #ffffff;
    border: 2px solid #333333;
    border-radius: 14px;
    padding: 14px;
    position: relative;
    overflow: hidden;
    margin: 2px 0 10px 0;
    box-shadow: 4px 4px 0px rgba(255, 255, 255, 0.05);
}

.cockpit-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background-image: radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px);
    background-size: 8px 8px;
    z-index: 0;
    pointer-events: none;
    opacity: 0.7;
}

.cockpit-inner {
    position: relative;
    z-index: 1;
}

/* Header */
.cockpit-hdr {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px dashed #444444;
    padding-bottom: 8px;
    margin-bottom: 10px;
}

.cockpit-hdr-title {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 2px;
    color: #ffffff;
    display: flex;
    align-items: center;
    gap: 8px;
}

.cockpit-led {
    width: 8px;
    height: 8px;
    background-color: #e50914;
    border-radius: 50%;
    animation: nothing-led-pulse 2s infinite ease-in-out;
}

.cockpit-status {
    font-size: 9px;
    letter-spacing: 1px;
    color: rgba(255, 255, 255, 0.45);
}

/* Quick Actions Launchpad */
.cockpit-launchpad {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 6px;
    margin-bottom: 10px;
}

.cockpit-btn {
    background: #000000;
    border: 1px solid #444444;
    border-radius: 6px;
    padding: 8px;
    font-family: 'Space Mono', monospace;
    font-size: 9.5px;
    font-weight: 700;
    letter-spacing: 1px;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    cursor: pointer;
    transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
    user-select: none;
}

.cockpit-btn:hover {
    background: #e50914;
    border-color: #e50914;
    color: #ffffff;
    box-shadow: 0 0 10px rgba(229, 9, 20, 0.4);
    transform: translateY(-1px);
}

.cockpit-btn:active {
    transform: translateY(1px);
}

.cockpit-btn .btn-dot {
    width: 4px;
    height: 4px;
    background: #e50914;
    border-radius: 50%;
}
.cockpit-btn:hover .btn-dot {
    background: #ffffff;
}

/* Target 300 Gauge */
.cockpit-gauge-box {
    background: #000000;
    border: 1px solid #333333;
    border-radius: 8px;
    padding: 9px;
    margin-bottom: 8px;
}

.cockpit-gauge-hdr {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
}

.cockpit-gauge-title {
    font-size: 8.5px;
    letter-spacing: 1.5px;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
}

.cockpit-gauge-score {
    font-size: 13.5px;
    font-weight: 700;
    color: #ffffff;
}

.cockpit-gauge-score .red {
    color: #e50914;
    text-shadow: 0 0 8px rgba(229, 9, 20, 0.5);
}

.cockpit-prog-rail {
    height: 4px;
    background: #222222;
    border-radius: 2px;
    overflow: hidden;
    position: relative;
    margin-bottom: 8px;
}

.cockpit-prog-bar {
    height: 100%;
    background: linear-gradient(90deg, #ffffff 0%, #e50914 100%);
    border-radius: 2px;
    box-shadow: 0 0 8px rgba(229, 9, 20, 0.6);
    transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Subject Micro Bars */
.cockpit-subs {
    display: flex;
    justify-content: space-between;
    gap: 6px;
}

.cockpit-sub-item {
    flex: 1;
    background: #050505;
    border: 1px solid #282828;
    border-radius: 4px;
    padding: 3px 5px;
    text-align: center;
}

.cockpit-sub-label {
    font-size: 8px;
    color: rgba(255, 255, 255, 0.45);
    letter-spacing: 0.5px;
    margin-bottom: 1px;
}

.cockpit-sub-val {
    font-size: 10.5px;
    font-weight: 700;
    color: #ffffff;
}

/* 14-Day Activity Streak Matrix */
.cockpit-streak-box {
    background: #000000;
    border: 1px solid #333333;
    border-radius: 8px;
    padding: 7px 8px;
    margin-bottom: 8px;
}

.cockpit-streak-title {
    font-size: 8.5px;
    letter-spacing: 1.5px;
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: 6px;
    text-transform: uppercase;
}

.cockpit-streak-grid {
    display: grid;
    grid-template-columns: repeat(14, 1fr);
    gap: 3px;
}

.cockpit-streak-cell {
    aspect-ratio: 1;
    border: 1px solid #333333;
    border-radius: 3px;
    background: #050505;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 7.5px;
    color: rgba(255, 255, 255, 0.35);
    transition: all 0.2s ease;
}

.cockpit-streak-cell.active {
    background: #e50914;
    border-color: #ff2d37;
    color: #ffffff;
    font-weight: 700;
    box-shadow: 0 0 6px rgba(229, 9, 20, 0.6);
}

.cockpit-streak-cell.today {
    border: 1px solid rgba(255, 255, 255, 0.8);
}

/* Active Tasks Feed (Replaces static calendar) */
.cockpit-tasks-box {
    background: #000000;
    border: 1px solid #333333;
    border-radius: 8px;
    padding: 8px;
    margin-bottom: 8px;
}

.cockpit-tasks-hdr {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
    cursor: pointer;
}

.cockpit-tasks-title {
    font-size: 8.5px;
    letter-spacing: 1.5px;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    display: flex;
    align-items: center;
    gap: 5px;
}

.cockpit-task-item {
    font-size: 9px;
    padding: 3px 4px;
    border-left: 2px solid #e50914;
    background: rgba(255, 255, 255, 0.02);
    margin-bottom: 3px;
    border-radius: 0 3px 3px 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #dddddd;
    cursor: pointer;
    transition: background 0.15s ease;
}

.cockpit-task-item:hover {
    background: rgba(229, 9, 20, 0.12);
    color: #ffffff;
}

/* Telemetry List */
.cockpit-telemetry-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    font-size: 9px;
    cursor: pointer;
    border-radius: 4px;
    transition: background 0.15s ease;
}

.cockpit-telemetry-row:hover {
    background: rgba(255, 255, 255, 0.04);
}

.cockpit-telemetry-row:last-child {
    border-bottom: none;
    margin-top: 2px;
    padding-top: 5px;
    border-top: 1px dashed #444444;
}

.cockpit-tlm-lbl {
    color: rgba(255, 255, 255, 0.55);
    letter-spacing: 1px;
    font-size: 8.5px;
}

.cockpit-tlm-val {
    font-weight: 700;
    font-size: 10px;
    color: #ffffff;
}

.cockpit-tlm-val.accent {
    color: #e50914;
    text-shadow: 0 0 8px rgba(229, 9, 20, 0.4);
}
`;

document.head.appendChild(style);

// 7. Build Widget DOM
const container = document.createElement("div");
container.className = "cockpit-card";

const scorePercent = Math.min(100, Math.round((totalScore / 300) * 100));

container.innerHTML = `
    <div class="cockpit-inner">
        <!-- Top Status Bar -->
        <div class="cockpit-hdr">
            <div class="cockpit-hdr-title">
                <span class="cockpit-led"></span>
                <span>SYS.COCKPIT // 01</span>
            </div>
            <div class="cockpit-status">NOMINAL</div>
        </div>

        <!-- Cockpit Quick Launchpad -->
        <div class="cockpit-launchpad">
            <div class="cockpit-btn" id="btn-today">
                <span class="btn-dot"></span>
                <span>СЕГОДНЯ</span>
            </div>
            <div class="cockpit-btn" id="btn-tasks">
                <span class="btn-dot"></span>
                <span>ТАСКИ</span>
            </div>
            <div class="cockpit-btn" id="btn-dash">
                <span class="btn-dot"></span>
                <span>ДЭШБОРД</span>
            </div>
            <div class="cockpit-btn" id="btn-inbox">
                <span class="btn-dot"></span>
                <span>ИНБОКС</span>
            </div>
        </div>

        <!-- Target 300 Score Box -->
        <div class="cockpit-gauge-box">
            <div class="cockpit-gauge-hdr">
                <span class="cockpit-gauge-title">ЦЕЛЬ 300 // ПРОБНИКИ (AVG 10)</span>
                <span class="cockpit-gauge-score"><span class="red">${totalScore}</span>/300</span>
            </div>
            <div class="cockpit-prog-rail">
                <div class="cockpit-prog-bar" style="width: ${scorePercent}%"></div>
            </div>
            <div class="cockpit-subs">
                <div class="cockpit-sub-item">
                    <div class="cockpit-sub-label">РУС</div>
                    <div class="cockpit-sub-val">${rusAvg}</div>
                </div>
                <div class="cockpit-sub-item">
                    <div class="cockpit-sub-label">МАТ</div>
                    <div class="cockpit-sub-val">${mathAvg}</div>
                </div>
                <div class="cockpit-sub-item">
                    <div class="cockpit-sub-label">ИНФ</div>
                    <div class="cockpit-sub-val">${infAvg}</div>
                </div>
            </div>
        </div>

        <!-- 14-Day Activity Streak Matrix -->
        <div class="cockpit-streak-box">
            <div class="cockpit-streak-title">АКТИВНОСТЬ УЧЕБЫ // 14 ДНЕЙ</div>
            <div class="cockpit-streak-grid">
                ${streakDays.map(s => `
                    <div class="cockpit-streak-cell ${s.active ? 'active' : ''} ${s.isToday ? 'today' : ''}" title="${s.date}: ${s.active ? 'Занятие зафиксировано' : 'Нет записей'}">
                        <span>${s.dayNum}</span>
                    </div>
                `).join('')}
            </div>
        </div>

        <!-- Focus Tasks Feed (Active Q1/Q2 tasks) -->
        <div class="cockpit-tasks-box" id="box-tasks">
            <div class="cockpit-tasks-hdr">
                <span class="cockpit-tasks-title">🎯 ТАСКИ В ФОКУСЕ (Q1/Q2)</span>
                <span style="font-size: 8px; color: #e50914;">Tasks.md &rarr;</span>
            </div>
            <div class="cockpit-tasks-list">
                ${topTasks.length > 0 ? topTasks.map(t => `
                    <div class="cockpit-task-item" title="${t.text.replace(/<[^>]*>/g, '')}">
                        ${t.text.replace(/#q[1-4]/g, '').trim()}
                    </div>
                `).join('') : '<div style="font-size: 8.5px; color: #666; font-style: italic;">Все задачи закрыты</div>'}
            </div>
        </div>

        <!-- Telemetry Metrics List -->
        <div class="cockpit-telemetry-list">
            <div class="cockpit-telemetry-row" id="row-ege">
                <span class="cockpit-tlm-lbl">ЕГЭ (ЧАСЫ)</span>
                <span class="cockpit-tlm-val">${clean(tEge)} h</span>
            </div>
            <div class="cockpit-telemetry-row" id="row-code">
                <span class="cockpit-tlm-lbl">GO / WORK</span>
                <span class="cockpit-tlm-val">${clean(tWork)} h</span>
            </div>
            <div class="cockpit-telemetry-row" id="row-gym">
                <span class="cockpit-tlm-lbl">ЗАЛ (ТОННАЖ)</span>
                <span class="cockpit-tlm-val">${tGym.toLocaleString('ru-RU')} kg</span>
            </div>
            <div class="cockpit-telemetry-row" id="row-target">
                <span class="cockpit-tlm-lbl">ДО ЭКЗАМЕНА</span>
                <span class="cockpit-tlm-val accent">${daysLeft + 1} d</span>
            </div>
        </div>
    </div>
`;

// 8. Attach Event Handlers (using openInMain to ALWAYS open in center editor)
container.querySelector("#btn-today").addEventListener("click", () => {
    const todayStr = moment().format("YYYY-MM-DD");
    openInMain(`02_Log/Days/${todayStr}.md`);
});

container.querySelector("#btn-tasks").addEventListener("click", () => {
    openInMain("Tasks.md");
});

container.querySelector("#btn-dash").addEventListener("click", () => {
    openInMain("Dashboard.md");
});

container.querySelector("#btn-inbox").addEventListener("click", async () => {
    const ts = moment().format("YYYY-MM-DD_HHmmss");
    const filename = `00_Inbox/Capture_${ts}.md`;
    const content = `# Quick Capture // ${moment().format("YYYY-MM-DD HH:mm")}\n\n- [ ] `;
    try {
        await app.vault.create(filename, content);
        openInMain(filename);
    } catch (e) {
        openInMain("00_Inbox");
    }
});

container.querySelector("#box-tasks").addEventListener("click", () => {
    openInMain("Tasks.md");
});

container.querySelector("#row-ege").addEventListener("click", () => {
    openInMain("02_Log/Week");
});

container.querySelector("#row-code").addEventListener("click", () => {
    openInMain("03_Knowledge/Программирование");
});

container.querySelector("#row-gym").addEventListener("click", () => {
    openInMain("Tasks.md");
});

container.querySelector("#row-target").addEventListener("click", () => {
    openInMain("02_Log/Week");
});

dv.container.appendChild(container);
```
