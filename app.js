// Memory Max — Option 1 pivot behavior
const MAX_NUM = 9;
const displayEl = document.getElementById('display');
const roundEl = document.getElementById('round');
const scoreEl = document.getElementById('score');
const startBtn = document.getElementById('startBtn');
const nextBtn = document.getElementById('nextBtn');
const restartBtn = document.getElementById('restartBtn');
const answerArea = document.getElementById('answerArea');
const numberGrid = document.getElementById('numberGrid');
const feedbackEl = document.getElementById('feedback');
const responseDisplay = document.getElementById('responseDisplay');
const submitBtn = document.getElementById('submitBtn');
const clearBtn = document.getElementById('clearBtn');
const introImageArea = document.getElementById('introImageArea');
const answerImageArea = document.getElementById('answerImageArea');
const correctImageArea = document.getElementById('correctImageArea');
const wrongImageArea = document.getElementById('wrongImageArea');
const confettiContainer = document.getElementById('confettiContainer');

let round = 0;
let score = 0;
let currentSequence = [];
let awaitingAnswer = false;
let currentResponse = '';

// Confetti emojis for celebration
const confettiEmojis = ['🌹', '❤️', '💕', '🌹', '❤️', '💕'];
const sadEmojis = ['💔', '😢', '😭', '💔', '😢', '😭'];

function randInt(min, max){ return Math.floor(Math.random()*(max-min+1))+min }

function setStatus(){ roundEl.textContent = round; scoreEl.textContent = score }

function generateSequence(len){
  const seq = [];
  for(let i=0;i<len;i++) seq.push(randInt(0, MAX_NUM));
  return seq;
}

// Option 1 pivot: first index i where seq[i] > seq[i-1], pivot = seq[i]
// Fallback: if no pivot found, use max of sequence as pivot (reasonable default)
function computePivot(seq){
  for(let i=1;i<seq.length;i++){
    if(seq[i] > seq[i-1]) return seq[i];
  }
  return Math.max(...seq);
}

function computeCorrectAnswer(seq){
  // Submit the first number and all numbers >= the first number
  // For sequence [5, 9], answer is "59"
  // For sequence [5, 3, 7], answer is "57" (skip 3 because it's < 5)
  if(seq.length === 0) return '';
  const firstNum = seq[0];
  const parts = seq.filter(n => n >= firstNum).map(String);
  return parts.join('');
}

async function showSequence(seq){
  for(let i=0;i<seq.length;i++){
    displayEl.textContent = seq[i];
    displayEl.style.opacity = '0';
    await new Promise(r=>requestAnimationFrame(r));
    displayEl.style.transition = 'opacity 0.12s';
    displayEl.style.opacity = '1';
    await new Promise(r=>setTimeout(r, 1000));
    displayEl.style.opacity = '0';
    await new Promise(r=>setTimeout(r, 100));
  }
  displayEl.style.transition = '';
  displayEl.textContent = '';
}

function createNumberButtons(){
  numberGrid.innerHTML = '';
  for(let i=0;i<=MAX_NUM;i++){
    const b = document.createElement('button');
    b.textContent = i;
    b.dataset.val = i;
    b.addEventListener('click', ()=>onNumberTap(String(b.dataset.val)));
    numberGrid.appendChild(b);
  }
}

function setResponse(str){
  currentResponse = str;
  responseDisplay.textContent = currentResponse;
  clearBtn.disabled = currentResponse.length === 0;
  submitBtn.disabled = currentResponse.length === 0;
}

function onNumberTap(valStr){
  if(!awaitingAnswer) return;
  // append the tapped number's string representation
  setResponse(currentResponse + valStr);
}

function enableAnswerArea(enabled){
  if(enabled){
    answerArea.classList.remove('hidden');
    Array.from(numberGrid.children).forEach(b=>b.disabled=false);
    awaitingAnswer = true;
    feedbackEl.textContent = '';
    setResponse('');
  } else {
    answerArea.classList.add('hidden');
    Array.from(numberGrid.children).forEach(b=>b.disabled=true);
    awaitingAnswer = false;
    setResponse('');
  }
}

async function startRound(){
  startBtn.disabled = true;
  nextBtn.disabled = true;
  restartBtn.disabled = false;
  // Hide intro, show answer image
  introImageArea.classList.add('hidden');
  answerImageArea.classList.remove('hidden');
  correctImageArea.classList.add('hidden');
  wrongImageArea.classList.add('hidden');
  round += 1;
  setStatus();
  currentSequence = generateSequence(round);
  enableAnswerArea(false);
  feedbackEl.textContent = 'Watch closely...';
  await showSequence(currentSequence);
  feedbackEl.textContent = '';
  enableAnswerArea(true);
}

function submitAnswer(){
  if(!awaitingAnswer) return;
  const correct = computeCorrectAnswer(currentSequence);
  if(currentResponse === correct){
    score += 1;
    feedbackEl.textContent = 'Correct!';
    scoreEl.textContent = score;
    enableAnswerArea(false);
    showCorrectFeedback();
    nextBtn.disabled = false;
  } else {
    feedbackEl.textContent = `Wrong — correct was ${correct}. Game over.`;
    enableAnswerArea(false);
    showWrongFeedback();
    startBtn.disabled = false;
    nextBtn.disabled = true;
    restartBtn.disabled = false;
  }
}

function clearResponse(){ setResponse(''); }

function spawnConfetti(emojis, count = 15){
  for(let i=0;i<count;i++){
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    const el = document.createElement('div');
    el.className = 'confetti';
    el.textContent = emoji;
    el.style.left = Math.random() * 100 + '%';
    el.style.top = '-20px';
    el.style.opacity = '1';
    confettiContainer.appendChild(el);
    // remove after animation
    setTimeout(()=>el.remove(), 3000);
  }
}

function showCorrectFeedback(){
  // Show correct image, hide others
  introImageArea.classList.add('hidden');
  answerImageArea.classList.add('hidden');
  wrongImageArea.classList.add('hidden');
  correctImageArea.classList.remove('hidden');
  spawnConfetti(confettiEmojis);
}

function showWrongFeedback(){
  // Show wrong image, hide others
  introImageArea.classList.add('hidden');
  answerImageArea.classList.add('hidden');
  correctImageArea.classList.add('hidden');
  wrongImageArea.classList.remove('hidden');
  spawnConfetti(sadEmojis);
}

function restartGame(){
  round = 0; score = 0; currentSequence = [];
  setStatus();
  displayEl.textContent = 'Press Start';
  feedbackEl.textContent = '';
  startBtn.disabled = false;
  nextBtn.disabled = true;
  restartBtn.disabled = true;
  enableAnswerArea(false);
  // Show intro, hide others
  introImageArea.classList.remove('hidden');
  answerImageArea.classList.add('hidden');
  correctImageArea.classList.add('hidden');
  wrongImageArea.classList.add('hidden');
}

// build UI
createNumberButtons();
restartGame();

startBtn.addEventListener('click', ()=>{ startRound(); });
nextBtn.addEventListener('click', ()=>{ startRound(); });
restartBtn.addEventListener('click', ()=>{ restartGame(); });
submitBtn.addEventListener('click', ()=>{ submitAnswer(); });
clearBtn.addEventListener('click', ()=>{ clearResponse(); });
