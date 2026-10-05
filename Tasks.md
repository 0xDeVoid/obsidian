
```dataviewjs
const tasks = dv.pages().file.tasks.where(t => !t.completed);

const q1 = tasks.where(t => t.text.includes("#q1"));
const q2 = tasks.where(t => t.text.includes("#q2"));
const q3 = tasks.where(t => t.text.includes("#q3"));
const q4 = tasks.where(t => t.text.includes("#q4"));

dv.span(`<b style="color: #EF4444; font-size: 1.2em;">🔥 Q1: Срочно и Важно (#q1)</b><br><span style="font-size: 0.85em; color: var(--text-muted);">Сделать немедленно</span>`);
if (q1.length > 0) dv.taskList(q1, false);
else dv.paragraph("*Чисто*");

dv.span(`<br><b style="color: #10B981; font-size: 1.2em;">🎯 Q2: Важно, не срочно (#q2)</b><br><span style="font-size: 0.85em; color: var(--text-muted);">Запланировать в календарь</span>`);
if (q2.length > 0) dv.taskList(q2, false);
else dv.paragraph("*Чисто*");

dv.span(`<br><b style="color: #F59E0B; font-size: 1.2em;">⚡ Q3: Срочно, не важно (#q3)</b><br><span style="font-size: 0.85em; color: var(--text-muted);">Делегировать или автоматизировать</span>`);
if (q3.length > 0) dv.taskList(q3, false);
else dv.paragraph("*Чисто*");

dv.span(`<br><b style="color: var(--text-muted); font-size: 1.2em;">🗑️ Q4: Не срочно и не важно (#q4)</b><br><span style="font-size: 0.85em; color: var(--text-muted);">Игнорировать</span>`);
if (q4.length > 0) dv.taskList(q4, false);
else dv.paragraph("*Чисто*");
```

---
### 🧠 Повторение номеров (давно не вызывались) 

```dataviewjs
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚙️ НАСТРОЙКИ (меняй здесь)
const QUIZ_COUNT = 6; // Сколько квизов показывать за одно повторение
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const pages = dv.pages('"03_Knowledge/ЕГЭ/Русский/Номера"')
    .where(p => p.type === "rus_schema")
    .sort(p => p.task_num, "asc")
    .sort(p => {
        const lc = p.last_check;
        if (!lc) return -Infinity;
        return window.moment(lc, "YYYY-MM-DD").valueOf();
    }, "asc");

if (pages.length === 0) {
    dv.paragraph("❌ Нет файлов с `type: rus_schema`.");
    return;
}

const page = pages[0];
const taskNum = page.task_num;
const lastCheck = page.last_check
    ? window.moment(page.last_check, "YYYY-MM-DD").format("DD.MM.YYYY")
    : "никогда";
const daysAgo = page.last_check
    ? window.moment().diff(window.moment(page.last_check, "YYYY-MM-DD"), "days")
    : 9999;

const tFile = app.vault.getAbstractFileByPath(page.file.path);
const allTasks = Array.from(page.file.tasks.where(t => t.text.includes("http")));
const openTasks = allTasks.filter(t => !t.completed);

// ── Шапка блока ───────────────────────────────────────────────────────────────
const header = document.createElement("div");
header.style.cssText = "padding: 14px 16px; background: #000; border: 1px dashed #444; border-radius: 8px; margin-bottom: 12px; font-family:'Space Mono',monospace;";

const headerTop = document.createElement("div");
headerTop.style.cssText = "display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;";

const headerInfo = document.createElement("div");

const titleSpan = document.createElement("span");
titleSpan.style.cssText = "font-size:1.15em; font-weight:700; text-transform:uppercase; letter-spacing:1px;";
titleSpan.textContent = `🔄 Задание ${taskNum}`;

const subtitleSpan = document.createElement("span");
subtitleSpan.style.cssText = "font-size:0.85em; color:var(--text-muted); margin-left:10px;";
subtitleSpan.textContent = `последний раз: ${lastCheck} (${daysAgo} дн. назад)`;

headerInfo.appendChild(titleSpan);
headerInfo.appendChild(subtitleSpan);

const headerBtns = document.createElement("div");
headerBtns.style.cssText = "display:flex; gap:8px; flex-wrap:wrap;";

// Кнопка «Схема» — открывает canvas
const schemaBtn = document.createElement("button");
schemaBtn.textContent = "📐 Схема";
schemaBtn.style.cssText = "background:#000; color:#fff; border:1px solid #555; padding:8px 14px; border-radius:4px; cursor:pointer; font-size:12px; font-weight:700; font-family:'Space Mono',monospace; text-transform:uppercase;";
schemaBtn.onclick = () => {
    const canvasName = `Номер ${taskNum}.canvas`;
    const canvasFile = app.vault.getFiles().find(f => f.name === canvasName);
    if (canvasFile) {
        app.workspace.getLeaf(false).openFile(canvasFile);
    } else {
        new Notice(`❌ Файл «${canvasName}» не найден`);
    }
};

// Кнопка «Повторил» — обновляет last_check
const doneBtn = document.createElement("button");
doneBtn.textContent = "✅ Повторил";
doneBtn.style.cssText = "background:#000; color:#fff; border:1px solid #e50914; padding:8px 14px; border-radius:4px; cursor:pointer; font-size:12px; font-weight:700; font-family:'Space Mono',monospace; text-transform:uppercase;";
doneBtn.onclick = async () => {
    const today = window.moment().format("YYYY-MM-DD");
    await app.fileManager.processFrontMatter(tFile, fm => {
        fm.last_check = today;
    });
    new Notice(`✅ Задание ${taskNum}: last_check обновлён на ${today}`);
};

headerBtns.appendChild(schemaBtn);
headerBtns.appendChild(doneBtn);
headerTop.appendChild(headerInfo);
headerTop.appendChild(headerBtns);
header.appendChild(headerTop);
dv.container.appendChild(header);

// ── Квизы ─────────────────────────────────────────────────────────────────────
const quizPool = openTasks.length > 0 ? openTasks : allTasks;
const quizSlice = quizPool.slice(0, QUIZ_COUNT);

if (quizSlice.length === 0) {
    dv.paragraph("🔻 **Барабан пуст.** Добавь ссылки в файл задания.");
    return;
}

const quizLabel = document.createElement("div");
quizLabel.style.cssText = "font-size:0.85em; color:var(--text-muted); margin-bottom:6px;";
quizLabel.textContent = `🎯 Квизы (${quizSlice.length} из ${allTasks.length}):`;
dv.container.appendChild(quizLabel);

const quizRow = document.createElement("div");
quizRow.style.cssText = "display:flex; flex-wrap:wrap; gap:8px; margin-bottom:4px;";

quizSlice.forEach((t, i) => {
    const uMatch = t.text.match(/https?:\/\/[^\s)]+/);
    const url = uMatch ? uMatch[0] : "#";
    const nameMatch = t.text.match(/\(([^)]+)\)/);
    const quizName = nameMatch ? nameMatch[1] : `Квиз #${i + 1}`;

    const btn = document.createElement("button");
    btn.textContent = t.completed ? `✅ ${quizName}` : `🚀 ${quizName}`;
    btn.style.cssText = t.completed
        ? "background:#000; color:#666; border:1px dashed #444; padding:8px 14px; border-radius:4px; cursor:pointer; font-size:12px; font-family:'Space Mono',monospace; text-transform:uppercase;"
        : "background:#000; color:#fff; border:1px solid #555; padding:8px 14px; border-radius:4px; cursor:pointer; font-size:12px; font-weight:700; font-family:'Space Mono',monospace; text-transform:uppercase;";

    btn.onclick = async () => {
        window.open(url, "_blank");
        if (!t.completed) {
            await app.vault.process(tFile, data =>
                data.replace("- [ ] " + t.text, "- [x] " + t.text)
            );
            btn.textContent = `✅ ${quizName}`;
            btn.style.cssText = "background:#000; color:#666; border:1px dashed #444; padding:8px 14px; border-radius:4px; cursor:pointer; font-size:12px; font-family:'Space Mono',monospace; text-transform:uppercase;";
        }
    };

    quizRow.appendChild(btn);
});

dv.container.appendChild(quizRow);

// ── Словарь текущего задания ───────────────────────────────
// ⚙️ VOCAB_COUNT — сколько карточек из словаря показывать
const VOCAB_COUNT = 10;

// Карта: номер задания → пути к словарям (относительно vault root)
const VOCAB_MAP = {
    5:  ["03_Knowledge/ЕГЭ/Русский/Номера/Задание 5 (паронимы)/Словник паронимов"],
    7:  ["03_Knowledge/ЕГЭ/Русский/Номера/Задание 7 (формы слова)/Ошибки квизы"],
    8:  ["03_Knowledge/ЕГЭ/Русский/Номера/!!! Задание 8 (синтаксические нормы)/Ошибки в квизах"],
    9:  [],
    10: ["03_Knowledge/ЕГЭ/Русский/Номера/Задание 10 (приставки)/Словарь",
         "03_Knowledge/ЕГЭ/Русский/Номера/Задание 10 (приставки)/Ошибки квизы"],
    11: ["03_Knowledge/ЕГЭ/Русский/Номера/Задание 11 (Суффиксы)/словарь"],
    12: [],
    13: ["03_Knowledge/ЕГЭ/Русский/Номера/Задание 13 (НЕ и НИ)/Словарь"],
    15: ["03_Knowledge/ЕГЭ/Русский/Номера/Задание 15 (Н и НН)/Словник"],
    16: [],
    17: [],
    18: [],
};

const vocabPaths = VOCAB_MAP[taskNum] || [];

if (vocabPaths.length > 0) {
    // Собираем все задачи из всех словарей задания
    let vocabPool = [];
    for (const vPath of vocabPaths) {
        const vPage = dv.page(vPath);
        if (!vPage) continue;
        const tasks = (vPage.file && vPage.file.tasks) ? Array.from(vPage.file.tasks) : [];
        const open = tasks.filter(t => !t.completed);
        // Предпочитаем незакрытые; если всё закрыто — берём все
        vocabPool = vocabPool.concat(open.length > 0 ? open : tasks);
    }

    if (vocabPool.length > 0) {
        const todayStr = window.moment().format("YYYY-MM-DD");
        const cacheKey = `vocab_${taskNum}_${todayStr}_v3`;
        window._myVocabCache = window._myVocabCache || {};
        
        if (!window._myVocabCache[cacheKey]) {
            // Случайная выборка VOCAB_COUNT карточек
            const shuffled = [...vocabPool].sort(() => Math.random() - 0.5);
            window._myVocabCache[cacheKey] = {
                batch: shuffled.slice(0, VOCAB_COUNT).map(t => ({ text: t.text, path: t.path, completed: t.completed })),
                idx: 0
            };
        }
        
        const vocabBatch = window._myVocabCache[cacheKey].batch;
        let vIdx = window._myVocabCache[cacheKey].idx;

        // ── Разделитель ─────────────────────────────────────────
        const sep = document.createElement("div");
        sep.style.cssText = "border-top:1px solid var(--background-modifier-border); margin:12px 0 8px;";
        dv.container.appendChild(sep);

        // ── Прогресс + заголовок ────────────────────────────────
        const vocabWrap = document.createElement("div");
        vocabWrap.style.cssText = "margin-bottom:4px;";
        dv.container.appendChild(vocabWrap);

        const vocabProgress = document.createElement("div");
        vocabProgress.style.cssText = "display:flex; align-items:center; gap:8px; margin-bottom:6px;";

        const vocabTitle = document.createElement("span");
        vocabTitle.style.cssText = "font-size:0.82em; font-weight:700; color:#e50914; white-space:nowrap; font-family:'Space Mono',monospace; text-transform:uppercase;";
        vocabTitle.textContent = `📖 Словарь №${taskNum}`;

        const vBarOuter = document.createElement("div");
        vBarOuter.style.cssText = "flex:1; height:5px; background:var(--background-modifier-border); border-radius:3px; overflow:hidden;";
        const vBarInner = document.createElement("div");
        vBarInner.style.cssText = "height:100%; background:#e50914; border-radius:3px; transition:width 0.3s; width:0%;";
        vBarOuter.appendChild(vBarInner);

        const vCounter = document.createElement("span");
        vCounter.style.cssText = "font-size:0.78em; color:var(--text-muted); white-space:nowrap;";

        vocabProgress.appendChild(vocabTitle);
        vocabProgress.appendChild(vBarOuter);
        vocabProgress.appendChild(vCounter);
        vocabWrap.appendChild(vocabProgress);

        // ── Карточка ─────────────────────────────────────────────
        const vocabCard = document.createElement("div");
        vocabCard.style.cssText = "padding:10px 14px; background:#000; border-radius:8px; border:1px dashed #444; font-family:'Space Mono',monospace;";
        vocabWrap.appendChild(vocabCard);

        function renderVocabCard() {
            vocabCard.innerHTML = "";
            const pct = Math.round((vIdx / vocabBatch.length) * 100);
            vBarInner.style.width = pct + "%";
            vCounter.textContent = `${vIdx} / ${vocabBatch.length}`;

            if (vIdx >= vocabBatch.length) {
                vocabCard.style.cssText = "padding:10px 14px; background:#000; border-radius:8px; border:1px dashed #444; text-align:center; font-size:0.9em; font-weight:700; font-family:'Space Mono',monospace;";
                vocabCard.textContent = "✅ Словарь — сессия завершена!";
                return;
            }

            const t = vocabBatch[vIdx];
            const rawText = t.text
                .replace(/\[fails:: \d+\]/g, "")
                .replace(/ 🗓️\d{4}-\d{2}-\d{2}/g, "")
                .trim();

            // Извлекаем слово и ответ из <details>
            const wordPart = rawText.replace(/<details>[\s\S]*?<\/details>/g, "").trim();
            const answerMatch = rawText.match(/<details>[\s\S]*?<\/summary>([\s\S]*?)<\/details>/);
            const answerText = answerMatch ? answerMatch[1].trim() : "—";

            // Верхняя строка: вопрос + кнопка показать
            const topRow = document.createElement("div");
            topRow.style.cssText = "display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:6px;";

            const wordDiv = document.createElement("div");
            wordDiv.style.cssText = "font-size:15px; font-weight:500; line-height:1.3; font-family: monospace;";
            wordDiv.innerHTML = wordPart.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");

            const showBtn = document.createElement("button");
            showBtn.textContent = "👁️";
            showBtn.title = "Показать ответ";
            showBtn.style.cssText = "background:#000; color:#fff; border:1px dashed #555; padding:3px 8px; border-radius:4px; cursor:pointer; font-size:12px; flex-shrink:0; font-family:'Space Mono',monospace;";

            topRow.appendChild(wordDiv);
            topRow.appendChild(showBtn);
            vocabCard.appendChild(topRow);

            const answerDiv = document.createElement("div");
            answerDiv.style.cssText = "font-size:13px; color:#8B5CF6; margin-bottom:7px; display:none; font-weight:500;";
            answerDiv.innerHTML = answerText.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
            vocabCard.appendChild(answerDiv);

            showBtn.onclick = () => {
                const visible = answerDiv.style.display !== "none";
                answerDiv.style.display = visible ? "none" : "block";
                showBtn.textContent = visible ? "👁️" : "🙈";
            };

            const actionsDiv = document.createElement("div");
            actionsDiv.style.cssText = "display:flex; gap:6px;";

            async function processVocab(isSuccess) {
                const today = window.moment().format("YYYY-MM-DD");
                // Update state synchronously so dataview refresh gets the new idx
                window._myVocabCache[cacheKey].idx++;
                
                const vtFile = app.vault.getAbstractFileByPath(t.path);
                if (vtFile) {
                    const failsMatch = t.text.match(/\[fails:: (\d+)\]/);
                    let fails = failsMatch ? parseInt(failsMatch[1]) : 0;
                    if (!isSuccess) fails++;
                    let baseText = t.text.replace(/ 🗓️\d{4}-\d{2}-\d{2}/g, "");
                    if (failsMatch) {
                        baseText = baseText.replace(/\[fails:: \d+\]/, `[fails:: ${fails}]`);
                    } else {
                        baseText += ` [fails:: ${fails}]`;
                    }
                    const newText = baseText + ` 🗓️${today}`;
                    const oldLine = (t.completed ? "- [x] " : "- [ ] ") + t.text;
                    const newLine = (isSuccess ? "- [x] " : "- [ ] ") + newText;
                    
                    t.text = newText;
                    t.completed = isSuccess ? true : t.completed;
                    
                    await app.vault.process(vtFile, data => data.replace(oldLine, newLine));
                }
                vIdx = window._myVocabCache[cacheKey].idx;
                renderVocabCard();
            }

            const btnW = document.createElement("button");
            btnW.textContent = "✅ Знаю";
            btnW.style.cssText = "flex:1; background:#000; color:#fff; border:1px solid #555; padding:7px; border-radius:4px; cursor:pointer; font-weight:700; font-size:12px; font-family:'Space Mono',monospace; text-transform:uppercase;";
            btnW.onclick = () => processVocab(true);

            const btnF = document.createElement("button");
            btnF.textContent = "❌ Ошибся";
            btnF.style.cssText = "flex:1; background:#000; color:#e50914; border:1px solid #e50914; padding:7px; border-radius:4px; cursor:pointer; font-weight:700; font-size:12px; font-family:'Space Mono',monospace; text-transform:uppercase;";
            btnF.onclick = () => processVocab(false);

            actionsDiv.appendChild(btnW);
            actionsDiv.appendChild(btnF);
            vocabCard.appendChild(actionsDiv);
        }

        renderVocabCard();
    } else {
        const sep = document.createElement("div");
        sep.style.cssText = "border-top:1px solid var(--background-modifier-border); margin:12px 0 8px;";
        dv.container.appendChild(sep);
        const warn = document.createElement("div");
        warn.style.cssText = "padding:10px; background:#EF444422; border:1px solid #EF4444; border-radius:8px; font-size:0.9em; text-align:center;";
        warn.innerHTML = `⚠️ <b>Не удалось загрузить словари для задания ${taskNum}.</b><br><span style="font-size:0.85em; color:var(--text-muted);">Не найдены задачи в файлах:</span><br><ul style="text-align:left; font-size:0.8em; margin: 5px 0;">${vocabPaths.map(p => `<li>${p}</li>`).join("")}</ul><span style="font-size:0.85em; color:var(--text-muted);">Убедитесь, что файлы скачались на телефон и в них есть чекбоксы.</span>`;
        dv.container.appendChild(warn);
    }
} else {
    // ── Разделитель ─────────────────────────────────────────
    const sep = document.createElement("div");
    sep.style.cssText = "border-top:1px solid var(--background-modifier-border); margin:12px 0 8px;";
    dv.container.appendChild(sep);
    const noVocab = document.createElement("div");
    noVocab.style.cssText = "font-size:0.85em; color:var(--text-muted); text-align:center; margin-bottom:8px;";
    noVocab.textContent = `📌 Для задания ${taskNum} нет словаря с ошибками.`;
    dv.container.appendChild(noVocab);
}
```

```dataviewjs
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚙️ НАСТРОЙКИ
const DAILY_LIMIT = 15; // Слов за один день (для каждого блока)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ── Взвешенная случайная выборка ──────────────────────────
function weightedSample(pool, n) {
    const today = window.moment();
    const weighted = pool.map(t => {
        const failsMatch = t.text.match(/\[fails:: (\d+)\]/);
        const fails = failsMatch ? parseInt(failsMatch[1]) : 0;
        const dateMatch = t.text.match(/🗓️(\d{4}-\d{2}-\d{2})/);
        const days = dateMatch
            ? today.diff(window.moment(dateMatch[1], "YYYY-MM-DD"), "days")
            : 999;
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

// ── Флеш-карта: одна карточка за раз ─────────────────────
async function makeWordBlock(filePath, title, accentColor) {
    const tFile = app.vault.getAbstractFileByPath(filePath);
    if (!tFile) { dv.paragraph(`❌ Файл не найден: ${filePath}`); return; }

    const today = window.moment().format("YYYY-MM-DD");
    const page = dv.page(filePath);
    if (!page) {
        dv.paragraph(`⚠️ **Dataview не смог загрузить страницу:** ${filePath}. Возможно, индексация на телефоне еще не завершена.`);
        return;
    }

    const allTasks = (page.file && page.file.tasks) ? Array.from(page.file.tasks) : [];
    const openTasks = allTasks.filter(t => !t.completed);

    // Wrapper
    const wrap = document.createElement("div");
    wrap.style.cssText = "margin-bottom:12px;";
    dv.container.appendChild(wrap);

    // ── 100% победа ──────────────────────────────────────────
    if (allTasks.length > 0 && openTasks.length === 0) {
        const winDiv = document.createElement("div");
        winDiv.style.cssText = `display:flex; align-items:center; justify-content:space-between; padding:10px 14px; background:#000; border:1px dashed #444; border-radius:8px;`;
        const winText = document.createElement("span");
        winText.style.cssText = "font-size:0.9em; font-weight:600;";
        winText.textContent = `🏆 ${title} — всё выучено!`;
        const resetBtn = document.createElement("button");
        resetBtn.textContent = "🔄 2-й круг";
        resetBtn.style.cssText = "background:#000; color:#fff; border:1px solid #555; padding:5px 12px; border-radius:4px; cursor:pointer; font-size:11px; font-weight:700; font-family:'Space Mono',monospace; text-transform:uppercase;";
        resetBtn.onclick = async () => {
            await app.vault.process(tFile, data => data.replace(/- \[x\]/g, "- [ ]"));
        };
        winDiv.appendChild(winText);
        winDiv.appendChild(resetBtn);
        wrap.appendChild(winDiv);
        return;
    }

    // ── Суточная норма и Выборка с КЭШИРОВАНИЕМ ──────────────
    const processedToday = allTasks.filter(t => t.text.includes(`🗓️${today}`)).length;
    let remain = DAILY_LIMIT - processedToday;

    const cacheKey = `word_${title}_${today}_v3`;
    window._myWordCache = window._myWordCache || {};
    
    if (!window._myWordCache[cacheKey]) {
        if (remain < 0) remain = 0;
        const pool = openTasks.filter(t => !t.text.includes(`🗓️${today}`));
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
        doneDiv.style.cssText = `padding:10px 14px; background:#000; border:1px dashed #444; border-radius:8px; font-size:0.9em; font-weight:700; font-family:\'Space Mono\',monospace;`;
        doneDiv.textContent = `✅ ${title} — норма выполнена (${DAILY_LIMIT} слов)`;
        wrap.appendChild(doneDiv);
        return;
    }

    // ── Прогресс-строка ───────────────────────────────────────
    const progressBar = document.createElement("div");
    progressBar.style.cssText = "display:flex; align-items:center; gap:8px; margin-bottom:6px;";

    const titleSpan = document.createElement("span");
    titleSpan.style.cssText = `font-size:0.82em; font-weight:700; color:#e50914; white-space:nowrap; font-family:\'Space Mono\',monospace; text-transform:uppercase;`;
    titleSpan.textContent = title;

    const barOuter = document.createElement("div");
    barOuter.style.cssText = "flex:1; height:5px; background:var(--background-modifier-border); border-radius:3px; overflow:hidden;";
    const barInner = document.createElement("div");
    barInner.style.cssText = `height:100%; background:#e50914; border-radius:3px; transition:width 0.3s; width:0%;`;
    barOuter.appendChild(barInner);

    const counterSpan = document.createElement("span");
    counterSpan.style.cssText = "font-size:0.78em; color:var(--text-muted); white-space:nowrap;";

    progressBar.appendChild(titleSpan);
    progressBar.appendChild(barOuter);
    progressBar.appendChild(counterSpan);
    wrap.appendChild(progressBar);

    // ── Карточка ──────────────────────────────────────────────
    const card = document.createElement("div");
    card.style.cssText = `padding:10px 14px; background:#000; border-radius:8px; border:1px dashed #444; font-family:\'Space Mono\',monospace;`;
    wrap.appendChild(card);

    function updateProgress() {
        const pct = Math.round((idx / batch.length) * 100);
        barInner.style.width = pct + "%";
        counterSpan.textContent = `${idx} / ${batch.length}`;
    }

    function renderCard() {
        card.innerHTML = "";

        if (idx >= batch.length) {
            card.style.cssText = `padding:10px 14px; background:#000; border-radius:8px; border:1px dashed #444; text-align:center; font-size:0.9em; font-weight:700; font-family:\'Space Mono\',monospace;`;
            card.textContent = `✅ ${title} — сессия завершена!`;
            updateProgress();
            return;
        }

        updateProgress();
        const t = batch[idx];

        const rawText = t.text
            .replace(/\[fails:: \d+\]/g, "")
            .replace(/ 🗓️\d{4}-\d{2}-\d{2}/g, "")
            .trim();
        const wordPart = rawText.replace(/<details>[\s\S]*?<\/details>/g, "").trim();
        const answerMatch = rawText.match(/<details>[\s\S]*?<\/summary>([\s\S]*?)<\/details>/);
        const answerText = answerMatch ? answerMatch[1].trim() : "—";

        // Верхняя строка: слово + кнопка показать
        const topRow = document.createElement("div");
        topRow.style.cssText = "display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:6px;";

        const wordDiv = document.createElement("div");
        wordDiv.style.cssText = "font-size:15px; font-weight:500; line-height:1.3;";
        wordDiv.innerHTML = wordPart.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");

        const showBtn = document.createElement("button");
        showBtn.textContent = "👁️";
        showBtn.title = "Показать ответ";
        showBtn.style.cssText = "background:#000; color:#fff; border:1px dashed #555; padding:3px 8px; border-radius:4px; cursor:pointer; font-size:12px; flex-shrink:0; font-family:'Space Mono',monospace;";

        topRow.appendChild(wordDiv);
        topRow.appendChild(showBtn);
        card.appendChild(topRow);

        // Ответ (скрыт)
        const answerDiv = document.createElement("div");
        answerDiv.style.cssText = `font-size:13px; color:${accentColor}; margin-bottom:7px; display:none; font-weight:500;`;
        answerDiv.textContent = `→ ${answerText}`;
        card.appendChild(answerDiv);

        showBtn.onclick = () => {
            const visible = answerDiv.style.display !== "none";
            answerDiv.style.display = visible ? "none" : "block";
            showBtn.textContent = visible ? "👁️" : "🙈";
        };

        // Кнопки действий
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
            const newText = baseText + ` 🗓️${today}`;
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
        btnWin.style.cssText = "flex:1; background:#000; color:#fff; border:1px solid #555; padding:7px; border-radius:4px; cursor:pointer; font-weight:700; font-size:12px; font-family:'Space Mono',monospace; text-transform:uppercase;";
        btnWin.onclick = () => processTask(true);

        const btnFail = document.createElement("button");
        btnFail.textContent = "❌ Ошибся";
        btnFail.style.cssText = "flex:1; background:#000; color:#e50914; border:1px solid #e50914; padding:7px; border-radius:4px; cursor:pointer; font-weight:700; font-size:12px; font-family:'Space Mono',monospace; text-transform:uppercase;";
        btnFail.onclick = () => processTask(false);

        actionsDiv.appendChild(btnWin);
        actionsDiv.appendChild(btnFail);
        card.appendChild(actionsDiv);
    }

    renderCard();
}

// ── Запуск обоих блоков ────────────────────────────────────
await makeWordBlock(
    "03_Knowledge/ЕГЭ/Русский/00_Словник_Ударения.md",
    "🎯 Ударения",
    "#F59E0B"
);
await makeWordBlock(
    "03_Knowledge/ЕГЭ/Русский/01_Формы_Слов.md",
    "🧬 Формы слов",
    "#2563EB"
);
```



```dataviewjs
// Настройки карантина
const CAPACITY = 5; 
const REVIEW_DAY = 7; // Воскресенье
const REVIEW_HOUR = 18; // 18:00

// Вычисление дедлайна относительно текущего времени
let nextReview = window.moment().isoWeekday(REVIEW_DAY).hour(REVIEW_HOUR).minute(0).second(0);
if (window.moment().isAfter(nextReview)) {
    nextReview.add(1, 'weeks');
}

const inboxTasks = dv.pages().file.tasks.where(t => !t.completed && t.text.includes("#inbox"));
const count = inboxTasks.length;

// Цветовая индикация перегруза
let color = "#10B981"; // Зеленый (Норма)
if (count >= CAPACITY) color = "#EF4444"; // Красный (Перегруз)
else if (count >= CAPACITY * 0.7) color = "#F59E0B"; // Желтый (Внимание)

dv.span(`
<div style="background: #000; padding: 15px; border-radius: 8px; border: 1px dashed #444; margin-bottom: 20px; font-family:'Space Mono',monospace;">
    <div style="display: flex; justify-content: space-between; align-items: center;">
        <b style="color: ${color}; font-size: 1.1em;">📦 Буфер задач: ${count} / ${CAPACITY}</b>
        <span style="font-size: 0.9em; color: var(--text-muted);">Разбор: <b>${nextReview.format("DD.MM в HH:mm")}</b> (${nextReview.fromNow()})</span>
    </div>
</div>
`);

if (count > 0) {
    dv.taskList(inboxTasks, false);
} else {
    dv.paragraph("🔻 *Буфер пуст. Оперативная память свободна.*");
}
```
