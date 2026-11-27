import { Home } from 'lucide-react';
import type { AppScreen, SupportLevel } from '../types/story';

interface TopBarProps {
  screen: AppScreen;
  supportLevel: SupportLevel;
  onGoHome: () => void;
  onGoRecords: () => void;
  onStartQuick?: () => void;
  onJumpStep?: (step: 1 | 2 | 3 | 4 | 5) => void;
  maxReachedStep: number;
}

const STEP_LABELS: { step: 1 | 2 | 3 | 4 | 5; short: string; full: string }[] = [
  { step: 1, short: 'Plan', full: 'Observe & Plan' },
  { step: 2, short: 'Draft', full: 'Draft' },
  { step: 3, short: 'Hint', full: 'Coach Hint' },
  { step: 4, short: 'Rewrite', full: 'Rewrite' },
  { step: 5, short: 'Finish', full: 'Finish' },
];

function getStepNumber(screen: AppScreen): number {
  if (screen === 'step1') return 1;
  if (screen === 'step2') return 2;
  if (screen === 'step3') return 3;
  if (screen === 'step4') return 4;
  if (screen === 'step5') return 5;
  return 0;
}

export function TopBar({
  screen,
  supportLevel,
  onGoHome,
  onGoRecords,
  onStartQuick,
  onJumpStep,
  maxReachedStep,
}: TopBarProps) {
  const currentStep = getStepNumber(screen);

  // Standard 3-zone header for Start, My Records, and Teacher View
  if (currentStep === 0) {
    return (
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-8">
          <button
            type="button"
            onClick={onGoHome}
            className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 min-h-[44px] flex items-center"
          >
            Scene to Story!
          </button>

          <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              type="button"
              onClick={onGoHome}
              className={`min-h-[44px] whitespace-nowrap shrink-0 transition-colors hover:text-slate-900 ${
                screen === 'start' ? 'text-slate-900 underline underline-offset-8 decoration-2 decoration-blue-600' : ''
              }`}
            >
              Topics
            </button>
            <button
              type="button"
              onClick={onGoRecords}
              className={`min-h-[44px] whitespace-nowrap shrink-0 transition-colors hover:text-slate-900 ${
                screen === 'records' ? 'text-slate-900 underline underline-offset-8 decoration-2 decoration-blue-600' : ''
              }`}
            >
              My Records
            </button>
          </nav>

          <div className="shrink-0">
            {screen === 'teacher' ? (
              <button
                type="button"
                onClick={onGoHome}
                className="min-h-[44px] px-4 py-2 text-xs font-semibold text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
              >
                Exit Teacher View
              </button>
            ) : (
              <button
                type="button"
                onClick={onStartQuick}
                className="min-h-[44px] px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0"
              >
                Start Writing
              </button>
            )}
          </div>
        </div>
      </header>
    );
  }

  // Step workflow header: Home (left) · 5-step progress bar (center) · Level indicator (right)
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onGoHome}
          aria-label="Return to Start screen"
          className="min-h-[44px] min-w-[44px] px-2.5 flex items-center justify-center gap-1.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0"
        >
          <Home className="w-4 h-4" aria-hidden="true" />
          <span className="hidden sm:inline">Home</span>
        </button>

        <nav aria-label="Writing steps" className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
          {STEP_LABELS.map((item, idx) => {
            const isActive = item.step === currentStep;
            const isDone = item.step < currentStep;
            const canClick = onJumpStep && item.step <= maxReachedStep;

            return (
              <div key={item.step} className="flex items-center gap-1 sm:gap-2 shrink-0">
                <button
                  type="button"
                  disabled={!canClick}
                  onClick={() => canClick && onJumpStep(item.step)}
                  aria-current={isActive ? 'step' : undefined}
                  className={`min-h-[40px] px-2 sm:px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : isDone
                      ? 'text-blue-700 hover:bg-blue-50'
                      : 'text-slate-400 cursor-default'
                  }`}
                >
                  <span className="font-mono tabular-nums">{item.step}</span>
                  <span className={isActive ? 'inline' : 'hidden md:inline'}>
                    {isActive ? item.full : item.short}
                  </span>
                </button>
                {idx < STEP_LABELS.length - 1 && (
                  <span className="text-slate-300 text-xs select-none" aria-hidden="true">
                    /
                  </span>
                )}
              </div>
            );
          })}
        </nav>

        <div className="shrink-0 text-right">
          <span className="text-xs sm:text-sm font-semibold text-slate-700 font-mono tabular-nums whitespace-nowrap">
            Level {supportLevel}
          </span>
        </div>
      </div>
    </header>
  );
}
