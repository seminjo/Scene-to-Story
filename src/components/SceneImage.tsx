import { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface SceneImageProps {
  src: string;
  alt: string;
  title: string;
  className?: string;
}

export function SceneImage({ src, alt, title, className = '' }: SceneImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-slate-100 border border-slate-200 rounded-xl p-6 text-center aspect-[4/3] ${className}`}
        role="img"
        aria-label={alt}
      >
        <ImageIcon className="w-8 h-8 text-slate-400 mb-2" aria-hidden="true" />
        <p className="text-sm font-semibold text-slate-700">{title}</p>
        <p className="text-xs text-slate-500 mt-1">Story scene illustration</p>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`w-full aspect-[4/3] object-cover rounded-xl bg-slate-100 ${className}`}
    />
  );
}
