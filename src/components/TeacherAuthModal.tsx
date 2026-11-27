import { useState } from 'react';
import { X } from 'lucide-react';

interface TeacherAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (token: string, email: string) => void;
}

export function TeacherAuthModal({ isOpen, onClose, onVerified }: TeacherAuthModalProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsChecking(true);
    try {
      const res = await fetch('/api/teacher/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok || !data.authorized) {
        setError(data.message || 'Only the designated teacher email can open Teacher View.');
        return;
      }
      onVerified(data.token, data.email);
      setEmail('');
      onClose();
    } catch {
      setError('Could not verify teacher email. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="teacher-auth-title"
    >
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 id="teacher-auth-title" className="font-display text-xl font-bold text-slate-900">
            Teacher View Access
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <p className="text-sm text-slate-600">
          Enter the designated instructor email to view student records in read-only mode.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="teacher-email-input" className="block text-xs font-semibold text-slate-700">
              Instructor Email
            </label>
            <input
              id="teacher-email-input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="instructor@school.edu"
              className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
            />
          </div>

          {error && (
            <p role="alert" className="text-xs font-medium text-rose-700">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isChecking}
              className="min-h-[44px] px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-60"
            >
              {isChecking ? 'Checking...' : 'Open Read-Only View'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
