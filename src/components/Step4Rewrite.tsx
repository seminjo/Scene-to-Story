import { useState } from 'react';
import { ChevronDown, ChevronUp, Languages, ShieldAlert } from 'lucide-react';
import type { CoachFeedback, HintLevel } from '../types/story';
import { checkPrivacy, countSentences, countWords } from '../utils/privacyCheck';

interface Step4RewriteProps {
  firstDraft: string;
  revisedDraft: string;
  onChangeRevisedDraft: (next: string) => void;
  feedback: CoachFeedback | null;
  hintLevel: HintLevel;
  koreanHelpEnabled: boolean;
  onToggleKoreanHelp: () => void;
}

export function Step4Rewrite({
  firstDraft,
  revisedDraft,
  onChangeRevisedDraft,
  feedback,
  hintLevel,
  koreanHelpEnabled,
  onToggleKoreanHelp,
}: Step4RewriteProps) {
  const [showOriginal, setShowOriginal] = useState(false);
  const privacy = checkPrivacy(revisedDraft);
  const sentences = countSentences(revisedDraft);
  const words = countWords(revisedDraft);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      {/* Coach Reminder Banner (Highlight + Question + remembered Korean Help ON/OFF) */}
      {feedback && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <span>Step 4 · Rewrite by Yourself · Hint {hintLevel}</span>
            <button
              type="button"
              aria-pressed={koreanHelpEnabled}
              onClick={onToggleKoreanHelp}
              className={`min-h-[36px] px-3 py-1 text-xs font-semibold rounded-lg border flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                koreanHelpEnabled
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Languages className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{koreanHelpEnabled ? '한국어 도움 ON' : '한국어 도움 OFF'}</span>
            </button>
          </div>

          {feedback.targetSentence && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
              <p className="text-xs font-semibold text-amber-900">Highlighted focus part</p>
              <p className="text-sm text-slate-900 font-medium">“{feedback.targetSentence}”</p>
              {koreanHelpEnabled && (
                <p className="text-xs text-amber-900/80 pt-1 border-t border-amber-200/70">
                  {feedback.koreanHelp.hint1}
                </p>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <p className="text-xs font-bold text-blue-800">Coach Pic’s Question</p>
            <p className="text-sm text-slate-900 font-medium">{feedback.question}</p>
            {koreanHelpEnabled && (
              <p className="text-xs text-blue-900/80">{feedback.koreanHelp.question}</p>
            )}

            {hintLevel >= 2 && (
              <div className="pt-1.5 space-y-0.5 text-xs text-slate-600">
                <p>Hint 2: {feedback.hint2}</p>
                {koreanHelpEnabled && <p className="text-slate-500">{feedback.koreanHelp.hint2}</p>}
              </div>
            )}
            {hintLevel >= 3 && (
              <div className="pt-1 space-y-0.5 text-xs text-slate-600">
                <p>Hint 3 pattern: “{feedback.hint3Example}”</p>
                {koreanHelpEnabled && <p className="text-slate-500">{feedback.koreanHelp.hint3}</p>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Editable Rewrite Box */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Revise your story
          </h1>
          <span className="text-xs font-mono tabular-nums text-slate-500">
            {sentences} {sentences === 1 ? 'sentence' : 'sentences'} · {words}{' '}
            {words === 1 ? 'word' : 'words'}
          </span>
        </div>

        {privacy.hasPII && (
          <div
            role="alert"
            className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 flex items-start gap-2.5 text-sm text-amber-900"
          >
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{privacy.message}</span>
          </div>
        )}

        <label htmlFor="rewrite-textarea" className="sr-only">
          Editable story rewrite box
        </label>
        <textarea
          id="rewrite-textarea"
          value={revisedDraft}
          onChange={(e) => onChangeRevisedDraft(e.target.value)}
          rows={9}
          className="w-full min-h-[240px] p-4 text-base leading-relaxed bg-slate-50 border border-slate-200 rounded-xl text-slate-900 resize-y"
        />

        {/* Small Collapsed Original Draft Card */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowOriginal((prev) => !prev)}
            className="w-full min-h-[44px] px-4 py-2 flex items-center justify-between text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            <span>View original draft</span>
            {showOriginal ? (
              <ChevronUp className="w-4 h-4 text-slate-500" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" aria-hidden="true" />
            )}
          </button>
          {showOriginal && (
            <div className="p-4 text-sm text-slate-600 leading-relaxed bg-white border-t border-slate-100 whitespace-pre-wrap">
              {firstDraft}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
