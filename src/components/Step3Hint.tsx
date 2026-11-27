import { useState } from 'react';
import { HelpCircle, Info, Languages, Lightbulb, Loader2 } from 'lucide-react';
import type { CoachFeedback, HintLevel } from '../types/story';

interface Step3HintProps {
  draft: string;
  feedback: CoachFeedback | null;
  isLoading: boolean;
  hintLevel: HintLevel;
  whyOpened: boolean;
  koreanHelpEnabled: boolean;
  onToggleKoreanHelp: () => void;
  onOpenWhy: () => void;
  onUnlockHintLevel: (next: HintLevel) => void;
  onRetryHint: () => void;
}

function renderHighlightedDraft(draft: string, targetSentence: string) {
  const target = targetSentence.trim();
  if (!target) {
    return <span>{draft}</span>;
  }
  const index = draft.indexOf(target);
  if (index === -1) {
    return <span>{draft}</span>;
  }
  const before = draft.slice(0, index);
  const after = draft.slice(index + target.length);
  return (
    <>
      <span>{before}</span>
      <mark className="bg-amber-100 text-slate-900 px-1 py-0.5 rounded border-b-2 border-amber-500 font-medium">
        {target}
      </mark>
      <span>{after}</span>
    </>
  );
}

export function Step3Hint({
  draft,
  feedback,
  isLoading,
  hintLevel,
  whyOpened,
  koreanHelpEnabled,
  onToggleKoreanHelp,
  onOpenWhy,
  onUnlockHintLevel,
  onRetryHint,
}: Step3HintProps) {
  const [showWhyBox, setShowWhyBox] = useState(whyOpened);

  const handleToggleWhy = () => {
    if (!showWhyBox) {
      onOpenWhy();
    }
    setShowWhyBox((prev) => !prev);
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
            Finding one helpful point to guide your next step.
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
            Coach Pic could not load a hint yet. Your writing is safe.
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
      {/* Left: Student Draft with ONLY ONE highlighted part (Hint 1) */}
      <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Your Draft · Hint 1 Highlight</span>
          <span className="font-medium text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
            Highlighted part
          </span>
        </div>

        <p className="text-base leading-relaxed text-slate-800 whitespace-pre-wrap">
          {renderHighlightedDraft(draft, feedback.targetSentence)}
        </p>

        {koreanHelpEnabled && (
          <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 text-xs text-slate-700 leading-relaxed">
            <span className="font-bold text-blue-800 mr-1.5">한국어 도움 · Hint 1:</span>
            <span>{feedback.koreanHelp.hint1}</span>
          </div>
        )}
      </div>

      {/* Right: Coach Pic Feedback (Praise -> Fix -> Explanation -> Question) + Why? + 한국어 도움 ON/OFF */}
      <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-5 space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-slate-500">
              Step 3 · {feedback.focusCategory} · Hint {hintLevel} of 3
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

        {/* Strict Praise -> Focused Fix -> Short Explanation -> Guiding Question Structure */}
        <div className="space-y-3 text-sm leading-relaxed">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <p className="text-xs font-bold text-emerald-700">1. Praise</p>
            <p className="text-slate-900">{feedback.praise}</p>
            {koreanHelpEnabled && (
              <p className="text-xs text-slate-600 pt-1.5 border-t border-slate-200/70">
                {feedback.koreanHelp.praise}
              </p>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <p className="text-xs font-bold text-amber-800">2. Focused Fix</p>
            <p className="text-slate-900 font-medium">{feedback.fix}</p>
            {koreanHelpEnabled && (
              <p className="text-xs text-slate-600 pt-1.5 border-t border-slate-200/70">
                {feedback.koreanHelp.fix}
              </p>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <p className="text-xs font-bold text-slate-700">3. Short Explanation</p>
            <p className="text-slate-800">{feedback.explanation}</p>
            {koreanHelpEnabled && (
              <p className="text-xs text-slate-600 pt-1.5 border-t border-slate-200/70">
                {feedback.koreanHelp.explanation}
              </p>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 space-y-1">
            <p className="text-xs font-bold text-blue-800">4. Guiding Question</p>
            <p className="text-slate-900 font-medium">{feedback.question}</p>
            {koreanHelpEnabled && (
              <p className="text-xs text-blue-900/80 pt-1.5 border-t border-blue-200/70">
                {feedback.koreanHelp.question}
              </p>
            )}
          </div>
        </div>

        {/* Why? Button & Expandable Explanation */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={handleToggleWhy}
            aria-expanded={showWhyBox}
            className={`min-h-[44px] px-4 py-2 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition-colors ${
              showWhyBox
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Info className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Why?</span>
          </button>

          {showWhyBox && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-sm">
              <p className="text-xs font-bold text-slate-700">Why this matters</p>
              <p className="text-slate-800 leading-relaxed">{feedback.whyExplanation}</p>
              {koreanHelpEnabled && (
                <p className="text-xs text-slate-600 pt-1.5 border-t border-slate-200/70">
                  {feedback.koreanHelp.whyExplanation}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Progressive Hint Ladder (Hint 2 & Hint 3) */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          {hintLevel >= 2 && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-sm">
              <p className="text-xs font-bold text-slate-700">Hint 2 · Closer Clue</p>
              <p className="text-slate-800">{feedback.hint2}</p>
              {koreanHelpEnabled && (
                <p className="text-xs text-slate-600 pt-1.5 border-t border-slate-200/70">
                  {feedback.koreanHelp.hint2}
                </p>
              )}
            </div>
          )}

          {hintLevel >= 3 && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-sm">
              <p className="text-xs font-bold text-slate-700">
                Hint 3 · Pattern Example ({feedback.hint3Pattern})
              </p>
              <p className="text-slate-800 italic">“{feedback.hint3Example}”</p>
              <p className="text-xs text-slate-500">
                Notice the pattern in this different sentence, then try revising your own story.
              </p>
              {koreanHelpEnabled && (
                <p className="text-xs text-slate-600 pt-1.5 border-t border-slate-200/70">
                  {feedback.koreanHelp.hint3}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {hintLevel === 1 && (
              <button
                type="button"
                onClick={() => onUnlockHintLevel(2)}
                className="min-h-[44px] px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Lightbulb className="w-4 h-4 text-amber-600" aria-hidden="true" />
                <span>Need Hint 2 (Closer Clue)</span>
              </button>
            )}
            {hintLevel === 2 && (
              <button
                type="button"
                onClick={() => onUnlockHintLevel(3)}
                className="min-h-[44px] px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <HelpCircle className="w-4 h-4 text-blue-600" aria-hidden="true" />
                <span>Need Hint 3 (Different Example)</span>
              </button>
            )}
          </div>
        </div>

        {/* Mandatory AI Notice */}
        <p className="text-xs text-slate-500 pt-2 border-t border-slate-100">
          AI can be wrong.{' '}
          {feedback.isUncertain
            ? 'Coach Pic is not completely sure—please check a dictionary or textbook.'
            : 'Coach Pic says "I think..." when unsure—check a dictionary or textbook.'}
          {feedback.usedFallback && ' (Prepared offline hint active; your text is safe.)'}
        </p>
      </div>
    </div>
  );
}
