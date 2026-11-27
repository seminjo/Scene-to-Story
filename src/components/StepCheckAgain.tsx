import { Check, Info, Languages } from 'lucide-react';
import { useState } from 'react';
import type { CheckAgainResult, CoachFeedback } from '../types/story';

interface StepCheckAgainProps {
  feedback: CoachFeedback | null;
  checkResult: CheckAgainResult | null;
  koreanHelpEnabled: boolean;
  onToggleKoreanHelp: () => void;
  onOpenWhy: () => void;
}

export function StepCheckAgain({
  feedback,
  checkResult,
  koreanHelpEnabled,
  onToggleKoreanHelp,
  onOpenWhy,
}: StepCheckAgainProps) {
  const [openWhyIds, setOpenWhyIds] = useState<Record<string, boolean>>({});

  if (!checkResult) {
    return null;
  }

  const remainingPoints =
    feedback?.feedbackPoints.filter((pt) => checkResult.remainingPointIds.includes(pt.id)) ?? [];

  const toggleWhy = (id: string) => {
    setOpenWhyIds((prev) => {
      const next = !prev[id];
      if (next) onOpenWhy();
      return { ...prev, [id]: next };
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-slate-500">Step 4 · Check Again</p>
            <h1 className="font-display text-2xl font-bold text-slate-900">
              Final Story Check
            </h1>
          </div>

          <button
            type="button"
            aria-pressed={koreanHelpEnabled}
            onClick={onToggleKoreanHelp}
            className={`min-h-[40px] px-3.5 py-1.5 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition-colors ${
              koreanHelpEnabled
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Languages className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{koreanHelpEnabled ? '한국어 도움 ON' : '한국어 도움 OFF'}</span>
          </button>
        </div>

        <p className="text-sm text-slate-700">{checkResult.encouragement}</p>

        {/* What You Improved */}
        <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
          <h2 className="text-xs font-bold text-emerald-800">What You Improved</h2>
          {checkResult.improved.length > 0 ? (
            <ul className="space-y-1.5 text-sm text-slate-900">
              {checkResult.improved.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-700">
              You kept your story safe. Check the tip below if you want to revise more.
            </p>
          )}
        </div>
      </div>

      {/* Original Feedback for Any Unfixed Important Point */}
      {remainingPoints.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-800 px-1">
            Check this part one more time.
          </h2>
          {remainingPoints.map((pt) => {
            const isWhyOpen = Boolean(openWhyIds[pt.id]);
            return (
              <article
                key={pt.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-slate-900">{pt.category}</h3>
                  <span className="text-xs font-mono text-slate-500">{pt.summaryTag}</span>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                  <p className="text-xs font-semibold text-amber-900">Your sentence</p>
                  <p className="text-sm text-slate-900 font-medium">“{pt.yourSentence}”</p>
                </div>

                <div className="space-y-1 text-sm">
                  <p className="text-xs font-bold text-slate-700">Think about</p>
                  <p className="text-slate-800">{pt.thinkAbout}</p>
                  {koreanHelpEnabled && (
                    <p className="text-xs text-slate-600 pt-1">{pt.koreanHelp.thinkAbout}</p>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 space-y-1 text-sm">
                  <p className="text-xs font-bold text-blue-800">Question</p>
                  <p className="text-slate-900 font-medium">{pt.question}</p>
                  {koreanHelpEnabled && (
                    <p className="text-xs text-blue-900/80 pt-1 border-t border-blue-200/70">
                      {pt.koreanHelp.question}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => toggleWhy(pt.id)}
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
                    <p className="text-slate-800">{pt.whyExplanation}</p>
                    {koreanHelpEnabled && (
                      <p className="text-xs text-slate-600 pt-1.5 border-t border-slate-200/70">
                        {pt.koreanHelp.whyExplanation}
                      </p>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
