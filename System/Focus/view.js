const {execFile} = require('child_process');
const {Modal, Notice} = require('obsidian');
const api = (args) => new Promise((resolve, reject) => execFile('/home/devoid/.local/bin/study-timer', args,
  {encoding:'utf8', timeout:15000, maxBuffer:8*1024*1024}, (err,out,stderr) => err ? reject(new Error(stderr || err.message)) : resolve(out)));
const host = dv.container.createDiv({cls:'focus-app'});
const el = (p,tag,cls,text) => p.createEl(tag,{cls,text});
const button = (p,text,fn,cls='') => {const b=el(p,'button',cls,text);b.onclick=fn;return b;};
const fmt = ms => {let m=Math.floor(Math.max(0,ms)/60000);return `${Math.floor(m/60)}ч ${String(m%60).padStart(2,'0')}м`;};
const clock = ms => {let s=Math.floor(Math.max(0,ms)/1000);return [Math.floor(s/3600),Math.floor(s/60)%60,s%60].map(v=>String(v).padStart(2,'0')).join(':');};
const dateKey = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const shift = (date,n) => {const d=new Date(date+'T12:00:00');d.setDate(d.getDate()+n);return dateKey(d);};
const local = ms => {const d=new Date(ms);return `${dateKey(d)}T${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;};
const time = ms => new Date(ms).toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'});
let state, selected, span=7, editing=false, busy=false, error='', liveLabel, liveTotal, loadedAt=0;
const totalFor = day => day===state.currentDate ? state.liveTotals : state.history[day] || {};
const sum = obj => Object.values(obj).reduce((a,b)=>a+Number(b),0);
async function refresh(){if(busy||editing)return;busy=true;try{state=JSON.parse(await api(['dashboard']));loadedAt=Date.now();selected ||= state.currentDate;error='';render();}catch(e){error=e.message;host.empty();el(host,'p','focus-error',error);button(host,'Повторить',refresh);}finally{busy=false;}}
async function act(args){try{await api(args);await refresh();}catch(e){new Notice(e.message,8000);}}
function editor(record){
  editing=true;
  const modal=new Modal(dv.app);modal.titleEl.setText(record?'Редактировать занятие':'Добавить занятие');
  modal.contentEl.addClass('focus-editor');
  const field=(label,type,value)=>{const l=el(modal.contentEl,'label','',label);const i=el(l,'input','');i.type=type;i.value=value;return i;};
  const subjectLabel=el(modal.contentEl,'label','','Предмет');const subject=el(subjectLabel,'select','');
  state.subjects.forEach(s=>{const o=el(subject,'option','',s.name);o.value=s.id;});subject.value=record?.subject || state.activeSubjectId;
  const kindLabel=el(modal.contentEl,'label','','Способ записи');const kind=el(kindLabel,'select','');
  [['interval','Начало и конец'],['duration','Только длительность']].forEach(([v,t])=>{const o=el(kind,'option','',t);o.value=v;});
  kind.value=record && !record.startedAt?'duration':'interval';
  const now=Date.now();const start=field('Начало','datetime-local',local(record?.startedAt || (selected===state.currentDate?now-3600000:new Date(selected+'T12:00:00').getTime())));
  const end=field('Конец','datetime-local',local(record?.endedAt || (selected===state.currentDate?now:new Date(selected+'T13:00:00').getTime())));
  const date=field('Учебный день','date',record?.date || selected);
  const minutes=field('Длительность, минут','number',String(Math.max(1,Math.round((record?.durationMs || 3600000)/60000))));minutes.min='1';minutes.max='1440';
  const note=field('Заметка','text',record?.note || '');note.maxLength=500;
  function toggle(){start.parentElement.hidden=end.parentElement.hidden=kind.value!=='interval';date.parentElement.hidden=minutes.parentElement.hidden=kind.value==='interval';}kind.onchange=toggle;toggle();
  el(modal.contentEl,'p','focus-muted','Учебный день начинается в 05:00. Старые суммы сохранены без выдуманного времени начала.');
  const message=el(modal.contentEl,'p','focus-error','');
  const save=button(modal.contentEl,'Сохранить',async()=>{
    save.disabled=true;try{
      const args=record?['edit-session',record.id]:['add-session'];args.push('--subject',subject.value,'--note',note.value,'--revision',String(state.revision));
      if(kind.value==='interval')args.push('--start',start.value,'--end',end.value);else args.push('--date',date.value,'--minutes',minutes.value);
      await api(args);selected=kind.value==='duration'?date.value:dateKey(new Date(new Date(start.value).getTime()-5*3600000));modal.close();await refresh();
    }catch(e){message.setText(e.message);}finally{save.disabled=false;}
  },'focus-primary');
  modal.onClose=()=>{editing=false;};modal.open();
}
function render(){
  host.empty();
  const top=el(host,'div','focus-top');const title=el(top,'div','');el(title,'div','focus-eyebrow','ЛИЧНОЕ ВРЕМЯ / LOCAL');el(title,'h1','','Фокус.');
  button(top,'← SPACE',()=>dv.app.workspace.openLinkText('Dashboard',dv.current().file.path));
  const active=state.subjects.find(s=>s.id===state.activeSubjectId);
  const hero=el(host,'div','focus-hero');hero.style.setProperty('--subject',active?.color || '#e50914');
  const left=el(hero,'div','');el(left,'div','focus-eyebrow',state.isRunning?'● '+active.name:'СЕГОДНЯ · ВСЕ ПРЕДМЕТЫ');
  liveLabel=el(left,'div','focus-clock',clock(state.isRunning?state.elapsedMs:sum(state.liveTotals)));
  liveTotal=el(left,'div','focus-muted',state.isRunning?'Текущая сессия · всего сегодня '+fmt(sum(state.liveTotals)):'Время для следующего шага');
  button(hero,state.isRunning?'■ Завершить':'▶ Продолжить',()=>act(state.isRunning?['--quiet','stop']:['--quiet','start',state.activeSubjectId]),'focus-primary');
  const cards=el(host,'div','focus-subjects');
  state.subjects.forEach(s=>{const card=el(cards,'button','focus-subject');card.style.setProperty('--subject',s.color);el(card,'span','',s.name);el(card,'strong','',fmt(state.liveTotals[s.id]||0));el(card,'small','','▶ Начать');card.onclick=()=>act(['--quiet','start',s.id]);});
  const controls = el(host, 'div', 'focus-controls');
  const dateNav = el(controls, 'div', 'focus-date-nav');
  button(dateNav, '‹', () => { selected = shift(selected, -1); render(); }, 'focus-nav-arrow');

  const dObj = new Date(selected + 'T12:00:00');
  const dFormatted = dObj.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric', weekday: 'short' });
  const dateBadge = el(dateNav, 'label', 'focus-date-badge');
  el(dateBadge, 'span', 'focus-date-text', dFormatted);
  const picker = el(dateBadge, 'input', 'focus-date-input');
  picker.type = 'date';
  picker.value = selected;
  picker.max = state.currentDate;
  picker.onchange = () => { if (picker.value) { selected = picker.value; render(); } };

  button(dateNav, '›', () => { if (selected < state.currentDate) { selected = shift(selected, 1); render(); } }, 'focus-nav-arrow');
  button(dateNav, 'Сегодня', () => { selected = state.currentDate; render(); }, `focus-today-btn ${selected === state.currentDate ? 'is-active' : ''}`);

  const ranges = el(controls, 'div', 'focus-ranges');
  [7, 30, 90].forEach(n => {
    button(ranges, n + ' дней', () => { span = n; render(); }, `focus-range-btn ${span === n ? 'is-selected' : ''}`);
  });
  const dates=Array.from({length:span},(_,i)=>shift(selected,i-span+1));const totals=dates.map(d=>sum(totalFor(d)));const combined=totals.reduce((a,b)=>a+b,0);
  const metrics=el(host,'div','focus-metrics');
  [['За период',fmt(combined)],['Среднее в день',fmt(combined/span)],['Лучший день',fmt(Math.max(...totals))],['Дней с фокусом',String(totals.filter(v=>v>0).length)+' / '+span]].forEach(([label,value])=>{const c=el(metrics,'div','');el(c,'small','',label);el(c,'strong','',value);});
  const chartCard=el(host,'section','focus-card');el(chartCard,'h3','','Ритм занятий');
  const chart=el(chartCard,'div','focus-chart');const max=Math.max(state.dailyGoalMinutes*60000,...totals,1);
  dates.forEach((d,i)=>{const col=el(chart,'button','focus-day');col.title=d+' · '+fmt(totals[i]);col.onclick=()=>{selected=d;render();};
    const stack=el(col,'div','focus-stack');stack.style.height=Math.max(2,totals[i]/max*125)+'px';
    state.subjects.forEach(s=>{const bar=el(stack,'div','');bar.style.background=s.color;bar.style.flex=String(totalFor(d)[s.id]||0);});
    if(span<=30)el(col,'small','',d.slice(8));
  });
  const breakdown=el(chartCard,'div','focus-breakdown');state.subjects.forEach(s=>{const ms=dates.reduce((a,d)=>a+(totalFor(d)[s.id]||0),0);const r=el(breakdown,'div','');el(r,'span','',s.name).style.color=s.color;el(r,'strong','',fmt(ms));});
  const goalRow=el(chartCard,'div','focus-controls');el(goalRow,'span','focus-muted','Дневная цель, мин');const goal=el(goalRow,'input','');goal.type='number';goal.min='1';goal.max='1440';goal.value=state.dailyGoalMinutes;goal.style.width='90px';button(goalRow,'Сохранить цель',()=>act(['goal',goal.value]));
  const journal=el(host,'section','focus-card');const heading=el(journal,'div','focus-top');const h=el(heading,'div','');el(h,'h3','','Занятия · '+selected);el(h,'small','focus-muted',fmt(sum(totalFor(selected)))+' всего');button(heading,'+ Занятие',()=>editor(null),'focus-primary');
  const records=state.sessions.filter(r=>r.date===selected&&!r.deleted).sort((a,b)=>(b.startedAt||0)-(a.startedAt||0));
  if(state.isRunning && selected===state.currentDate)el(journal,'p','focus-live','● '+active.name+' · сейчас идёт. Для изменения времени сначала заверши сессию.');
  if(!records.length)el(journal,'p','focus-muted','Здесь появятся завершённые занятия. Можно добавить пропущенное вручную.');
  records.forEach(r=>{
    const s=state.subjects.find(s=>s.id===r.subject);const row=el(journal,'div','focus-session');const details=el(row,'div','');el(details,'strong','',s?.name||r.subject).style.color=s?.color||'#fff';
    el(details,'div','focus-muted',r.startedAt?time(r.startedAt)+' — '+time(r.endedAt):'Без времени начала · сохранённая сумма');
    if(r.note)el(details,'small','focus-muted',r.note);
    el(row,'strong','',fmt(r.durationMs));
    button(row,'Править',()=>editor(r));
    const remove=button(row,'×',()=>{if(remove.dataset.confirm!=='yes'){remove.dataset.confirm='yes';remove.setText('Удалить?');return;}act(['delete-session',r.id,'--revision',String(state.revision)]);});remove.title='Удалить с возможностью восстановления';
  });
  const deleted=state.sessions.filter(r=>r.date===selected&&r.deleted);
  if(deleted.length){const bin=el(journal,'details','focus-bin');el(bin,'summary','','Удалённые · '+deleted.length);deleted.forEach(r=>button(bin,'Восстановить '+(state.subjects.find(s=>s.id===r.subject)?.name||r.subject)+' · '+fmt(r.durationMs),()=>act(['restore-session',r.id,'--revision',String(state.revision)])));}
  const foot=el(host,'div','focus-footer');el(foot,'span','','Всё хранится на ноутбуке · день с 05:00');button(foot,'Дневная заметка ↗',()=>dv.app.workspace.openLinkText('02_Log/Days/'+selected,dv.current().file.path));button(foot,'Обновить',refresh);
}
await refresh();
const regInt = (fn, ms) => {
  const id = window.setInterval(fn, ms);
  if (typeof dv !== 'undefined' && dv?.component && typeof dv.component.registerInterval === 'function') {
    dv.component.registerInterval(id);
  }
  return id;
};
regInt(()=>{if(!host.isConnected||!state||editing)return;if(state.isRunning&&liveLabel){let extra=Date.now()-loadedAt;let elapsed=state.elapsedMs+extra;if(state.mode==='pomodoro')elapsed=Math.min(elapsed,state.pomoRemainingMs);liveLabel.setText(clock(elapsed));liveTotal.setText('Текущая сессия · всего сегодня '+fmt(sum(state.liveTotals)+elapsed-state.elapsedMs));}},1000);
regInt(()=>{if(host.isConnected&&!editing&&!host.contains(document.activeElement))refresh();},15000);
