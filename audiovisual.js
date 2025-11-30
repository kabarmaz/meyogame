// Simple scaffold for Audio Visual Memory (B1)
// The page expects a list of 65 city names to be provided to `loadCityList(cities)`.

const closedListEl = document.getElementById('closedList');
const corridorGrid = document.getElementById('corridorGrid');
const newSetBtn = document.getElementById('newSetBtn');
const avLevelSelect = document.getElementById('avLevelSelect');
const playAudioBtn = document.getElementById('playAudioBtn');
const submitNowBtn = document.getElementById('submitNowBtn');
const speedSelect = document.getElementById('speedSelect');
const instructionLog = document.getElementById('instructionLog');
const responseGrid = document.getElementById('responseGrid');
const citiesPlaceholder = document.getElementById('citiesPlaceholder');
const feedback = document.getElementById('avFeedback');

let closedCorridors = [];
let instructions = [];
let cityList = [];

// Default 65 cities (as provided) — will be sorted alphabetically before display
const defaultCities = [
  'Amsterdam','Ankara','Ashgabat','Baghdat','Bahrein','Baku','Bangkok','Basel','Batumi','Beirut',
  'Belgrade','Berlin','Bilbao','Bishkek','Bologna','Bombay','Boston','Bremen','Budapest','Dallas',
  'Delhi','Doha','Dubai','Dublin','Hamburg','Havana','Houston','Kathmandu','Kiev','Lagos',
  'Lisbon','London','Lyon','Madrid','Malaga','Malta','Manchester','Melbourne','Miami','Milan',
  'Montreal','Moscow','Munich','Paris','Phuket','Porto','Prague','Riyadh','Rotterdam','Salzburg',
  'Santiago','Shanghai','Singapore','Stockholm','Stuttgart','Sydney','Tashkent','Tokyo','Toronto','Tunis',
  'Valencia','Venice','Vienna','Zagreb','Zurich'
];

function makeCorridorButtons(){
  corridorGrid.innerHTML = '';
  for(let i=1;i<=9;i++){
    const el = document.createElement('div');
    el.textContent = i;
    el.style.padding = '10px';
    el.style.borderRadius = '8px';
    el.style.background = 'rgba(255,255,255,0.02)';
    el.style.color = 'var(--text)';
    el.style.textAlign = 'center';
    el.dataset.idx = i;
    corridorGrid.appendChild(el);
  }
}

function pickClosedCorridors(){
  const pool = [1,2,3,4,5,6,7,8,9];
  // pick two distinct closed corridors
  closedCorridors = [];
  while(closedCorridors.length < 2){
    const idx = Math.floor(Math.random()*pool.length);
    const val = pool.splice(idx,1)[0];
    closedCorridors.push(val);
  }
  closedCorridors.sort((a,b)=>a-b);
  closedListEl.textContent = closedCorridors.join(', ');
  // update visuals
  Array.from(corridorGrid.children).forEach(div => {
    const n = Number(div.dataset.idx);
    if(closedCorridors.includes(n)){
      div.style.opacity = '0.35';
      div.style.border = '2px dashed rgba(255,0,0,0.15)';
    } else {
      div.style.opacity = '1';
      div.style.border = '';
    }
  });
}

function buildInstructionsForSet(count){
  // Build `count` random instructions; include both open and closed corridors.
  // Mark instructions on closed corridors so they are ignored during scoring.
  instructions = [];
  const allCorridors = [1,2,3,4,5,6,7,8,9];
  const shuffledCities = cityList.slice().sort(() => Math.random() - 0.5);
  const shuffledCorridors = allCorridors.slice().sort(() => Math.random() - 0.5);
  for(let i=0;i<count;i++){
    const corridor = shuffledCorridors[i % shuffledCorridors.length];
    const city = shuffledCities[i] || (`City${i+1}`);
    const isClosed = closedCorridors.includes(corridor);
    instructions.push({city, corridor, closed: isClosed});
  }
}

function logInstruction(msg){
  const p = document.createElement('div');
  p.textContent = msg;
  instructionLog.appendChild(p);
  instructionLog.scrollTop = instructionLog.scrollHeight;
}

function playInstructions(){
  if(instructions.length === 0){ feedback.textContent = 'No instructions prepared.'; return; }
  playAudioBtn.disabled = true;
  feedback.textContent = '';
  let i = 0;
  function speakNext(){
    if(i >= instructions.length){
      playAudioBtn.disabled = false;
      feedback.textContent = 'Now select the cities on the response screen.';
      return;
    }
    const inst = instructions[i];
    const displayText = `To ${inst.city} on Corridor ${inst.corridor}`; // do not write closed marker
    const speechText = `To ${inst.city} on Corridor ${inst.corridor}`; // omit closed indicator in voice
    logInstruction(displayText);
    if(window.speechSynthesis){
      const u = new SpeechSynthesisUtterance(speechText);
      window.speechSynthesis.speak(u);
      u.onend = ()=>{ i++; setTimeout(speakNext, 350); };
    } else {
      i++; setTimeout(speakNext, 700);
    }
  }
  speakNext();
}

function populateResponseGrid(cities){
  // Ensure grid layout: 5 columns, 13 rows
  responseGrid.innerHTML = '';
  responseGrid.style.display = 'grid';
  responseGrid.style.gridTemplateColumns = 'repeat(5, 1fr)';
  responseGrid.style.gridTemplateRows = 'repeat(10, auto)';
  responseGrid.style.gridAutoFlow = 'column';
  responseGrid.style.gap = '8px';

  cities.forEach((city, idx) =>{
    const id = `city_${idx}`;
    const wrapper = document.createElement('div');
    wrapper.style.padding = '6px 8px';
    wrapper.style.borderRadius = '6px';
    wrapper.style.background = 'rgba(255,255,255,0.01)';
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.gap = '8px';
    const cb = document.createElement('input'); cb.type='checkbox'; cb.id=id; cb.dataset.city = city;
    const label = document.createElement('label'); label.htmlFor = id; label.textContent = city;
    wrapper.appendChild(cb); wrapper.appendChild(label);
    responseGrid.appendChild(wrapper);
  });
}

// Public: loadCityList(citiesArray)
function loadCityList(cities){
  if(!Array.isArray(cities)) throw new Error('Provide an array of city names');
  // Sort alphabetically (case-insensitive) as required by the spec
  const sorted = cities.slice().sort((a,b)=>a.localeCompare(b,'en',{sensitivity:'base'}));
  cityList = sorted;
  if(cityList.length === 0) return;
  if(citiesPlaceholder) citiesPlaceholder.remove();
  populateResponseGrid(cityList);
  feedback.textContent = `Loaded ${cityList.length} cities.`;
}

// Event wiring
makeCorridorButtons();
pickClosedCorridors();

newSetBtn.addEventListener('click', ()=>{ prepareNewSet(); });

playAudioBtn.addEventListener('click', ()=>{
  // Play instructions then start the response timer when done
  playInstructions();
  const expectedLen = instructions.length;
  let pollCount = 0;
  const poll = setInterval(()=>{
    if(instructionLog.children.length >= expectedLen || pollCount > 30){
      clearInterval(poll);
      setTimeout(()=> startResponseTimer(), 400);
    }
    pollCount += 1;
  }, 200);
});

// Expose loader for the user to call from console or later UI
window.loadCityList = loadCityList;

// Auto-load the provided default cities so the response grid is ready immediately.
window.loadCityList(defaultCities);

// Example: You can call `window.loadCityList([...])` from the console to replace the list.

// --- Scoring / timing / auto-evaluate logic ---
const avRoundEl = document.getElementById('avRound');
const avScoreEl = document.getElementById('avScore');
const avTimerEl = document.getElementById('avTimer');
let avRound = 0;
let avScore = 0;
let responseTimerId = null;
let responseCountdownInterval = null;
let perInstructionMs = 2500; // default per-instruction time (normal)
let baseMs = 2000; // default base time before/after instructions
let responseFillInterval = null;
let avInstructionCount = 8; // default Normal

function setAvStatus(){
  if(avRoundEl) avRoundEl.textContent = avRound;
  if(avScoreEl) avScoreEl.textContent = avScore;
}

function clearSelections(){
  Array.from(responseGrid.querySelectorAll('input[type=checkbox]')).forEach(cb=> cb.checked = false);
}

function prepareNewSet(){
  // prepare but don't auto-play; user may press Play Instructions
  instructionLog.innerHTML = '';
  pickClosedCorridors();
  avRound += 1;
  setAvStatus();
  // choose count based on selected difficulty
  const count = avInstructionCount;
  buildInstructionsForSet(count);
  playAudioBtn.disabled = false;
  if(submitNowBtn) submitNowBtn.disabled = true;
  feedback.textContent = `Prepared ${count} instructions.`;
  clearSelections();
  // cancel any previous timers
  if(responseTimerId) { clearTimeout(responseTimerId); responseTimerId = null; }
  if(responseCountdownInterval){ clearInterval(responseCountdownInterval); responseCountdownInterval = null; }
  if(avTimerEl) avTimerEl.textContent = '';
}

function startResponseTimer(){
  // Show response time based on number of instructions and selected speed
  if(submitNowBtn) submitNowBtn.disabled = false;
  const timeMs = baseMs + instructions.length * perInstructionMs; // base + per-instruction
  let remaining = Math.ceil(timeMs/1000);
  if(avTimerEl) avTimerEl.textContent = `Time: ${remaining}s`;
  // update every 1s
  responseCountdownInterval = setInterval(()=>{
    remaining -= 1;
    if(avTimerEl) avTimerEl.textContent = `Time: ${Math.max(0,remaining)}s`;
    if(remaining <= 0){ clearInterval(responseCountdownInterval); responseCountdownInterval = null; }
  }, 1000);
  // schedule evaluation
  responseTimerId = setTimeout(()=>{ evaluateResponse(); }, timeMs);

  // animate timer fill: update width and colors
  const fillEl = document.getElementById('timerFill');
  if(fillEl){
    const start = Date.now();
    const duration = timeMs;
    fillEl.classList.remove('warning','danger');
    fillEl.style.width = '100%';
    // clear any previous interval
    if(responseFillInterval) clearInterval(responseFillInterval);
    responseFillInterval = setInterval(()=>{
      const elapsed = Date.now() - start;
      const pct = Math.max(0, 1 - (elapsed / duration));
      fillEl.style.width = `${(pct*100).toFixed(1)}%`;
      // color thresholds: >60% green, 30-60% orange, <30% red
      if(pct <= 0.30) {
        fillEl.classList.add('danger');
        fillEl.classList.remove('warning');
      } else if(pct <= 0.60) {
        fillEl.classList.add('warning');
        fillEl.classList.remove('danger');
      } else {
        fillEl.classList.remove('warning','danger');
      }
      if(elapsed >= duration){ clearInterval(responseFillInterval); responseFillInterval = null; }
    }, 80);
  }
}

// Enable submit button when timer starts (user can submit early)
// (removed duplicate wrapper)

function evaluateResponse(){
  // gather selected cities (trimmed)
  const checked = Array.from(responseGrid.querySelectorAll('input[type=checkbox]:checked')).map(cb=>cb.dataset.city.trim());
  const selectedSet = new Set(checked);
  // Only cities on OPEN corridors are required
  const openInstructionCities = instructions.filter(i=>!i.closed).map(i=>i.city.trim());
  const requiredSet = new Set(openInstructionCities);
  // Determine correctness: all required selected and no extras (extras allowed? -> treat extra selections as wrong)
  const allRequiredSelected = [...requiredSet].every(c => selectedSet.has(c));
  const noExtraOpenSelections = [...selectedSet].every(c => requiredSet.has(c));
  const isCorrect = allRequiredSelected && noExtraOpenSelections;

  if(isCorrect){
    avScore += 1;
    feedback.textContent = 'Correct!';
    setAvStatus();
    highlightCorrect(openInstructionCities);
    setTimeout(()=>{ prepareNewSet(); }, 1400);
  } else {
    feedback.textContent = `Wrong — correct: ${openInstructionCities.join(', ')}.`;
    highlightCorrect(openInstructionCities, true);
  }
  if(avTimerEl) avTimerEl.textContent = '';
  if(responseTimerId){ clearTimeout(responseTimerId); responseTimerId = null; }
  if(responseCountdownInterval){ clearInterval(responseCountdownInterval); responseCountdownInterval = null; }
  if(responseFillInterval){ clearInterval(responseFillInterval); responseFillInterval = null; }
  const fillEl = document.getElementById('timerFill');
  if(fillEl){ fillEl.style.width = '0%'; fillEl.classList.add('danger'); }
}

function highlightCorrect(correctCities, showAll=false){
  // visually mark correct cities in the grid; if showAll true also mark incorrect choices
  const allInputs = Array.from(responseGrid.querySelectorAll('input[type=checkbox]'));
  allInputs.forEach(cb=>{
    const label = cb.nextElementSibling;
    if(correctCities.includes(cb.dataset.city)){
      if(label) label.style.background = 'rgba(34,197,94,0.12)';
      cb.checked = true;
    } else if(showAll){
      if(cb.checked){
        if(label) label.style.background = 'rgba(239,68,68,0.12)';
      }
    }
  });
  // clear highlights after 1.8s
  setTimeout(()=>{
    allInputs.forEach(cb=>{ if(cb.nextElementSibling) cb.nextElementSibling.style.background = ''; });
  }, 1800);
}

// Early submission handler and speed control wiring
function submitNow(){
  // cancel countdown if running
  if(responseTimerId){ clearTimeout(responseTimerId); responseTimerId = null; }
  if(responseCountdownInterval){ clearInterval(responseCountdownInterval); responseCountdownInterval = null; }
  if(avTimerEl) avTimerEl.textContent = '';
  evaluateResponse();
}

if(submitNowBtn){
  submitNowBtn.addEventListener('click', ()=>{ submitNow(); });
}

if(speedSelect){
  speedSelect.addEventListener('change', ()=>{
    const v = speedSelect.value;
    if(v === 'slow'){
      perInstructionMs = 3500; baseMs = 2500;
    } else if(v === 'fast'){
      perInstructionMs = 1800; baseMs = 1200;
    } else {
      perInstructionMs = 2500; baseMs = 2000;
    }
  });
}
// Level selection wiring
if(avLevelSelect){
  const applyLevel = () => {
    const lv = avLevelSelect.value;
    if(lv === 'easy') avInstructionCount = 5;
    else if(lv === 'hard') avInstructionCount = 10;
    else avInstructionCount = 8; // normal
  };
  avLevelSelect.addEventListener('change', applyLevel);
  applyLevel();
}
// Initialize status
setAvStatus();
