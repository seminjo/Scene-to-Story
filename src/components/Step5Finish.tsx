import { useState } from 'react';
import { BookOpen, Check, Save, Sparkles } from 'lucide-react';
import type { FeedbackPoint, SupportLevel, TopicScene } from '../types/story';
import { computeWordDiff } from '../utils/privacyCheck';

interface Step5FinishProps {
  topic: TopicScene;
  firstDraft: string;
  finalDraft: string;
  supportLevelUsed: SupportLevel;
  feedbackPoints: FeedbackPoint[];
  whyOpened: boolean;
  koreanHelpUsed: boolean;
  checkAgainUsed: boolean;
  reflectionNote: string;
  onChangeReflectionNote: (note: string) => void;
  isSaving: boolean;
  hasSaved: boolean;
  saveError: string;
  onSaveRecord: () => void;
  onStartNextStory: () => void;
}

export function Step5Finish({
  topic,
  firstDraft,
  finalDraft,
  supportLevelUsed,
  feedbackPoints,
  whyOpened,
  koreanHelpUsed,
  checkAgainUsed,
  reflectionNote,
  onChangeReflectionNote,
  isSaving,
  hasSaved,
  saveError,
  onSaveRecord,
  onStartNextStory,
}: Step5FinishProps) {
  const [showSample, setShowSample] = useState(false);
  const { beforeTokens, afterTokens } = computeWordDiff(firstDraft, finalDraft);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header Summary */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <span>Step 5 · Finish & Reflect</span>
          <span className="font-mono tabular-nums">{topic.title}</span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
          Great job on your story!
        </h1>
        <p className="text-sm text-slate-600">
          Compare your first draft and your revised story below, then write what you changed.
        </p>
      </div>

      {/* Before / After Comparison with Highlighted Changes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700">Before</span>
            <span className="text-slate-400">Removed words crossed</span>
          </div>
          <p className="text-sm sm:text-base leading-relaxed text-slate-700">
            {beforeTokens.map((tok, idx) => (
              <span key={idx}>
                {tok.kind === 'removed' ? (
                  <del className="bg-rose-50 text-rose-800 px-1 rounded">{tok.text}</del>
                ) : (
                  <span>{tok.text}</span>
                )}{' '}
              </span>
            ))}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-blue-700">After</span>
            <span className="text-slate-400">New or changed words highlighted</span>
          </div>
          <p className="text-sm sm:text-base leading-relaxed text-slate-900">
            {afterTokens.map((tok, idx) => (
              <span key={idx}>
                {tok.kind === 'added' ? (
                  <ins className="bg-emerald-100 text-emerald-950 font-semibold px-1 rounded no-underline border-b border-emerald-500">
                    {tok.text}
                  </ins>
                ) : (
                  <span>{tok.text}</span>
                )}{' '}
              </span>
            ))}
          </p>
        </div>
      </div>

      {/* My Feedback + Student Reflection */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" aria-hidden="true" />
            <span>My Feedback</span>
          </h2>

          {feedbackPoints.length > 0 && (
            <ul className="space-y-1.5 text-sm text-slate-800">
              {feedbackPoints.map((pt) => (
                <li
                  key={pt.id}
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
                >
                  <span className="font-medium">{pt.summaryTag}</span>
                  <span className="text-xs text-slate-500">{pt.category}</span>
                </li>
              ))}
            </ul>
          )}

          <dl className="space-y-2 text-sm text-slate-700 pt-1">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <dt className="text-slate-500">Feedback points</dt>
              <dd className="font-semibold font-mono tabular-nums">{feedbackPoints.length}</dd>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <dt className="text-slate-500">Used “Why?”</dt>
              <dd className="font-semibold text-slate-900">{whyOpened ? 'Yes' : 'No'}</dd>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <dt className="text-slate-500">Used Korean Help</dt>
              <dd className="font-semibold text-slate-900">{koreanHelpUsed ? 'ON' : 'OFF'}</dd>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <dt className="text-slate-500">Used Check Again</dt>
              <dd className="font-semibold text-slate-900">{checkAgainUsed ? 'Yes' : 'No'}</dd>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <dt className="text-slate-500">Support level</dt>
              <dd className="font-semibold font-mono tabular-nums">Level {supportLevelUsed}</dd>
            </div>
          </dl>
        </div>

        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
          <div>
            <label
              htmlFor="reflection-note"
              className="block font-display text-lg font-bold text-slate-900"
            >
              What did you change in your writing?
            </label>
            <p className="text-xs text-slate-600 mt-0.5">글에서 어떤 부분을 고쳤나요?</p>
          </div>
          <textarea
            id="reflection-note"
            value={reflectionNote}
            onChange={(e) => onChangeReflectionNote(e.target.value)}
            rows={4}
            placeholder="I changed the verbs to the past tense and fixed some sentences."
            className="w-full p-3.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Actions: Save + See a Sample (ONLY on Finish!) + Next Scenario */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
        {saveError && (
          <p role="alert" className="text-sm text-rose-700 font-medium">
            {saveError}
          </p>
        )}

        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
          <button
            type="button"
            disabled={isSaving || hasSaved}
            onClick={onSaveRecord}
            className={`min-h-[48px] px-5 py-3 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors ${
              hasSaved
                ? 'bg-emerald-600 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60'
            }`}
          >
            {hasSaved ? (
              <>
                <Check className="w-4 h-4" aria-hidden="true" />
                <span>Saved to My Records</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" aria-hidden="true" />
                <span>{isSaving ? 'Saving...' : 'Save to My Records'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setShowSample((prev) => !prev)}
            className="min-h-[48px] px-5 py-3 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <BookOpen className="w-4 h-4 text-slate-600" aria-hidden="true" />
            <span>{showSample ? 'Hide Sample Story' : 'See a Sample'}</span>
          </button>

          <button
            type="button"
            onClick={onStartNextStory}
            className="min-h-[48px] px-5 py-3 text-sm font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl sm:ml-auto transition-colors"
          >
            Try Next Scenario
          </button>
        </div>

        {showSample && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <p className="text-xs font-bold text-slate-700">
              Sample A2 Story · {topic.title}
            </p>
            <p className="text-sm sm:text-base leading-relaxed text-slate-800">
              {topic.sampleParagraph}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
