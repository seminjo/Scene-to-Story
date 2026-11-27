import { useCallback, useEffect, useMemo, useState } from 'react';
import { BottomNav } from './components/BottomNav';
import { RecordsView } from './components/RecordsView';
import { StartScreen } from './components/StartScreen';
import { Step1Plan } from './components/Step1Plan';
import { Step2Draft } from './components/Step2Draft';
import { Step3Hint } from './components/Step3Hint';
import { Step4Rewrite } from './components/Step4Rewrite';
import { Step5Finish } from './components/Step5Finish';
import { StepCheckAgain } from './components/StepCheckAgain';
import { TeacherAuthModal } from './components/TeacherAuthModal';
import { TeacherView } from './components/TeacherView';
import { TopBar } from './components/TopBar';
import { TOPIC_SCENES } from './data/topics';
import type {
  AppScreen,
  CheckAgainResult,
  CoachFeedback,
  StoryRecord,
  SupportLevel,
  WritingPlan,
} from './types/story';
import { checkPrivacy } from './utils/privacyCheck';

const STORAGE_KEY = 'scene_to_story_workspace_v2';
const STUDENT_ID_KEY = 'scene_to_story_student_id_v1';

interface SavedWorkspace {
  studentName: string;
  selectedTopicId: string;
  supportLevel: SupportLevel;
  koreanHelpEnabled: boolean;
  plan: WritingPlan;
  firstDraft: string;
  revisedDraft: string;
  reflectionNote: string;
}

const EMPTY_PLAN: WritingPlan = {
  who: '',
  where: '',
  whatHappened: '',
  howFelt: '',
  whatNext: '',
  howEnded: '',
};

function getOrCreateStudentId(): string {
  try {
    const existing = localStorage.getItem(STUDENT_ID_KEY);
    if (existing) return existing;
    const created = `stu_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
    localStorage.setItem(STUDENT_ID_KEY, created);
    return created;
  } catch {
    return `stu_${Date.now().toString(36)}`;
  }
}

function loadWorkspace(): Partial<SavedWorkspace> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export default function App() {
  const initial = useMemo(() => loadWorkspace(), []);
  const [studentId] = useState<string>(() => getOrCreateStudentId());

  const [screen, setScreen] = useState<AppScreen>('start');
  const [studentName, setStudentName] = useState<string>(initial.studentName ?? 'StoryWriter');
  const [selectedTopicId, setSelectedTopicId] = useState<string>(
    initial.selectedTopicId ?? TOPIC_SCENES[0].id
  );
  const [supportLevel, setSupportLevel] = useState<SupportLevel>(initial.supportLevel ?? 2);
  const [activeStoryLevel, setActiveStoryLevel] = useState<SupportLevel>(initial.supportLevel ?? 2);

  const [plan, setPlan] = useState<WritingPlan>({ ...EMPTY_PLAN, ...(initial.plan ?? {}) });
  const [firstDraft, setFirstDraft] = useState<string>(initial.firstDraft ?? '');
  const [revisedDraft, setRevisedDraft] = useState<string>(initial.revisedDraft ?? '');
  const [reflectionNote, setReflectionNote] = useState<string>(initial.reflectionNote ?? '');

  const [feedback, setFeedback] = useState<CoachFeedback | null>(null);
  const [whyOpened, setWhyOpened] = useState(false);
  const [koreanHelpEnabled, setKoreanHelpEnabled] = useState<boolean>(
    initial.koreanHelpEnabled ?? false
  );
  const [isLoadingHint, setIsLoadingHint] = useState(false);
  const [isCheckingAgain, setIsCheckingAgain] = useState(false);
  const [checkAgainUsed, setCheckAgainUsed] = useState(false);
  const [checkAgainResult, setCheckAgainResult] = useState<CheckAgainResult | null>(null);
  const [maxReachedStep, setMaxReachedStep] = useState<number>(1);

  const [myRecords, setMyRecords] = useState<StoryRecord[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [isSavingRecord, setIsSavingRecord] = useState(false);
  const [hasSavedCurrent, setHasSavedCurrent] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [teacherModalOpen, setTeacherModalOpen] = useState(false);
  const [teacherToken, setTeacherToken] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherRecords, setTeacherRecords] = useState<StoryRecord[]>([]);
  const [isLoadingTeacher, setIsLoadingTeacher] = useState(false);

  const activeTopic = useMemo(
    () => TOPIC_SCENES.find((t) => t.id === selectedTopicId) || TOPIC_SCENES[0],
    [selectedTopicId]
  );

  useEffect(() => {
    try {
      const payload: SavedWorkspace = {
        studentName,
        selectedTopicId,
        supportLevel,
        koreanHelpEnabled,
        plan,
        firstDraft,
        revisedDraft,
        reflectionNote,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota issues gracefully
    }
  }, [
    studentName,
    selectedTopicId,
    supportLevel,
    koreanHelpEnabled,
    plan,
    firstDraft,
    revisedDraft,
    reflectionNote,
  ]);

  const fetchMyRecords = useCallback(async () => {
    setIsLoadingRecords(true);
    try {
      const res = await fetch(`/api/records?studentId=${encodeURIComponent(studentId)}`);
      if (res.ok) {
        const data = await res.json();
        setMyRecords(Array.isArray(data.records) ? data.records : []);
      }
    } catch {
      // Keep existing local state on transient failure
    } finally {
      setIsLoadingRecords(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchMyRecords();
  }, [fetchMyRecords]);

  const handleSelectTopic = (topicId: string) => {
    if (topicId === selectedTopicId) return;
    setSelectedTopicId(topicId);
    setPlan(EMPTY_PLAN);
    setFirstDraft('');
    setRevisedDraft('');
    setReflectionNote('');
    setFeedback(null);
    setWhyOpened(false);
    setCheckAgainUsed(false);
    setCheckAgainResult(null);
    setHasSavedCurrent(false);
    setSaveError('');
    setMaxReachedStep(1);
  };

  const handleStartWriting = () => {
    setActiveStoryLevel(supportLevel);
    setScreen('step1');
    setMaxReachedStep((prev) => Math.max(prev, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const requestCoachFeedback = async () => {
    const privacy = checkPrivacy(firstDraft);
    if (privacy.hasPII) return;

    setScreen('step3');
    setMaxReachedStep((prev) => Math.max(prev, 3));
    setIsLoadingHint(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const res = await fetch('/api/coach/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draft: firstDraft,
          topicTitle: activeTopic.title,
          supportLevel: activeStoryLevel,
        }),
      });
      if (!res.ok) {
        throw new Error('Feedback request failed');
      }
      const data = await res.json();
      setFeedback(data.feedback);
      setWhyOpened(false);
      setCheckAgainUsed(false);
      setCheckAgainResult(null);
      if (!revisedDraft.trim()) {
        setRevisedDraft(firstDraft);
      }
    } catch {
      const sentences = firstDraft
        .split(/(?<=[.!?])\s+|\n+/)
        .map((s) => s.trim())
        .filter(Boolean);
      const fallbackPts = activeTopic.fallbackFeedback.feedbackPoints.map((pt, idx) => ({
        ...pt,
        yourSentence: sentences[Math.min(idx, Math.max(0, sentences.length - 1))] || firstDraft.trim(),
      }));
      setFeedback({
        ...activeTopic.fallbackFeedback,
        feedbackPoints: fallbackPts,
      });
      setWhyOpened(false);
      setCheckAgainUsed(false);
      setCheckAgainResult(null);
      if (!revisedDraft.trim()) {
        setRevisedDraft(firstDraft);
      }
    } finally {
      setIsLoadingHint(false);
    }
  };

  const handleCheckAgain = async () => {
    const privacy = checkPrivacy(revisedDraft);
    if (privacy.hasPII) return;

    setIsCheckingAgain(true);
    setCheckAgainUsed(true);
    try {
      const res = await fetch('/api/coach/check-again', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstDraft,
          revisedDraft,
          feedbackPoints: feedback?.feedbackPoints ?? [],
          currentLevel: activeStoryLevel,
        }),
      });
      if (!res.ok) {
        throw new Error('Check again failed');
      }
      const result: CheckAgainResult = await res.json();
      setCheckAgainResult(result);
    } catch {
      const changed = revisedDraft.trim() !== firstDraft.trim();
      const remainingIds =
        feedback?.feedbackPoints
          .filter((pt) => pt.yourSentence && revisedDraft.includes(pt.yourSentence))
          .map((pt) => pt.id) ?? [];
      setCheckAgainResult({
        improved: changed
          ? ['You updated your story in your own words.']
          : [],
        remainingPointIds: remainingIds,
        encouragement: changed
          ? 'Nice changes! Look below to see what you improved.'
          : 'Your writing is safe. You can edit the marked part if you want.',
        nextLevel:
          remainingIds.length === 0 && changed && activeStoryLevel < 3
            ? ((activeStoryLevel + 1) as SupportLevel)
            : activeStoryLevel,
      });
    } finally {
      setIsCheckingAgain(false);
      setScreen('checkAgain');
      setMaxReachedStep((prev) => Math.max(prev, 4));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFinishWriting = () => {
    const privacy = checkPrivacy(revisedDraft);
    if (privacy.hasPII) return;
    setScreen('step5');
    setMaxReachedStep(5);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveRecord = async () => {
    setSaveError('');
    const cleanName = studentName.trim() || 'StoryWriter';
    if (checkPrivacy(cleanName).hasPII || checkPrivacy(revisedDraft).hasPII) {
      setSaveError(
        'Please do not include your real name, school, phone number, or address before saving.'
      );
      return;
    }

    setIsSavingRecord(true);
    const points = feedback?.feedbackPoints ?? [];
    const aiHelpSummary = `Support Level ${activeStoryLevel} · ${points.length} feedback point(s) · Why? ${
      whyOpened ? 'Yes' : 'No'
    } · Korean Help ${koreanHelpEnabled ? 'ON' : 'OFF'} · Check Again ${
      checkAgainUsed ? 'Yes' : 'No'
    }`;

    const payload: StoryRecord = {
      id: `rec_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      studentId,
      studentName: cleanName,
      date: new Date().toISOString(),
      topicId: activeTopic.id,
      topicTitle: activeTopic.title,
      supportLevel: activeStoryLevel,
      feedbackCount: points.length,
      feedbackPoints: points.map((pt) => ({
        category: pt.category,
        summaryTag: pt.summaryTag,
        yourSentence: pt.yourSentence,
        thinkAbout: pt.thinkAbout,
        question: pt.question,
      })),
      firstDraft: firstDraft.trim(),
      finalDraft: revisedDraft.trim(),
      reflectionNote: reflectionNote.trim(),
      aiHelpSummary,
      whyOpened,
      koreanHelpUsed: koreanHelpEnabled,
      checkAgainUsed,
    };

    try {
      const res = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Could not save record.');
      }
      const data = await res.json();
      setMyRecords((prev) => [data.record, ...prev]);
      setHasSavedCurrent(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Could not save record.');
    } finally {
      setIsSavingRecord(false);
    }
  };

  const handleStartNextStory = () => {
    const nextLevel = checkAgainResult?.nextLevel ?? supportLevel;
    setSupportLevel(nextLevel);
    const currentIdx = TOPIC_SCENES.findIndex((t) => t.id === selectedTopicId);
    const nextTopic = TOPIC_SCENES[(currentIdx + 1) % TOPIC_SCENES.length];
    setSelectedTopicId(nextTopic.id);
    setPlan(EMPTY_PLAN);
    setFirstDraft('');
    setRevisedDraft('');
    setReflectionNote('');
    setFeedback(null);
    setWhyOpened(false);
    setCheckAgainUsed(false);
    setCheckAgainResult(null);
    setHasSavedCurrent(false);
    setSaveError('');
    setMaxReachedStep(1);
    setActiveStoryLevel(nextLevel);
    setScreen('step1');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTeacherVerified = async (token: string, email: string) => {
    setTeacherToken(token);
    setTeacherEmail(email);
    setScreen('teacher');
    setIsLoadingTeacher(true);
    try {
      const res = await fetch(`/api/records?teacherToken=${encodeURIComponent(token)}`);
      if (res.ok) {
        const data = await res.json();
        setTeacherRecords(Array.isArray(data.records) ? data.records : []);
      }
    } finally {
      setIsLoadingTeacher(false);
    }
  };

  const handleJumpStep = (step: 1 | 2 | 3 | 4 | 5) => {
    const map: Record<1 | 2 | 3 | 4 | 5, AppScreen> = {
      1: 'step1',
      2: 'step2',
      3: 'step3',
      4: 'step4',
      5: 'step5',
    };
    setScreen(map[step]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const step1HasPII = checkPrivacy(
    `${plan.who} ${plan.where} ${plan.whatHappened} ${plan.howFelt} ${plan.whatNext} ${plan.howEnded}`
  ).hasPII;
  const step2HasPII = checkPrivacy(firstDraft).hasPII;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <TopBar
        screen={screen}
        supportLevel={screen.startsWith('step') || screen === 'checkAgain' ? activeStoryLevel : supportLevel}
        onGoHome={() => setScreen('start')}
        onGoRecords={() => {
          fetchMyRecords();
          setScreen('records');
        }}
        onStartQuick={handleStartWriting}
        onJumpStep={handleJumpStep}
        maxReachedStep={maxReachedStep}
      />

      <main className="flex-1">
        {screen === 'start' && (
          <StartScreen
            topics={TOPIC_SCENES}
            selectedTopicId={selectedTopicId}
            onSelectTopic={handleSelectTopic}
            studentName={studentName}
            onChangeStudentName={setStudentName}
            supportLevel={supportLevel}
            onChangeSupportLevel={setSupportLevel}
            onStartWriting={handleStartWriting}
            onOpenTeacherPrompt={() => setTeacherModalOpen(true)}
            recordCount={myRecords.length}
            onOpenRecords={() => {
              fetchMyRecords();
              setScreen('records');
            }}
          />
        )}

        {screen === 'step1' && (
          <Step1Plan topic={activeTopic} plan={plan} onChangePlan={setPlan} />
        )}

        {screen === 'step2' && (
          <Step2Draft
            topic={activeTopic}
            plan={plan}
            supportLevel={activeStoryLevel}
            draft={firstDraft}
            onChangeDraft={(val) => {
              setFirstDraft(val);
              if (feedback) {
                setFeedback(null);
              }
            }}
          />
        )}

        {screen === 'step3' && (
          <Step3Hint
            draft={firstDraft}
            feedback={feedback}
            isLoading={isLoadingHint}
            koreanHelpEnabled={koreanHelpEnabled}
            onToggleKoreanHelp={() => setKoreanHelpEnabled((prev) => !prev)}
            onOpenWhy={() => setWhyOpened(true)}
            onRetryHint={requestCoachFeedback}
          />
        )}

        {screen === 'step4' && (
          <Step4Rewrite
            firstDraft={firstDraft}
            revisedDraft={revisedDraft}
            onChangeRevisedDraft={setRevisedDraft}
            feedback={feedback}
            koreanHelpEnabled={koreanHelpEnabled}
            onToggleKoreanHelp={() => setKoreanHelpEnabled((prev) => !prev)}
            isCheckingAgain={isCheckingAgain}
            onBackToFeedback={() => setScreen('step3')}
            onCheckAgain={handleCheckAgain}
            onFinishWriting={handleFinishWriting}
          />
        )}

        {screen === 'checkAgain' && (
          <StepCheckAgain
            feedback={feedback}
            checkResult={checkAgainResult}
            koreanHelpEnabled={koreanHelpEnabled}
            onToggleKoreanHelp={() => setKoreanHelpEnabled((prev) => !prev)}
            onOpenWhy={() => setWhyOpened(true)}
          />
        )}

        {screen === 'step5' && (
          <Step5Finish
            topic={activeTopic}
            firstDraft={firstDraft}
            finalDraft={revisedDraft}
            supportLevelUsed={activeStoryLevel}
            feedbackPoints={feedback?.feedbackPoints ?? []}
            whyOpened={whyOpened}
            koreanHelpUsed={koreanHelpEnabled}
            checkAgainUsed={checkAgainUsed}
            reflectionNote={reflectionNote}
            onChangeReflectionNote={setReflectionNote}
            isSaving={isSavingRecord}
            hasSaved={hasSavedCurrent}
            saveError={saveError}
            onSaveRecord={handleSaveRecord}
            onStartNextStory={handleStartNextStory}
          />
        )}

        {screen === 'records' && (
          <RecordsView
            records={myRecords}
            studentName={studentName}
            isLoading={isLoadingRecords}
            onStartNew={handleStartWriting}
          />
        )}

        {screen === 'teacher' && teacherToken && (
          <TeacherView
            records={teacherRecords}
            topics={TOPIC_SCENES}
            teacherEmail={teacherEmail}
            isLoading={isLoadingTeacher}
          />
        )}
      </main>

      {/* Bottom Navigation Bar */}
      {screen === 'step1' && (
        <BottomNav
          backLabel="Scenarios"
          nextLabel="Next: Draft"
          onBack={() => setScreen('start')}
          onNext={() => {
            setScreen('step2');
            setMaxReachedStep((prev) => Math.max(prev, 2));
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          nextDisabled={step1HasPII}
        />
      )}

      {screen === 'step2' && (
        <BottomNav
          backLabel="Back: Plan"
          nextLabel="Next: AI Feedback"
          onBack={() => setScreen('step1')}
          onNext={() => {
            if (feedback && revisedDraft) {
              setScreen('step3');
            } else {
              requestCoachFeedback();
            }
          }}
          nextDisabled={!firstDraft.trim() || step2HasPII}
        />
      )}

      {screen === 'step3' && (
        <BottomNav
          backLabel="Back: Draft"
          nextLabel="Next: Rewrite"
          onBack={() => setScreen('step2')}
          onNext={() => {
            if (!revisedDraft.trim()) {
              setRevisedDraft(firstDraft);
            }
            setScreen('step4');
            setMaxReachedStep((prev) => Math.max(prev, 4));
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          nextDisabled={isLoadingHint || !feedback}
        />
      )}

      {screen === 'checkAgain' && (
        <BottomNav
          backLabel="Back: Edit Story"
          nextLabel="Finish Writing"
          onBack={() => setScreen('step4')}
          onNext={handleFinishWriting}
        />
      )}

      {screen === 'step5' && (
        <BottomNav
          backLabel="Back: Rewrite"
          nextLabel="My Records"
          onBack={() => setScreen('step4')}
          onNext={() => {
            fetchMyRecords();
            setScreen('records');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      <TeacherAuthModal
        isOpen={teacherModalOpen}
        onClose={() => setTeacherModalOpen(false)}
        onVerified={handleTeacherVerified}
      />
    </div>
  );
}
