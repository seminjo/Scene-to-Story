import { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Languages,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';
import type { CoachFeedback } from '../types/story';
import { checkPrivacy, countSentences, countWords } from '../utils/privacyCheck';

interface Step4RewriteProps {
  firstDraft: string;
  revisedDraft: string;
  onChangeRevisedDraft: (next: string) => void;
  feedback: CoachFeedback | null;
  koreanHelpEnabled: boolean;
  onToggleKoreanHelp: () => void;
  isCheckingAgain: boolean;
  onBackToFeedback: () => void;
  onCheckAgain: () => void;
  onFinishWriting: () => void;
}

export function Step4Rewrite({
  firstDraft,
  revisedDraft,
  onChangeRevisedDraft,
  feedback,
  koreanHelpEnabled,
  onToggleKoreanHelp,
  isCheckingAgain,
  onBackToFeedback,
  onCheckAgain,
  onFinishWriting,
}: Step4RewriteProps) {
  const [showOriginal, setShowOriginal] = useState(false);
  const privacy = checkPrivacy(revisedDraft);
  const sentences = countSentences(revisedDraft);
  const words = countWords(revisedDraft);
  const disableSubmit = !revisedDraft.trim() || privacy.hasPII || isCheckingAgain;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      {/* Small Summary of Feedback Cards */}
      {feedback && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-lg font-bold text-slate-900">Your Feedback</h2>
            <button
              type="button"
              aria-pressed={koreanHelpEnabled}
              onClick={onToggleKoreanHelp}
              className={`min-h-[38px] px-3 py-1.5 text-xs font-semibold rounded-lg border flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                koreanHelpEnabled
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Languages className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{koreanHelpEnabled ? '한국어 도움 ON' : '한국어 도움 OFF'}</span>
            </button>
          </div>

          <ul className="space-y-2 text-sm">
            {feedback.feedbackPoints.map((pt, idx) => (
              <li
                key={pt.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-slate-900">
                    {idx + 1}. {pt.summaryTag}
                  </span>
                  <span className="text-xs text-slate-500">“{pt.yourSentence}”</span>
                </div>
                <p className="text-xs text-slate-600">{pt.question}</p>
                {koreanHelpEnabled && (
                  <p className="text-xs text-blue-800">{pt.koreanHelp.thinkAbout}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Editable Rewrite Box */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Rewrite your story
          </h1>
          <span className="text-xs font-mono tabular-nums text-slate-500">
            {sentences} {sentences === 1 ? 'sentence' : 'sentences'} · {words}{' '}
            {words === 1 ? 'word' : 'words'}
          </span>
        </div>

        <p className="text-sm text-slate-600">
          Fix your story by yourself using the feedback above.
        </p>

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

        {/* Action Buttons: Back + Primary (Check Again) + Secondary (Finish Writing) */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBackToFeedback}
            className="min-h-[48px] px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Back: AI Feedback</span>
          </button>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <button
              type="button"
              disabled={disableSubmit}
              onClick={onFinishWriting}
              className="min-h-[48px] px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Finish Writing / 글쓰기 마치기</span>
            </button>

            <button
              type="button"
              disabled={disableSubmit}
              onClick={onCheckAgain}
              className="min-h-[48px] px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <RefreshCw
                className={`w-4 h-4 shrink-0 ${isCheckingAgain ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
              <span>
                {isCheckingAgain ? 'Checking...' : 'Check Again / 다시 확인하기'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
