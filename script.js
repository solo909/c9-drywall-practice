const letters = ['A', 'B', 'C', 'D'];
const $ = (id) => document.getElementById(id);

const setupCard = $('setupCard');
const quizLayout = $('quizLayout');
const resultsCard = $('resultsCard');
const setSelect = $('setSelect');
const difficultySelect = $('difficultySelect');
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
const resultsSummary = $('resultsSummary');
const reviewMissedBtn = $('reviewMissedBtn');
const newQuizBtn = $('newQuizBtn');
const missedList = $('missedList');
const historyCard = $('historyCard');
const historyStats = $('historyStats');
const historyList = $('historyList');
const clearHistoryBtn = $('clearHistoryBtn');

const SCORE_HISTORY_KEY = 'c9DrywallScoreHistoryV1';

let state = {
  mode: 'practice',
  set: 'list1',
  difficulty: 1,
  questions: [],
  index: 0,
  answers: {},
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

function randomizeQuestionChoices(question) {
  const order = shuffle([0, 1, 2, 3]);
  return {
    ...question,
    choices: order.map(index => question.choices[index]),
    answer: order.indexOf(question.answer),
  };
}

function startQuiz() {
  state.mode = modeSelect.value;
  state.set = setSelect.value;
  state.difficulty = Number(difficultySelect.value);

  const pool = window.QUESTION_BANK.filter(
    q => q.set === state.set && Number(q.difficulty || 1) === state.difficulty
  );

  const selected = shuffle(pool).slice(0, 20);
  state.questions = state.difficulty === 2
    ? selected.map(randomizeQuestionChoices)
    : selected;
  state.index = 0;
  state.answers = {};
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
  return state.questions.reduce(
    (total, q) => total + (state.answers[q.id] === q.answer ? 1 : 0),
    0
  );
}

function renderQuestion() {
  const q = currentQuestion();
  const selected = selectedAnswer(q);
  const total = state.questions.length;
  const progress = ((state.index + 1) / total) * 100;

  progressLabel.textContent = `Question ${state.index + 1} of ${total}`;
  progressFill.style.width = `${progress}%`;
  scorePill.textContent = `Score: ${getScore()} correct`;
  sectionLabel.textContent = `${q.id} • ${q.section}`;
  questionText.textContent = q.q;
  answers.innerHTML = '';

  q.choices.forEach((choice, idx) => {
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

    const box = document.createElement('span');
    box.className = 'box';
    box.textContent = idx === selected ? '✓' : '';

    const label = document.createElement('span');
    const letter = document.createElement('strong');
    letter.textContent = `${letters[idx]}. `;
    label.appendChild(letter);
    label.appendChild(document.createTextNode(choice));

    btn.appendChild(box);
    btn.appendChild(label);
    btn.addEventListener('click', () => chooseAnswer(idx));
    answers.appendChild(btn);
  });

  prevBtn.disabled = state.index === 0;
  nextBtn.textContent = state.index === total - 1 ? 'Finish' : 'Next';

  if (selected === undefined) {
    showNeutral();
  } else if (state.mode === 'practice') {
    showFeedback(q, selected);
  } else {
    statusText.className = 'status-muted';
    statusText.textContent = 'Answer saved.';
    explanationText.textContent = 'In Test Mode, explanations appear at the end.';
  }
}

function showNeutral() {
  statusText.className = 'status-muted';
  statusText.textContent = '';
  explanationText.textContent = 'Tip: read all choices before selecting. Many C-9 questions are looking for the safest, most practical, or code/standard-based answer.';
}

function chooseAnswer(idx) {
  state.answers[currentQuestion().id] = idx;
  renderQuestion();
}

function showFeedback(q, selected) {
  const isCorrect = selected === q.answer;
  statusText.className = isCorrect ? 'status-correct' : 'status-wrong';
  statusText.textContent = isCorrect ? 'Correct' : 'Incorrect';
  buildExplanation(q, selected);
}

function buildExplanation(q, selected) {
  explanationText.innerHTML = '';

  const correct = document.createElement('p');
  const correctLabel = document.createElement('strong');
  correctLabel.textContent = 'Correct answer: ';
  correct.appendChild(correctLabel);
  correct.appendChild(document.createTextNode(`${letters[q.answer]}. ${q.choices[q.answer]}`));
  explanationText.appendChild(correct);

  if (selected !== q.answer) {
    const yours = document.createElement('p');
    const yoursLabel = document.createElement('strong');
    yoursLabel.textContent = 'Your answer: ';
    yours.appendChild(yoursLabel);
    yours.appendChild(document.createTextNode(`${letters[selected]}. ${q.choices[selected]}`));
    explanationText.appendChild(yours);
  }

  const explanation = document.createElement('p');
  explanation.textContent = q.explanation || topicTip(q);
  explanationText.appendChild(explanation);
}

function topicTip(q) {
  const text = `${q.q} ${q.choices.join(' ')}`.toLowerCase();

  if (text.includes('type x')) return 'Exam memory: Type X gypsum board points to fire resistance and rated assemblies. Rated assemblies should be installed exactly as specified.';
  if (text.includes('square feet') || text.includes('sheet covers') || text.includes('how many sheets') || text.includes('waste') || text.includes('ft ×') || text.includes('feet long')) return 'Drywall estimating is mostly area math: length × height, multiply by 2 for both sides, then divide by sheet size and round up.';
  if (text.includes('track')) return 'Track is usually measured in linear feet. A basic wall needs top track and bottom track, so wall length × 2.';
  if (text.includes('stud')) return 'For stud count, convert wall length to inches, divide by on-center spacing, then add one extra stud for the end.';
  if (text.includes('ladder') || text.includes('scaffold') || text.includes('ppe') || text.includes('hazard') || text.includes('asbestos') || text.includes('fall protection') || text.includes('cylinder') || text.includes('fire extinguisher') || text.includes('cal/osha')) return 'Safety questions usually favor the answer that removes the hazard, protects access, uses proper PPE, or follows Cal/OSHA or manufacturer rules.';
  if (text.includes('level 5') || text.includes('gloss') || text.includes('critical lighting') || text.includes('skim coat')) return 'Level 5 is the highest finish. Think gloss paint, dark paint, smooth walls, and critical lighting.';
  if (text.includes('screw') || text.includes('fastener')) return 'Fastener memory: Type S is for gypsum board to light-gauge steel; Type W is for wood framing.';
  if (text.includes('moisture') || text.includes('wet') || text.includes('water')) return 'Drywall must be protected from moisture. Wet or damaged board should be evaluated and rejected if it cannot perform properly.';
  if (text.includes('fire-rated') || text.includes('rated assembly') || text.includes('fire resistance') || text.includes('fire taping')) return 'For fire-rated assemblies, do not substitute materials casually. The tested/listed assembly controls board type, layers, fasteners, and details.';
  if (q.section.toLowerCase().includes('law') || text.includes('contract') || text.includes('payroll') || text.includes('bond') || text.includes('workers')) return 'Law & Business questions focus on contracts, licensing, payroll, bonds, insurance, employees, liens, and safety responsibilities.';
  if (q.section.toLowerCase().includes('finishing') || text.includes('compound') || text.includes('joint') || text.includes('sanding')) return 'Finishing questions often test compound type, finish level, sanding defects, critical lighting, and proper drying conditions.';
  return 'Focus on the key trade word in the question. The CSLB-style answer is usually the safest, most standard, and most job-correct choice.';
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

function getMissedQuestions() {
  return state.questions.filter(q => state.answers[q.id] !== q.answer);
}

function showResults() {
  quizLayout.classList.add('hidden');
  resultsCard.classList.remove('hidden');

  const total = state.questions.length;
  const answered = state.questions.filter(q => state.answers[q.id] !== undefined).length;
  const correct = getScore();
  const percent = Math.round((correct / total) * 100);
  const missed = getMissedQuestions();

  if (!state.scoreSaved) {
    state.scoreSaved = saveScore({
      date: new Date().toISOString(),
      set: state.set,
      mode: state.mode,
      difficulty: state.difficulty,
      correct,
      total,
      percent,
    });
  }

  historyCard.classList.remove('hidden');
  renderScoreHistory();

  resultsSummary.textContent = `You got ${correct} out of ${total} correct (${percent}%). Answered: ${answered}. Missed or blank: ${missed.length}.`;
  missedList.innerHTML = '';
}

function reviewMissed() {
  const missed = getMissedQuestions();
  missedList.innerHTML = '';

  if (missed.length === 0) {
    const item = document.createElement('div');
    item.className = 'missed-item';
    item.innerHTML = '<strong>No missed questions.</strong>';
    missedList.appendChild(item);
    return;
  }

  missed.forEach(q => {
    const user = state.answers[q.id];
    const div = document.createElement('div');
    div.className = 'missed-item';

    const title = document.createElement('strong');
    title.textContent = `${q.id} • ${q.q}`;
    div.appendChild(title);

    const correct = document.createElement('p');
    correct.textContent = `Correct: ${letters[q.answer]}. ${q.choices[q.answer]}`;
    div.appendChild(correct);

    const yours = document.createElement('p');
    yours.textContent = `Your answer: ${user === undefined ? 'Blank' : `${letters[user]}. ${q.choices[user]}`}`;
    div.appendChild(yours);

    const tip = document.createElement('p');
    tip.textContent = q.explanation || topicTip(q);
    div.appendChild(tip);

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
  } catch {
    return [];
  }
}

function saveScore(entry) {
  try {
    const history = loadScoreHistory();
    history.unshift(entry);
    localStorage.setItem(SCORE_HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
    return true;
  } catch (error) {
    console.warn('Score history could not be saved:', error);
    return false;
  }
}

function formatHistoryDate(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function renderScoreHistory() {
  const history = loadScoreHistory();
  historyList.innerHTML = '';

  if (history.length === 0) {
    historyStats.textContent = 'No scores yet.';
    const empty = document.createElement('p');
    empty.className = 'history-empty';
    empty.textContent = 'Finished quiz scores will appear here.';
    historyList.appendChild(empty);
    clearHistoryBtn.disabled = true;
    return;
  }

  clearHistoryBtn.disabled = false;
  const best = Math.max(...history.map(item => Number(item.percent) || 0));
  const average = Math.round(history.reduce((sum, item) => sum + (Number(item.percent) || 0), 0) / history.length);
  historyStats.textContent = `Attempts: ${history.length} • Best: ${best}% • Average: ${average}%`;

  history.slice(0, 10).forEach(item => {
    const row = document.createElement('div');
    row.className = 'history-row';

    const info = document.createElement('span');
    const setName = item.set === 'list1' ? 'List 1' : 'List 2';
    const level = Number(item.difficulty || 1);
    info.textContent = `${formatHistoryDate(item.date)} • ${setName} • Level ${level}`;

    const mode = document.createElement('span');
    mode.className = 'history-mode';
    mode.textContent = item.mode === 'test' ? 'Test' : 'Practice';

    const score = document.createElement('span');
    score.className = 'history-score';
    score.textContent = `${item.correct}/${item.total} — ${item.percent}%`;

    row.appendChild(info);
    row.appendChild(mode);
    row.appendChild(score);
    historyList.appendChild(row);
  });
}

function clearScoreHistory() {
  if (!window.confirm('Clear all saved score history?')) return;
  try {
    localStorage.removeItem(SCORE_HISTORY_KEY);
  } catch {}
  renderScoreHistory();
}

startBtn.addEventListener('click', startQuiz);
nextBtn.addEventListener('click', nextQuestion);
prevBtn.addEventListener('click', prevQuestion);
restartBtn.addEventListener('click', restartToSetup);
newQuizBtn.addEventListener('click', restartToSetup);
reviewMissedBtn.addEventListener('click', reviewMissed);
clearHistoryBtn.addEventListener('click', clearScoreHistory);

renderScoreHistory();

document.addEventListener('keydown', (event) => {
  if (quizLayout.classList.contains('hidden')) return;
  if (['1', '2', '3', '4'].includes(event.key)) chooseAnswer(Number(event.key) - 1);
  if (event.key === 'ArrowRight') nextQuestion();
  if (event.key === 'ArrowLeft') prevQuestion();
});
