import { useState } from 'react';
import { ChevronDown, ChevronUp, ShieldAlert } from 'lucide-react';
import type { SupportLevel, TopicScene, WritingPlan } from '../types/story';
import { checkPrivacy, countSentences, countWords } from '../utils/privacyCheck';
import { SceneImage } from './SceneImage';

interface Step2DraftProps {
  topic: TopicScene;
  plan: WritingPlan;
  supportLevel: SupportLevel;
  draft: string;
  onChangeDraft: (next: string) => void;
}

export function Step2Draft({
  topic,
  plan,
  supportLevel,
  draft,
  onChangeDraft,
}: Step2DraftProps) {
  const [showPlanRef, setShowPlanRef] = useState(true);
  const privacy = checkPrivacy(draft);
  const sentences = countSentences(draft);
  const words = countWords(draft);

  const insertSnippet = (snippet: string) => {
    const trimmed = draft.trimEnd();
    const spacer = trimmed.length === 0 ? '' : trimmed.endsWith('\n') ? '' : ' ';
    onChangeDraft(`${trimmed}${spacer}${snippet}`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left: Support Panel by Level + Collapsible Scene/Plan Reference */}
      <div className="lg:col-span-5 space-y-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">
              Level {supportLevel} Writing Support
            </span>
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              {supportLevel === 1
                ? 'Sentence frames'
                : supportLevel === 2
                ? 'Keywords & questions'
                : 'Connectors only'}
            </span>
          </div>

          {supportLevel === 1 && (
            <div className="space-y-2.5">
              <p className="text-xs text-slate-600">
                Tap any frame to add it to your box, then replace the blanks with your own story.
              </p>
              <div className="space-y-2">
                {topic.level1Frames.map((frame, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => insertSnippet(frame)}
                    className="w-full text-left p-2.5 text-xs text-slate-700 bg-slate-50 hover:bg-blue-50 hover:text-blue-900 border border-slate-200 rounded-xl transition-colors"
                  >
                    + {frame}
                  </button>
                ))}
              </div>
            </div>
          )}

          {supportLevel === 2 && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-slate-700">Guiding Questions</p>
                <ul className="space-y-1 text-xs text-slate-600 list-disc pl-4">
                  {topic.level2Keywords.questions.map((q) => (
                    <li key={q}>{q}</li>
                  ))}
                </ul>
              </div>
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-700">Useful Scene Words</p>
                <div className="flex flex-wrap gap-1.5">
                  {topic.level2Keywords.vocabulary.map((word) => (
                    <button
                      key={word}
                      type="button"
                      onClick={() => insertSnippet(word)}
                      className="min-h-[34px] px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      {word}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {supportLevel === 3 && (
            <div className="space-y-2.5">
              <p className="text-xs text-slate-600">
                Free writing mode! Try linking your 6–8 sentences with sequencing and reason words:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {topic.level3Connectors.map((conn) => (
                  <button
                    key={conn}
                    type="button"
                    onClick={() => insertSnippet(conn === 'Because' || conn === 'So' ? conn.toLowerCase() : `${conn},`)}
                    className="min-h-[36px] px-3 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-blue-50 hover:text-blue-800 rounded-lg transition-colors"
                  >
                    {conn}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Collapsible Scene & Step 1 Plan */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowPlanRef((prev) => !prev)}
            className="w-full min-h-[44px] px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <span>Scene & Your Step 1 Notes</span>
            {showPlanRef ? (
              <ChevronUp className="w-4 h-4 text-slate-500" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" aria-hidden="true" />
            )}
          </button>

          {showPlanRef && (
            <div className="px-4 pb-4 pt-1 space-y-3 border-t border-slate-100">
              <SceneImage src={topic.imageUrl} alt={topic.imageAlt} title={topic.title} />
              <dl className="grid grid-cols-1 gap-1.5 text-xs text-slate-600">
                <div>
                  <dt className="inline font-semibold text-slate-700">Who: </dt>
                  <dd className="inline">{plan.who || '—'}</dd>
                </div>
                <div>
                  <dt className="inline font-semibold text-slate-700">Where: </dt>
                  <dd className="inline">{plan.where || '—'}</dd>
                </div>
                <div>
                  <dt className="inline font-semibold text-slate-700">What: </dt>
                  <dd className="inline">{plan.whatHappened || '—'}</dd>
                </div>
                <div>
                  <dt className="inline font-semibold text-slate-700">Feeling: </dt>
                  <dd className="inline">{plan.howFelt || '—'}</dd>
                </div>
                <div>
                  <dt className="inline font-semibold text-slate-700">Next: </dt>
                  <dd className="inline">{plan.whatNext || '—'}</dd>
                </div>
                <div>
                  <dt className="inline font-semibold text-slate-700">Ending: </dt>
                  <dd className="inline">{plan.howEnded || '—'}</dd>
                </div>
              </dl>
            </div>
          )}
        </div>
      </div>

      {/* Right: Story Writing Box */}
      <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Write your first draft
          </h1>
          <span className="text-xs font-mono tabular-nums text-slate-500">
            {sentences} {sentences === 1 ? 'sentence' : 'sentences'} · {words}{' '}
            {words === 1 ? 'word' : 'words'} · Goal: 6–8 sentences
          </span>
        </div>

        <p className="text-sm text-slate-600">
          Write the story in your own words. Coach Pic will look at one focus point when you finish.
        </p>

        {privacy.hasPII && (
          <div
            role="alert"
            className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 flex items-start gap-2.5 text-sm text-amber-900"
          >
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-semibold">Personal information detected</p>
              <p className="mt-0.5">{privacy.message}</p>
            </div>
          </div>
        )}

        <label htmlFor="draft-textarea" className="sr-only">
          Your English story draft
        </label>
        <textarea
          id="draft-textarea"
          value={draft}
          onChange={(e) => onChangeDraft(e.target.value)}
          rows={9}
          placeholder="Yesterday, I was waiting at the bus stop after school..."
          className="w-full min-h-[240px] p-4 text-base leading-relaxed bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 resize-y"
        />

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-slate-500">
          <span>Connector ideas: First · Then · After that · Because · So · Finally</span>
          <span className="font-mono tabular-nums">
            {sentences >= 6 ? 'Great length for B1!' : `${Math.max(0, 6 - sentences)} more to reach 6 sentences`}
          </span>
        </div>
      </div>
    </div>
  );
}
