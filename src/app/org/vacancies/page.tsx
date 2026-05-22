'use client';

import { Briefcase } from 'lucide-react';

export default function VacanciesPage() {
  return (
    <div className="flex-1 flex items-center justify-center h-full min-h-[400px]">
      <div className="text-center">
        <Briefcase size={48} className="text-ink/10 mx-auto mb-4" />
        <p className="text-ink/30 text-sm">Select a vacancy from the left panel to view details.</p>
      </div>
    </div>
  );
}
