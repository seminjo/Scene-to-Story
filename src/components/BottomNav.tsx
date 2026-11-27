import { ArrowLeft, ArrowRight } from 'lucide-react';

interface BottomNavProps {
  backLabel: string;
  nextLabel: string;
  onBack: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
  isBusy?: boolean;
}

export function BottomNav({
  backLabel,
  nextLabel,
  onBack,
  onNext,
  nextDisabled = false,
  isBusy = false,
}: BottomNavProps) {
  return (
    <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-md border-t border-slate-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[48px] px-5 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{backLabel}</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled || isBusy}
          className="min-h-[48px] px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
        >
          <span>{isBusy ? 'Working...' : nextLabel}</span>
          <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
