import { ShieldAlert } from 'lucide-react';
import type { TopicScene, WritingPlan } from '../types/story';
import { checkPrivacy } from '../utils/privacyCheck';
import { SceneImage } from './SceneImage';

interface Step1PlanProps {
  topic: TopicScene;
  plan: WritingPlan;
  onChangePlan: (next: WritingPlan) => void;
}

const PLAN_FIELDS: {
  key: keyof WritingPlan;
  label: string;
  placeholder: string;
  starters: string[];
}[] = [
  {
    key: 'who',
    label: '1. Who?',
    placeholder: 'Who is in your story? (e.g., I and another student)',
    starters: ['I', 'Another student', 'A café worker', 'A new classmate'],
  },
  {
    key: 'where',
    label: '2. Where?',
    placeholder: 'Where does your story happen?',
    starters: ['At the bus stop', 'Near a quiet café', 'In our classroom', 'Outside the school gate'],
  },
  {
    key: 'whatHappened',
    label: '3. What happened?',
    placeholder: 'What started the problem in your story?',
    starters: ['Suddenly started to rain', 'Found a wallet on the ground', 'Sat alone looking nervous'],
  },
  {
    key: 'howFelt',
    label: '4. How did they feel?',
    placeholder: 'How did you or the other person feel?',
    starters: ['Surprised at first', 'Unsure and worried', 'Nervous and quiet', 'Warm and thankful'],
  },
  {
    key: 'whatNext',
    label: '5. What happened next?',
    placeholder: 'What choice or action happened after the problem?',
    starters: ['Offered to share', 'Asked someone for help', 'Walked over to say hello', 'Talked together'],
  },
  {
    key: 'howEnded',
    label: '6. How did the story end?',
    placeholder: 'Write your own ending idea for how the moment finished.',
    starters: ['Thanked each other', 'Felt relieved', 'Became friendly', 'Smiled on the way home'],
  },
];

export function Step1Plan({ topic, plan, onChangePlan }: Step1PlanProps) {
  const combinedPlanText = `${plan.who} ${plan.where} ${plan.whatHappened} ${plan.howFelt} ${plan.whatNext} ${plan.howEnded}`;
  const privacy = checkPrivacy(combinedPlanText);

  const appendStarter = (key: keyof WritingPlan, starter: string) => {
    const current = plan[key].trim();
    const nextValue = current ? `${current}, ${starter.toLowerCase()}` : starter;
    onChangePlan({ ...plan, [key]: nextValue });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top: Selected Scenario Summary */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <span>Step 1 · Observe & Plan</span>
          <span className="font-mono tabular-nums">Scenario {topic.scenarioNumber}</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="font-display text-2xl font-bold text-slate-900">{topic.title}</h1>
            <p className="text-xs text-slate-500">
              Use this scenario as a starting point—create your own details and ending.
            </p>
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-700 md:max-w-2xl">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <dt className="font-bold text-slate-800 mb-0.5">Beginning</dt>
              <dd>{topic.beginning}</dd>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <dt className="font-bold text-slate-800 mb-0.5">Problem</dt>
              <dd>{topic.problem}</dd>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <dt className="font-bold text-slate-800 mb-0.5">Ending idea</dt>
              <dd>{topic.endingIdea}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Picture Prompt */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
          <SceneImage src={topic.imageUrl} alt={topic.imageAlt} title={topic.title} />
          <p className="text-sm text-slate-700 leading-relaxed">{topic.scenePromptQuestion}</p>
        </div>

        {/* Right: 6 Planning Question Boxes */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 space-y-5">
          <div className="space-y-1">
            <h2 className="font-display text-xl font-bold text-slate-900">
              Plan your story ideas
            </h2>
            <p className="text-sm text-slate-600">
              Jot down short notes for each question. Your notes stay with you in Step 2.
            </p>
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

          <div className="space-y-4">
            {PLAN_FIELDS.map((field) => (
              <div key={field.key} className="space-y-2">
                <label
                  htmlFor={`plan-${field.key}`}
                  className="block text-sm font-semibold text-slate-900"
                >
                  {field.label}
                </label>
                <input
                  id={`plan-${field.key}`}
                  type="text"
                  value={plan[field.key]}
                  onChange={(e) => onChangePlan({ ...plan, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                  className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400"
                />
                <div className="flex flex-wrap gap-1.5">
                  {field.starters.map((starter) => (
                    <button
                      key={starter}
                      type="button"
                      onClick={() => appendStarter(field.key, starter)}
                      className="min-h-[34px] px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      + {starter}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
