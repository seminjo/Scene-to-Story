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

interface SavedFeedbackPointPayload {
  category: string;
  summaryTag: string;
  yourSentence: string;
  thinkAbout: string;
  question: string;
}

interface IncomingFeedbackPoint {
  id?: string;
  category?: string;
  summaryTag?: string;
  yourSentence?: string;
  thinkAbout?: string;
  question?: string;
}

interface StoryRecordPayload {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  topicId: string;
  topicTitle: string;
  supportLevel: 1 | 2 | 3;
  feedbackCount: number;
  feedbackPoints: SavedFeedbackPointPayload[];
  firstDraft: string;
  finalDraft: string;
  reflectionNote: string;
  aiHelpSummary: string;
  whyOpened: boolean;
  koreanHelpUsed: boolean;
  checkAgainUsed: boolean;
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

function splitSentences(draft: string): string[] {
  return draft
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function pickBestTargetSentence(draft: string, candidate: string, fallbackIndex = 0): string {
  const cleanCandidate = (candidate || '').trim();
  if (cleanCandidate && draft.includes(cleanCandidate)) {
    return cleanCandidate;
  }
  const sentences = splitSentences(draft);
  if (sentences.length === 0) return draft.trim();
  if (cleanCandidate) {
    const lowerCand = cleanCandidate.toLowerCase();
    const matched = sentences.find(
      (s) => s.toLowerCase().includes(lowerCand) || lowerCand.includes(s.toLowerCase())
    );
    if (matched) return matched;
  }
  return sentences[Math.min(fallbackIndex, sentences.length - 1)] || sentences[0];
}

function buildFallbackFeedback(draft: string, topicTitle: string) {
  const sentences = splitSentences(draft);
  const firstSentence = sentences[0] || draft.trim();
  const secondSentence = sentences[1] || firstSentence;

  const feedbackPoints = [
    {
      id: 'fb-1',
      category: 'Grammar',
      summaryTag: 'Check past tense',
      yourSentence: firstSentence,
      thinkAbout: 'This story happened in the past. Check the verb in this sentence.',
      question: 'This happened yesterday. What past form of the verb do you need?',
      whyExplanation:
        'We often change verbs when we talk about past events. This helps the reader know when the action happened.',
      koreanHelp: {
        thinkAbout: '이미 일어난 이야기이므로 동사의 과거형을 확인해 보세요.',
        question: '어제 일어난 일이라면 동사를 어떤 과거 형태로 써야 할까요?',
        whyExplanation:
          '이미 지난 일을 말할 때 동사를 과거형으로 바꾸면 독자가 언제 일어난 일인지 쉽게 알 수 있어요.',
      },
    },
  ];

  if (sentences.length >= 2 && secondSentence !== firstSentence) {
    feedbackPoints.push({
      id: 'fb-2',
      category: 'Sentence Connection',
      summaryTag: 'Connect story order',
      yourSentence: secondSentence,
      thinkAbout: 'Check how this sentence connects to the event before it.',
      question: 'Can you add a word like "then", "next", or "because" here?',
      whyExplanation:
        'Connecting words show the order of events. They make your story easy to read.',
      koreanHelp: {
        thinkAbout: '앞 문장과 이 문장이 자연스럽게 이어지는지 확인해 보세요.',
        question: '"then", "next", "because" 같은 연결어를 넣어 볼 수 있을까요?',
        whyExplanation:
          '연결어를 쓰면 사건의 순서나 이유가 잘 드러나서 이야기를 읽기 쉬워져요.',
      },
    });
  }

  return {
    goodPoint: `You showed the main event in "${topicTitle}" clearly.`,
    goodPointKorean: `"${topicTitle}" 이야기의 중심 사건을 분명하게 잘 표현했어요.`,
    feedbackPoints,
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
      res.json({ feedback: buildFallbackFeedback(draft, cleanTitle) });
      return;
    }

    try {
      const systemInstruction = [
        'You are Coach Pic, a warm English writing coach for Korean middle school 1st-year students (ages 13-14, CEFR A2).',
        'LANGUAGE LEVEL RULES (CEFR A2):',
        '- Use short, clear sentences, common everyday vocabulary, and simple grammar explanations.',
        '- Avoid difficult grammar jargon, long paragraphs, or abstract words.',
        '- Example style: "This story happened in the past. Check the verb in this sentence."',
        '',
        'FEEDBACK STRUCTURE & PRIORITY RULES:',
        '1. Read the whole student draft first.',
        '2. Give ONE specific positive comment in goodPoint (what the student actually did well).',
        '3. Select ONLY the 1 to 3 most important points to improve (maximum 3 points).',
        '   - If there is only 1 important issue, return 1 point. If 2, return 2. Never force 3.',
        '   - Do NOT list every small error.',
        '4. Choose feedback points in this strict priority order (never show this priority list to the student):',
        '   1) Meaning / clarity',
        '   2) Story order',
        '   3) Missing information',
        '   4) Sentence connection',
        '   5) Grammar',
        '   6) Vocabulary',
        '   7) Spelling / punctuation',
        '5. For each feedback point:',
        '   - category: short friendly label (e.g., "Meaning", "Story Order", "Missing Info", "Connection", "Grammar", "Sentence Form", "Vocabulary", "Spelling").',
        '   - summaryTag: 2-4 words for summary list (e.g., "Check past tense", "Check sentence form", "Add story order").',
        '   - yourSentence: copy verbatim the exact sentence or phrase from the student draft.',
        '   - thinkAbout: 1-2 short A2 sentences explaining what to check without giving the answer.',
        '   - question: 1 simple A2 guiding question.',
        '   - whyExplanation: 1-2 short A2 sentences explaining why this issue matters, without adding a new problem or giving the corrected sentence.',
        '   - koreanHelp: short simple Korean explanations for thinkAbout, question, and whyExplanation. Explain the hint concept—NEVER write the corrected English word/sentence in Korean Help (e.g., never say "waited로 바꾸세요").',
        '6. STRICTLY FORBIDDEN:',
        '   - NEVER rewrite the student paragraph.',
        '   - NEVER show the corrected sentence anywhere in English or Korean.',
        '   - NEVER use negative words ("wrong", "bad", "poor", "failure") or numerical scores.',
        '7. If unsure about anything, start with "I think..." and suggest checking a dictionary or textbook, setting isUncertain to true.',
      ].join('\n');

      const prompt = [
        `Scenario: ${cleanTitle}`,
        `Student support level: Level ${level}`,
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
              goodPoint: {
                type: Type.STRING,
                description: 'One specific positive comment in simple A2 English.',
              },
              goodPointKorean: {
                type: Type.STRING,
                description: 'Simple Korean explanation of the good point.',
              },
              feedbackPoints: {
                type: Type.ARRAY,
                description: 'Between 1 and 3 most important feedback points.',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    category: { type: Type.STRING },
                    summaryTag: { type: Type.STRING },
                    yourSentence: { type: Type.STRING },
                    thinkAbout: { type: Type.STRING },
                    question: { type: Type.STRING },
                    whyExplanation: { type: Type.STRING },
                    koreanHelp: {
                      type: Type.OBJECT,
                      properties: {
                        thinkAbout: { type: Type.STRING },
                        question: { type: Type.STRING },
                        whyExplanation: { type: Type.STRING },
                      },
                      required: ['thinkAbout', 'question', 'whyExplanation'],
                    },
                  },
                  required: [
                    'id',
                    'category',
                    'summaryTag',
                    'yourSentence',
                    'thinkAbout',
                    'question',
                    'whyExplanation',
                    'koreanHelp',
                  ],
                },
              },
              isUncertain: {
                type: Type.BOOLEAN,
              },
            },
            required: ['goodPoint', 'goodPointKorean', 'feedbackPoints', 'isUncertain'],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      const rawPoints: IncomingFeedbackPoint[] = Array.isArray(parsed.feedbackPoints)
        ? parsed.feedbackPoints.slice(0, 3)
        : [];

      if (rawPoints.length === 0) {
        res.json({ feedback: buildFallbackFeedback(draft, cleanTitle) });
        return;
      }

      const normalizedPoints = rawPoints.map((pt, idx) => {
        const rawPt = pt as IncomingFeedbackPoint & {
          koreanHelp?: { thinkAbout?: string; question?: string; whyExplanation?: string };
          whyExplanation?: string;
        };
        const matchedSentence = pickBestTargetSentence(draft, rawPt.yourSentence || '', idx);
        return {
          id: rawPt.id || `fb-${idx + 1}`,
          category: rawPt.category || 'Writing Tip',
          summaryTag: rawPt.summaryTag || 'Check this sentence',
          yourSentence: matchedSentence,
          thinkAbout: rawPt.thinkAbout || 'Read this sentence carefully and check the words.',
          question: rawPt.question || 'How can you make this sentence clearer?',
          whyExplanation:
            rawPt.whyExplanation ||
            'Fixing this part helps the reader understand your story clearly.',
          koreanHelp: {
            thinkAbout:
              rawPt.koreanHelp?.thinkAbout || '이 문장의 표현과 순서를 천천히 확인해 보세요.',
            question:
              rawPt.koreanHelp?.question || '이야기의 흐름에 맞게 이 문장을 어떻게 고칠 수 있을까요?',
            whyExplanation:
              rawPt.koreanHelp?.whyExplanation ||
              '이 부분을 고치면 읽는 사람이 이야기를 훨씬 쉽게 이해할 수 있어요.',
          },
        };
      });

      res.json({
        feedback: {
          goodPoint: parsed.goodPoint || 'You shared clear events and feelings in your story.',
          goodPointKorean:
            parsed.goodPointKorean || '이야기의 중심 내용과 기분을 잘 표현했어요.',
          feedbackPoints: normalizedPoints,
          isUncertain: Boolean(parsed.isUncertain),
          usedFallback: false,
        },
      });
    } catch (error) {
      console.error('Gemini hint error, using fallback feedback:', error);
      res.json({ feedback: buildFallbackFeedback(draft, cleanTitle) });
    }
  });

  app.post('/api/coach/check-again', async (req, res) => {
    const { firstDraft, revisedDraft, feedbackPoints, currentLevel } = req.body ?? {};
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
    const points: IncomingFeedbackPoint[] = Array.isArray(feedbackPoints)
      ? feedbackPoints.slice(0, 3)
      : [];

    const localCheck = () => {
      const improved: string[] = [];
      const remainingPointIds: string[] = [];

      for (const pt of points) {
        const ptId = String(pt.id || '');
        const orig = (pt.yourSentence || '').trim();
        if (orig && !revisedDraft.includes(orig)) {
          improved.push(`You revised "${pt.summaryTag || pt.category || 'this part'}".`);
        } else if (orig && revisedDraft.includes(orig)) {
          if (ptId) remainingPointIds.push(ptId);
        }
      }

      if (improved.length === 0 && revisedDraft.trim() !== firstDraft.trim()) {
        improved.push('You updated your story in your own words.');
      }

      const nextLevel = (
        remainingPointIds.length === 0 && improved.length > 0 && level < 3
          ? level + 1
          : level
      ) as 1 | 2 | 3;

      return {
        improved,
        remainingPointIds,
        encouragement:
          remainingPointIds.length === 0
            ? 'Great work! You checked your feedback and improved your story.'
            : 'Nice changes! Look at the remaining tip one more time if you want.',
        nextLevel,
      };
    };

    const ai = getGenAIClient();
    if (!ai || points.length === 0) {
      res.json(localCheck());
      return;
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: [
          `Original draft:\n${firstDraft.trim()}`,
          `Revised draft:\n${revisedDraft.trim()}`,
          `Original feedback points:\n${JSON.stringify(
            points.map((p) => ({
              id: p.id,
              category: p.category,
              summaryTag: p.summaryTag,
              yourSentence: p.yourSentence,
              thinkAbout: p.thinkAbout,
            }))
          )}`,
        ].join('\n\n'),
        config: {
          systemInstruction: [
            'You are Coach Pic for Korean middle school 1st-year students (CEFR A2).',
            'Compare the original draft and revised draft against ONLY the given original feedback points.',
            'RULES:',
            '- Do NOT introduce any new correction points or start a new feedback cycle.',
            '- In "improved", write 1 to 3 short, friendly A2 sentences starting like "You changed..." or "You improved..." for each feedback point the student fixed.',
            '- In "remainingPointIds", list ONLY the IDs from the given feedbackPoints that still clearly need attention (empty array if all were fixed).',
            '- NEVER show a corrected sentence, NEVER use negative words ("wrong", "bad", "poor", "failure"), and NEVER give scores.',
            '- Keep "encouragement" to one short, warm A2 sentence.',
          ].join('\n'),
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              improved: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              remainingPointIds: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              encouragement: { type: Type.STRING },
            },
            required: ['improved', 'remainingPointIds', 'encouragement'],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      const validIds = new Set(points.map((p) => String(p.id || '')).filter(Boolean));
      const remainingPointIds: string[] = Array.isArray(parsed.remainingPointIds)
        ? parsed.remainingPointIds.filter((id: unknown) => typeof id === 'string' && validIds.has(id))
        : [];
      const improved: string[] = Array.isArray(parsed.improved)
        ? parsed.improved.filter((s: unknown) => typeof s === 'string' && s.trim().length > 0).slice(0, 3)
        : [];

      if (improved.length === 0 && revisedDraft.trim() !== firstDraft.trim() && remainingPointIds.length < points.length) {
        improved.push('You updated your story using the feedback.');
      }

      const nextLevel = (
        remainingPointIds.length === 0 && improved.length > 0 && level < 3
          ? level + 1
          : level
      ) as 1 | 2 | 3;

      res.json({
        improved,
        remainingPointIds,
        encouragement:
          parsed.encouragement ||
          (remainingPointIds.length === 0
            ? 'Great job! You improved your story by yourself.'
            : 'Good changes! You can check the marked part one more time.'),
        nextLevel,
      });
    } catch (error) {
      console.error('Gemini check-again error, using local comparison:', error);
      res.json(localCheck());
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

    const safeFeedbackPoints: SavedFeedbackPointPayload[] = Array.isArray(body.feedbackPoints)
      ? body.feedbackPoints.slice(0, 3).map((pt) => ({
          category: typeof pt?.category === 'string' ? pt.category.slice(0, 60) : 'Feedback',
          summaryTag: typeof pt?.summaryTag === 'string' ? pt.summaryTag.slice(0, 80) : 'Writing tip',
          yourSentence: typeof pt?.yourSentence === 'string' ? pt.yourSentence.slice(0, 400) : '',
          thinkAbout: typeof pt?.thinkAbout === 'string' ? pt.thinkAbout.slice(0, 300) : '',
          question: typeof pt?.question === 'string' ? pt.question.slice(0, 300) : '',
        }))
      : [];

    const record: StoryRecordPayload = {
      id: typeof body.id === 'string' && body.id ? body.id.slice(0, 64) : crypto.randomUUID(),
      studentId: body.studentId.trim().slice(0, 80),
      studentName: (body.studentName || 'Student').trim().slice(0, 40),
      date: typeof body.date === 'string' ? body.date.slice(0, 40) : new Date().toISOString(),
      topicId: typeof body.topicId === 'string' ? body.topicId.slice(0, 80) : 'rainy-day-surprise',
      topicTitle: typeof body.topicTitle === 'string' ? body.topicTitle.slice(0, 120) : 'Story',
      supportLevel: body.supportLevel === 1 || body.supportLevel === 3 ? body.supportLevel : 2,
      feedbackCount:
        typeof body.feedbackCount === 'number'
          ? Math.max(0, Math.min(3, body.feedbackCount))
          : safeFeedbackPoints.length,
      feedbackPoints: safeFeedbackPoints,
      firstDraft: body.firstDraft.slice(0, 4000),
      finalDraft: body.finalDraft.slice(0, 4000),
      reflectionNote: typeof body.reflectionNote === 'string' ? body.reflectionNote.slice(0, 1000) : '',
      aiHelpSummary: typeof body.aiHelpSummary === 'string' ? body.aiHelpSummary.slice(0, 240) : '',
      whyOpened: Boolean(body.whyOpened),
      koreanHelpUsed: Boolean(body.koreanHelpUsed),
      checkAgainUsed: Boolean(body.checkAgainUsed),
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
