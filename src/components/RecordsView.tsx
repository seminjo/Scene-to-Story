import { useState } from 'react';
import { ChevronDown, ChevronUp, PenLine } from 'lucide-react';
import type { StoryRecord } from '../types/story';

interface RecordsViewProps {
  records: StoryRecord[];
  studentName: string;
  isLoading: boolean;
  onStartNew: () => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function RecordsView({
  records,
  studentName,
  isLoading,
  onStartNew,
}: RecordsViewProps) {
  const [expandedId, setExpandedId] = useState<string | null>(records[0]?.id ?? null);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs text-slate-500">
            Student Portfolio · {studentName || 'My Workspace'}
          </p>
          <h1 className="font-display text-3xl font-bold text-slate-900">My Records</h1>
        </div>

        <button
          type="button"
          onClick={onStartNew}
          className="min-h-[44px] px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-2 transition-colors"
        >
          <PenLine className="w-4 h-4" aria-hidden="true" />
          <span>Write a Story</span>
        </button>
      </div>

      {isLoading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-sm text-slate-600">
          Loading your saved stories...
        </div>
      ) : records.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3">
          <h2 className="font-display text-xl font-bold text-slate-900">
            No saved stories yet
          </h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Complete all 5 steps for any picture scene and press “Save to My Records” on the final
            screen to keep your Before and After drafts here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((rec) => {
            const isOpen = expandedId === rec.id;
            return (
              <article
                key={rec.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setExpandedId(isOpen ? null : rec.id)}
                  className="w-full min-h-[60px] px-5 py-4 text-left flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="space-y-1 min-w-0">
                    <h2 className="text-base font-bold text-slate-900 truncate">
                      {rec.topicTitle}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-mono tabular-nums">
                      <span>{formatDate(rec.date)}</span>
                      <span aria-hidden="true">·</span>
                      <span>Level {rec.supportLevel}</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {rec.hintsUsed} {rec.hintsUsed === 1 ? 'hint' : 'hints'}
                      </span>
                    </div>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" aria-hidden="true" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-100 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                        <p className="text-xs font-bold text-slate-600">Before · First Draft</p>
                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                          {rec.firstDraft}
                        </p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                        <p className="text-xs font-bold text-blue-700">After · Final Story</p>
                        <p className="text-sm text-slate-900 leading-relaxed whitespace-pre-wrap">
                          {rec.finalDraft}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <p className="font-bold text-slate-700 mb-1">What I changed</p>
                        <p>{rec.reflectionNote || 'No reflection note added.'}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                        <p className="font-bold text-slate-700">AI helped me with</p>
                        <p>{rec.aiHelpSummary || `Level ${rec.supportLevel} · ${rec.hintsUsed} hint(s)`}</p>
                        {rec.feedbackFocus && (
                          <p className="text-slate-500">Focus: {rec.feedbackFocus}</p>
                        )}
                        {typeof rec.whyOpened === 'boolean' && (
                          <p className="text-slate-500">
                            Opened “Why?”: {rec.whyOpened ? 'Yes' : 'No'}
                          </p>
                        )}
                        {typeof rec.koreanHelpUsed === 'boolean' && (
                          <p className="text-slate-500">
                            Korean Help: {rec.koreanHelpUsed ? 'ON' : 'OFF'}
                          </p>
                        )}
                      </div>
                    </div>
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
