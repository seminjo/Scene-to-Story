import 'dotenv/config';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';

const PORT = Number(process.env.PORT || 3000);
const TEACHER_EMAIL = (process.env.TEACHER_EMAIL || 'seminjo0707@gmail.com').trim().toLowerCase();
const TOKEN_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

const DATA_DIR = path.resolve(process.cwd(), '.data');
const RECORDS_FILE = path.join(DATA_DIR, 'records.json');

interface StoryRecordPayload {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  topicId: string;
  topicTitle: string;
  supportLevel: 1 | 2 | 3;
  hintsUsed: number;
  maxHintLevel: 1 | 2 | 3;
  firstDraft: string;
  finalDraft: string;
  reflectionNote: string;
  aiHelpSummary: string;
  feedbackFocus?: string;
  whyOpened?: boolean;
  koreanHelpUsed?: boolean;
}

const PHONE_REGEX = /(?:\+?\d{1,3}[-.\s]?)?(?:01[016789]|02|0[3-6][1-5]|\d{3})[-.\s]?\d{3,4}[-.\s]?\d{4}\b/;
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const NAME_INTRO_REGEX = /\b(?:my\s+name\s+is|i\s*['’]?m\s+called|call\s+me)\s+[A-Z][a-z]{1,20}(?:\s+[A-Z][a-z]{1,20})?/i;
const KOREAN_NAME_REGEX = /(?:제\s*이름은|내\s*이름은|이름\s*:)\s*[가-힣]{2,4}/;
const SCHOOL_NAME_REGEX = /\b[A-Z][a-zA-Z'-]{1,25}(?:\s+[A-Z][a-zA-Z'-]{1,25})*\s+(?:High\s+School|Middle\s+School|Elementary\s+School|Girls'?\s+High|Boys'?\s+High)\b/;
const KOREAN_SCHOOL_REGEX = /[가-힣]{2,10}(?:초등학교|중학교|고등학교)/;
const ADDRESS_REGEX = /\b\d{1,5}\s+[A-Z][a-zA-Z]+\s+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr)\b|\b(?:I\s+live\s+(?:at|in)|my\s+address\s+is)\s+[^.?!]{3,40}/i;
const KOREAN_ADDRESS_REGEX = /[가-힣]{2,10}(?:시|구|동|로|길)\s*\d{1,4}(?:-\d{1,4})?/;

function containsPII(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  return (
    PHONE_REGEX.test(trimmed) ||
    EMAIL_REGEX.test(trimmed) ||
    NAME_INTRO_REGEX.test(trimmed) ||
    KOREAN_NAME_REGEX.test(trimmed) ||
    SCHOOL_NAME_REGEX.test(trimmed) ||
    KOREAN_SCHOOL_REGEX.test(trimmed) ||
    ADDRESS_REGEX.test(trimmed) ||
    KOREAN_ADDRESS_REGEX.test(trimmed)
  );
}

function ensureRecordsStore(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(RECORDS_FILE)) {
    fs.writeFileSync(RECORDS_FILE, '[]', 'utf8');
  }
}

function readAllRecords(): StoryRecordPayload[] {
  ensureRecordsStore();
  try {
    const raw = fs.readFileSync(RECORDS_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveRecord(record: StoryRecordPayload): void {
  const existing = readAllRecords();
  const next = [record, ...existing.filter((item) => item.id !== record.id)].slice(0, 500);
  fs.writeFileSync(RECORDS_FILE, JSON.stringify(next, null, 2), 'utf8');
}

function signTeacherToken(email: string): string {
  const payload = `${email}:${Date.now()}`;
  const sig = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('hex');
  return Buffer.from(`${payload}:${sig}`).toString('base64url');
}

function verifyTeacherToken(token: string): boolean {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const parts = decoded.split(':');
    if (parts.length !== 3) return false;
    const [email, tsStr, sig] = parts;
    if (email !== TEACHER_EMAIL) return false;
    const ts = Number(tsStr);
    if (!Number.isFinite(ts) || Date.now() - ts > 1000 * 60 * 60 * 12) return false;
    const expected = crypto.createHmac('sha256', TOKEN_SECRET).update(`${email}:${tsStr}`).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

function pickBestTargetSentence(draft: string, candidate: string): string {
  const cleanCandidate = (candidate || '').trim();
  if (cleanCandidate && draft.includes(cleanCandidate)) {
    return cleanCandidate;
  }
  const sentences = draft
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (sentences.length === 0) return draft.trim();
  if (cleanCandidate) {
    const lowerCand = cleanCandidate.toLowerCase();
    const matched = sentences.find(
      (s) => s.toLowerCase().includes(lowerCand) || lowerCand.includes(s.toLowerCase())
    );
    if (matched) return matched;
  }
  return sentences[Math.min(1, sentences.length - 1)] || sentences[0];
}

function buildFallbackHint(draft: string, topicTitle: string) {
  const sentences = draft
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const targetSentence = sentences[Math.min(1, Math.max(0, sentences.length - 1))] || draft.trim();
  return {
    focusCategory: 'Grammar · Past time and connection',
    targetSentence,
    praise: `You clearly shared an important event from "${topicTitle}" in your story.`,
    fix: `Look at "${targetSentence}".`,
    explanation:
      'Because this story happens in the past, matching your verb tense and event connector helps readers follow easily.',
    question: 'What verb form or time connector fits an event that happened yesterday?',
    whyExplanation:
      'English verbs change to show completed past actions, and time connectors link events in order. Checking this one part makes your whole story smoother.',
    hint2:
      'Check the main action verb for past time, or check if a word like "Then" or "Because" helps here.',
    hint3Pattern: 'Time connector + past-tense verb',
    hint3Example: 'Yesterday, I walked home. Then, the sky suddenly turned dark.',
    koreanHelp: {
      praise: `"${topicTitle}" 장면에서 중요한 사건을 분명하게 담아냈어요.`,
      fix: '강조된 문장의 동사 형태와 연결 표현을 한 번 더 살펴보세요.',
      explanation:
        '이미 지난 과거의 이야기이므로 동사 시제와 순서 연결어가 맞으면 독자가 흐름을 쉽게 따라갈 수 있어요.',
      question: '어제 일어난 일을 나타낼 때 어떤 동사 형태나 시간 연결어가 어울릴까요?',
      whyExplanation:
        '영어에서는 이미 끝난 과거의 행동을 나타낼 때 동사 형태가 바뀌며, 연결어가 사건 순서를 보여 줍니다.',
      hint1: '강조된 문장에서 시제나 연결을 점검할 핵심 부분을 살펴보세요.',
      hint2: '핵심 동사가 과거 시제인지, 사건을 잇는 연결어가 필요한지 생각해 보세요.',
      hint3: '예문에서 과거 시제 동사와 "Then"이 어떻게 쓰였는지 참고해 보세요.',
    },
    isUncertain: false,
    usedFallback: true,
  };
}

function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function createApp() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.post('/api/coach/hint', async (req, res) => {
    const { draft, topicTitle, supportLevel } = req.body ?? {};
    if (typeof draft !== 'string' || !draft.trim()) {
      res.status(400).json({ error: 'EMPTY_DRAFT', message: 'Please write a short story draft first.' });
      return;
    }

    if (containsPII(draft)) {
      res.status(400).json({
        error: 'PII_DETECTED',
        message:
          'Please do not write your real name, school, phone number, or address. Change those details before continuing.',
      });
      return;
    }

    const cleanTitle = typeof topicTitle === 'string' ? topicTitle.slice(0, 120) : 'Picture Story';
    const level = supportLevel === 1 || supportLevel === 2 || supportLevel === 3 ? supportLevel : 2;
    const ai = getGenAIClient();

    if (!ai) {
      res.json({ feedback: buildFallbackHint(draft, cleanTitle) });
      return;
    }

    try {
      const systemInstruction = [
        'You are Coach Pic, a friendly English writing coach for Korean high school first-year students (CEFR B1).',
        'CRITICAL RULES:',
        '1. Give feedback on ONLY ONE writing point at a time. Never list multiple problems.',
        '2. Choose the single most important issue in this strict priority order:',
        '   Meaning / clarity -> Story organization -> Missing detail -> Sentence connection -> Grammar -> Spelling.',
        '3. Structure the main feedback as: Praise -> Focused Fix -> Short Explanation -> Guiding Question.',
        '   - praise: Mention one specific strength that actually appears in the student draft.',
        '   - fix: Point only to the exact word, phrase, or sentence that needs attention (e.g., Look at "...").',
        '   - explanation: Briefly explain why that part needs attention and how it affects meaning, organization, sentence connection, or grammar.',
        '   - question: End with one guiding question that helps the student revise independently.',
        '4. Total length of praise + fix + explanation + question combined should be about 40 to 60 words in clear, simple B1 English.',
        '5. whyExplanation: 1 to 2 additional sentences explaining the same focused point and why the issue matters. Do NOT introduce a new correction point and do NOT give the corrected sentence.',
        '6. Hint Ladder rules:',
        '   - targetSentence (Hint 1): Copy verbatim the exact word, phrase, or short sentence from the student draft that needs attention.',
        '   - hint2 (Hint 2): Name the problem more clearly and ask a smaller guiding question without giving the corrected sentence.',
        '   - hint3Pattern & hint3Example (Hint 3): Show the same language pattern using a completely different, unrelated example sentence (never from the student topic).',
        '7. koreanHelp: Explain the meaning of each feedback part in simple Korean (praise, fix, explanation, question, whyExplanation, hint1, hint2, hint3). Help the student understand the concept. Never translate or rewrite the student full paragraph, and never provide the corrected English sentence in Korean Help.',
        '8. NEVER rewrite the student paragraph, NEVER provide a corrected sentence from the student text, NEVER use negative words ("wrong", "bad", "poor", "failure"), and NEVER give numerical scores. Maximum one emoji.',
        '9. If uncertain about anything, start with "I think..." and advise checking a dictionary or textbook, and set isUncertain to true.',
      ].join('\n');

      const prompt = [
        `Topic: ${cleanTitle}`,
        `Student scaffolding level: Level ${level}`,
        'Student draft:',
        draft.trim(),
      ].join('\n\n');

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              focusCategory: {
                type: Type.STRING,
                description:
                  'Priority area and short topic label, e.g. "Grammar · Past verb form" or "Sentence connection · Time order".',
              },
              targetSentence: {
                type: Type.STRING,
                description:
                  'Exact verbatim word, phrase, or sentence copied from the student draft to highlight.',
              },
              praise: {
                type: Type.STRING,
                description: 'Specific strength that actually appears in the student draft.',
              },
              fix: {
                type: Type.STRING,
                description: 'Points only to the single phrase or sentence needing attention.',
              },
              explanation: {
                type: Type.STRING,
                description:
                  'Short explanation of why that part needs attention and how it affects meaning, organization, connection, or grammar.',
              },
              question: {
                type: Type.STRING,
                description: 'One guiding question ending with ? helping the student revise independently.',
              },
              whyExplanation: {
                type: Type.STRING,
                description:
                  '1-2 additional sentences explaining the same focused point and why it matters, without new points or corrected sentences.',
              },
              hint2: {
                type: Type.STRING,
                description:
                  'Hint 2: Name the problem more clearly and ask a smaller guiding question without giving the corrected sentence.',
              },
              hint3Pattern: {
                type: Type.STRING,
                description: 'Short label for the target language pattern.',
              },
              hint3Example: {
                type: Type.STRING,
                description:
                  'Completely different unrelated example sentence showing the same pattern.',
              },
              koreanHelp: {
                type: Type.OBJECT,
                properties: {
                  praise: { type: Type.STRING },
                  fix: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  question: { type: Type.STRING },
                  whyExplanation: { type: Type.STRING },
                  hint1: { type: Type.STRING },
                  hint2: { type: Type.STRING },
                  hint3: { type: Type.STRING },
                },
                required: [
                  'praise',
                  'fix',
                  'explanation',
                  'question',
                  'whyExplanation',
                  'hint1',
                  'hint2',
                  'hint3',
                ],
              },
              isUncertain: {
                type: Type.BOOLEAN,
              },
            },
            required: [
              'focusCategory',
              'targetSentence',
              'praise',
              'fix',
              'explanation',
              'question',
              'whyExplanation',
              'hint2',
              'hint3Pattern',
              'hint3Example',
              'koreanHelp',
              'isUncertain',
            ],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      const targetSentence = pickBestTargetSentence(draft, parsed.targetSentence);

      res.json({
        feedback: {
          focusCategory: parsed.focusCategory || 'Meaning / clarity',
          targetSentence,
          praise: parsed.praise || 'You clearly shared a key event from the scene.',
          fix: parsed.fix || `Look at "${targetSentence}".`,
          explanation:
            parsed.explanation ||
            'Adjusting this part will help readers follow your story smoothly.',
          question: parsed.question || 'How could you revise this part so the time or connection is clear?',
          whyExplanation:
            parsed.whyExplanation ||
            'When this part matches the rest of your story, readers can picture the event right away.',
          hint2:
            parsed.hint2 ||
            'Look closely at the key verb or connector in that phrase and check if it matches your story time.',
          hint3Pattern: parsed.hint3Pattern || 'Clear past action and connector',
          hint3Example:
            parsed.hint3Example || 'Yesterday, I walked home. Then, my friend called me.',
          koreanHelp: {
            praise: parsed.koreanHelp?.praise || '장면의 핵심 내용을 잘 표현했어요.',
            fix: parsed.koreanHelp?.fix || '강조된 표현을 한 번 더 살펴보세요.',
            explanation:
              parsed.koreanHelp?.explanation ||
              '이 부분을 다듬으면 글의 흐름과 의미가 훨씬 자연스러워집니다.',
            question:
              parsed.koreanHelp?.question ||
              '이야기의 시제나 연결이 더 자연스럽게 보이도록 어떻게 바꿀 수 있을까요?',
            whyExplanation:
              parsed.koreanHelp?.whyExplanation ||
              '이 부분이 이야기의 나머지 흐름과 맞으면 독자가 장면을 바로 떠올릴 수 있습니다.',
            hint1:
              parsed.koreanHelp?.hint1 ||
              '노란색으로 강조된 단어·구절·문장을 먼저 확인해 보세요.',
            hint2:
              parsed.koreanHelp?.hint2 ||
              '핵심 동사나 연결어가 이야기의 시간과 흐름에 맞는지 다시 살펴보세요.',
            hint3:
              parsed.koreanHelp?.hint3 ||
              '다른 예시 문장에서 같은 문장 패턴이 어떻게 쓰였는지 참고해 보세요.',
          },
          isUncertain: Boolean(parsed.isUncertain),
          usedFallback: false,
        },
      });
    } catch (error) {
      console.error('Gemini hint error, using fallback hint:', error);
      res.json({ feedback: buildFallbackHint(draft, cleanTitle) });
    }
  });

  app.post('/api/coach/check-revision', async (req, res) => {
    const { firstDraft, revisedDraft, targetSentence, fixPoint, currentLevel, hintsUsed } = req.body ?? {};
    if (typeof firstDraft !== 'string' || typeof revisedDraft !== 'string' || !revisedDraft.trim()) {
      res.status(400).json({ error: 'INVALID_INPUT', message: 'Revised story cannot be empty.' });
      return;
    }

    if (containsPII(revisedDraft)) {
      res.status(400).json({
        error: 'PII_DETECTED',
        message:
          'Please do not write your real name, school, phone number, or address. Change those details before continuing.',
      });
      return;
    }

    const level: 1 | 2 | 3 = currentLevel === 1 || currentLevel === 3 ? currentLevel : 2;
    const hints = typeof hintsUsed === 'number' && hintsUsed >= 1 ? hintsUsed : 1;

    const computeNextLevel = (fixed: boolean): { nextLevel: 1 | 2 | 3; levelChangeReason: 'up' | 'down' | 'same' } => {
      if (fixed && hints <= 1) {
        const nextLevel = (level < 3 ? level + 1 : 3) as 1 | 2 | 3;
        return { nextLevel, levelChangeReason: level < 3 ? 'up' : 'same' };
      }
      if (!fixed && hints >= 2) {
        const nextLevel = (level > 1 ? level - 1 : 1) as 1 | 2 | 3;
        return { nextLevel, levelChangeReason: level > 1 ? 'down' : 'same' };
      }
      return { nextLevel: level, levelChangeReason: 'same' };
    };

    const changedTarget =
      revisedDraft.trim() !== firstDraft.trim() &&
      (!targetSentence || !revisedDraft.includes(String(targetSentence).trim()));

    const ai = getGenAIClient();
    if (!ai) {
      const fixed = changedTarget || revisedDraft.trim() !== firstDraft.trim();
      const { nextLevel, levelChangeReason } = computeNextLevel(fixed);
      res.json({
        fixed,
        encouragement: fixed
          ? 'Nice revision! You worked through the hint on your own.'
          : 'You kept your story safe. Next time, try adjusting the highlighted sentence.',
        nextLevel,
        levelChangeReason,
      });
      return;
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: [
          `Original draft:\n${firstDraft.trim()}`,
          `Revised draft:\n${revisedDraft.trim()}`,
          `Focused sentence:\n${targetSentence || ''}`,
          `Focused improvement point:\n${fixPoint || ''}`,
        ].join('\n\n'),
        config: {
          systemInstruction:
            'You are Coach Pic. Check if the student meaningfully revised the focused sentence or improvement point. Never show a corrected sentence, never give scores, and never use negative words like wrong, bad, poor, or failure. Respond in <= 15 words of friendly B1 English.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              fixed: { type: Type.BOOLEAN },
              encouragement: { type: Type.STRING },
            },
            required: ['fixed', 'encouragement'],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      const fixed = Boolean(parsed.fixed) || changedTarget;
      const { nextLevel, levelChangeReason } = computeNextLevel(fixed);

      res.json({
        fixed,
        encouragement:
          parsed.encouragement ||
          (fixed
            ? 'Great job revising that part by yourself!'
            : 'Good effort! Keep practicing one focus point at a time.'),
        nextLevel,
        levelChangeReason,
      });
    } catch (error) {
      console.error('Gemini revision check error, using local fallback:', error);
      const fixed = changedTarget || revisedDraft.trim() !== firstDraft.trim();
      const { nextLevel, levelChangeReason } = computeNextLevel(fixed);
      res.json({
        fixed,
        encouragement: fixed
          ? 'Nice revision! You updated the story by yourself.'
          : 'Your draft is saved. Try editing the highlighted part next time.',
        nextLevel,
        levelChangeReason,
      });
    }
  });

  app.post('/api/teacher/verify', (req, res) => {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    if (!email || email !== TEACHER_EMAIL) {
      res.status(403).json({
        authorized: false,
        message: 'Only the designated teacher email can open Teacher View.',
      });
      return;
    }
    const token = signTeacherToken(email);
    res.json({ authorized: true, token, email });
  });

  app.get('/api/records', (req, res) => {
    const teacherToken = typeof req.query.teacherToken === 'string' ? req.query.teacherToken : '';
    const studentId = typeof req.query.studentId === 'string' ? req.query.studentId.trim() : '';

    const all = readAllRecords();
    if (teacherToken) {
      if (!verifyTeacherToken(teacherToken)) {
        res.status(403).json({ error: 'FORBIDDEN', message: 'Invalid or expired teacher access.' });
        return;
      }
      res.json({ records: all, role: 'teacher' });
      return;
    }

    if (!studentId) {
      res.json({ records: [], role: 'student' });
      return;
    }

    res.json({
      records: all.filter((r) => r.studentId === studentId),
      role: 'student',
    });
  });

  app.post('/api/records', (req, res) => {
    const body = req.body as Partial<StoryRecordPayload> | undefined;
    if (
      !body ||
      typeof body.studentId !== 'string' ||
      !body.studentId.trim() ||
      typeof body.firstDraft !== 'string' ||
      typeof body.finalDraft !== 'string'
    ) {
      res.status(400).json({ error: 'INVALID_RECORD', message: 'Missing required story fields.' });
      return;
    }

    if (containsPII(body.studentName || '') || containsPII(body.finalDraft)) {
      res.status(400).json({
        error: 'PII_DETECTED',
        message: 'Please remove personal details before saving.',
      });
      return;
    }

    const record: StoryRecordPayload = {
      id: typeof body.id === 'string' && body.id ? body.id.slice(0, 64) : crypto.randomUUID(),
      studentId: body.studentId.trim().slice(0, 80),
      studentName: (body.studentName || 'Student').trim().slice(0, 40),
      date: typeof body.date === 'string' ? body.date.slice(0, 40) : new Date().toISOString(),
      topicId: typeof body.topicId === 'string' ? body.topicId.slice(0, 80) : 'rainy-day-surprise',
      topicTitle: typeof body.topicTitle === 'string' ? body.topicTitle.slice(0, 120) : 'Story',
      supportLevel: body.supportLevel === 1 || body.supportLevel === 3 ? body.supportLevel : 2,
      hintsUsed: typeof body.hintsUsed === 'number' ? Math.max(0, Math.min(10, body.hintsUsed)) : 1,
      maxHintLevel: body.maxHintLevel === 2 || body.maxHintLevel === 3 ? body.maxHintLevel : 1,
      firstDraft: body.firstDraft.slice(0, 4000),
      finalDraft: body.finalDraft.slice(0, 4000),
      reflectionNote: typeof body.reflectionNote === 'string' ? body.reflectionNote.slice(0, 1000) : '',
      aiHelpSummary: typeof body.aiHelpSummary === 'string' ? body.aiHelpSummary.slice(0, 240) : '',
      feedbackFocus: typeof body.feedbackFocus === 'string' ? body.feedbackFocus.slice(0, 160) : '',
      whyOpened: Boolean(body.whyOpened),
      koreanHelpUsed: Boolean(body.koreanHelpUsed),
    };

    saveRecord(record);
    res.status(201).json({ record });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Scene to Story! server running at http://0.0.0.0:${PORT}`);
  });
}

createApp().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
