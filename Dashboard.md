<style>
/* CSS Reset and Grid Setup */
.dash-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    margin-top: 10px;
}
@media (max-width: 768px) {
    .dash-container {
        grid-template-columns: 1fr;
    }
}
.dash-col {
    display: flex;
    flex-direction: column;
    gap: 24px;
}
/* Tokyo Night Card Styling */
.dash-card {
    background: var(--background-primary-alt);
    border: 1px solid var(--background-modifier-border);
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 14px rgba(0,0,0,0.1);
}
.dash-card h3 {
    margin-top: 0;
    margin-bottom: 15px;
    font-size: 1.1em;
    color: #7dcfff; /* Tokyo Night Cyan */
    border-bottom: 1px solid var(--background-modifier-border);
    padding-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
}

/* Custom UI Elements */
.dv-btn {
    padding: 8px 12px;
    background: var(--background-secondary);
    color: var(--text-normal);
    border: 1px solid var(--background-modifier-border);
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.9em;
}
.dv-btn:hover {
    background: #3d59a1; /* Tokyo Night Blue Accent */
    color: #fff;
    border-color: #7dcfff;
}
.dv-btn-active {
    background: #7aa2f7; /* Tokyo Night Blue */
    color: #1a1b26;
}

/* Circular Progress Bar */
.progress-ring {
    transform: rotate(-90deg);
    transform-origin: 50% 50%;
}
.progress-ring__circle-bg {
    stroke: var(--background-secondary-alt);
}
.progress-ring__circle {
    stroke: #9ece6a; /* Tokyo Night Green */
    transition: stroke-dashoffset 0.5s ease-in-out;
}

/* Quick Nav */
.quick-nav {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}
.quick-nav-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px;
    background: var(--background-secondary);
    border: 1px solid var(--background-modifier-border);
    border-radius: 8px;
    text-decoration: none !important;
    color: var(--text-normal);
    font-weight: bold;
    font-size: 0.95em;
    transition: all 0.2s;
    cursor: pointer;
}
.quick-nav-btn:hover {
    background: var(--background-modifier-hover);
    border-color: #bb9af7; /* Tokyo Night Magenta */
    color: #bb9af7;
}

.daily-summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--background-secondary);
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 15px;
    border: 1px solid var(--background-modifier-border);
}
</style>

<div class="dash-container">
    <div class="dash-col">
        
        <div class="dash-card">
            <h3>⚡ Сводка дня</h3>
            ```dataviewjs
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

            let html = `
            <div class="daily-summary">
                <div>
                    <div style="font-size: 1.2em; font-weight: bold; margin-bottom: 4px; color: #c0caf5;">${greet}, Rayten!</div>
                    <div style="font-size: 0.85em; color: var(--text-muted);">
                        ${page ? `Задачи на день: <b style="color: #9ece6a">${completed} / ${total}</b>` : `⚠️ Заметка за сегодня не создана`}
                    </div>
                </div>
                <div style="position: relative; width: 60px; height: 60px;">
                    <svg width="60" height="60" class="progress-ring">
                        <circle class="progress-ring__circle-bg" stroke-width="5" fill="transparent" r="${radius}" cx="30" cy="30" />
                        <circle class="progress-ring__circle" stroke-width="5" fill="transparent" r="${radius}" cx="30" cy="30" 
                                stroke-dasharray="${circ} ${circ}" stroke-dashoffset="${offset}" stroke-linecap="round"/>
                    </svg>
                    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 0.8em; font-weight: bold; color: #c0caf5;">
                        ${pct}%
                    </div>
                </div>
            </div>
            `;

            const wrapper = document.createElement("div");
            wrapper.innerHTML = html;

            if (page && tFile) {
                const actsTitle = document.createElement("div");
                actsTitle.style.cssText = "font-size: 0.9em; margin-bottom: 8px; font-weight: bold; color: var(--text-muted);";
                actsTitle.innerHTML = "🕹️ Быстрые действия:";
                wrapper.appendChild(actsTitle);
                
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
                
                wrapper.appendChild(acts);
            }
            dv.container.appendChild(wrapper);
            ```
        </div>

        <div class="dash-card">
            <h3>🧭 Навигация</h3>
            ```dataviewjs
            const today = window.moment().format("YYYY-MM-DD");
            const thisWeek = window.moment().format("YYYY-[W]WW");

            const nav = document.createElement("div");
            nav.className = "quick-nav";

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
                nav.appendChild(btn);
            });
            dv.container.appendChild(nav);
            ```
        </div>

        <div class="dash-card">
            <h3>🎯 Фокус (Q1)</h3>
            ```dataview
            TASK
            WHERE !completed AND contains(text, "#q1")
            ```
        </div>

    </div>

    <div class="dash-col">
        
        <div class="dash-card">
            <h3>📅 Стена дисциплины</h3>
            ```dataviewjs
            const today = window.moment().format("YYYY-MM-DD");

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
            const mainContainer = document.createElement("div");

            let headerHtml = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <span style="font-weight: bold; font-size: 14px; color: #c0caf5;">АКТИВНЫЙ СТРИК: <span style="color: #9ece6a; font-size: 16px;">🔥 ${currentStreak} ДН.</span></span>
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

                let bg = isDone ? '#9ece6a' : 'var(--background-secondary)';
                let border = isToday ? '2px solid #7dcfff' : '1px solid var(--background-modifier-border)';
                let color = isDone ? '#1a1b26' : 'transparent';

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
            mainContainer.innerHTML = headerHtml + gridHtml;
            dv.container.appendChild(mainContainer);
            ```
        </div>

        <div class="dash-card">
            <h3>📈 График результатов</h3>
            ```dataviewjs
            const weekPages = dv.pages('"02_Log/Week"').where(p => p.rus_score || p.math_score || p.inf_score).sort(p => p.file.name, 'asc');

            if (weekPages.length < 1) {
                dv.paragraph("🔻 *График пуст. Заполни свойства rus_score, math_score или inf_score вверху файлов 02_Log/Week*");
            } else {
                const records = weekPages.values;
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
                    // Tokyo Night themed colors
                    if (r !== null) { rusPoints.push({x, y: getValuesY(r), val: r}); allPointsByX[x].push({y: getValuesY(r), val: r, color: "#f7768e"}); }
                    if (m !== null) { mathPoints.push({x, y: getValuesY(m), val: m}); allPointsByX[x].push({y: getValuesY(m), val: m, color: "#7aa2f7"}); }
                    if (inf !== null) { infPoints.push({x, y: getValuesY(inf), val: inf}); allPointsByX[x].push({y: getValuesY(inf), val: inf, color: "#9ece6a"}); }
                    
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

                const chartContainer = document.createElement("div");

                let yGrid = "";
                [0, 25, 50, 75, 100].forEach(val => {
                    const y = getValuesY(val);
                    yGrid += `
                        <line x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}" stroke="var(--background-modifier-border)" stroke-width="1" stroke-dasharray="4,4"></line>
                        <text x="${padding - 10}" y="${y + 4}" font-size="10" fill="var(--text-muted)" text-anchor="end">${val}</text>
                    `;
                });

                chartContainer.innerHTML = `
                    <div style="display: flex; gap: 16px; margin-bottom: 15px; font-size: 12px; font-weight: bold; justify-content: center; flex-wrap: wrap;">
                        <span style="color: #f7768e;">● Русский (${rusAvg})</span>
                        <span style="color: #7aa2f7;">● Математика (${mathAvg})</span>
                        <span style="color: #9ece6a;">● Информатика (${infAvg})</span>
                    </div>
                    <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: auto; overflow: visible;">
                        ${yGrid}
                        ${xLabels}
                        <path d="${makePath(rusPoints)}" fill="none" stroke="#f7768e" stroke-width="2.5"></path>
                        <path d="${makePath(mathPoints)}" fill="none" stroke="#7aa2f7" stroke-width="2.5"></path>
                        <path d="${makePath(infPoints)}" fill="none" stroke="#9ece6a" stroke-width="2.5"></path>
                        ${circlesAndLabels}
                    </svg>
                `;
                dv.container.appendChild(chartContainer);
            }
            ```
        </div>
        
    </div>
</div>
