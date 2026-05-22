'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import { FileText, Sparkles, Loader2, Users, CheckCircle, Clock } from 'lucide-react';

export default function OrgAcademiaPage() {
  const params = useParams();
  const jobId = params?.id;

  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  async function handleGenerate() {
    setGenerating(true);
    // Simulate AI generation
    await new Promise(r => setTimeout(r, 2000));
    setGenerating(false);
    setGenerated(true);
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-serif text-3xl font-bold text-ink tracking-tight">Academia Round</h1>
        <p className="text-ink/50 mt-1 text-sm">Configure technical assessment for this position.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bento-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600"><FileText size={18} /></div>
            <h3 className="font-serif text-lg font-semibold text-ink">Assessment Details</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink/60 mb-1.5 ml-1">Test Duration (Minutes)</label>
              <input type="number" defaultValue={45} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink/60 mb-1.5 ml-1">Number of Questions</label>
              <input type="number" defaultValue={20} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink/60 mb-1.5 ml-1">Pass Percentage</label>
              <div className="relative">
                <input type="number" defaultValue={70} className="input-field" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-ink/40 font-bold">%</span>
              </div>
            </div>
            <button className="px-5 py-2.5 bg-ink text-cream rounded-xl text-sm font-semibold hover:bg-ink/90 transition-colors w-full mt-2">
              Save Configuration
            </button>
          </div>
        </div>

        <div className="bento-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600"><Sparkles size={18} /></div>
            <h3 className="font-serif text-lg font-semibold text-ink">AI Question Generator</h3>
          </div>
          
          <p className="text-sm text-ink/60 leading-relaxed mb-6">
            Use AI to automatically generate technical multiple-choice questions based on the skills required for this job description.
          </p>

          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 mb-6">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">Detected Skills</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">React</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">TypeScript</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">Next.js</span>
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={generating || generated}
            className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold transition-all shadow-md ${
              generated 
                ? 'bg-emerald-500 text-white cursor-default' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {generating ? (
              <><Loader2 size={18} className="animate-spin" /> Generating 20 Questions...</>
            ) : generated ? (
              <><CheckCircle size={18} /> Questions Generated</>
            ) : (
              <><Sparkles size={18} /> Generate Questions</>
            )}
          </button>
        </div>
      </div>

      {generated && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bento-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-serif text-lg font-semibold text-ink">Enroll Candidates</h3>
            <span className="text-sm text-ink/50 bg-ink/5 px-3 py-1 rounded-lg">12 Candidates Screened</span>
          </div>
          <p className="text-sm text-ink/60 mb-6">
            Questions have been generated and the test is ready. Send an invitation link to all candidates who have passed the initial screening phase.
          </p>
          <button className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-sage text-white rounded-xl font-bold hover:bg-sage/90 shadow-md transition-colors">
            <Users size={18} /> Enroll 12 Candidates
          </button>
        </motion.div>
      )}
    </div>
  );
}
