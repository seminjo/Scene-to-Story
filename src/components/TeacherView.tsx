import { useMemo, useState } from 'react';
import { Eye } from 'lucide-react';
import type { StoryRecord, TopicScene } from '../types/story';

interface TeacherViewProps {
  records: StoryRecord[];
  topics: TopicScene[];
  teacherEmail: string;
  isLoading: boolean;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function TeacherView({
  records,
  topics,
  teacherEmail,
  isLoading,
}: TeacherViewProps) {
  const [topicFilter, setTopicFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const matchTopic = topicFilter === 'all' || r.topicId === topicFilter;
      const matchLevel = levelFilter === 'all' || String(r.supportLevel) === levelFilter;
      return matchTopic && matchLevel;
    });
  }, [records, topicFilter, levelFilter]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Eye className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Teacher View · Read-only · Signed in as {teacherEmail}</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-slate-900">
            Student Learning Records
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="teacher-topic-filter" className="sr-only">
            Filter by scenario
          </label>
          <select
            id="teacher-topic-filter"
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            className="min-h-[44px] px-3 py-2 text-xs font-medium bg-white border border-slate-200 rounded-xl text-slate-700"
          >
            <option value="all">All Scenarios</option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>

          <label htmlFor="teacher-level-filter" className="sr-only">
            Filter by level
          </label>
          <select
            id="teacher-level-filter"
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="min-h-[44px] px-3 py-2 text-xs font-medium bg-white border border-slate-200 rounded-xl text-slate-700"
          >
            <option value="all">All Levels</option>
            <option value="1">Level 1</option>
            <option value="2">Level 2</option>
            <option value="3">Level 3</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-sm text-slate-600">
          Loading student records...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-sm text-slate-600">
          No student records match the selected filters yet.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((rec) => {
            const feedbackCount =
              typeof rec.feedbackCount === 'number'
                ? rec.feedbackCount
                : Array.isArray(rec.feedbackPoints)
                ? rec.feedbackPoints.length
                : 0;

            return (
              <article
                key={rec.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="space-y-0.5">
                    <h2 className="text-base font-bold text-slate-900">
                      {rec.studentName} · {rec.topicTitle}
                    </h2>
                    <p className="text-xs text-slate-500 font-mono tabular-nums">
                      {formatDate(rec.date)} · Level {rec.supportLevel} · {feedbackCount}{' '}
                      {feedbackCount === 1 ? 'feedback point' : 'feedback points'} · Why?{' '}
                      {rec.whyOpened ? 'Yes' : 'No'} · Korean Help{' '}
                      {rec.koreanHelpUsed ? 'ON' : 'OFF'} · Check Again{' '}
                      {rec.checkAgainUsed ? 'Yes' : 'No'}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">Read-only</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <p className="text-xs font-bold text-slate-600">Original Draft</p>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {rec.firstDraft}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <p className="text-xs font-bold text-blue-700">Final Revised Draft</p>
                    <p className="text-sm text-slate-900 leading-relaxed whitespace-pre-wrap">
                      {rec.finalDraft}
                    </p>
                  </div>
                </div>

                {Array.isArray(rec.feedbackPoints) && rec.feedbackPoints.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                    <p className="font-bold text-slate-700">AI Feedback Points</p>
                    <ul className="space-y-1 text-slate-600">
                      {rec.feedbackPoints.map((pt, i) => (
                        <li key={i}>
                          <span className="font-semibold text-slate-800">
                            {pt.category} ({pt.summaryTag}):
                          </span>{' '}
                          “{pt.yourSentence}” — {pt.thinkAbout}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <p className="text-xs text-slate-600">
                  <span className="font-semibold text-slate-700">Student reflection: </span>
                  {rec.reflectionNote || 'No reflection note added.'}
                </p>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
