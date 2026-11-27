import { useState } from 'react';
import { Info, Languages, Loader2 } from 'lucide-react';
import type { CoachFeedback, FeedbackPoint } from '../types/story';

interface Step3HintProps {
  draft: string;
  feedback: CoachFeedback | null;
  isLoading: boolean;
  koreanHelpEnabled: boolean;
  onToggleKoreanHelp: () => void;
  onOpenWhy: () => void;
  onRetryHint: () => void;
}

function renderHighlightedDraft(draft: string, points: FeedbackPoint[]) {
  const ranges: { start: number; end: number; num: number }[] = [];

  points.forEach((pt, idx) => {
    const target = pt.yourSentence.trim();
    if (!target) return;
    const start = draft.indexOf(target);
    if (start === -1) return;
    const end = start + target.length;
    const overlaps = ranges.some((r) => !(end <= r.start || start >= r.end));
    if (!overlaps) {
      ranges.push({ start, end, num: idx + 1 });
    }
  });

  if (ranges.length === 0) {
    return <span>{draft}</span>;
  }

  ranges.sort((a, b) => a.start - b.start);
  const segments: React.ReactNode[] = [];
  let cursor = 0;

  ranges.forEach((r, i) => {
    if (r.start > cursor) {
      segments.push(<span key={`plain-${i}`}>{draft.slice(cursor, r.start)}</span>);
    }
    segments.push(
      <mark
        key={`mark-${i}`}
        className="bg-amber-100 text-slate-900 px-1 py-0.5 rounded border-b-2 border-amber-500 font-medium"
      >
        <span className="font-mono text-xs font-bold text-amber-800 mr-1">[{r.num}]</span>
        {draft.slice(r.start, r.end)}
      </mark>
    );
    cursor = r.end;
  });

  if (cursor < draft.length) {
    segments.push(<span key="tail">{draft.slice(cursor)}</span>);
  }

  return <>{segments}</>;
}

export function Step3Hint({
  draft,
  feedback,
  isLoading,
  koreanHelpEnabled,
  onToggleKoreanHelp,
  onOpenWhy,
  onRetryHint,
}: Step3HintProps) {
  const [openWhyIds, setOpenWhyIds] = useState<Record<string, boolean>>({});

  const toggleWhyForCard = (id: string) => {
    setOpenWhyIds((prev) => {
      const nextOpen = !prev[id];
      if (nextOpen) {
        onOpenWhy();
      }
      return { ...prev, [id]: nextOpen };
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-3">
          <Loader2 className="w-7 h-7 text-blue-600 animate-spin" aria-hidden="true" />
          <h1 className="font-display text-xl font-bold text-slate-900">
            Coach Pic is reading your story...
          </h1>
          <p className="text-sm text-slate-600">
            Looking for 1–3 helpful points to share with you.
          </p>
        </div>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center space-y-4">
          <p className="text-sm text-slate-700">
            Coach Pic could not load feedback right now. Your writing is safe.
          </p>
          <button
            type="button"
            onClick={onRetryHint}
            className="min-h-[44px] px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left: Full Draft with Highlighted Sentences */}
      <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 space-y-3 lg:sticky lg:top-20">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Your First Draft</span>
          <span className="font-mono tabular-nums">
            {feedback.feedbackPoints.length}{' '}
            {feedback.feedbackPoints.length === 1 ? 'point' : 'points'}
          </span>
        </div>

        <p className="text-base leading-relaxed text-slate-800 whitespace-pre-wrap">
          {renderHighlightedDraft(draft, feedback.feedbackPoints)}
        </p>

        <p className="text-xs text-slate-500 pt-2 border-t border-slate-100">
          Numbers like [1] match the feedback cards on the right.
        </p>
      </div>

      {/* Right: Good Point + 1-3 Feedback Cards + Per-Card Why? + Korean Help ON/OFF */}
      <div className="lg:col-span-7 space-y-4">
        {/* Header Bar with Korean Help ON/OFF Toggle */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-500">
                Step 3 · AI Feedback ({feedback.feedbackPoints.length}{' '}
                {feedback.feedbackPoints.length === 1 ? 'tip' : 'tips'})
              </p>
              <h1 className="font-display text-2xl font-bold text-slate-900">Coach Pic</h1>
            </div>

            <button
              type="button"
              aria-pressed={koreanHelpEnabled}
              onClick={onToggleKoreanHelp}
              className={`min-h-[44px] px-3.5 py-2 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                koreanHelpEnabled
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Languages className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{koreanHelpEnabled ? '한국어 도움 ON' : '한국어 도움 OFF'}</span>
            </button>
          </div>

          {/* Good Point */}
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
            <h2 className="text-xs font-bold text-emerald-800">Good Point</h2>
            <p className="text-sm sm:text-base text-slate-900 font-medium">{feedback.goodPoint}</p>
            {koreanHelpEnabled && (
              <p className="text-xs text-emerald-950/80 pt-1.5 border-t border-emerald-200/70">
                {feedback.goodPointKorean}
              </p>
            )}
          </div>
        </div>

        {/* Up to 3 Feedback Cards */}
        {feedback.feedbackPoints.map((pt, index) => {
          const isWhyOpen = Boolean(openWhyIds[pt.id]);
          return (
            <article
              key={pt.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3.5"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Feedback {index + 1} — {pt.category}
                </h3>
                <span className="text-xs font-mono text-slate-500">{pt.summaryTag}</span>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                <p className="text-xs font-semibold text-amber-900">Your sentence</p>
                <p className="text-sm text-slate-900 font-medium">“{pt.yourSentence}”</p>
              </div>

              <div className="space-y-1 text-sm">
                <p className="text-xs font-bold text-slate-700">Think about</p>
                <p className="text-slate-800 leading-relaxed">{pt.thinkAbout}</p>
                {koreanHelpEnabled && (
                  <p className="text-xs text-slate-600 pt-1">{pt.koreanHelp.thinkAbout}</p>
                )}
              </div>

              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 space-y-1 text-sm">
                <p className="text-xs font-bold text-blue-800">Question</p>
                <p className="text-slate-900 font-medium leading-relaxed">{pt.question}</p>
                {koreanHelpEnabled && (
                  <p className="text-xs text-blue-900/80 pt-1 border-t border-blue-200/70">
                    {pt.koreanHelp.question}
                  </p>
                )}
              </div>

              <div className="pt-1 space-y-2.5">
                <button
                  type="button"
                  onClick={() => toggleWhyForCard(pt.id)}
                  aria-expanded={isWhyOpen}
                  className={`min-h-[44px] px-4 py-2 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition-colors ${
                    isWhyOpen
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Info className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Why?</span>
                </button>

                {isWhyOpen && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-sm">
                    <p className="text-xs font-bold text-slate-700">Why this matters</p>
                    <p className="text-slate-800 leading-relaxed">{pt.whyExplanation}</p>
                    {koreanHelpEnabled && (
                      <p className="text-xs text-slate-600 pt-1.5 border-t border-slate-200/70">
                        {pt.koreanHelp.whyExplanation}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </article>
          );
        })}

        {/* Mandatory AI Notice */}
        <p className="text-xs text-slate-500 px-1">
          AI can be wrong.{' '}
          {feedback.isUncertain
            ? 'Coach Pic is not completely sure—please check a dictionary or textbook.'
            : 'Coach Pic says "I think..." when unsure—check a dictionary or textbook.'}
          {feedback.usedFallback && ' (Prepared offline feedback active; your text is safe.)'}
        </p>
      </div>
    </div>
  );
}
