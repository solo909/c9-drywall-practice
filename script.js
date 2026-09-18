const letters = ['A', 'B', 'C', 'D'];

const $ = (id) => document.getElementById(id);
const setupCard = $('setupCard');
const quizLayout = $('quizLayout');
const resultsCard = $('resultsCard');
const languageSelect = $('languageSelect');
const setSelect = $('setSelect');
const modeSelect = $('modeSelect');
const startBtn = $('startBtn');
const progressLabel = $('progressLabel');
const progressFill = $('progressFill');
const scorePill = $('scorePill');
const sectionLabel = $('sectionLabel');
const questionText = $('questionText');
const answers = $('answers');
const statusText = $('statusText');
const explanationText = $('explanationText');
const prevBtn = $('prevBtn');
const nextBtn = $('nextBtn');
const restartBtn = $('restartBtn');
const resultsTitle = $('resultsTitle');
const resultsSummary = $('resultsSummary');
const reviewMissedBtn = $('reviewMissedBtn');
const newQuizBtn = $('newQuizBtn');
const missedList = $('missedList');
const historyCard = $('historyCard');
const historyTitle = $('historyTitle');
const historyStats = $('historyStats');
const historyList = $('historyList');
const clearHistoryBtn = $('clearHistoryBtn');

const SCORE_HISTORY_KEY = 'c9DrywallScoreHistoryV1';

let state = {
  language: 'en',
  mode: 'practice',
  set: 'list1',
  questions: [],
  index: 0,
  answers: {},
  finished: false,
  scoreSaved: false,
};

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function startQuiz() {
  state.language = languageSelect.value;
  state.mode = modeSelect.value;
  const setValue = setSelect.value;
  state.set = setValue;

  // Keep List 1 and List 2 separate. Every new quiz pulls 20 random questions
  // from only the selected list.
  const pool = window.QUESTION_BANK.filter(q => q.set === setValue);
  state.questions = shuffle(pool).slice(0, 20);
  state.index = 0;
  state.answers = {};
  state.finished = false;
  state.scoreSaved = false;

  setupCard.classList.add('hidden');
  historyCard.classList.add('hidden');
  resultsCard.classList.add('hidden');
  quizLayout.classList.remove('hidden');
  renderQuestion();
}

function currentQuestion() {
  return state.questions[state.index];
}

function selectedAnswer(q) {
  return state.answers[q.id];
}

function getScore() {
  let correct = 0;
  for (const q of state.questions) {
    if (state.answers[q.id] === q.answer) correct++;
  }
  return correct;
}

function renderQuestion() {
  const q = currentQuestion();
  const lang = state.language;
  const selected = selectedAnswer(q);
  const total = state.questions.length;
  const progress = ((state.index + 1) / total) * 100;

  progressLabel.textContent = lang === 'es'
    ? `Pregunta ${state.index + 1} de ${total}`
    : `Question ${state.index + 1} of ${total}`;
  progressFill.style.width = `${progress}%`;
  scorePill.textContent = lang === 'es'
    ? `Puntaje: ${getScore()} correctas`
    : `Score: ${getScore()} correct`;
  sectionLabel.textContent = `${q.id} • ${q.section}`;
  questionText.textContent = q.q[lang];
  answers.innerHTML = '';

  q.choices[lang].forEach((choice, idx) => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.type = 'button';

    if (selected !== undefined) {
      if (state.mode === 'practice') {
        if (idx === q.answer) btn.classList.add('correct');
        if (idx === selected && selected !== q.answer) btn.classList.add('wrong');
      }
      if (idx === selected) btn.classList.add('selected');
    }

    btn.innerHTML = `<span class="box">${idx === selected ? '✓' : ''}</span><span><strong>${letters[idx]}.</strong> ${choice}</span>`;
    btn.addEventListener('click', () => chooseAnswer(idx));
    answers.appendChild(btn);
  });

  prevBtn.disabled = state.index === 0;
  nextBtn.textContent = state.index === total - 1
    ? (lang === 'es' ? 'Terminar' : 'Finish')
    : (lang === 'es' ? 'Siguiente' : 'Next');
  prevBtn.textContent = lang === 'es' ? 'Atrás' : 'Back';
  restartBtn.textContent = lang === 'es' ? 'Reiniciar' : 'Restart';

  if (selected === undefined) {
    showNeutral(lang);
  } else if (state.mode === 'practice') {
    showFeedback(q, selected);
  } else {
    statusText.className = 'status-muted';
    statusText.textContent = lang === 'es' ? 'Respuesta guardada.' : 'Answer saved.';
    explanationText.innerHTML = lang === 'es'
      ? 'En Test Mode, la explicación aparece al final. Cambia a Practice Mode para ver right/wrong al momento.'
      : 'In Test Mode, explanations appear at the end. Use Practice Mode to see right/wrong immediately.';
  }
}

function showNeutral(lang) {
  statusText.className = 'status-muted';
  statusText.textContent = '';
  explanationText.innerHTML = lang === 'es'
    ? 'Tip: lee todas las opciones antes de escoger. Muchas preguntas del C-9 buscan la respuesta más segura, más práctica, o la que sigue el code/standard.'
    : 'Tip: read all choices before selecting. Many C-9 questions are looking for the safest, most practical, or code/standard-based answer.';
}

function chooseAnswer(idx) {
  const q = currentQuestion();
  state.answers[q.id] = idx;
  renderQuestion();
}

function showFeedback(q, selected) {
  const lang = state.language;
  const isCorrect = selected === q.answer;
  statusText.className = isCorrect ? 'status-correct' : 'status-wrong';
  statusText.textContent = isCorrect
    ? (lang === 'es' ? 'Correcto' : 'Correct')
    : (lang === 'es' ? 'Incorrecto' : 'Incorrect');

  explanationText.innerHTML = buildExplanation(q, selected, lang);
}

function buildExplanation(q, selected, lang) {
  const correctChoice = q.choices[lang][q.answer];
  const selectedChoice = q.choices[lang][selected];
  const base = lang === 'es'
    ? `<p><strong>Respuesta correcta:</strong> ${letters[q.answer]}. ${correctChoice}</p>` +
      (selected !== q.answer ? `<p><strong>Tu respuesta:</strong> ${letters[selected]}. ${selectedChoice}</p>` : '')
    : `<p><strong>Correct answer:</strong> ${letters[q.answer]}. ${correctChoice}</p>` +
      (selected !== q.answer ? `<p><strong>Your answer:</strong> ${letters[selected]}. ${selectedChoice}</p>` : '');

  const explanation = q.explanation?.[lang] || topicTip(q, lang);
  return base + `<p>${explanation}</p>`;
}

function topicTip(q, lang) {
  const text = `${q.q.en} ${q.choices.en.join(' ')}`.toLowerCase();

  const tipsEn = {
    typex: 'Exam memory: Type X gypsum board points to fire resistance and rated assemblies. Rated assemblies should be installed exactly as specified.',
    math: 'Drywall estimating is mostly area math: length × height, multiply by 2 for both sides, then divide by sheet size and round up.',
    track: 'Track is usually measured in linear feet. A basic wall needs top track and bottom track, so wall length × 2.',
    studs: 'For stud count, convert wall length to inches, divide by on-center spacing, then add one extra stud for the end.',
    safety: 'Safety questions usually favor the answer that removes the hazard, protects access, uses proper PPE, or follows Cal/OSHA/manufacturer rules.',
    level5: 'Level 5 finish is the highest finish. Think gloss paint, dark paint, smooth walls, and critical lighting.',
    screw: 'Fastener memory: Type S is for gypsum board to light-gauge steel; Type W is for wood framing.',
    moisture: 'Drywall must be protected from moisture. Wet or damaged board should be evaluated and rejected if it cannot perform properly.',
    fire: 'For fire-rated assemblies, do not substitute materials casually. The tested/listed assembly controls board type, layers, fasteners, and details.',
    law: 'Law & Business questions focus on contracts, licensing, payroll, bonds, insurance, employees, liens, and safety responsibilities.',
    finish: 'Finishing questions often test compound type, finish level, sanding defects, critical lighting, and proper drying conditions.',
    default: 'Focus on the key trade word in the question. The CSLB-style answer is usually the safest, most standard, and most job-correct choice.'
  };

  const tipsEs = {
    typex: 'Para memorizar: Type X gypsum board apunta a fire resistance y rated assemblies. Una rated assembly se instala exactamente como está especificada.',
    math: 'Estimating de drywall casi siempre es area math: length × height, multiplicar por 2 si son los dos lados, dividir por sheet size y redondear para arriba.',
    track: 'Track normalmente se mide en linear feet. Una wall básica necesita top track y bottom track: wall length × 2.',
    studs: 'Para contar studs, convierte wall length a inches, divide por on-center spacing, y suma uno extra para el final.',
    safety: 'En safety, normalmente gana la opción que quita el hazard, protege access, usa PPE correcto, o sigue Cal/OSHA/manufacturer rules.',
    level5: 'Level 5 finish es el finish más alto. Piensa en gloss paint, dark paint, smooth walls, y critical lighting.',
    screw: 'Para memorizar fasteners: Type S es para gypsum board a light-gauge steel; Type W es para wood framing.',
    moisture: 'Drywall debe protegerse de moisture. Board mojada o dañada se debe revisar y rechazar si ya no sirve bien.',
    fire: 'En fire-rated assemblies, no cambies materials al azar. La tested/listed assembly controla board type, layers, fasteners, y details.',
    law: 'Law & Business se enfoca en contracts, licensing, payroll, bonds, insurance, employees, liens, y safety responsibilities.',
    finish: 'Finishing pregunta mucho sobre compound type, finish level, sanding defects, critical lighting, y drying conditions.',
    default: 'Concéntrate en la palabra clave del trade. La respuesta estilo CSLB normalmente es la opción más safe, standard, y correcta para el job.'
  };

  const tips = lang === 'es' ? tipsEs : tipsEn;

  if (text.includes('type x')) return tips.typex;
  if (text.includes('square feet') || text.includes('sheet covers') || text.includes('how many sheets') || text.includes('waste') || text.includes('ft ×') || text.includes('feet long')) return tips.math;
  if (text.includes('track')) return tips.track;
  if (text.includes('stud')) return tips.studs;
  if (text.includes('ladder') || text.includes('scaffold') || text.includes('ppe') || text.includes('hazard') || text.includes('asbestos') || text.includes('fall protection') || text.includes('cylinder') || text.includes('fire extinguisher') || text.includes('cal/osha')) return tips.safety;
  if (text.includes('level 5') || text.includes('gloss') || text.includes('critical lighting') || text.includes('skim coat')) return tips.level5;
  if (text.includes('screw') || text.includes('fastener')) return tips.screw;
  if (text.includes('moisture') || text.includes('wet') || text.includes('water')) return tips.moisture;
  if (text.includes('fire-rated') || text.includes('rated assembly') || text.includes('fire resistance') || text.includes('fire taping')) return tips.fire;
  if (q.section.toLowerCase().includes('law') || text.includes('contract') || text.includes('payroll') || text.includes('bond') || text.includes('workers')) return tips.law;
  if (q.section.toLowerCase().includes('finishing') || text.includes('compound') || text.includes('joint') || text.includes('sanding')) return tips.finish;
  return tips.default;
}

function nextQuestion() {
  if (state.index === state.questions.length - 1) {
    showResults();
    return;
  }
  state.index++;
  renderQuestion();
}

function prevQuestion() {
  if (state.index > 0) {
    state.index--;
    renderQuestion();
  }
}

function showResults() {
  state.finished = true;
  quizLayout.classList.add('hidden');
  resultsCard.classList.remove('hidden');

  const lang = state.language;
  const total = state.questions.length;
  const answered = state.questions.filter(q => state.answers[q.id] !== undefined).length;
  const correct = getScore();
  const percent = Math.round((correct / total) * 100);
  const missed = getMissedQuestions();

  if (!state.scoreSaved) {
    saveScore({
      date: new Date().toISOString(),
      set: state.set,
      language: state.language,
      mode: state.mode,
      correct,
      total,
      percent,
    });
    state.scoreSaved = true;
  }

  resultsTitle.textContent = lang === 'es' ? 'Resultados' : 'Results';
  resultsSummary.textContent = lang === 'es'
    ? `Sacó ${correct} de ${total} correctas (${percent}%). Respondidas: ${answered}. Falladas o en blanco: ${missed.length}.`
    : `You got ${correct} out of ${total} correct (${percent}%). Answered: ${answered}. Missed or blank: ${missed.length}.`;
  reviewMissedBtn.textContent = lang === 'es' ? 'Revisar falladas' : 'Review missed questions';
  newQuizBtn.textContent = lang === 'es' ? 'Empezar de nuevo' : 'Start over';
  missedList.innerHTML = '';
}

function getMissedQuestions() {
  return state.questions.filter(q => state.answers[q.id] !== q.answer);
}

function reviewMissed() {
  const lang = state.language;
  const missed = getMissedQuestions();
  missedList.innerHTML = '';

  if (missed.length === 0) {
    missedList.innerHTML = `<div class="missed-item"><strong>${lang === 'es' ? 'No hay preguntas falladas.' : 'No missed questions.'}</strong></div>`;
    return;
  }

  missed.forEach(q => {
    const user = state.answers[q.id];
    const div = document.createElement('div');
    div.className = 'missed-item';
    div.innerHTML = `
      <strong>${q.id} • ${q.q[lang]}</strong>
      <p>${lang === 'es' ? 'Correcta' : 'Correct'}: ${letters[q.answer]}. ${q.choices[lang][q.answer]}</p>
      <p>${lang === 'es' ? 'Tu respuesta' : 'Your answer'}: ${user === undefined ? (lang === 'es' ? 'En blanco' : 'Blank') : `${letters[user]}. ${q.choices[lang][user]}`}</p>
      <p>${topicTip(q, lang)}</p>
    `;
    missedList.appendChild(div);
  });
}

function restartToSetup() {
  quizLayout.classList.add('hidden');
  resultsCard.classList.add('hidden');
  setupCard.classList.remove('hidden');
  historyCard.classList.remove('hidden');
  missedList.innerHTML = '';
  renderScoreHistory();
}

function loadScoreHistory() {
  try {
    const saved = JSON.parse(localStorage.getItem(SCORE_HISTORY_KEY) || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    return [];
  }
}

function saveScore(entry) {
  try {
    const history = loadScoreHistory();
    history.unshift(entry);
    localStorage.setItem(SCORE_HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
  } catch (error) {
    // The quiz still works even if the browser blocks local storage.
  }
}

function formatHistoryDate(iso, lang) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(lang === 'es' ? 'es-US' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function renderScoreHistory() {
  const lang = languageSelect.value;
  const history = loadScoreHistory();

  historyTitle.textContent = lang === 'es' ? 'Historial de Puntajes' : 'Score History';
  clearHistoryBtn.textContent = lang === 'es' ? 'Borrar historial' : 'Clear history';
  historyList.innerHTML = '';

  if (history.length === 0) {
    historyStats.textContent = lang === 'es' ? 'Todavía no hay puntajes.' : 'No scores yet.';
    historyList.innerHTML = `<p class="history-empty">${lang === 'es' ? 'Los resultados aparecerán aquí después de terminar un quiz.' : 'Finished quiz scores will appear here.'}</p>`;
    clearHistoryBtn.disabled = true;
    return;
  }

  clearHistoryBtn.disabled = false;
  const best = Math.max(...history.map(item => Number(item.percent) || 0));
  const average = Math.round(history.reduce((sum, item) => sum + (Number(item.percent) || 0), 0) / history.length);
  historyStats.textContent = lang === 'es'
    ? `Intentos: ${history.length} • Mejor: ${best}% • Promedio: ${average}%`
    : `Attempts: ${history.length} • Best: ${best}% • Average: ${average}%`;

  history.slice(0, 10).forEach(item => {
    const row = document.createElement('div');
    row.className = 'history-row';
    const setName = item.set === 'list1'
      ? (lang === 'es' ? 'Lista 1' : 'List 1')
      : (lang === 'es' ? 'Lista 2' : 'List 2');
    const languageName = item.language === 'es' ? 'Español' : 'English';
    const modeName = item.mode === 'test'
      ? (lang === 'es' ? 'Examen' : 'Test')
      : (lang === 'es' ? 'Práctica' : 'Practice');
    row.innerHTML = `
      <span>${formatHistoryDate(item.date, lang)} • ${setName}</span>
      <span class="history-language">${languageName}</span>
      <span class="history-mode">${modeName}</span>
      <span class="history-score">${item.correct}/${item.total} — ${item.percent}%</span>
    `;
    historyList.appendChild(row);
  });
}

function clearScoreHistory() {
  const lang = languageSelect.value;
  const message = lang === 'es'
    ? '¿Borrar todo el historial de puntajes?'
    : 'Clear all saved score history?';
  if (!window.confirm(message)) return;
  try {
    localStorage.removeItem(SCORE_HISTORY_KEY);
  } catch (error) {
    // Ignore storage errors and refresh the visible history.
  }
  renderScoreHistory();
}

startBtn.addEventListener('click', startQuiz);
nextBtn.addEventListener('click', nextQuestion);
prevBtn.addEventListener('click', prevQuestion);
restartBtn.addEventListener('click', restartToSetup);
newQuizBtn.addEventListener('click', restartToSetup);
reviewMissedBtn.addEventListener('click', reviewMissed);
clearHistoryBtn.addEventListener('click', clearScoreHistory);
languageSelect.addEventListener('change', renderScoreHistory);

renderScoreHistory();

// Helpful keyboard controls for desktop use.
document.addEventListener('keydown', (event) => {
  if (quizLayout.classList.contains('hidden')) return;
  if (['1','2','3','4'].includes(event.key)) chooseAnswer(Number(event.key) - 1);
  if (event.key === 'ArrowRight') nextQuestion();
  if (event.key === 'ArrowLeft') prevQuestion();
});
