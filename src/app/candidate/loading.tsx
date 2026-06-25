'use client';
import { Loader2 } from 'lucide-react';
export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
      <p className="text-ink/50 font-medium">Loading candidate portal...</p>
    </div>
  );
}
