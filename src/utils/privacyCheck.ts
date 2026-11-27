export interface PrivacyCheckResult {
  hasPII: boolean;
  reasons: string[];
  message: string;
}

const PHONE_REGEX = /(?:\+?\d{1,3}[-.\s]?)?(?:01[016789]|02|0[3-6][1-5]|\d{3})[-.\s]?\d{3,4}[-.\s]?\d{4}\b/;
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const NAME_INTRO_REGEX = /\b(?:my\s+name\s+is|i\s*['’]?m\s+called|call\s+me)\s+[A-Z][a-z]{1,20}(?:\s+[A-Z][a-z]{1,20})?/i;
const KOREAN_NAME_REGEX = /(?:제\s*이름은|내\s*이름은|이름\s*:)\s*[가-힣]{2,4}/;
const SCHOOL_NAME_REGEX = /\b[A-Z][a-zA-Z'-]{1,25}(?:\s+[A-Z][a-zA-Z'-]{1,25})*\s+(?:High\s+School|Middle\s+School|Elementary\s+School|Girls'?\s+High|Boys'?\s+High)\b/;
const KOREAN_SCHOOL_REGEX = /[가-힣]{2,10}(?:초등학교|중학교|고등학교)/;
const ADDRESS_REGEX = /\b\d{1,5}\s+[A-Z][a-zA-Z]+\s+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr)\b|\b(?:I\s+live\s+(?:at|in)|my\s+address\s+is)\s+[^.?!]{3,40}/i;
const KOREAN_ADDRESS_REGEX = /[가-힣]{2,10}(?:시|구|동|로|길)\s*\d{1,4}(?:-\d{1,4})?/;

export function checkPrivacy(text: string): PrivacyCheckResult {
  const reasons: string[] = [];
  const trimmed = text.trim();
  if (!trimmed) {
    return { hasPII: false, reasons: [], message: '' };
  }

  if (NAME_INTRO_REGEX.test(trimmed) || KOREAN_NAME_REGEX.test(trimmed)) {
    reasons.push('real name');
  }
  if (SCHOOL_NAME_REGEX.test(trimmed) || KOREAN_SCHOOL_REGEX.test(trimmed)) {
    reasons.push('school name');
  }
  if (PHONE_REGEX.test(trimmed)) {
    reasons.push('phone number');
  }
  if (EMAIL_REGEX.test(trimmed)) {
    reasons.push('email address');
  }
  if (ADDRESS_REGEX.test(trimmed) || KOREAN_ADDRESS_REGEX.test(trimmed)) {
    reasons.push('home address');
  }

  if (reasons.length > 0) {
    return {
      hasPII: true,
      reasons,
      message:
        'Please do not write your real name, school, phone number, or address. Change those details before continuing.',
    };
  }

  return { hasPII: false, reasons: [], message: '' };
}

export function countSentences(text: string): number {
  const cleaned = text.trim();
  if (!cleaned) return 0;
  const parts = cleaned
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  return parts.length;
}

export function countWords(text: string): number {
  const cleaned = text.trim();
  if (!cleaned) return 0;
  return cleaned.split(/\s+/).filter(Boolean).length;
}

export interface DiffToken {
  text: string;
  kind: 'same' | 'added' | 'removed';
}

export function computeWordDiff(beforeText: string, afterText: string): {
  beforeTokens: DiffToken[];
  afterTokens: DiffToken[];
} {
  const a = beforeText.trim().split(/\s+/).filter(Boolean);
  const b = afterText.trim().split(/\s+/).filter(Boolean);

  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      if (a[i] === b[j]) {
        dp[i][j] = 1 + dp[i + 1][j + 1];
      } else {
        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  const beforeTokens: DiffToken[] = [];
  const afterTokens: DiffToken[] = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (a[i] === b[j]) {
      beforeTokens.push({ text: a[i], kind: 'same' });
      afterTokens.push({ text: b[j], kind: 'same' });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      beforeTokens.push({ text: a[i], kind: 'removed' });
      i++;
    } else {
      afterTokens.push({ text: b[j], kind: 'added' });
      j++;
    }
  }
  while (i < m) {
    beforeTokens.push({ text: a[i], kind: 'removed' });
    i++;
  }
  while (j < n) {
    afterTokens.push({ text: b[j], kind: 'added' });
    j++;
  }

  return { beforeTokens, afterTokens };
}
