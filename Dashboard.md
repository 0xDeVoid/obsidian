```dataviewjs
// ==============================================================================
// 0xDeVoid Combat Dashboard // Мусаси & Nothing OS Edition
// ==============================================================================

// 1. Встраиваем стили
const style = document.createElement("style");
style.innerHTML = `
.dash-container { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 10px; }
@media (max-width: 860px) { .dash-container { grid-template-columns: 1fr; } }
.dash-col { display: flex; flex-direction: column; gap: 24px; }

/* Brutalist Nothing Cards */
.dash-card {
    background-color: #000;
    border: 2px solid #333;
    border-radius: 16px;
    padding: 22px;
    position: relative;
    overflow: hidden;
    box-shadow: 4px 4px 0px rgba(255, 255, 255, 0.05);
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

// 2. Компактная шапка Nothing OS (БЕЗ гиммиков и баннеров)
const topBar = document.createElement("div");
topBar.style.cssText = "display: flex; justify-content: space-between; align-items: center; padding: 12px 18px; background: #000; border: 1px dashed #444; border-radius: 12px; margin-bottom: 20px; font-family: 'Space Mono', monospace; flex-wrap: wrap; gap: 8px;";
topBar.innerHTML = `
    <div style="font-weight: 700; letter-spacing: 2px; color: #fff; font-size: 0.95em;">
        🗡️ 0xDeVoid Cockpit // Мусаси Edition
    </div>
    <div style="font-size: 0.8em; color: #a6e3a1; font-weight: bold; font-family: 'Space Mono', monospace;">
        ● 300 БАЛЛОВ ЕГЭ // INNOPOLIS TRACK
    </div>
`;
dv.container.appendChild(topBar);

// 3. Создаем структуру сетки
const container = document.createElement("div");
container.className = "dash-container";

const col1 = document.createElement("div");
col1.className = "dash-col";
const col2 = document.createElement("div");
col2.className = "dash-col";

container.appendChild(col1);
container.appendChild(col2);
dv.container.appendChild(container);


// ==============================================================================
// КОЛОНКА 1: СВОДКА, ВВОД, НАВИГАЦИЯ, ФОКУС
// ==============================================================================

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
let workTime = 0;

if (page) {
    if (page.file && page.file.tasks) {
        total = page.file.tasks.length;
        completed = page.file.tasks.filter(t => t.completed).length;
    }
    engDone = page.english_done || false;
    egeTime = page.ege_time || 0;
    workTime = page.work_time || 0;
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
    actsTitle.style.cssText = "font-size: 0.9em; margin-bottom: 8px; font-weight: bold; color: var(--text-muted); font-family: 'Space Mono', monospace;";
    actsTitle.innerHTML = "🕹️ Быстрый трекинг времени:";
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
    egeBtn.innerHTML = `⏱️ ЕГЭ: ${Number(egeTime).toFixed(1)} ч <span style="font-size:0.8em; opacity:0.7;">(+0.5)</span>`;
    egeBtn.onclick = async () => {
        await app.fileManager.processFrontMatter(tFile, fm => { 
            fm.ege_time = Math.round(((fm.ege_time || 0) + 0.5) * 10) / 10; 
        });
    };
    acts.appendChild(egeBtn);

    const codeBtn = document.createElement("button");
    codeBtn.className = "dv-btn";
    codeBtn.innerHTML = `💻 Код: ${Number(workTime).toFixed(1)} ч <span style="font-size:0.8em; opacity:0.7;">(+0.5)</span>`;
    codeBtn.onclick = async () => {
        await app.fileManager.processFrontMatter(tFile, fm => { 
            fm.work_time = Math.round(((fm.work_time || 0) + 0.5) * 10) / 10; 
        });
    };
    acts.appendChild(codeBtn);
    
    card1.appendChild(acts);
}

// Карточка 2: Быстрый ввод задач в фокус (0 гонок Syncthing)
const cardTerm = document.createElement("div");
cardTerm.className = "dash-card";
cardTerm.innerHTML = `<h3>>_ ВВОД ЗАДАЧ В ФОКУС</h3>`;
col1.appendChild(cardTerm);

const termBox = document.createElement("div");
termBox.style.cssText = "display: flex; gap: 8px; margin-bottom: 14px;";

const inputField = document.createElement("input");
inputField.type = "text";
inputField.placeholder = "Новая задача в фокус дня...";
inputField.style.cssText = "flex: 1; background: #050505; color: #fff; border: 1px solid #444; border-radius: 4px; padding: 10px 12px; font-family: 'Space Mono', monospace; font-size: 0.9em; outline: none;";

const addBtn = document.createElement("button");
addBtn.className = "dv-btn dv-btn-active";
addBtn.innerText = "+ В ФОКУС";

const addTaskToDay = async () => {
    const val = inputField.value.trim();
    if (!val) return;
    const dayFile = app.vault.getAbstractFileByPath(dailyPath);
    if (dayFile) {
        await app.vault.process(dayFile, content => {
            const focusHeader = "### 🎯 Главный фокус дня (Топ-3)";
            if (content.includes(focusHeader)) {
                return content.replace(focusHeader, `${focusHeader}\n- [ ] ${val}`);
            }
            return `${content}\n- [ ] ${val}`;
        });
        inputField.value = "";
        new Notice(`✅ Задача добавлена в фокус: ${val}`);
    } else {
        new Notice("⚠️ Заметка за сегодня не найдена");
    }
};

addBtn.onclick = addTaskToDay;
inputField.onkeydown = (e) => { if (e.key === "Enter") addTaskToDay(); };

termBox.appendChild(inputField);
termBox.appendChild(addBtn);
cardTerm.appendChild(termBox);

// Быстрые ссылки на боевые протоколы
const quickPills = document.createElement("div");
quickPills.style.cssText = "display: flex; gap: 6px; flex-wrap: wrap;";
const pillsData = [
    { label: "⚡ Компилятор русского", file: "03_Knowledge/ЕГЭ/Русский/КОМПИЛЯТОР_РУССКОГО.md" },
    { label: "⚔️ Опережающий удар (Матан)", file: "03_Knowledge/ЕГЭ/Математика/ПРОТОКОЛ_ОПЕРЕЖАЮЩЕГО_УДАРА.md" },
    { label: "📋 Тренажер и Задачи", file: "Tasks.md" }
];
pillsData.forEach(p => {
    const pill = document.createElement("button");
    pill.style.cssText = "background: #000; color: #aaa; border: 1px solid #333; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 0.8em; font-family: 'Space Mono', monospace;";
    pill.innerText = p.label;
    pill.onmouseover = () => { pill.style.borderColor = "#e50914"; pill.style.color = "#fff"; };
    pill.onmouseout = () => { pill.style.borderColor = "#333"; pill.style.color = "#aaa"; };
    pill.onclick = () => app.workspace.openLinkText(p.file, "", false);
    quickPills.appendChild(pill);
});
cardTerm.appendChild(quickPills);

// Карточка 3: Навигация
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

// Карточка 4: Фокус дня (активные задачи)
const card3 = document.createElement("div");
card3.className = "dash-card";
card3.innerHTML = `<h3>🎯 Фокус дня</h3>`;
col1.appendChild(card3);

const getTaskHeaderStr = (t) => {
    if (!t) return "";
    if (t.section && t.section.subpath) return String(t.section.subpath);
    if (t.header) {
        if (typeof t.header === "string") return t.header;
        if (t.header.subpath) return String(t.header.subpath);
        if (t.header.display) return String(t.header.display);
        return String(t.header.path || t.header);
    }
    return "";
};

const currentWeekFile = `02_Log/Week/${thisWeek}.md`;
const todayTasks = dv.pages().file.tasks.where(t => {
    if (t.completed) return false;
    if (t.path === dailyPath) return true;
    const hStr = getTaskHeaderStr(t);
    if (t.path === currentWeekFile && hStr.includes(today)) return true;
    const txt = String(t.text || "");
    if (txt.includes("#focus") || txt.includes("#q1")) return true;
    return false;
});

const tasksStart = dv.container.childNodes.length;
dv.taskList(todayTasks, false);
setTimeout(() => {
    while(dv.container.childNodes.length > tasksStart) {
        card3.appendChild(dv.container.childNodes[tasksStart]);
    }
}, 0);


// ==============================================================================
// КОЛОНКА 2: РУССКИЙ ЯЗЫК (ТРЕНАЖЕР), СТЕНА ДИСЦИПЛИНЫ, ГРАФИК
// ==============================================================================

// Карточка 5: РУССКИЙ ЯЗЫК // ТРЕНАЖЕР СЛОВАРЕЙ И НОМЕРОВ
const cardRus = document.createElement("div");
cardRus.className = "dash-card";
cardRus.innerHTML = `<h3>📖 РУССКИЙ ЯЗЫК // ТРЕНАЖЕР</h3>`;
col2.appendChild(cardRus);

// ── Вспомогательные функции для русского тренажера ──────────
function weightedSample(pool, n) {
    const todayM = window.moment();
    const weighted = pool.map(t => {
        const failsMatch = t.text.match(/\[fails:: (\d+)\]/);
        const fails = failsMatch ? parseInt(failsMatch[1]) : 0;
        const dateMatch = t.text.match(/🗓️(\d{4}-\d{2}-\d{2})/);
        const days = dateMatch ? todayM.diff(window.moment(dateMatch[1], "YYYY-MM-DD"), "days") : 999;
        return { task: t, weight: (fails + 1) * (days + 1) };
    });
    const result = [];
    const used = new Set();
    let totalWeight = weighted.reduce((s, x) => s + x.weight, 0);
    for (let i = 0; i < Math.min(n, pool.length); i++) {
        let r = Math.random() * totalWeight;
        for (const w of weighted) {
            if (used.has(w.task)) continue;
            r -= w.weight;
            if (r <= 0) {
                result.push(w.task);
                used.add(w.task);
                totalWeight -= w.weight;
                break;
            }
        }
    }
    if (result.length < Math.min(n, pool.length)) {
        for (const w of weighted) {
            if (!used.has(w.task)) result.push(w.task);
            if (result.length >= n) break;
        }
    }
    return result;
}

async function makeWordBlock(filePath, title, accentColor, parentEl) {
    const tFile = app.vault.getAbstractFileByPath(filePath);
    if (!tFile) return;

    const todayStr = window.moment().format("YYYY-MM-DD");
    const pageObj = dv.page(filePath);
    if (!pageObj) return;

    const allTasks = (pageObj.file && pageObj.file.tasks) ? Array.from(pageObj.file.tasks) : [];
    const openTasks = allTasks.filter(t => !t.completed);

    const wrap = document.createElement("div");
    wrap.style.cssText = "margin-bottom: 12px;";
    parentEl.appendChild(wrap);

    if (allTasks.length > 0 && openTasks.length === 0) {
        const winDiv = document.createElement("div");
        winDiv.style.cssText = "display:flex; align-items:center; justify-content:space-between; padding:8px 12px; background:#000; border:1px dashed #444; border-radius:6px;";
        winDiv.innerHTML = `<span style="font-size:0.85em; font-weight:600;">🏆 ${title} — всё выучено!</span>`;
        const resetBtn = document.createElement("button");
        resetBtn.textContent = "🔄 2-й круг";
        resetBtn.style.cssText = "background:#000; color:#fff; border:1px solid #555; padding:4px 10px; border-radius:4px; cursor:pointer; font-size:11px; font-weight:700; font-family:'Space Mono', monospace; text-transform:uppercase;";
        resetBtn.onclick = async () => {
            await app.vault.process(tFile, data => data.replace(/- \[x\]/g, "- [ ]"));
        };
        winDiv.appendChild(resetBtn);
        wrap.appendChild(winDiv);
        return;
    }

    const processedToday = allTasks.filter(t => t.text.includes(`🗓️${todayStr}`)).length;
    let remain = 15 - processedToday;

    const cacheKey = `word_${title}_${todayStr}_v4`;
    window._myWordCache = window._myWordCache || {};
    
    if (!window._myWordCache[cacheKey]) {
        if (remain < 0) remain = 0;
        const pool = openTasks.filter(t => !t.text.includes(`🗓️${todayStr}`));
        const newBatch = weightedSample(pool, remain);
        window._myWordCache[cacheKey] = {
            batch: newBatch.map(t => ({ text: t.text, completed: t.completed })),
            idx: 0
        };
    }
    
    const batch = window._myWordCache[cacheKey].batch;
    let idx = window._myWordCache[cacheKey].idx;

    if (idx >= batch.length && batch.length === 0) {
        const doneDiv = document.createElement("div");
        doneDiv.style.cssText = "padding:8px 12px; background:#000; border:1px dashed #444; border-radius:6px; font-size:0.82em; font-weight:700; font-family:'Space Mono',monospace;";
        doneDiv.textContent = `✅ ${title} — норма выполнена (15 слов)`;
        wrap.appendChild(doneDiv);
        return;
    }

    const progressBar = document.createElement("div");
    progressBar.style.cssText = "display:flex; align-items:center; gap:8px; margin-bottom:6px;";

    const titleSpan = document.createElement("span");
    titleSpan.style.cssText = "font-size:0.8em; font-weight:700; color:#e50914; white-space:nowrap; font-family:'Space Mono',monospace; text-transform:uppercase;";
    titleSpan.textContent = title;

    const barOuter = document.createElement("div");
    barOuter.style.cssText = "flex:1; height:4px; background:var(--background-modifier-border); border-radius:2px; overflow:hidden;";
    const barInner = document.createElement("div");
    barInner.style.cssText = "height:100%; background:#e50914; border-radius:2px; transition:width 0.3s; width:0%;";
    barOuter.appendChild(barInner);

    const counterSpan = document.createElement("span");
    counterSpan.style.cssText = "font-size:0.75em; color:var(--text-muted); white-space:nowrap;";

    progressBar.appendChild(titleSpan);
    progressBar.appendChild(barOuter);
    progressBar.appendChild(counterSpan);
    wrap.appendChild(progressBar);

    const card = document.createElement("div");
    card.style.cssText = "padding:10px 12px; background:#000; border-radius:6px; border:1px dashed #444; font-family:'Space Mono',monospace;";
    wrap.appendChild(card);

    function updateProgress() {
        const pct = Math.round((idx / (batch.length || 1)) * 100);
        barInner.style.width = pct + "%";
        counterSpan.textContent = `${idx} / ${batch.length}`;
    }

    function renderCard() {
        card.innerHTML = "";

        if (idx >= batch.length) {
            card.style.cssText = "padding:8px 12px; background:#000; border-radius:6px; border:1px dashed #444; text-align:center; font-size:0.82em; font-weight:700; font-family:'Space Mono',monospace;";
            card.textContent = `✅ ${title} — сессия завершена!`;
            updateProgress();
            return;
        }

        updateProgress();
        const t = batch[idx];

        const rawText = t.text.replace(/\[fails:: \d+\]/g, "").replace(/ 🗓️\d{4}-\d{2}-\d{2}/g, "").trim();
        const wordPart = rawText.replace(/<details>[\s\S]*?<\/details>/g, "").trim();
        const answerMatch = rawText.match(/<details>[\s\S]*?<\/summary>([\s\S]*?)<\/details>/);
        const answerText = answerMatch ? answerMatch[1].trim() : "—";

        const topRow = document.createElement("div");
        topRow.style.cssText = "display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:6px;";

        const wordDiv = document.createElement("div");
        wordDiv.style.cssText = "font-size:14px; font-weight:600; line-height:1.3; font-family: monospace;";
        wordDiv.innerHTML = wordPart.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");

        const showBtn = document.createElement("button");
        showBtn.textContent = "👁️";
        showBtn.title = "Показать ответ";
        showBtn.style.cssText = "background:#000; color:#fff; border:1px dashed #555; padding:2px 7px; border-radius:4px; cursor:pointer; font-size:11px; flex-shrink:0;";

        topRow.appendChild(wordDiv);
        topRow.appendChild(showBtn);
        card.appendChild(topRow);

        const answerDiv = document.createElement("div");
        answerDiv.style.cssText = `font-size:13px; color:${accentColor}; margin-bottom:7px; display:none; font-weight:600;`;
        answerDiv.textContent = `→ ${answerText}`;
        card.appendChild(answerDiv);

        showBtn.onclick = () => {
            const visible = answerDiv.style.display !== "none";
            answerDiv.style.display = visible ? "none" : "block";
            showBtn.textContent = visible ? "👁️" : "🙈";
        };

        const actionsDiv = document.createElement("div");
        actionsDiv.style.cssText = "display:flex; gap:6px;";

        async function processTask(isSuccess) {
            window._myWordCache[cacheKey].idx++;
            const failsMatch = t.text.match(/\[fails:: (\d+)\]/);
            let fails = failsMatch ? parseInt(failsMatch[1]) : 0;
            if (!isSuccess) fails++;
            let baseText = t.text.replace(/ 🗓️\d{4}-\d{2}-\d{2}/g, "");
            if (failsMatch) {
                baseText = baseText.replace(/\[fails:: \d+\]/, `[fails:: ${fails}]`);
            } else {
                baseText += ` [fails:: ${fails}]`;
            }
            const newText = baseText + ` 🗓️${todayStr}`;
            const oldLine = (t.completed ? "- [x] " : "- [ ] ") + t.text;
            const newLine = (isSuccess ? "- [x] " : "- [ ] ") + newText;
            
            t.text = newText;
            t.completed = isSuccess ? true : t.completed;
            
            await app.vault.process(tFile, data => data.replace(oldLine, newLine));
            idx = window._myWordCache[cacheKey].idx;
            renderCard();
        }

        const btnWin = document.createElement("button");
        btnWin.textContent = "✅ Знаю";
        btnWin.style.cssText = "flex:1; background:#000; color:#fff; border:1px solid #555; padding:6px; border-radius:4px; cursor:pointer; font-weight:700; font-size:11px; font-family:'Space Mono', monospace; text-transform:uppercase;";
        btnWin.onclick = () => processTask(true);

        const btnFail = document.createElement("button");
        btnFail.textContent = "❌ Ошибся";
        btnFail.style.cssText = "flex:1; background:#000; color:#e50914; border:1px solid #e50914; padding:6px; border-radius:4px; cursor:pointer; font-weight:700; font-size:11px; font-family:'Space Mono', monospace; text-transform:uppercase;";
        btnFail.onclick = () => processTask(false);

        actionsDiv.appendChild(btnWin);
        actionsDiv.appendChild(btnFail);
        card.appendChild(actionsDiv);
    }

    renderCard();
}

async function renderTaskSchema(parentEl) {
    function parseDateStr(val) {
        if (!val) return null;
        if (typeof val === 'string') {
            const s = val.trim().slice(0, 10);
            return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
        }
        if (val.toISODate && typeof val.toISODate === 'function') return val.toISODate();
        if (val.ts) return window.moment(val.ts).format("YYYY-MM-DD");
        if (val instanceof Date) return window.moment(val).format("YYYY-MM-DD");
        return null;
    }

    function getTimestamp(val) {
        if (!val) return 0;
        if (typeof val === 'number') return val;
        if (val.ts) return val.ts;
        if (val.toMillis && typeof val.toMillis === 'function') return val.toMillis();
        const str = parseDateStr(val);
        if (str) {
            const m = window.moment(str, "YYYY-MM-DD");
            if (m.isValid()) return m.valueOf();
        }
        return 0;
    }

    const rawPages = Array.from(dv.pages('"03_Knowledge/ЕГЭ/Русский/Номера"').where(p => p.type === "rus_schema"));
    if (rawPages.length === 0) return;

    const todayStr = window.moment().format("YYYY-MM-DD");

    let items = rawPages.map(p => {
        const num = Number(p.task_num);
        const dStr = parseDateStr(p.last_check);
        const isToday = (dStr === todayStr);
        let daysAgo = 9999;
        let lastCheckDisplay = "никогда";
        if (dStr) {
            const m = window.moment(dStr, "YYYY-MM-DD");
            if (m.isValid()) {
                lastCheckDisplay = m.format("DD.MM.YYYY");
                daysAgo = window.moment().startOf('day').diff(m.startOf('day'), 'days');
            }
        }
        return {
            page: p,
            num: num,
            dStr: dStr,
            ts: getTimestamp(p.last_check),
            isToday: isToday,
            daysAgo: daysAgo,
            lastCheckDisplay: lastCheckDisplay
        };
    }).sort((a, b) => a.num - b.num);

    const schemaContainer = document.createElement("div");
    schemaContainer.style.cssText = "margin-top: 14px; padding-top: 10px; border-top: 1px dashed #333;";
    parentEl.appendChild(schemaContainer);

    function render(requestedNum = null) {
        schemaContainer.innerHTML = "";

        const uncompleted = items.filter(it => !it.isToday).sort((a, b) => a.ts - b.ts || a.num - b.num);
        const completedCount = items.filter(it => it.isToday).length;

        let activeItem = null;
        if (requestedNum !== null) {
            activeItem = items.find(it => it.num === requestedNum);
        }
        if (!activeItem) {
            activeItem = uncompleted.length > 0 ? uncompleted[0] : items[0];
        }

        const taskNum = activeItem.num;
        const pageObj = activeItem.page;
        const schemaFile = app.vault.getAbstractFileByPath(pageObj.file.path);
        const allTasks = Array.from(pageObj.file.tasks.where(t => t.text.includes("http")));
        const openTasks = allTasks.filter(t => !t.completed);

        // 1. Компактный селектор номеров
        const navRow = document.createElement("div");
        navRow.style.cssText = "display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; font-family:'Space Mono', monospace; font-size: 0.8em; flex-wrap: wrap; gap: 4px;";
        navRow.innerHTML = `
            <span style="font-weight: 700; color: #fff; text-transform: uppercase;">Очередь номеров:</span>
            <span style="color: ${completedCount === items.length ? '#a6e3a1' : '#e50914'}; font-weight: bold;">
                ${completedCount === items.length ? '🏆 Все 11 номеров повторены!' : `Повторено: ${completedCount}/${items.length}`}
            </span>
        `;
        schemaContainer.appendChild(navRow);

        const pillRow = document.createElement("div");
        pillRow.style.cssText = "display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 8px;";
        items.forEach(it => {
            const btn = document.createElement("button");
            const isActive = (it.num === activeItem.num);
            btn.textContent = it.isToday ? `№${it.num} ✓` : `№${it.num}`;
            btn.style.cssText = `
                background: ${isActive ? "#e50914" : "#000"};
                color: ${isActive ? "#fff" : (it.isToday ? "#a6e3a1" : "#888")};
                border: 1px solid ${isActive ? "#e50914" : (it.isToday ? "#2e7d32" : "#333")};
                padding: 3px 6px; border-radius: 4px; cursor: pointer;
                font-size: 10px; font-weight: 700; font-family: 'Space Mono', monospace;
            `;
            btn.onclick = () => render(it.num);
            pillRow.appendChild(btn);
        });
        schemaContainer.appendChild(pillRow);

        // 2. Шапка активного номера
        const header = document.createElement("div");
        header.style.cssText = "padding: 8px 12px; background: #000; border: 1px dashed #444; border-radius: 6px; margin-bottom: 8px; font-family:'Space Mono', monospace;";

        const headerTop = document.createElement("div");
        headerTop.style.cssText = "display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;";

        const headerInfo = document.createElement("div");
        const daysText = activeItem.daysAgo === 9999 ? "никогда" : (activeItem.daysAgo === 0 ? "сегодня" : `${activeItem.daysAgo} дн. назад`);
        const statusHtml = activeItem.isToday 
            ? `<span style="font-size:0.75em; color:#a6e3a1; font-weight:bold; margin-left:6px;">● ПОВТОРЕНО СЕГОДНЯ</span>`
            : `<span style="font-size:0.75em; color:var(--text-muted); margin-left:6px;">(${daysText})</span>`;
        headerInfo.innerHTML = `<span style="font-size:0.95em; font-weight:700; text-transform:uppercase; color:#fff;">🔄 Задание ${taskNum}</span>${statusHtml}`;

        const headerBtns = document.createElement("div");
        headerBtns.style.cssText = "display:flex; gap:6px;";

        const schemaBtn = document.createElement("button");
        schemaBtn.textContent = "📐 Схема";
        schemaBtn.style.cssText = "background:#000; color:#fff; border:1px solid #555; padding:5px 8px; border-radius:4px; cursor:pointer; font-size:10px; font-weight:700; font-family:'Space Mono', monospace; text-transform:uppercase;";
        schemaBtn.onclick = () => {
            const canvasName = `Номер ${taskNum}.canvas`;
            const canvasFile = app.vault.getFiles().find(f => f.name === canvasName);
            if (canvasFile) app.workspace.getLeaf(false).openFile(canvasFile);
            else new Notice(`❌ Файл «${canvasName}» не найден`);
        };

        const doneBtn = document.createElement("button");
        doneBtn.textContent = activeItem.isToday ? "✓ Повторено" : "✅ Повторил";
        doneBtn.style.cssText = activeItem.isToday
            ? "background:#000; color:#a6e3a1; border:1px dashed #2e7d32; padding:5px 8px; border-radius:4px; cursor:pointer; font-size:10px; font-weight:700; font-family:'Space Mono', monospace; text-transform:uppercase;"
            : "background:#000; color:#fff; border:1px solid #e50914; padding:5px 8px; border-radius:4px; cursor:pointer; font-size:10px; font-weight:700; font-family:'Space Mono', monospace; text-transform:uppercase;";

        doneBtn.onclick = async () => {
            await app.fileManager.processFrontMatter(schemaFile, fm => { fm.last_check = todayStr; });
            activeItem.dStr = todayStr;
            activeItem.isToday = true;
            activeItem.daysAgo = 0;
            activeItem.lastCheckDisplay = window.moment().format("DD.MM.YYYY");
            activeItem.ts = window.moment().valueOf();
            new Notice(`✅ Задание ${taskNum} повторено!`);
            render(); // Автоматически переходит к следующему несданному номеру!
        };

        headerBtns.appendChild(schemaBtn);
        headerBtns.appendChild(doneBtn);
        headerTop.appendChild(headerInfo);
        headerTop.appendChild(headerBtns);
        header.appendChild(headerTop);
        schemaContainer.appendChild(header);

        // 3. Квизы
        const quizPool = openTasks.length > 0 ? openTasks : allTasks;
        const quizSlice = quizPool.slice(0, 4);

        if (quizSlice.length > 0) {
            const quizRow = document.createElement("div");
            quizRow.style.cssText = "display:flex; flex-wrap:wrap; gap:6px; margin-bottom:8px;";

            quizSlice.forEach((t, i) => {
                const uMatch = t.text.match(/https?:\/\/[^\s)]+/);
                const url = uMatch ? uMatch[0] : "#";
                const nameMatch = t.text.match(/\(([^)]+)\)/);
                const quizName = nameMatch ? nameMatch[1] : `Квиз #${i + 1}`;

                const btn = document.createElement("button");
                btn.textContent = t.completed ? `✅ ${quizName}` : `🚀 ${quizName}`;
                btn.style.cssText = t.completed
                    ? "background:#000; color:#555; border:1px dashed #333; padding:5px 8px; border-radius:4px; cursor:pointer; font-size:10px; font-family:'Space Mono', monospace; text-transform:uppercase;"
                    : "background:#000; color:#fff; border:1px solid #444; padding:5px 8px; border-radius:4px; cursor:pointer; font-size:10px; font-weight:700; font-family:'Space Mono', monospace; text-transform:uppercase;";

                btn.onclick = async () => {
                    window.open(url, "_blank");
                    if (!t.completed) {
                        await app.vault.process(schemaFile, data => data.replace("- [ ] " + t.text, "- [x] " + t.text));
                        btn.textContent = `✅ ${quizName}`;
                        btn.style.cssText = "background:#000; color:#555; border:1px dashed #333; padding:5px 8px; border-radius:4px; cursor:pointer; font-size:10px; font-family:'Space Mono', monospace; text-transform:uppercase;";
                    }
                };
                quizRow.appendChild(btn);
            });
            schemaContainer.appendChild(quizRow);
        }
    }

    render();
}

// ── Рендерим русский тренажер ───────────────────────────────
await makeWordBlock("03_Knowledge/ЕГЭ/Русский/00_Словник_Ударения.md", "🎯 Ударения", "#F59E0B", cardRus);
await makeWordBlock("03_Knowledge/ЕГЭ/Русский/01_Формы_Слов.md", "🧬 Формы слов", "#2563EB", cardRus);
await renderTaskSchema(cardRus);


// Карточка 6: Стена дисциплины
const card4 = document.createElement("div");
card4.className = "dash-card";
card4.innerHTML = `<h3>📅 Стена дисциплины</h3>`;
col2.appendChild(card4);

const weekPages = dv.pages('"02_Log/Week"');
const dateStats = {}; 

for (let p of weekPages) {
    if (!p.file || !p.file.tasks) continue;
    for (let t of p.file.tasks) {
        const subpath = getTaskHeaderStr(t);
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


// Карточка 7: График результатов
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
            <span style="color: #888888;">● Информатика (${infAvg})</span>
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
