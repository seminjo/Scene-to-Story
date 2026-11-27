import { firebaseConfig, TEACHER_EMAIL } from './firebase-config.js';

const state = {
  step: 0,
  level: 2,
  hintCount: 0,
  hintsUsed: [],
  user: { uid: 'demo-student', name: 'Demo Student', email: 'demo@student.local', demo: true },
  draft: '',
  rewrite: '',
  reflection: '',
  feedback: null,
  records: [],
  teacherRecords: []
};

const screens = {
  start: document.getElementById('startScreen'),
  plan: document.getElementById('planScreen'),
  draft: document.getElementById('draftScreen'),
  hint: document.getElementById('hintScreen'),
  rewrite: document.getElementById('rewriteScreen'),
  finish: document.getElementById('finishScreen'),
  records: document.getElementById('recordsScreen'),
  teacher: document.getElementById('teacherScreen')
};

const el = {
  stepLabel: document.getElementById('stepLabel'), levelBadge: document.getElementById('levelBadge'),
  homeBtn: document.getElementById('homeBtn'), bottomNav: document.getElementById('bottomNav'),
  backBtn: document.getElementById('backBtn'), nextBtn: document.getElementById('nextBtn'),
  userChip: document.getElementById('userChip'), teacherTab: document.getElementById('teacherTab'),
  googleLoginBtn: document.getElementById('googleLoginBtn'), demoLoginBtn: document.getElementById('demoLoginBtn'),
  startWritingBtn: document.getElementById('startWritingBtn'),
  planWho: document.getElementById('planWho'), planWhere: document.getElementById('planWhere'),
  planWhat: document.getElementById('planWhat'), planFeel: document.getElementById('planFeel'),
  supportPanel: document.getElementById('supportPanel'), draftText: document.getElementById('draftText'),
  sentenceCount: document.getElementById('sentenceCount'), privacyWarning: document.getElementById('privacyWarning'),
  draftPreview: document.getElementById('draftPreview'), praiseText: document.getElementById('praiseText'),
  fixText: document.getElementById('fixText'), questionText: document.getElementById('questionText'),
  koreanHelpBtn: document.getElementById('koreanHelpBtn'), koreanHelp: document.getElementById('koreanHelp'),
  hint1Btn: document.getElementById('hint1Btn'), hint2Btn: document.getElementById('hint2Btn'),
  hint3Btn: document.getElementById('hint3Btn'), hintOutput: document.getElementById('hintOutput'),
  originalDraftText: document.getElementById('originalDraftText'), rewriteText: document.getElementById('rewriteText'),
  rewriteFocus: document.getElementById('rewriteFocus'), beforeText: document.getElementById('beforeText'),
  afterText: document.getElementById('afterText'), reflectionText: document.getElementById('reflectionText'),
  aiSummary: document.getElementById('aiSummary'), sampleBtn: document.getElementById('sampleBtn'),
  sampleCard: document.getElementById('sampleCard'), saveRecordBtn: document.getElementById('saveRecordBtn'),
  saveStatus: document.getElementById('saveStatus'), recordsList: document.getElementById('recordsList'),
  teacherRecordsList: document.getElementById('teacherRecordsList')
};

let firebaseReady = false;
let auth = null;
let db = null;
let fb = {};

function configLooksReal() {
  return firebaseConfig.apiKey && !firebaseConfig.apiKey.includes('PASTE_');
}

async function initFirebase() {
  if (!configLooksReal()) { updateUserUI(); return; }
  try {
    const appMod = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js');
    const authMod = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js');
    const fsMod = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js');
    const app = appMod.initializeApp(firebaseConfig);
    auth = authMod.getAuth(app);
    db = fsMod.getFirestore(app);
    fb = { ...authMod, ...fsMod };
    firebaseReady = true;
    authMod.onAuthStateChanged(auth, user => {
      if (user) {
        state.user = { uid: user.uid, name: user.displayName || user.email || 'Student', email: user.email || '', demo: false };
        updateUserUI(); loadMyRecords(); maybeLoadTeacherRecords();
      }
    });
  } catch (err) {
    console.warn('Firebase unavailable. Demo mode stays active.', err);
  }
  updateUserUI();
}

function updateUserUI() {
  el.userChip.textContent = state.user?.name || 'Guest';
  const isTeacher = state.user?.email?.toLowerCase() === TEACHER_EMAIL.toLowerCase();
  el.teacherTab.classList.toggle('hidden', !isTeacher);
}

function showOnly(screen) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screen.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showStep(step) {
  state.step = step;
  const map = { 0: screens.start, 1: screens.plan, 2: screens.draft, 3: screens.hint, 4: screens.rewrite, 5: screens.finish };
  showOnly(map[step]);
  el.bottomNav.classList.toggle('hidden', step === 0 || step === 5);
  el.stepLabel.textContent = step === 0 ? 'Start' : `Step ${step} / 5`;
  document.querySelectorAll('.step-dot').forEach((dot, i) => {
    const n = i + 1;
    dot.classList.toggle('active', n === step);
    dot.classList.toggle('done', n < step);
  });
  el.levelBadge.textContent = `Level ${state.level}`;
  renderCurrentStep();
}

function renderCurrentStep() {
  if (state.step === 2) renderSupport();
  if (state.step === 3) prepareFeedback();
  if (state.step === 4) prepareRewrite();
  if (state.step === 5) prepareFinish();
}

function renderSupport() {
  const copy = {
    1: '<strong>Level 1 support</strong><br>First, I saw ___. Then, ___. I felt ___ because ___.',
    2: '<strong>Level 2 support</strong><br>Who? Where? What happened next? Why?',
    3: '<strong>Level 3 support</strong><br>Try free writing. Use first, then, after that, because, so, finally.'
  };
  el.supportPanel.innerHTML = copy[state.level];
}

function countSentences(text) {
  return text.split(/[.!?]+/).map(s => s.trim()).filter(Boolean).length;
}

function containsPersonalInfo(text) {
  const phone = /\b\d{2,3}[-.\s]?\d{3,4}[-.\s]?\d{4}\b/.test(text);
  const school = /\b(school|high school|middle school|elementary school|university)\b/i.test(text);
  const address = /\b(address|street|road|avenue|apt|apartment)\b/i.test(text);
  const selfName = /\bmy name is\b/i.test(text);
  return phone || school || address || selfName;
}

function privacySafe() {
  const unsafe = containsPersonalInfo(el.draftText.value);
  el.privacyWarning.classList.toggle('hidden', !unsafe);
  return !unsafe;
}

function chooseFeedback(text) {
  const t = text.trim();
  const lower = t.toLowerCase();
  const n = countSentences(t);

  if (/\bi wait bus\b/i.test(t) || /\bi wait the bus\b/i.test(t)) {
    return { focus: 'I wait bus', praise: 'Your story has a clear event.', fix: 'Look at “I wait bus.”', question: 'The story happened yesterday. What verb form do you need?', ko: '이야기가 어제 일어난 일이므로 과거 시제를 떠올려 보세요.', category: 'past tense' };
  }
  if (/\ba girl give\b/i.test(t) || /\bshe give\b/i.test(t)) {
    const focus = t.match(/(?:a girl give|she give)[^.!?]*/i)?.[0] || 'give';
    return { focus, praise: 'You clearly showed who helped in the story.', fix: `Look at “${focus}.”`, question: 'What verb form matches a past event?', ko: '과거 사건이므로 동사의 과거형을 생각해 보세요.', category: 'past tense' };
  }
  if (n < 4) {
    const focus = t.split(/[.!?]+/).map(s => s.trim()).filter(Boolean).at(-1) || t;
    return { focus, praise: 'Your main idea is easy to understand.', fix: 'Your story needs one more event.', question: 'What happened after the umbrella was shared?', ko: '우산을 함께 쓴 다음의 사건을 하나 더 추가해 보세요.', category: 'story detail' };
  }
  if (!/\b(first|then|after that|finally|later|next)\b/i.test(lower)) {
    const focus = t.split(/[.!?]+/).map(s => s.trim()).filter(Boolean)[2] || t;
    return { focus, praise: 'Your events are easy to understand.', fix: 'Look at how you connect the events.', question: 'What connector could show what happened next?', ko: '사건의 순서를 보여 주는 연결어를 생각해 보세요.', category: 'connector' };
  }
  if (!/\bbecause\b/i.test(lower)) {
    const focus = t.split(/[.!?]+/).map(s => s.trim()).filter(Boolean).at(-1) || t;
    return { focus, praise: 'Your story has a clear sequence.', fix: 'Your feeling could have a clearer reason.', question: 'Why did the character feel that way?', ko: '감정의 이유를 because를 활용해 더 분명하게 써 보세요.', category: 'reason' };
  }
  const focus = t.split(/[.!?]+/).map(s => s.trim()).filter(Boolean)[2] || t;
  return { focus, praise: 'Your story has a clear sequence and feeling.', fix: 'One transition could be smoother.', question: 'Which connector could make the next event flow naturally?', ko: '다음 사건으로 자연스럽게 이어지는 연결어를 생각해 보세요.', category: 'flow' };
}

function prepareFeedback() {
  state.draft = el.draftText.value.trim();
  if (!state.feedback) state.feedback = chooseFeedback(state.draft);
  el.draftPreview.innerHTML = highlightFocus(state.draft, state.feedback.focus);
  el.praiseText.textContent = state.feedback.praise;
  el.fixText.textContent = state.feedback.fix;
  el.questionText.textContent = state.feedback.question;
  el.koreanHelp.textContent = state.feedback.ko;
  el.koreanHelp.classList.add('hidden');
  el.hintOutput.textContent = 'Use the hints only if you need them.';
}

function highlightFocus(text, focus) {
  const escaped = escapeHtml(text);
  const safeFocus = escapeHtml(focus || '');
  if (!safeFocus) return escaped;
  const i = escaped.toLowerCase().indexOf(safeFocus.toLowerCase());
  if (i < 0) return escaped;
  return escaped.slice(0, i) + `<span class="highlight">${escaped.slice(i, i + safeFocus.length)}</span>` + escaped.slice(i + safeFocus.length);
}

function hintText(level) {
  const category = state.feedback?.category || 'writing';
  if (level === 1) return `Hint 1: Look at the highlighted part. Focus on ${category}.`;
  if (level === 2) return `Hint 2: Think about the ${category}. What change can you make yourself?`;
  if (category === 'past tense') return 'Hint 3: Different example — “Yesterday, I walked home.” Notice the verb pattern.';
  if (category === 'connector') return 'Hint 3: Different example — “The bell rang. Then, we left the classroom.”';
  if (category === 'reason') return 'Hint 3: Different example — “I smiled because my friend helped me.”';
  return 'Hint 3: Different example — “First, we met. Then, we talked.” Notice how the ideas connect.';
}

function useHint(level) {
  state.hintCount = Math.max(state.hintCount, level);
  if (!state.hintsUsed.includes(level)) state.hintsUsed.push(level);
  el.hintOutput.textContent = hintText(level);
}

function prepareRewrite() {
  state.draft = el.draftText.value.trim();
  el.originalDraftText.textContent = state.draft;
  if (!el.rewriteText.value.trim()) el.rewriteText.value = state.draft;
  el.rewriteFocus.textContent = `Focus on one point: ${state.feedback?.category || 'clarity'}. The app will not rewrite it for you.`;
}

function prepareFinish() {
  state.rewrite = el.rewriteText.value.trim();
  el.beforeText.textContent = state.draft;
  el.afterText.textContent = state.rewrite;
  el.aiSummary.textContent = `AI helped me with ${state.hintsUsed.length} hint level(s): ${state.hintsUsed.length ? state.hintsUsed.join(', ') : 'no extra hints'}. Focus: ${state.feedback?.category || 'writing'}.`;

  if (!state.levelAdjusted) {
    const fixedFast = state.rewrite && state.rewrite !== state.draft && state.hintCount <= 1;
    if (fixedFast && state.level < 3) state.level += 1;
    else if (state.hintCount >= 2 && state.level > 1) state.level -= 1;
    state.levelAdjusted = true;
  }
  el.levelBadge.textContent = `Level ${state.level}`;
}

function escapeHtml(s) {
  return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
}

function saveDraftLocally() {
  try {
    localStorage.setItem('scene-to-story-draft', JSON.stringify({
      planWho: el.planWho.value, planWhere: el.planWhere.value, planWhat: el.planWhat.value, planFeel: el.planFeel.value,
      draft: el.draftText.value, rewrite: el.rewriteText.value, reflection: el.reflectionText.value, level: state.level
    }));
  } catch {}
}

function restoreDraftLocally() {
  try {
    const raw = JSON.parse(localStorage.getItem('scene-to-story-draft') || 'null');
    if (!raw) return;
    el.planWho.value = raw.planWho || ''; el.planWhere.value = raw.planWhere || ''; el.planWhat.value = raw.planWhat || ''; el.planFeel.value = raw.planFeel || '';
    el.draftText.value = raw.draft || ''; el.rewriteText.value = raw.rewrite || ''; el.reflectionText.value = raw.reflection || ''; state.level = raw.level || 2;
  } catch {}
}

async function loginWithGoogle() {
  if (!firebaseReady) { alert('Firebase is not configured yet. Use Demo Student or add your Firebase config.'); return; }
  try { await fb.signInWithPopup(auth, new fb.GoogleAuthProvider()); }
  catch { alert('Google login could not start.'); }
}

function demoLogin() {
  state.user = { uid: 'demo-student', name: 'Demo Student', email: 'demo@student.local', demo: true };
  updateUserUI();
}

async function saveRecord() {
  state.reflection = el.reflectionText.value.trim();
  const record = {
    studentName: state.user?.name || 'Guest', studentEmail: state.user?.email || '', uid: state.user?.uid || 'guest',
    date: new Date().toISOString(), topic: 'A Rainy Day Surprise', level: state.level,
    hintsUsed: [...state.hintsUsed], firstDraft: state.draft, finalText: state.rewrite,
    reflection: state.reflection, aiFocus: state.feedback?.category || ''
  };

  if (firebaseReady && !state.user.demo) {
    try {
      await fb.addDoc(fb.collection(db, 'writingRecords'), record);
      el.saveStatus.textContent = 'Saved to My Records.';
      await loadMyRecords();
      return;
    } catch (e) { console.warn(e); }
  }

  try {
    const all = JSON.parse(localStorage.getItem('scene-to-story-records') || '[]');
    all.unshift(record); localStorage.setItem('scene-to-story-records', JSON.stringify(all));
    state.records = all; el.saveStatus.textContent = 'Saved locally in demo mode.'; renderRecords();
  } catch { el.saveStatus.textContent = 'Could not save. Your text is still on this screen.'; }
}

async function loadMyRecords() {
  if (firebaseReady && !state.user.demo) {
    try {
      const q = fb.query(fb.collection(db, 'writingRecords'), fb.where('uid', '==', state.user.uid));
      const snap = await fb.getDocs(q);
      state.records = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => String(b.date).localeCompare(String(a.date)));
      renderRecords(); return;
    } catch (e) { console.warn(e); }
  }
  try { state.records = JSON.parse(localStorage.getItem('scene-to-story-records') || '[]'); }
  catch { state.records = []; }
  renderRecords();
}

async function maybeLoadTeacherRecords() {
  if (!firebaseReady || state.user?.email?.toLowerCase() !== TEACHER_EMAIL.toLowerCase()) return;
  try {
    const snap = await fb.getDocs(fb.collection(db, 'writingRecords'));
    state.teacherRecords = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => String(b.date).localeCompare(String(a.date)));
    renderTeacherRecords();
  } catch (e) { console.warn(e); }
}

function recordListHtml(records, teacher=false) {
  if (!records.length) return '<div class="record-item">No records yet.</div>';
  return records.map(r => `
    <div class="record-item">
      <strong>${escapeHtml(r.topic || 'Untitled')}</strong><br>
      <small>${escapeHtml((r.date || '').slice(0,10))} · Level ${r.level || ''}${teacher ? ` · ${escapeHtml(r.studentName || '')}` : ''}</small>
      <details><summary>View</summary>
        <p><b>Hints:</b> ${escapeHtml((r.hintsUsed || []).join(', ') || 'none')}</p>
        <p><b>First draft</b></p><pre>${escapeHtml(r.firstDraft || '')}</pre>
        <p><b>Final text</b></p><pre>${escapeHtml(r.finalText || '')}</pre>
        <p><b>Reflection</b></p><pre>${escapeHtml(r.reflection || '')}</pre>
      </details>
    </div>`).join('');
}

function renderRecords() { el.recordsList.innerHTML = recordListHtml(state.records); }
function renderTeacherRecords() { el.teacherRecordsList.innerHTML = recordListHtml(state.teacherRecords, true); }

function navTo(view) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.view === view));
  el.bottomNav.classList.add('hidden');
  if (view === 'write') showStep(state.step || 0);
  if (view === 'records') { loadMyRecords(); showOnly(screens.records); el.stepLabel.textContent = 'My Records'; }
  if (view === 'teacher') { maybeLoadTeacherRecords(); showOnly(screens.teacher); el.stepLabel.textContent = 'Teacher View'; }
}

function nextStep() {
  saveDraftLocally();
  if (state.step === 1) { showStep(2); return; }
  if (state.step === 2) {
    if (!privacySafe()) return;
    if (!el.draftText.value.trim()) { alert('Write your draft first.'); return; }
    state.feedback = null; state.hintCount = 0; state.hintsUsed = []; state.levelAdjusted = false; showStep(3); return;
  }
  if (state.step === 3) { showStep(4); return; }
  if (state.step === 4) {
    if (!el.rewriteText.value.trim()) { alert('Rewrite your story first.'); return; }
    showStep(5);
  }
}

function backStep() { saveDraftLocally(); if (state.step > 1) showStep(state.step - 1); else showStep(0); }

el.startWritingBtn.addEventListener('click', () => showStep(1));
el.demoLoginBtn.addEventListener('click', demoLogin);
el.googleLoginBtn.addEventListener('click', loginWithGoogle);
el.homeBtn.addEventListener('click', () => { saveDraftLocally(); showStep(0); });
el.nextBtn.addEventListener('click', nextStep);
el.backBtn.addEventListener('click', backStep);
document.querySelectorAll('.nav-btn').forEach(btn => btn.addEventListener('click', () => navTo(btn.dataset.view)));

el.draftText.addEventListener('input', () => { el.sentenceCount.textContent = `${countSentences(el.draftText.value)} sentences`; privacySafe(); saveDraftLocally(); });
[el.planWho,el.planWhere,el.planWhat,el.planFeel,el.rewriteText,el.reflectionText].forEach(node => node.addEventListener('input', saveDraftLocally));
el.koreanHelpBtn.addEventListener('click', () => el.koreanHelp.classList.toggle('hidden'));
el.hint1Btn.addEventListener('click', () => useHint(1));
el.hint2Btn.addEventListener('click', () => useHint(2));
el.hint3Btn.addEventListener('click', () => useHint(3));
el.sampleBtn.addEventListener('click', () => el.sampleCard.classList.toggle('hidden'));
el.saveRecordBtn.addEventListener('click', saveRecord);

restoreDraftLocally();
el.sentenceCount.textContent = `${countSentences(el.draftText.value)} sentences`;
loadMyRecords();
showStep(0);
initFirebase();
