import { useState } from 'react';
import { BookOpen, Check, Save, Sparkles } from 'lucide-react';
import type {
  HintLevel,
  RevisionCheckResult,
  SupportLevel,
  TopicScene,
} from '../types/story';
import { computeWordDiff } from '../utils/privacyCheck';

interface Step5FinishProps {
  topic: TopicScene;
  firstDraft: string;
  finalDraft: string;
  supportLevelUsed: SupportLevel;
  hintsUsed: number;
  maxHintLevel: HintLevel;
  feedbackFocus: string;
  whyOpened: boolean;
  koreanHelpUsed: boolean;
  revisionCheck: RevisionCheckResult | null;
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
  hintsUsed,
  maxHintLevel,
  feedbackFocus,
  whyOpened,
  koreanHelpUsed,
  revisionCheck,
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
      {/* Header Summary + Scaffolding Level Update */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <span>Step 5 · Finish & Compare</span>
          <span className="font-mono tabular-nums">{topic.title}</span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
          Your story is ready!
        </h1>
        {revisionCheck && (
          <p className="text-sm text-slate-700">
            {revisionCheck.encouragement}{' '}
            {revisionCheck.levelChangeReason === 'up' && (
              <span className="font-semibold text-blue-700">
                Next story moves up to Level {revisionCheck.nextLevel}!
              </span>
            )}
            {revisionCheck.levelChangeReason === 'down' && (
              <span className="font-semibold text-slate-800">
                Next story gives extra support at Level {revisionCheck.nextLevel}.
              </span>
            )}
            {revisionCheck.levelChangeReason === 'same' && (
              <span className="font-semibold text-slate-800">
                Next story continues at Level {revisionCheck.nextLevel}.
              </span>
            )}
          </p>
        )}
      </div>

      {/* Before / After Comparison with Highlighted Changes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700">Before · First Draft</span>
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
            <span className="font-bold text-blue-700">After · Final Story</span>
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

      {/* AI Helped Me With + Reflection Note */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
          <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" aria-hidden="true" />
            <span>AI helped me with</span>
          </h2>
          <dl className="space-y-2 text-sm text-slate-700">
            <div className="flex items-center justify-between gap-3 py-1.5 border-b border-slate-100">
              <dt className="text-slate-500 shrink-0">Main feedback focus</dt>
              <dd className="font-semibold text-slate-900 text-right">
                {feedbackFocus || 'Meaning / clarity'}
              </dd>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <dt className="text-slate-500">Hint levels used</dt>
              <dd className="font-semibold font-mono tabular-nums">
                {hintsUsed} of 3 (up to Hint {maxHintLevel})
              </dd>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <dt className="text-slate-500">Opened “Why?” explanation</dt>
              <dd className="font-semibold text-slate-900">{whyOpened ? 'Yes' : 'No'}</dd>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <dt className="text-slate-500">Korean Help</dt>
              <dd className="font-semibold text-slate-900">{koreanHelpUsed ? 'ON' : 'OFF'}</dd>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <dt className="text-slate-500">Writing support</dt>
              <dd className="font-semibold font-mono tabular-nums">Level {supportLevelUsed}</dd>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <dt className="text-slate-500">Who rewrote</dt>
              <dd className="font-semibold text-slate-900">Me (Student)</dd>
            </div>
          </dl>
        </div>

        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
          <label htmlFor="reflection-note" className="block font-display text-lg font-bold text-slate-900">
            What I changed
          </label>
          <p className="text-xs text-slate-600">
            Write one short note about what you improved in your own words.
          </p>
          <textarea
            id="reflection-note"
            value={reflectionNote}
            onChange={(e) => onChangeReflectionNote(e.target.value)}
            rows={3}
            placeholder="e.g., I changed 'wait' to 'waited' and added 'Then' to connect the events."
            className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Actions: Save + See a Sample (ONLY on Step 5!) + Next Topic */}
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
            Write Next Scene
          </button>
        </div>

        {showSample && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <p className="text-xs font-bold text-slate-700">
              Sample B1 Story · {topic.title}
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
