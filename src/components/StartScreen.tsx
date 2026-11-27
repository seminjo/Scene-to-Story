import { ArrowRight, Lock, ShieldAlert } from 'lucide-react';
import type { SupportLevel, TopicScene } from '../types/story';
import { SceneImage } from './SceneImage';

interface StartScreenProps {
  topics: TopicScene[];
  selectedTopicId: string;
  onSelectTopic: (topicId: string) => void;
  studentName: string;
  onChangeStudentName: (name: string) => void;
  supportLevel: SupportLevel;
  onChangeSupportLevel: (level: SupportLevel) => void;
  onStartWriting: () => void;
  onOpenTeacherPrompt: () => void;
  recordCount: number;
  onOpenRecords: () => void;
}

const LEVEL_DESCRIPTIONS: Record<SupportLevel, string> = {
  1: 'Level 1 (More Support) · Sentence frames help you write each part.',
  2: 'Level 2 (Some Support) · Keywords and short questions guide your story.',
  3: 'Level 3 (Less Support) · Free writing with connector words only.',
};

export function StartScreen({
  topics,
  selectedTopicId,
  onSelectTopic,
  studentName,
  onChangeStudentName,
  supportLevel,
  onChangeSupportLevel,
  onStartWriting,
  onOpenTeacherPrompt,
  recordCount,
  onOpenRecords,
}: StartScreenProps) {
  const activeTopic = topics.find((t) => t.id === selectedTopicId) || topics[0];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-10">
      {/* Hero Split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <p className="text-xs font-medium text-slate-500 tabular-nums">
              CEFR A2 Story Workshop · Middle School Grade 1 · Coach Pic
            </p>
            <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
              Turn a short scene into your own story.
            </h1>
            <p className="text-base text-slate-600 leading-relaxed max-w-xl">
              Choose a scenario, plan your ideas, write a short story, and get 1–3 simple tips from
              Coach Pic to fix your writing yourself.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="student-nickname" className="block text-sm font-semibold text-slate-900">
                Your Writer Nickname
              </label>
              <input
                id="student-nickname"
                type="text"
                value={studentName}
                maxLength={32}
                onChange={(e) => onChangeStudentName(e.target.value)}
                placeholder="e.g., SunnyWriter01"
                className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400"
              />
              <div className="flex items-start gap-2 pt-1 text-xs text-slate-600">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  Privacy rule: Do not enter your real name, school, phone number, or address.
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">Starting Support Level</span>
                <span className="text-xs font-mono tabular-nums text-slate-500">
                  Auto-adjusts as you revise
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
                {([1, 2, 3] as SupportLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => onChangeSupportLevel(lvl)}
                    className={`min-h-[40px] px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                      supportLevel === lvl
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Level {lvl}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-600">{LEVEL_DESCRIPTIONS[supportLevel]}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="button"
              onClick={onStartWriting}
              className="min-h-[48px] px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
            >
              <span>Start Writing: {activeTopic.title}</span>
              <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
            </button>

            {recordCount > 0 && (
              <button
                type="button"
                onClick={onOpenRecords}
                className="min-h-[48px] px-5 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-sm rounded-xl transition-colors whitespace-nowrap"
              >
                My Records ({recordCount})
              </button>
            )}
          </div>
        </div>

        {/* Selected Scene Featured Card */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Selected Scenario · Scenario {activeTopic.scenarioNumber}</span>
              <span className="font-mono tabular-nums">CEFR A2 · 5–7 sentences</span>
            </div>
            <SceneImage
              src={activeTopic.imageUrl}
              alt={activeTopic.imageAlt}
              title={activeTopic.title}
            />
          </div>
          <div className="space-y-2.5">
            <h2 className="font-display text-xl font-bold text-slate-900">{activeTopic.title}</h2>
            <dl className="space-y-1 text-xs text-slate-600 leading-relaxed">
              <div>
                <dt className="inline font-semibold text-slate-800">Beginning: </dt>
                <dd className="inline">{activeTopic.beginning}</dd>
              </div>
              <div>
                <dt className="inline font-semibold text-slate-800">Problem: </dt>
                <dd className="inline">{activeTopic.problem}</dd>
              </div>
              <div>
                <dt className="inline font-semibold text-slate-800">Ending idea: </dt>
                <dd className="inline">{activeTopic.endingIdea}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Scenario Selector Grid (3 Open-Ended Scenarios) */}
      <section className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
              Choose a Story Scenario
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Each scenario gives you a starting direction—you invent the details and ending.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono tabular-nums shrink-0">
            {topics.length} scenarios
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {topics.map((topic) => {
            const isSelected = topic.id === activeTopic.id;
            return (
              <button
                key={topic.id}
                type="button"
                onClick={() => onSelectTopic(topic.id)}
                className={`text-left bg-white rounded-2xl p-4 border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-600 ring-2 ring-blue-600/15'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="space-y-3.5 w-full">
                  <SceneImage src={topic.imageUrl} alt={topic.imageAlt} title={topic.title} />
                  <div className="space-y-1">
                    <p className="text-xs font-mono tabular-nums text-slate-500">
                      Scenario {topic.scenarioNumber}
                    </p>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {topic.title}
                    </h3>
                  </div>

                  <dl className="space-y-1.5 text-xs text-slate-600 leading-relaxed">
                    <div>
                      <dt className="font-semibold text-slate-800 inline">Beginning: </dt>
                      <dd className="inline">{topic.beginning}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-slate-800 inline">Problem: </dt>
                      <dd className="inline">{topic.problem}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-slate-800 inline">Ending idea: </dt>
                      <dd className="inline">{topic.endingIdea}</dd>
                    </div>
                  </dl>
                </div>

                <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                  <span className={isSelected ? 'text-blue-600' : 'text-slate-600'}>
                    {isSelected ? 'Selected' : 'Choose scenario'}
                  </span>
                  <ArrowRight
                    className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`}
                    aria-hidden="true"
                  />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Discreet Footer with Read-only Teacher Access */}
      <footer className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <p>Scene to Story! · Process-focused English writing studio · Never writes for the student</p>
        <button
          type="button"
          onClick={onOpenTeacherPrompt}
          className="min-h-[36px] px-2 text-slate-400 hover:text-slate-700 flex items-center gap-1.5 transition-colors"
        >
          <Lock className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Teacher Access</span>
        </button>
      </footer>
    </div>
  );
}
