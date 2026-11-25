/* Nothing Space · local edition. No network requests, dependencies or telemetry. */
const { Plugin, ItemView, Modal, Notice, FuzzySuggestModal, MarkdownRenderChild,
  PluginSettingTab, Setting, TFile, setIcon, parseYaml } = require('obsidian');

const HOME = 'nothing-space';
const NAV = 'nothing-space-nav';
const PULSE = 'nothing-space-pulse';
const DAY = '02_Log/Days/';
const WEEK = '02_Log/Week/';
const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const DEFAULTS = { openOnStartup: true };
const LIBRARY_SPACES = [
  { title:'ЕГЭ / 300', path:'03_Knowledge/ЕГЭ/', icon:'graduation-cap', note:'Русский, математика, информатика' },
  { title:'English', path:'03_Knowledge/English/', icon:'languages', note:'Грамматика, ошибки, словарь' },
  { title:'Код & системы', path:'03_Knowledge/Программирование/', icon:'terminal', note:'Go, Django, проекты и практика' },
  { title:'Мышление', path:'03_Knowledge/Мышление и Продуктивность/', icon:'brain', note:'Конспекты и упражнения' },
  { title:'Спорт', path:'03_Knowledge/Спорт/', icon:'dumbbell', note:'Программа и прогрессия' },
  { title:'Жизнь & проекты', path:'01_Domains/', icon:'orbit', note:'Личные области и направления' }
];
const VOCAB_MAP = {
  5:['03_Knowledge/ЕГЭ/Русский/Номера/Задание 5 (паронимы)/Словник паронимов'],
  7:['03_Knowledge/ЕГЭ/Русский/Номера/Задание 7 (формы слова)/Ошибки квизы'],
  8:['03_Knowledge/ЕГЭ/Русский/Номера/!!! Задание 8 (синтаксические нормы)/Ошибки в квизах'],
  9:['03_Knowledge/ЕГЭ/Русский/Номера/Задание 9 (корни)/Словарь'],
  10:['03_Knowledge/ЕГЭ/Русский/Номера/Задание 10 (приставки)/Словарь','03_Knowledge/ЕГЭ/Русский/Номера/Задание 10 (приставки)/Ошибки квизы'],
  11:['03_Knowledge/ЕГЭ/Русский/Номера/Задание 11 (Суффиксы)/словарь'],
  13:['03_Knowledge/ЕГЭ/Русский/Номера/Задание 13 (НЕ и НИ)/Словарь'],
  15:['03_Knowledge/ЕГЭ/Русский/Номера/Задание 15 (Н и НН)/Словник']
};
const fmt = n => Number(n || 0).toLocaleString('ru-RU', { maximumFractionDigits: 1 });
const pad = n => String(n).padStart(2, '0');
function dateKey(d = new Date()) { return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
function fromKey(s) { return new Date(`${s}T12:00:00`); }
function shift(s, n) { const d = fromKey(s); d.setDate(d.getDate()+n); return dateKey(d); }
function monday(s = dateKey()) { const d = fromKey(s); return shift(s, -((d.getDay()+6)%7)); }
function weekKey(s = dateKey()) {
  const a = fromKey(s), d = new Date(Date.UTC(a.getFullYear(), a.getMonth(), a.getDate()));
  d.setUTCDate(d.getUTCDate()+4-(d.getUTCDay()||7));
  const y = d.getUTCFullYear(), start = new Date(Date.UTC(y,0,1));
  return `${y}-W${pad(Math.ceil((((d-start)/86400000)+1)/7))}`;
}
function weekStart(key) {
  const m = /^(\d{4})-W(\d{2})$/.exec(key);
  if (!m) return monday();
  return shift(monday(`${m[1]}-01-04`), (Number(m[2])-1)*7);
}
function plain(s) {
  return String(s).replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2')
    .replace(/\[\[([^\]]+)\]\]/g, '$1').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`]/g, '').replace(/(?:^|\s)#(?:focus|q1)\b/g, '').trim();
}
function frontmatter(text) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(text);
  try { return match ? parseYaml(match[1]) || {} : {}; } catch (_) { return {}; }
}
function parseTasks(content, path) {
  const rows = content.split('\n'), result = [], headings = [];
  let fence = null, yaml = rows[0]?.trim() === '---', day = path.startsWith(DAY) ? path.slice(DAY.length,-3) : null;
  for (let i=0; i<rows.length; i++) {
    const row = rows[i].replace(/\r$/, '');
    if (yaml) { if (i>0 && row.trim() === '---') yaml = false; continue; }
    const f = /^\s*(`{3,}|~{3,})/.exec(row);
    if (f) { if (!fence) fence=f[1]; else if (f[1][0]===fence[0] && f[1].length>=fence.length) fence=null; continue; }
    if (fence) continue;
    const h = /^(#{1,6})\s+(.+)$/.exec(row);
    if (h) {
      while (headings.length && headings[headings.length-1].depth>=h[1].length) headings.pop();
      headings.push({ depth:h[1].length, title:h[2] });
      const dated = [...headings].reverse().map(x => x.title.match(/\d{4}-\d{2}-\d{2}/)?.[0]).find(Boolean);
      day = dated || (path.startsWith(DAY) ? path.slice(DAY.length,-3) : null);
      continue;
    }
    const m = /^(\s*(?:[-*+]|\d+[.)])\s+\[)([ xX/\-])\]\s+(.+)$/.exec(row);
    if (!m || !m[3].trim() || m[2]==='-') continue;
    const section = headings.map(h=>h.title).join(' / ');
    if (/спринт|чекаут|checkout/i.test(section)) continue;
    const text=m[3].trim();
    if (!plain(text)) continue;
    result.push({ path, row:i, raw:rows[i], text, label:plain(text), done:/x/i.test(m[2]),
      date:day, section, focus:/(?:^|\s)#(?:focus|q1)\b/.test(text), prefix:m[1] });
  }
  return result;
}
function setNumber(content, key, change) {
  const fm=frontmatter(content), current=Number(fm[key])||0, next=Math.round(change(current)*10000)/10000;
  if (!Number.isFinite(next)) throw new Error('Некорректное число');
  const block=/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(content);
  if (!block) return `---\n${key}: ${next}\n---\n${content}`;
  const re=new RegExp(`^${key}:[^\\r\\n]*`, 'm');
  const body=re.test(block[1]) ? block[1].replace(re,`${key}: ${next}`) : `${block[1]}\n${key}: ${next}`;
  return `---\n${body}\n---\n${content.slice(block[0].length)}`;
}
function appendSection(content, heading, text) {
  const lines=content.split('\n'), index=lines.findIndex(x=>x.trim()===heading);
  if (index<0) return `${content.trimEnd()}\n\n${heading}\n${text}\n`;
  const depth=/^#+/.exec(heading)[0].length;
  let end=index+1;
  while(end<lines.length && !new RegExp(`^#{1,${depth}}\\s`).test(lines[end])) end++;
  while(end>index+1 && !lines[end-1].trim()) end--;
  lines.splice(end,0,text);return lines.join('\n');
}
function dayContent(key) {
  const dow=DAYS[(fromKey(key).getDay()+6)%7], wk=weekKey(key);
  return `---\ntype: day\ncssclasses: [space-note]\ntags: [day]\nweek: "[[${WEEK}${wk}]]"\nwork_time: 0\nege_time: 0\ngym_weight: 0\nenglish_done: false\ncns_status: ok\n---\n# ${dow} / ${key}\n\n[[Dashboard|← SPACE]] · [[${WEEK}${wk}|План недели]]\n\n## План из недели\n![[${WEEK}${wk}#${dow} — ${key}]]\n\n### 🎯 Оперативные задачи\n\n## Заметки\n\n## Вечерний чекаут · 30 секунд\n- **Главный результат:**\n- **Что мешало:**\n- **Первый шаг завтра:**\n`;
}
function weekContent(key) {
  const start=weekStart(key);
  return `---\ntype: week\ncssclasses: [space-note]\ntags: [week]\nrus_score:\nmath_score:\ninf_score:\n---\n# Неделя ${key.split('-W')[1]} / ${start} — ${shift(start,6)}\n\n[[Dashboard|← SPACE]]\n\n> [!focus] Главное на неделю\n> Один результат, который сделает эту неделю полезной.\n\n## Ритм недели\n\n\`\`\`dataview\nTABLE work_time AS "Код, ч", ege_time AS "Учёба, ч", english_done AS "English"\nFROM "02_Log/Days"\nWHERE file.name >= "${start}" AND file.name <= "${shift(start,6)}"\nSORT file.name ASC\n\`\`\`\n\n## План по дням\n\n${DAYS.map((d,i)=>`#### ${d} — ${shift(start,i)}\n\n`).join('')}## Итоги\n- **Получилось:**\n- **Изменить на следующей неделе:**\n`;
}
function scoreValues(value) {
  if(value===null||value===undefined||value===''||typeof value==='boolean')return [];
  const parts=Array.isArray(value)?value.flatMap(scoreValues):typeof value==='string'?value.split(/[,;]+/).map(s=>s.trim()).filter(Boolean):[value];
  return parts.map(Number).filter(n=>Number.isFinite(n)&&n>=0);
}
function isoDate(value) {
  if(!value)return null;
  if(typeof value==='string'){const match=value.match(/^\d{4}-\d{2}-\d{2}/);return match?.[0]||null;}
  if(value instanceof Date&&!Number.isNaN(value.valueOf()))return dateKey(value);
  if(typeof value.toISODate==='function')return value.toISODate();
  return null;
}
function daysSince(value,today=dateKey()) {const key=isoDate(value);return key?Math.max(0,Math.round((fromKey(today)-fromKey(key))/86400000)):9999;}
function vocabParts(text) {
  const clean=String(text).replace(/\[fails:: \d+\]/g,'').replace(/ 🗓️\d{4}-\d{2}-\d{2}/g,'').trim();
  const answer=clean.match(/<details>[\s\S]*?<\/summary>([\s\S]*?)<\/details>/i)?.[1]?.trim()||'Ответ спрятан в источнике';
  return {prompt:clean.replace(/<details>[\s\S]*?<\/details>/gi,'').trim(),answer};
}
function quizLabel(text,index) { return String(text).match(/\(([^)]+)\)/)?.[1]||`КВИЗ #${index+1}`; }
function element(parent, tag, cls, text) {
  const el=document.createElement(tag);if(cls) el.className=cls;if(text!==undefined) el.textContent=String(text);parent.appendChild(el);return el;
}
function icon(parent,name,cls='ns-icon') { const el=element(parent,'span',cls);setIcon(el,name);return el; }
function button(parent,label,fn,cls='ns-button',glyph) {
  const el=element(parent,'button',cls);el.type='button';if(glyph) icon(el,glyph);element(el,'span','',label);
  el.addEventListener('click',()=>{Promise.resolve().then(()=>fn(el)).catch(report);});return el;
}
function report(err) { console.error('[Nothing Space]',err);new Notice(`SPACE: ${err.message||err}`); }
function label(parent,left,right) { const el=element(parent,'div','ns-label');element(el,'span','',left);if(right)element(el,'span','ns-muted',right);return el; }
function card(parent,cls='') { return element(parent,'section',`ns-card ${cls}`); }
function input(parent,placeholder,cls='ns-input') { const el=element(parent,'input',cls);el.type='text';el.placeholder=placeholder;el.setAttribute('aria-label',placeholder);return el; }
function linkButton(parent,text,path,plugin,cls='ns-text-link') { return button(parent,text,()=>plugin.open(path),cls,'arrow-up-right'); }

class NoteFinder extends FuzzySuggestModal {
  constructor(plugin) { super(plugin.app);this.plugin=plugin;this.setPlaceholder('Найти заметку, конспект или canvas…'); }
  getItems() { return this.app.vault.getFiles().filter(f=>['md','canvas','base'].includes(f.extension)&&!f.path.startsWith('System/Backups/')&&!f.path.startsWith('Archive/')); }
  getItemText(f) { return `${f.basename}   ·   ${f.parent?.path||''}`; }
  onChooseItem(f,e) { this.plugin.open(f.path,!!(e?.ctrlKey||e?.metaKey)); }
}
class CaptureModal extends Modal {
  constructor(plugin,mode='note') { super(plugin.app);this.plugin=plugin;this.mode=mode; }
  onOpen() {
    this.modalEl.addClass('ns-modal');const c=this.contentEl;
    label(c,'QUICK CAPTURE','LOCAL / FIRST');element(c,'h2','ns-modal-title','Освободи голову.');
    const tabs=element(c,'div','ns-segment');
    const task=button(tabs,'Задача на сегодня',()=>select('task'),'ns-segment-button');
    const note=button(tabs,'Мысль во входящие',()=>select('note'),'ns-segment-button');
    const field=element(c,'textarea','ns-capture-text');field.rows=5;field.setAttribute('aria-label','Текст записи');
    const hint=element(c,'p','ns-muted');
    const select=mode=>{this.mode=mode;task.classList.toggle('is-active',mode==='task');note.classList.toggle('is-active',mode==='note');field.placeholder=mode==='task'?'Один конкретный следующий шаг…':'Идея, вопрос, ссылка — запиши как есть.';hint.textContent=mode==='task'?'В план недели на сегодня; если его нет — в дневную заметку.':'Отдельная заметка в 00_Inbox. Можно разобрать позже.';};select(this.mode);
    const footer=element(c,'div','ns-modal-footer');element(footer,'span','ns-kbd','Ctrl / ⌘ + Enter');
    const save=button(footer,'Сохранить',async()=>{
      if(!field.value.trim()) {field.focus();return;}save.disabled=true;
      try { if(this.mode==='task') await this.plugin.addTask(field.value);else await this.plugin.capture(field.value);this.close(); }
      finally {save.disabled=false;}
    },'ns-button ns-primary','arrow-up-right');
    field.addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();save.click();}});field.focus();
  }
  onClose() { this.contentEl.empty(); }
}
class SpaceView extends ItemView {
  constructor(leaf,plugin,type) { super(leaf);this.plugin=plugin;this.type=type; }
  getViewType() { return this.type; }
  getDisplayText() { return this.type===HOME?'SPACE':this.type===NAV?'Навигация':'Пульс'; }
  getIcon() { return this.type===HOME?'circle-dot':this.type===NAV?'panels-left-bottom':'activity'; }
  async onOpen() {
    this.contentEl.empty();this.contentEl.addClass('ns-view');
    this.ui=new SpaceUI(this.contentEl,this.plugin,this.type);this.plugin.interfaces.add(this.ui);await this.ui.refresh();
  }
  async onClose() { this.plugin.interfaces.delete(this.ui);if(this.ui)this.ui.destroyed=true; }
}
class InlineSpace extends MarkdownRenderChild {
  constructor(el,plugin) {super(el);this.plugin=plugin;}
  onload() {this.ui=new SpaceUI(this.containerEl,this.plugin,HOME);this.plugin.interfaces.add(this.ui);this.ui.refresh().catch(report);}
  onunload() {this.plugin.interfaces.delete(this.ui);this.ui.destroyed=true;}
}

class SpaceUI {
  constructor(root,plugin,type) {this.root=root;this.p=plugin;this.type=type;this.tab='overview';this.taskFilter='today';this.generation=0;this.libraryQuery='';this.libraryMode='catalog';this.libraryFolder='';this.activeReviewNum=null;this.vocabState=new Map();}
  async refresh() {
    const generation=++this.generation;
    const data=await this.p.snapshot();if(this.destroyed||generation!==this.generation)return;
    const focus=this.root.contains(document.activeElement)?document.activeElement:null;
    const field=focus?.dataset?.nsField, value=focus?.value, start=focus?.selectionStart;
    const draft=this.root.querySelector('[data-ns-field="task"]')?.value;
    const scroll=this.root.scrollTop;
    this.root.replaceChildren();this.root.classList.add('ns-app');this.root.classList.toggle('ns-sidebar',this.type!==HOME);
    if(this.type===NAV)this.navigation(data);else if(this.type===PULSE)this.pulse(data);else this.dashboard(data);
    if(draft){const task=this.root.querySelector('[data-ns-field="task"]');if(task)task.value=draft;}
    if(field) {const target=this.root.querySelector(`[data-ns-field="${field}"]`);if(target){target.value=value;target.focus({preventScroll:true});if(start!==null)target.setSelectionRange(start,start);}}
    this.root.scrollTop=scroll;this.p.paintClock();
  }
  go(tab) {this.tab=tab;return this.refresh();}
  dashboard(d) {
    const shell=element(this.root,'div','ns-shell');
    const mast=element(shell,'header','ns-masthead');
    const brand=element(mast,'div','ns-brand');element(brand,'i','ns-led');element(brand,'span','','NOTHING / SPACE');
    const controls=element(mast,'div','ns-mast-controls');
    button(controls,'Найти заметку',()=>new NoteFinder(this.p).open(),'ns-search','search');
    button(controls,'Захватить',()=>new CaptureModal(this.p).open(),'ns-button ns-primary','plus');
    const tabs=element(shell,'nav','ns-main-tabs');tabs.setAttribute('aria-label','Разделы SPACE');
    [['overview','Обзор','01'],['week','Неделя','02'],['library','Библиотека','03']].forEach(([tab,title,n])=>{
      const b=button(tabs,title,()=>this.go(tab),`ns-main-tab ${this.tab===tab?'is-active':''}`);element(b,'small','',n);b.setAttribute('aria-current',this.tab===tab?'page':'false');
    });
    const stamp=element(tabs,'span','ns-date-stamp',new Date().toLocaleDateString('ru-RU',{day:'numeric',month:'long',weekday:'short'}));
    if(this.tab==='overview')this.overview(shell,d);else if(this.tab==='week')this.week(shell,d);else this.library(shell,d);
    const footer=element(shell,'footer','ns-footer');element(footer,'span','','LESS NOISE. MORE MEANING.');
    button(footer,'Как это работает ↗',()=>this.p.open('System/Nothing Space/Начни здесь.md'),'ns-footer-link');
    element(footer,'span','','0xDeVoid / LOCAL EDITION');
  }
  overview(shell,d) {
    const hero=element(shell,'div','ns-hero-grid');
    const welcome=card(hero,'ns-hero');
    label(welcome,'YOUR MIND, AT EASE.','VOL. 01 / PERSONAL OS');
    element(welcome,'h1','ns-hero-title','MAKE\nSPACE.');
    const lower=element(welcome,'div','ns-hero-bottom');
    element(lower,'p','',`${new Date().getHours()<12?'Доброе утро':new Date().getHours()<18?'Добрый день':'Добрый вечер'}, Влад.\nВыбери главное. Остальное подождёт.`);
    button(lower,'Открыть день',()=>this.p.openDay(),'ns-button ns-hero-button','arrow-up-right');
    const orbit=element(welcome,'div','ns-orbit');orbit.setAttribute('aria-hidden','true');for(let i=0;i<4;i++)element(orbit,'i',`ns-orbit-ring ring-${i}`);element(orbit,'b','ns-orbit-dot');
    const today=card(hero,'ns-today');label(today,'TODAY / В ФОКУСЕ',DAYS[(fromKey(d.today).getDay()+6)%7].toUpperCase());
    const done=d.todayTasks.filter(t=>t.done).length, total=d.todayTasks.length;
    const number=element(today,'div','ns-today-number');element(number,'strong','',pad(done));element(number,'span','',`/ ${pad(total)}`);
    element(today,'p','ns-today-caption',total?(done===total?'Всё намеченное сделано.':'закрыто задач на сегодня'):'Начни с одной задачи.');
    const track=element(today,'div','ns-progress');element(track,'i','').style.width=`${total?100*done/total:0}%`;
    const preview=d.todayTasks.find(t=>!t.done);
    element(today,'div','ns-next-label','СЛЕДУЮЩИЙ ШАГ');element(today,'div','ns-next-task',preview?preview.label:'Добавь то, что действительно важно.');
    const stats=element(today,'div','ns-today-stats');element(stats,'span','',`${fmt(d.todayFM.ege_time)} ч · учёба`);element(stats,'span','',`${fmt(d.todayFM.work_time)} ч · код`);
    const grid=element(shell,'div','ns-work-grid');this.tasks(grid,d);this.review(grid,d);
    const bottom=element(shell,'div','ns-bottom-grid');this.activity(bottom,d);this.launchpad(bottom,d);
    const recent=card(shell,'ns-recent');const h=label(recent,'CONTINUE / ПРОДОЛЖИТЬ');button(h,'Вся библиотека',()=>this.go('library'),'ns-text-link','arrow-up-right');
    const list=element(recent,'div','ns-recent-grid');
    d.recent.slice(0,3).forEach(f=>{
      const b=button(list,f.basename,()=>this.p.open(f.path),'ns-recent-item','file-text');element(b,'small','',f.parent?.path.replace('03_Knowledge/','')||'Заметки');
    });
    if(!d.recent.length)element(list,'p','ns-muted','Здесь появятся твои последние конспекты.');
  }
  tasks(parent,d) {
    const c=card(parent,'ns-tasks');const head=label(c,'01 / ОДИН ШАГ ЗА ДРУГИМ');button(head,'План ↗',()=>this.p.openWeek(),'ns-text-link');
    const tabs=element(c,'div','ns-segment');[['today','Сегодня'],['week','На неделе'],['review','Повторение']].forEach(([key,name])=>button(tabs,name,()=>{this.taskFilter=key;return this.refresh();},`ns-segment-button ${key===this.taskFilter?'is-active':''}`));
    if(this.taskFilter==='review'){this.reviewQueue(c,d);return;}
    const tasks=this.taskFilter==='today'?d.todayTasks:this.taskFilter==='week'?d.weekTasks:d.focusTasks;
    const pending=tasks.filter(t=>!t.done),done=tasks.filter(t=>t.done);
    const list=element(c,'div','ns-task-list');
    if(!pending.length){const empty=element(list,'div','ns-empty');icon(empty,'check-check');element(empty,'strong','',tasks.length?'План выполнен.':'Здесь есть место для главного.');element(empty,'span','',tasks.length?'Можно выдохнуть или выбрать следующий шаг.':'Добавь задачу в строке ниже.');}
    pending.slice(0,9).forEach(t=>this.taskRow(list,t));
    if(pending.length>9)button(list,`Ещё ${pending.length-9} в плане недели ↗`,()=>this.p.openWeek(),'ns-text-link');
    if(done.length){const details=element(c,'details','ns-completed');element(details,'summary','',`Готово · ${done.length}`);done.forEach(t=>this.taskRow(details,t));}
    const form=element(c,'form','ns-task-form');
    const field=input(form,'Добавить задачу на сегодня…');field.dataset.nsField='task';
    const add=button(form,'',()=>{},'ns-add-task','plus');add.setAttribute('aria-label','Добавить задачу');add.type='submit';
    form.addEventListener('submit',async e=>{e.preventDefault();const value=field.value.trim();if(!value||add.disabled)return;add.disabled=true;field.value='';
      try {await this.p.addTask(value);this.taskFilter='today';await this.refresh();}catch(err){const current=this.root.querySelector('[data-ns-field="task"]');if(current&&!current.value)current.value=value;report(err);}finally{add.disabled=false;}});
  }
  taskRow(parent,t) {
    const row=element(parent,'div',`ns-task ${t.done?'is-done':''}`);
    const check=element(row,'input','ns-checkbox');check.type='checkbox';check.checked=t.done;check.setAttribute('aria-label',`Выполнено: ${t.label}`);
    check.addEventListener('change',async()=>{check.disabled=true;try{await this.p.toggleTask(t,check.checked);}catch(err){check.checked=t.done;report(err);}finally{check.disabled=false;}});
    const b=button(row,t.label,()=>this.p.open(t.path,false,t.row),'ns-task-title');b.title=`Открыть источник · ${t.path}`;
    const hint=t.date===dateKey()?'↗':t.date?.slice(5).split('-').reverse().join('.')||'↗';
    element(row,'span','ns-task-origin',hint);
  }
  reviewQueue(parent,d) {
    const queue=element(parent,'div','ns-review-queue');
    label(queue,`${d.reviewDoneToday} ИЗ ${d.reviewItems.length} ПОВТОРЕНО СЕГОДНЯ`,'РУССКИЙ / РОТАЦИЯ');
    if(!d.reviewItems.length){element(queue,'p','ns-empty','В очереди пока нет заданий с type: rus_schema.');return;}
    d.reviewItems.forEach(item=>{
      const row=element(queue,'div',`ns-review-row ${item.last_check===d.today?'is-done':''} ${item.num===this.activeReviewNum?'is-active':''}`);
      const dot=element(row,'i','ns-review-dot');
      const title=button(row,`№${item.num} · ${item.title}`,()=>{this.activeReviewNum=item.num;return this.refresh();},'ns-review-row-title');
      element(row,'span','ns-review-age',item.last_check===d.today?'сегодня':item.daysAgo===9999?'никогда':`${item.daysAgo} дн.`);
      if(item.quizTotal)element(row,'span','ns-review-quiz',`${item.quizOpen}/${item.quizTotal} квизов`);
    });
    button(queue,'Открыть Tasks.md ↗',()=>this.p.open('Tasks.md'),'ns-text-link');
  }
  review(parent,d) {
    const c=card(parent,'ns-review');label(c,'02 / ПОВТОРЕНИЕ МАТЕРИАЛА',`${d.reviewDoneToday}/${d.reviewItems.length} СЕГОДНЯ`);
    const item=d.reviewItems.find(x=>x.num===this.activeReviewNum)||d.reviewItems.find(x=>x.last_check!==d.today)||d.reviewItems[0];
    if(!item){element(c,'div','ns-review-empty','Очередь чистая. Добавь в неделю следующий блок подготовки.');button(c,'Открыть Tasks.md',()=>this.p.open('Tasks.md'),'ns-button','arrow-up-right');return;}
    this.activeReviewNum=item.num;
    element(c,'div','ns-review-kicker',`RUSSIAN / №${item.num}`);
    element(c,'h2','ns-review-title',item.title);
    element(c,'p','ns-review-age',item.last_check===d.today?'Повторено сегодня. Следующий круг можно оставить на завтра.':item.daysAgo===9999?'Ещё не повторялось.':'Последний вызов: '+item.daysAgo+' дн. назад.');
    const bar=element(c,'div','ns-review-progress');element(bar,'i','').style.width=`${d.reviewItems.length?100*d.reviewDoneToday/d.reviewItems.length:0}%`;
    const meta=element(c,'div','ns-review-meta');element(meta,'span','',`${item.quizOpen}/${item.quizTotal} квизов открыто`);element(meta,'span','',item.canvas?'есть схема':'схема не найдена');
    const actions=element(c,'div','ns-review-actions');
    button(actions,'Теория',()=>this.p.open(item.path),'ns-button ns-primary','book-open');
    if(item.canvas)button(actions,'Схема',()=>this.p.open(item.canvas),'ns-button','layout-dashboard');
    const done=button(actions,item.last_check===d.today?'✓ Сегодня':'Повторил',async()=>{this.activeReviewNum=d.reviewItems.find(x=>x.num!==item.num&&x.last_check!==d.today)?.num||item.num;await this.p.markReview(item);},'ns-button ns-review-done','check');done.disabled=item.last_check===d.today;
    if(item.quizzes.length){const q=element(c,'div','ns-review-material');label(q,`🎯 КВИЗЫ (${item.quizOpen} ИЗ ${item.quizTotal})`,'ОТКРОЙ И ПРОЙДИ');const row=element(q,'div','ns-quiz-row');item.quizzes.slice(0,6).forEach((quiz,i)=>button(row,`${quiz.done?'✓':'↗'} ${quizLabel(quiz.text,i)}`,()=>this.p.openQuiz(item,quiz),`ns-quiz-button ${quiz.done?'is-done':''}`));}
    if(item.vocab.length){const key=`${item.num}:${d.today}`,state=this.vocabState.get(key)||{index:0,batch:item.vocab.slice(0,10)};this.vocabState.set(key,state);const v=element(c,'div','ns-vocab-material');label(v,`📖 КАРТОЧКИ · ЗАДАНИЕ ${item.num}`,`${Math.min(state.index,state.batch.length)} / ${state.batch.length}`);const progress=element(v,'div','ns-vocab-progress');element(progress,'i','').style.width=`${state.batch.length?100*Math.min(state.index,state.batch.length)/state.batch.length:0}%`;if(state.index>=state.batch.length)element(v,'p','ns-vocab-complete','Словник закрыт на сегодня. Красиво.');else {const current=state.batch[state.index],parts=vocabParts(current.text),face=element(v,'div','ns-vocab-card');element(face,'strong','ns-vocab-prompt',parts.prompt||current.label);const answer=element(face,'div','ns-vocab-answer');answer.textContent=parts.answer;answer.hidden=true;button(face,'◉ Показать ответ',()=>{answer.hidden=!answer.hidden;},'ns-vocab-reveal');const va=element(v,'div','ns-vocab-actions');button(va,'✓ ЗНАЮ',()=>this.p.processVocab(item,current,true),'ns-vocab-button ns-vocab-know');button(va,'✕ ОШИБСЯ',()=>this.p.processVocab(item,current,false),'ns-vocab-button ns-vocab-fail');}}
    element(c,'p','ns-footnote','Одна тема за раз. Открой теорию, реши квиз и отметь повторение. Источник остаётся в `Tasks.md`.');
  }
  activity(parent,d) {
    const c=card(parent,'ns-activity');label(c,'03 / SMALL STEPS ADD UP','18 НЕДЕЛЬ');
    const summary=element(c,'div','ns-activity-summary');element(summary,'strong','',String(d.activeDays));element(summary,'span','','активных дней\nза последние 126 дней');
    const wrap=element(c,'div','ns-heatmap-wrap'),heat=element(wrap,'div','ns-heatmap');
    const end=d.today, start=shift(end,-125);
    for(let i=0;i<126;i++) {
      const key=shift(start,i),s=d.activity[key]||{done:0,hours:0,english:false,gym:0};
      const active=s.done+s.hours*2+Number(s.english)+Number(s.gym>0),level=active<=0?0:active<2?1:active<4?2:active<7?3:4;
      const cell=button(heat,'',()=>this.p.openDay(key),`ns-heat-cell level-${level}${key===end?' is-today':''}`);
      cell.title=`${key} · выполнено: ${s.done} · учёба и код: ${fmt(s.hours)} ч${s.english?' · English':''}${s.gym>0?' · тренировка':''}`;
      cell.setAttribute('aria-label',cell.title);
    }
    const legend=element(c,'div','ns-heat-legend');element(legend,'span','',fromKey(start).toLocaleDateString('ru-RU',{day:'numeric',month:'short'}));
    const levels=element(legend,'span','ns-legend-levels');element(levels,'span','','меньше');for(let i=0;i<5;i++)element(levels,'i',`level-${i}`);element(levels,'span','','больше');
    element(c,'p','ns-footnote','Выполненные задачи, часы учёбы и кода, English и тренировки. Нажми на день, чтобы открыть его.');
  }
  launchpad(parent,d) {
    const c=card(parent,'ns-launchpad');label(c,'04 / ТВОИ ПРОСТРАНСТВА');
    const rows=[['ЕГЭ / 300','Теория, практика, ошибки','graduation-cap','03_Knowledge/ЕГЭ/'],['English','Говорить, понимать, пробовать','languages','03_Knowledge/English/'],['Код & системы','Идеи становятся работающими','terminal','03_Knowledge/Программирование/']];
    rows.forEach(([title,sub,glyph,path],i)=>{const b=button(c,'',()=>this.showLibrary(path),'ns-space-row');element(b,'span','ns-space-number',pad(i+1));const text=element(b,'span','ns-space-text');element(text,'strong','',title);element(text,'small','',sub);icon(b,glyph);});
    const more=element(c,'div','ns-space-more');button(more,'Входящие',()=>this.showLibrary('00_Inbox/'),'ns-text-link','inbox');button(more,'Случайная заметка',()=>this.p.randomNote(),'ns-text-link','shuffle');
  }
  showLibrary(path='') {this.libraryFolder=path;this.libraryMode=path==='00_Inbox/'?'inbox':'catalog';this.tab='library';return this.refresh();}
  week(shell,d) {
    const header=element(shell,'div','ns-page-heading');element(header,'span','ns-eyebrow',`WEEK ${weekKey().split('-W')[1]} / ${new Date().getFullYear()}`);element(header,'h1','ns-page-title','Меньше планов.\nБольше сделанного.');
    button(header,'Редактировать план недели',()=>this.p.openWeek(),'ns-button','arrow-up-right');
    const stats=element(shell,'div','ns-week-metrics');
    [[fmt(d.weekEge),'часов учёбы'],[fmt(d.weekWork),'часов кода'],[d.weekEnglish,'дней English'],[d.weekTasks.filter(t=>t.done).length,'закрытых задач']].forEach(([n,title])=>{const c=card(stats);element(c,'strong','ns-metric-number',String(n));element(c,'span','ns-muted',title);});
    this.trajectory(shell,d);
    const grid=element(shell,'div','ns-week-grid');const start=monday();
    DAYS.forEach((name,i)=>{const key=shift(start,i),tasks=d.weekTasks.filter(t=>t.date===key),c=card(grid,`ns-week-day ${key===d.today?'is-today':''}`);
      label(c,`${name.toUpperCase()} / ${key.slice(8)}`,key===d.today?'СЕГОДНЯ':`${tasks.filter(t=>t.done).length}/${tasks.length}`);
      if(!tasks.length)element(c,'p','ns-week-empty','Свободное пространство.');tasks.forEach(t=>this.taskRow(c,t));
      button(c,'Открыть день ↗',()=>this.p.openDay(key),'ns-text-link');});
  }
  trajectory(parent,d) {
    const c=card(parent,'ns-trajectory');label(c,'TRAJECTORY / ПРОБНИКИ','ЗАПИСИ ИЗ ПЛАНОВ НЕДЕЛЬ');
    const keys=[['rus_score','Русский','#f04e59'],['math_score','Математика','#e8e6df'],['inf_score','Информатика','#929cae']];
    if(!d.scores.length){element(c,'p','ns-score-empty','Здесь появится твоя траектория.');element(c,'p','ns-footnote','Заполни rus_score, math_score и inf_score в свойствах недельного плана. Можно записать одно число или список результатов.');return;}
    const summary=element(c,'div','ns-score-summary');
    for(const [key,name,color] of keys){
      const values=d.scores.filter(p=>p.values[key]!==undefined),last=values.at(-1),prev=values.at(-2);
      const b=button(summary,'',()=>last&&this.p.open(last.path),'ns-score-subject');b.disabled=!last;
      const title=element(b,'span','ns-score-name');element(title,'i','').style.background=color;element(title,'span','',name);
      element(b,'strong','',last?fmt(last.values[key]):'—');
      const delta=last&&prev?last.values[key]-prev.values[key]:null;
      element(b,'small','',last?`${last.week}${delta!==null?` · ${delta>0?'+':''}${fmt(delta)}`:''}`:'Нет записей');
      b.title=last?'Открыть источник результата':'В свойствах недели пока нет результата';
    }
    const points=d.scores.slice(-8),max=Math.max(100,...points.flatMap(p=>Object.values(p.values))),w=760,h=164,left=30,right=20,top=12,bottom=26;
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox',`0 0 ${w} ${h}`);svg.setAttribute('class','ns-score-chart');svg.setAttribute('role','img');svg.setAttribute('aria-label','Результаты пробников по последним восьми заполненным неделям');c.appendChild(svg);
    const node=(tag,attrs,text)=>{const e=document.createElementNS(svg.namespaceURI,tag);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,String(v));if(text!==undefined)e.textContent=text;svg.appendChild(e);return e;};
    const x=i=>points.length===1?(w+left-right)/2:left+i*(w-left-right)/(points.length-1),y=value=>h-bottom-value/max*(h-top-bottom);
    for(const v of [0,max/2,max]){node('line',{x1:left,y1:y(v),x2:w-right,y2:y(v),class:'ns-chart-grid'});node('text',{x:0,y:y(v)+3,class:'ns-chart-label'},fmt(v));}
    points.forEach((p,i)=>node('text',{x:x(i),y:h-5,'text-anchor':'middle',class:'ns-chart-label'},p.week.slice(5)));
    for(const [key,name,color] of keys){
      const values=points.map((p,i)=>({p,i,value:p.values[key]})).filter(p=>p.value!==undefined);
      node('polyline',{points:values.map(p=>`${x(p.i)},${y(p.value)}`).join(' '),stroke:color,'stroke-width':2,fill:'none','stroke-linejoin':'round','stroke-linecap':'round'});
      values.forEach(p=>{const point=node('circle',{cx:x(p.i),cy:y(p.value),r:3.5,fill:color,stroke:'#191a1d','stroke-width':2});const title=document.createElementNS(svg.namespaceURI,'title');title.textContent=`${name} · ${p.p.week}: ${fmt(p.value)}`;point.appendChild(title);});
    }
    element(c,'p','ns-footnote','Если в неделе несколько результатов, показано их среднее. Нажми на предмет, чтобы открыть последнюю запись.');
  }
  library(shell,d) {
    const header=element(shell,'div','ns-page-heading');element(header,'span','ns-eyebrow','LIBRARY / CONNECT THE DOTS');element(header,'h1','ns-page-title','Всё, что ты\nуже знаешь.');
    const search=input(header,'Фильтр по названию или папке…','ns-input ns-library-search');search.dataset.nsField='library';search.value=this.libraryQuery;
    const tabs=element(shell,'div','ns-library-tabs');
    [['catalog','Каталог'],['recent','Недавние'],['inbox','Входящие']].forEach(([key,title])=>button(tabs,title,()=>{this.libraryMode=key;this.libraryFolder=key==='inbox'?'00_Inbox/':'';return this.refresh();},`ns-chip ${this.libraryMode===key?'is-active':''}`));
    const body=element(shell,'div','ns-library-body');
    const files=d.library;
    const fileRow=(parent,f)=>{const b=button(parent,'',()=>this.p.open(f.path),'ns-library-item');icon(b,f.extension==='canvas'?'layout-dashboard':'file-text');const text=element(b,'span','ns-library-text');element(text,'strong','',f.basename);element(text,'small','',f.parent?.path||'');element(b,'span','ns-library-kind',f.extension.toUpperCase());icon(b,'arrow-up-right');};
    const renderFiles=(parent,items,caption)=>{label(parent,`${items.length} МАТЕРИАЛОВ`,caption);if(!items.length)element(parent,'p','ns-empty','Здесь пока тихо. Попробуй другой раздел.');items.slice(0,80).forEach(f=>fileRow(parent,f));if(items.length>80)element(parent,'p','ns-footnote','Показаны первые 80. Уточни фильтр, чтобы найти нужное.');};
    const folderCards=(parent,prefix)=>{
      const children=new Map();
      files.filter(f=>f.path.startsWith(prefix)).forEach(f=>{const rel=f.path.slice(prefix.length),slash=rel.indexOf('/');if(slash>0){const name=rel.slice(0,slash),child=`${prefix}${name}/`;if(!children.has(child))children.set(child,{name,path:child,count:0,latest:0});const x=children.get(child);x.count++;x.latest=Math.max(x.latest,f.stat.mtime||0);}});
      const wrap=element(parent,'div','ns-library-folders');for(const x of [...children.values()].sort((a,b)=>a.name.localeCompare(b.name,'ru'))){const b=button(wrap,'',()=>{this.libraryFolder=x.path;this.libraryMode='catalog';return this.refresh();},'ns-folder-card','folder');const text=element(b,'span','ns-folder-text');element(text,'strong','',x.name);element(text,'small','',`${x.count} материалов`);element(b,'span','ns-folder-arrow','↗');}return children;
    };
    const breadcrumb=(parent,prefix)=>{const bar=element(parent,'div','ns-breadcrumb');button(bar,'Каталог',()=>{this.libraryFolder='';return this.refresh();},'ns-breadcrumb-link','library');if(!prefix)return;let current='';for(const part of prefix.replace(/^03_Knowledge\//,'').replace(/^01_Domains\//,'').split('/').filter(Boolean)){current+=part+'/';const path=prefix.startsWith('03_Knowledge/')?`03_Knowledge/${current}`:`01_Domains/${current}`;button(bar,part,()=>{this.libraryFolder=path;return this.refresh();},'ns-breadcrumb-link','chevron-right');}};
    const render=()=>{
      body.replaceChildren();const q=this.libraryQuery.trim().toLowerCase();
      if(q){const hit=files.filter(f=>f.path.toLowerCase().includes(q));renderFiles(body,hit,'ПОИСК ПО ВСЕЙ БИБЛИОТЕКЕ');return;}
      if(this.libraryMode==='recent'){renderFiles(body,d.recent.slice(0,30),'ПОСЛЕДНИЕ МАТЕРИАЛЫ');return;}
      if(this.libraryMode==='inbox'){renderFiles(body,files.filter(f=>f.path.startsWith('00_Inbox/')),'ВХОДЯЩИЕ');return;}
      if(!this.libraryFolder){const grid=element(body,'div','ns-space-catalog');for(const space of LIBRARY_SPACES){const items=files.filter(f=>f.path.startsWith(space.path));const b=button(grid,'',()=>{this.libraryFolder=space.path;return this.refresh();},'ns-space-card',space.icon);const head=element(b,'div','ns-space-card-head');icon(head,space.icon);element(head,'span','ns-space-count',String(items.length));element(b,'strong','',space.title);element(b,'small','',space.note);element(b,'span','ns-space-card-arrow','Открыть ↗');}const inbox=files.filter(f=>f.path.startsWith('00_Inbox/'));const b=button(grid,'',()=>{this.libraryMode='inbox';this.libraryFolder='00_Inbox/';return this.refresh();},'ns-space-card ns-space-inbox','inbox');const head=element(b,'div','ns-space-card-head');icon(head,'inbox');element(head,'span','ns-space-count',String(inbox.length));element(b,'strong','', 'Входящие');element(b,'small','', 'Идеи, ссылки и необработанные заметки');element(b,'span','ns-space-card-arrow','Разобрать ↗');return;}
      breadcrumb(body,this.libraryFolder);const heading=element(body,'div','ns-library-branch-head');const pretty=this.libraryFolder.split('/').filter(Boolean).at(-1)||'Каталог';element(heading,'h2','',pretty);element(heading,'span','ns-muted',`${files.filter(f=>f.path.startsWith(this.libraryFolder)).length} внутри`);folderCards(body,this.libraryFolder);const direct=files.filter(f=>f.path.startsWith(this.libraryFolder)&&!f.path.slice(this.libraryFolder.length).includes('/'));if(direct.length){const list=element(body,'div','ns-library-list ns-library-direct');renderFiles(list,direct,'МАТЕРИАЛЫ ЭТОГО УРОВНЯ');}
    };
    search.addEventListener('input',()=>{this.libraryQuery=search.value;render();});render();
  }
  navigation(d) {
    const c=element(this.root,'div','ns-nav-inner');
    const brand=element(c,'div','ns-side-brand');element(brand,'i','ns-led');element(brand,'span','','SPACE');element(brand,'small','','/ 01');
    element(c,'p','ns-nav-subtitle','A LITTLE ROOM TO THINK.');
    button(c,'Обзор',()=>this.p.activate(),'ns-nav-button ns-nav-home','circle-dot');
    button(c,'Сегодня',()=>this.p.openDay(),'ns-nav-button','sun');
    button(c,'Неделя',()=>this.p.activate('week'),'ns-nav-button','calendar-range');
    button(c,'Библиотека',()=>this.p.activate('library'),'ns-nav-button','library');
    label(c,'PINNED / ПОД РУКОЙ');
    [['Русский · компилятор','03_Knowledge/ЕГЭ/Русский/КОМПИЛЯТОР_РУССКОГО.md','spell-check'],['Математика · протокол','03_Knowledge/ЕГЭ/Математика/ПРОТОКОЛ_ОПЕРЕЖАЮЩЕГО_УДАРА.md','sigma'],['English · hub','03_Knowledge/English/ENGLISH_HUB.md','languages'],['Задачи & тренажёр','Tasks.md','list-checks']].forEach(([title,path,glyph])=>{if(this.p.app.vault.getAbstractFileByPath(path))button(c,title,()=>this.p.open(path),'ns-pin',glyph);});
    const inbox=button(c,'Входящие',()=>this.p.activate('library','00_Inbox/'),'ns-nav-inbox','inbox');element(inbox,'b','',String(d.inboxCount));
    button(c,'Поймать мысль',()=>new CaptureModal(this.p).open(),'ns-button ns-nav-capture','plus');
    const bottom=element(c,'div','ns-nav-bottom');element(bottom,'span','ns-small-dot');element(bottom,'span','','Твои данные. Твоё пространство.');
  }
  pulse(d) {
    const c=element(this.root,'div','ns-pulse-inner');label(c,'PULSE / ТВОЙ РИТМ');
    const time=element(c,'div','ns-pulse-clock');element(time,'span','ns-clock');element(time,'small','',new Date().toLocaleDateString('ru-RU',{weekday:'long',day:'numeric',month:'long'}));
    const cal=element(c,'div','ns-mini-calendar');
    const first=d.today.slice(0,8)+'01',offset=(fromKey(first).getDay()+6)%7;
    const monthLabel=element(cal,'div','ns-calendar-month',fromKey(d.today).toLocaleDateString('ru-RU',{month:'long',year:'numeric'}));
    const days=element(cal,'div','ns-calendar-grid');DAYS.forEach(n=>element(days,'span','ns-calendar-dow',n));
    const max=new Date(fromKey(d.today).getFullYear(),fromKey(d.today).getMonth()+1,0).getDate();
    for(let i=0;i<offset;i++)element(days,'span','');
    for(let i=1;i<=max;i++){const key=d.today.slice(0,8)+pad(i),exists=!!this.p.app.vault.getAbstractFileByPath(`${DAY}${key}.md`);
      const b=button(days,String(i),()=>this.p.openDay(key),`ns-calendar-day ${key===d.today?'is-today':''} ${exists?'has-note':''}`);b.title=`${key} · ${exists?'Открыть дневник':'Создать дневник'}`;}
    label(c,'ЭТА НЕДЕЛЯ',weekKey());
    [['graduation-cap','Учёба',`${fmt(d.weekEge)} ч`],['terminal','Код',`${fmt(d.weekWork)} ч`],['languages','English',`${d.weekEnglish} / 7`]].forEach(([glyph,title,value])=>{const row=element(c,'div','ns-pulse-stat');icon(row,glyph);element(row,'span','',title);element(row,'strong','',value);});
    const track=element(c,'div','ns-quick-track');label(track,'ЗАПИСАТЬ ЗА СЕГОДНЯ');
    button(track,'Учёба +30м',()=>this.p.track('ege_time',0.5),'ns-track-button','plus');
    button(track,'Код +30м',()=>this.p.track('work_time',0.5),'ns-track-button','plus');
    button(track,d.todayFM.english_done?'English · готово':'English · отметить',()=>this.p.english(),`ns-track-button ${d.todayFM.english_done?'is-active':''}`,'check');
    const inbox=element(c,'div','ns-inbox-widget');label(inbox,'INBOX / РАЗОБРАТЬ');
    const count=element(inbox,'div','ns-inbox-count');element(count,'strong','',pad(d.inboxCount));element(count,'span','','во входящих');
    d.library.filter(f=>f.path.startsWith('00_Inbox/')).slice(0,2).forEach(f=>button(inbox,f.basename,()=>this.p.open(f.path),'ns-inbox-note','file-text'));
    button(inbox,d.inboxCount?'Разобрать входящие':'Поймать мысль',()=>d.inboxCount?this.p.activate('library','00_Inbox/'):new CaptureModal(this.p).open(),'ns-button','arrow-up-right');
    button(c,'Открыть граф связей',()=>this.p.app.commands.executeCommandById('graph:open'),'ns-graph-link','git-fork');
  }
}

class SpaceSettings extends PluginSettingTab {
  constructor(app,plugin){super(app,plugin);this.p=plugin;}
  display(){const c=this.containerEl;c.empty();c.createEl('h2',{text:'Nothing Space'});
    new Setting(c).setName('Открывать SPACE при запуске').setDesc('Главный экран появится при открытии хранилища.').addToggle(t=>t.setValue(this.p.settings.openOnStartup).onChange(async value=>{this.p.settings.openOnStartup=value;await this.p.saveData(this.p.settings);}));
    new Setting(c).setName('Боковые панели').setDesc('Вернуть навигацию и пульс, если панели были закрыты.').addButton(b=>b.setButtonText('Показать').onClick(()=>this.p.showSidebars().catch(report)));
    new Setting(c).setName('Краткое руководство').addButton(b=>b.setButtonText('Открыть').onClick(()=>this.p.open('System/Nothing Space/Начни здесь.md')));
    c.createEl('p',{text:'SPACE работает локально. Задачи остаются в Markdown, время — в привычных свойствах ege_time и work_time. Отключение плагина не удаляет записи.'});
  }
}

class NothingSpace extends Plugin {
  async onload() {
    this.settings={...DEFAULTS,...await this.loadData()};
    const legacyKeys=['timer','duration','subject'];
    if(legacyKeys.some(key=>key in this.settings)){for(const key of legacyKeys)delete this.settings[key];await this.saveData(this.settings);}
    this.interfaces=new Set();this.cache=new Map();this.creating=new Map();this.refreshId=null;this.currentDay=dateKey();
    this.registerView(HOME,leaf=>new SpaceView(leaf,this,HOME));this.registerView(NAV,leaf=>new SpaceView(leaf,this,NAV));this.registerView(PULSE,leaf=>new SpaceView(leaf,this,PULSE));
    this.registerMarkdownCodeBlockProcessor('nothing-space',(_,el,ctx)=>ctx.addChild(new InlineSpace(el,this)));
    const commands=[
      ['open','Открыть SPACE',()=>this.activate(),[{modifiers:['Mod','Alt'],key:'Home'}]],
      ['capture','Быстрый захват',()=>new CaptureModal(this).open(),[{modifiers:['Mod','Shift'],key:' '}]],
      ['today','Открыть сегодняшний дневник',()=>this.openDay(),[{modifiers:['Mod','Alt'],key:'d'}]],
      ['week','Открыть план недели',()=>this.openWeek()],
      ['library','Открыть библиотеку',()=>this.activate('library')],
      ['random','Случайный конспект',()=>this.randomNote()],
      ['sidebars','Показать боковые панели',()=>this.showSidebars()]
    ];
    commands.forEach(([id,name,fn,hotkeys])=>this.addCommand({id,name,hotkeys,callback:()=>Promise.resolve().then(fn).catch(report)}));
    this.addRibbonIcon('circle-dot','Nothing Space',()=>this.activate().catch(report));
    this.addRibbonIcon('plus','SPACE · быстрый захват',()=>new CaptureModal(this).open());
    this.addSettingTab(new SpaceSettings(this.app,this));
    for(const event of ['modify','create','delete','rename'])this.registerEvent(this.app.vault.on(event,file=>{if(file?.extension==='md'||event==='rename'){this.cache.delete(file?.path);this.scheduleRefresh();}}));
    this.registerEvent(this.app.metadataCache.on('resolved',()=>this.scheduleRefresh()));
    this.registerInterval(window.setInterval(()=>{this.paintClock();if(this.currentDay!==dateKey()){this.currentDay=dateKey();this.scheduleRefresh();}},1000));
    this.register(()=>window.clearTimeout(this.refreshId));
    this.app.workspace.onLayoutReady(()=>{if(this.settings.openOnStartup)this.activate().catch(report);});
  }
  onunload(){for(const ui of this.interfaces)ui.destroyed=true;this.interfaces.clear();}
  scheduleRefresh(){window.clearTimeout(this.refreshId);this.refreshId=window.setTimeout(()=>{for(const ui of this.interfaces)ui.refresh().catch(report);},350);}
  async refresh(){this.cache.clear();await Promise.all([...this.interfaces].map(ui=>ui.refresh()));}
  async snapshot() {
    const files=this.app.vault.getMarkdownFiles(),today=dateKey(),start=monday(today),end=shift(start,6);
    const source=files.filter(f=>!f.path.startsWith('Archive/')&&!f.path.startsWith('System/')&&(
      f.path.startsWith(DAY)||f.path.startsWith(WEEK)||f.path==='Tasks.md'||f.path.startsWith('00_Inbox/')||f.path.startsWith('01_Domains/')||f.path.startsWith('03_Knowledge/ЕГЭ/Русский/Номера/')||
      this.app.metadataCache.getFileCache?.(f)?.tags?.some(t=>['#focus','#q1'].includes(t.tag))));
    const entries=await Promise.all(source.map(async f=>{
      const version=`${f.stat.mtime}:${f.stat.size}`,cached=this.cache.get(f.path);if(cached?.version===version)return cached;
      const content=await this.app.vault.cachedRead(f),entry={version,file:f,fm:frontmatter(content),tasks:parseTasks(content,f.path)};this.cache.set(f.path,entry);return entry;
    }));
    const tasks=entries.flatMap(e=>e.tasks),daily=entries.filter(e=>e.file.path.startsWith(DAY));
    const weekTasks=tasks.filter(t=>t.date>=start&&t.date<=end&&(t.path.startsWith(DAY)||t.path.startsWith(WEEK)));
    const focusTasks=tasks.filter(t=>t.focus&&(!t.date||t.date===today));
    const todayTasks=tasks.filter(t=>((t.date===today&&(t.path.startsWith(DAY)||t.path.startsWith(WEEK)))||focusTasks.includes(t)));
    const activity={};const at=key=>(activity[key]||(activity[key]={done:0,hours:0,english:false,gym:0}));
    for(const t of tasks)if(t.date&&t.done)at(t.date).done++;
    let weekEge=0,weekWork=0,weekEnglish=0,todayFM={};
    daily.forEach(({file,fm})=>{
      const key=file.basename;if(!/^\d{4}-\d{2}-\d{2}$/.test(key))return;
      Object.assign(at(key),{hours:(Number(fm.ege_time)||0)+(Number(fm.work_time)||0),english:fm.english_done===true,gym:Number(fm.gym_weight)||0});
      if(key===today)todayFM=fm;
      if(key>=start&&key<=end){weekEge+=Number(fm.ege_time)||0;weekWork+=Number(fm.work_time)||0;if(fm.english_done===true)weekEnglish++;}
    });
    const activeDays=Object.entries(activity).filter(([key,s])=>key>=shift(today,-125)&&key<=today&&(s.done>0||s.hours>0||s.english||s.gym>0)).length;
    const library=this.app.vault.getFiles().filter(f=>['md','canvas','base'].includes(f.extension)&&(f.path.startsWith('03_Knowledge/')||f.path.startsWith('00_Inbox/')||f.path.startsWith('01_Domains/'))).sort((a,b)=>b.stat.mtime-a.stat.mtime||a.path.localeCompare(b.path));
    const candidates=library.filter(f=>f.path.startsWith('03_Knowledge/'));
    const opened=(this.app.workspace.getLastOpenFiles?.()||[]).map(path=>candidates.find(f=>f.path===path)).filter(Boolean);
    const recent=[...opened,...candidates.filter(f=>!opened.includes(f))];
    const reviewItems=(await Promise.all(entries.filter(e=>e.fm.type==='rus_schema'&&Number.isFinite(Number(e.fm.task_num))).map(async e=>{
      const num=Number(e.fm.task_num),last=isoDate(e.fm.last_check);
      const canvas=this.app.vault.getFiles().find(f=>f.extension==='canvas'&&f.basename===`Номер ${num}`);
      const quizzes=e.tasks.filter(t=>/https?:\/\//.test(t.text));
      const vocab=[];for(const base of (VOCAB_MAP[num]||[])){const f=files.find(x=>x.path===base||x.path===`${base}.md`);if(f)vocab.push(...parseTasks(await this.app.vault.cachedRead(f),f.path));}
      return {num,title:e.file.basename.replace(/^Задание\s*\d+\s*/,'').replace(/\.md$/,''),path:e.file.path,last_check:last,daysAgo:daysSince(last,today),canvas:canvas?.path||null,quizzes,vocab,quizTotal:quizzes.length,quizOpen:quizzes.filter(t=>!t.done).length};
    }))).sort((a,b)=>(a.last_check===today)-(b.last_check===today)||b.daysAgo-a.daysAgo||a.num-b.num);
    const reviewDoneToday=reviewItems.filter(x=>x.last_check===today).length;
    const scores=entries.filter(e=>e.file.path.startsWith(WEEK)).map(e=>{
      const values={};for(const key of ['rus_score','math_score','inf_score']){const nums=scoreValues(e.fm[key]);if(nums.length)values[key]=nums.reduce((a,b)=>a+b,0)/nums.length;}
      return {path:e.file.path,week:e.file.basename,values};
    }).filter(e=>Object.keys(e.values).length).sort((a,b)=>a.week.localeCompare(b.week));
    return {today,todayFM,todayTasks,weekTasks,focusTasks,activity,activeDays,weekEge,weekWork,weekEnglish,library,recent,reviewItems,reviewDoneToday,scores,inboxCount:files.filter(f=>f.path.startsWith('00_Inbox/')).length};
  }
  async activate(tab='overview',folder) {
    let leaf=this.app.workspace.getLeavesOfType(HOME)[0];
    if(!leaf){const current=this.app.workspace.getMostRecentLeaf();leaf=current?.view?.file?.path==='Dashboard.md'?current:this.app.workspace.getLeaf('tab');await leaf.setViewState({type:HOME,active:true});}
    this.app.workspace.revealLeaf(leaf);if(leaf.view.ui){leaf.view.ui.tab=tab;if(folder!==undefined){leaf.view.ui.libraryFolder=folder;leaf.view.ui.libraryMode=folder==='00_Inbox/'?'inbox':'catalog';}await leaf.view.ui.refresh();}
    return leaf;
  }
  async showSidebars(){
    for(const [type,side]of [[NAV,'left'],[PULSE,'right']]){let leaf=this.app.workspace.getLeavesOfType(type)[0];if(!leaf){leaf=side==='left'?this.app.workspace.getLeftLeaf(false):this.app.workspace.getRightLeaf(false);if(!leaf)continue;await leaf.setViewState({type,active:true});}this.app.workspace.revealLeaf(leaf);}
  }
  async open(path,newTab=false,line) {
    const file=this.app.vault.getAbstractFileByPath(path);if(!(file instanceof TFile))throw new Error(`Файл не найден: ${path}`);
    const existing=!newTab&&this.app.workspace.getLeavesOfType('markdown').find(l=>l.view?.file?.path===path);
    const current=this.app.workspace.getMostRecentLeaf();
    const leaf=existing||this.app.workspace.getLeaf(newTab||current?.view?.getViewType()===HOME?'tab':false);
    await leaf.openFile(file,{active:true,eState:line===undefined?undefined:{line}});this.app.workspace.revealLeaf(leaf);
  }
  async ensureFolder(path){let current='';for(const part of path.split('/').filter(Boolean)){current=current?`${current}/${part}`:part;if(!this.app.vault.getAbstractFileByPath(current)){try{await this.app.vault.createFolder(current);}catch(err){if(!this.app.vault.getAbstractFileByPath(current))throw err;}}}}
  async ensure(path,content){
    const existing=this.app.vault.getAbstractFileByPath(path);if(existing instanceof TFile)return existing;
    if(this.creating.has(path))return this.creating.get(path);
    const pending=(async()=>{await this.ensureFolder(path.split('/').slice(0,-1).join('/'));try{return await this.app.vault.create(path,content);}catch(err){const found=this.app.vault.getAbstractFileByPath(path);if(found instanceof TFile)return found;throw err;}})();
    this.creating.set(path,pending);try{return await pending;}finally{this.creating.delete(path);}
  }
  async ensureDay(key=dateKey()){return this.ensure(`${DAY}${key}.md`,dayContent(key));}
  async openDay(key=dateKey()){const f=await this.ensureDay(key);return this.open(f.path);}
  async openWeek(){const key=weekKey(),f=await this.ensure(`${WEEK}${key}.md`,weekContent(key));return this.open(f.path);}
  async addTask(value) {
    const text=value.replace(/[\r\n]+/g,' ').trim();if(!text)return;
    const key=dateKey(),week=this.app.vault.getAbstractFileByPath(`${WEEK}${weekKey(key)}.md`);let added=false;
    if(week instanceof TFile)await this.app.vault.process(week,content=>{
      const rows=content.split('\n'),i=rows.findIndex(row=>/^#{1,6}\s/.test(row)&&row.includes(key));if(i<0)return content;
      const heading=rows[i];added=true;return appendSection(content,heading,`- [ ] ${text}`);
    });
    if(!added){const f=await this.ensureDay(key);await this.app.vault.process(f,content=>appendSection(content,'### 🎯 Оперативные задачи',`- [ ] ${text}`));}
    await this.refresh();new Notice('Задача добавлена на сегодня');
  }
  async toggleTask(task,done) {
    const file=this.app.vault.getAbstractFileByPath(task.path);if(!(file instanceof TFile))throw new Error('Источник задачи не найден');
    await this.app.vault.process(file,content=>{
      const rows=content.split('\n');let i=task.row;
      if(rows[i]!==task.raw){const candidates=parseTasks(content,task.path).filter(t=>t.text===task.text&&t.section===task.section&&t.date===task.date);if(candidates.length!==1)throw new Error('План изменился. Обнови экран и повтори.');i=candidates[0].row;}
      rows[i]=rows[i].replace(/^(\s*(?:[-*+]|\d+[.)])\s+\[)[ xX/\-](\])/,(m,a,b)=>`${a}${done?'x':' '}${b}`);return rows.join('\n');
    });await this.refresh();
  }
  async capture(text) {
    const now=new Date(),title=plain(text.split('\n')[0]).replace(/[\\/:*?"<>|#\[\]]/g,' ').replace(/\s+/g,' ').trim().slice(0,64)||'Мысль';
    await this.ensureFolder('00_Inbox');const stem=`00_Inbox/${dateKey(now)} ${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())} — ${title}`;
    let path=`${stem}.md`,n=1;while(this.app.vault.getAbstractFileByPath(path))path=`${stem} (${n++}).md`;
    await this.app.vault.create(path,`---\ntype: inbox\ncreated: ${dateKey(now)}\ncssclasses: [space-note]\n---\n\n${text.trim()}\n`);await this.refresh();new Notice('Мысль сохранена во входящие');
  }
  async track(key,hours){if(!['ege_time','work_time'].includes(key))return;const f=await this.ensureDay();await this.app.vault.process(f,content=>setNumber(content,key,n=>n+hours));await this.refresh();new Notice('Записано 30 минут');}
  async english(){const f=await this.ensureDay();await this.app.fileManager.processFrontMatter(f,fm=>{fm.english_done=fm.english_done!==true;});await this.refresh();}
  async markReview(item){const f=this.app.vault.getAbstractFileByPath(item.path);if(!(f instanceof TFile))throw new Error('Файл повторения не найден');await this.app.fileManager.processFrontMatter(f,fm=>{fm.last_check=dateKey();});await this.refresh();new Notice(`№${item.num} отмечено как повторённое`);}
  async openQuiz(item,quiz){const url=quiz.text.match(/https?:\/\/[^\s)]+/)?.[0];if(url)window.open(url,'_blank');if(quiz.done)return;const f=this.app.vault.getAbstractFileByPath(item.path);if(!(f instanceof TFile))return;await this.app.vault.process(f,content=>{const rows=content.split('\n');let i=quiz.row;if(rows[i]!==quiz.raw){const found=parseTasks(content,item.path).find(t=>t.text===quiz.text);if(!found)throw new Error('Квиз изменился. Обнови экран.');i=found.row;}rows[i]=rows[i].replace(/^(\s*(?:[-*+]|\d+[.)])\s+\[)[ xX\/\-](\])/, '$1x$2');return rows.join('\n');});await this.refresh();}
  async processVocab(item,task,success){const f=this.app.vault.getAbstractFileByPath(task.path);if(!(f instanceof TFile))throw new Error('Словарь не найден');const today=dateKey();await this.app.vault.process(f,content=>{const rows=content.split('\n');let i=task.row;if(rows[i]!==task.raw){const found=parseTasks(content,task.path).find(t=>t.text===task.text);if(!found)throw new Error('Карточка изменилась. Обнови экран.');i=found.row;}const old=task.text,fails=Number(old.match(/\[fails:: (\d+)\]/)?.[1]||0),base=old.replace(/\[fails:: \d+\]/,'').replace(/ 🗓️\d{4}-\d{2}-\d{2}/,'').trim(),next=`${base} [fails:: ${success?fails:fails+1}] 🗓️${today}`;rows[i]=rows[i].replace(/^(\s*(?:[-*+]|\d+[.)])\s+\[)[ xX\/\-](\]\s+).*/,(_,a,b)=>`${a}${success?'x':' '}${b}${next}`);return rows.join('\n');});for(const ui of this.interfaces){const key=`${item.num}:${today}`,s=ui.vocabState?.get(key);if(s)s.index++;}await this.refresh();new Notice(success?'Карточка засчитана':'Отметил ошибку — вернём её позже');}
  randomNote(){const files=this.app.vault.getMarkdownFiles().filter(f=>f.path.startsWith('03_Knowledge/'));if(files.length)return this.open(files[Math.floor(Math.random()*files.length)].path);new Notice('В базе знаний пока нет заметок');}
  paintClock(){const text=new Date().toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'});for(const ui of this.interfaces)ui.root.querySelectorAll('.ns-clock').forEach(el=>el.textContent=text);}
}
module.exports=NothingSpace;
module.exports._test={dateKey,shift,monday,weekKey,weekStart,parseTasks,setNumber,appendSection,dayContent,weekContent,frontmatter,scoreValues,isoDate,daysSince,vocabParts,SpaceUI,CaptureModal};
