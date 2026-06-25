'use client';
import { AlertCircle } from 'lucide-react';
import { useEffect } from 'react';
export default function Error({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-rust/5 rounded-3xl m-8">
      <AlertCircle className="w-12 h-12 text-rust mb-4" />
      <h2 className="text-2xl font-serif font-bold text-ink mb-2">Something went wrong</h2>
      <p className="text-ink/60 mb-6 max-w-md text-center">{error.message}</p>
      <button onClick={() => reset()} className="px-6 py-2.5 bg-rust text-white font-bold rounded-xl hover:bg-rust/80 transition-colors">Try again</button>
    </div>
  );
}
