'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, CheckCircle, AlertTriangle, Loader2, Video, Smartphone, ShieldAlert, MonitorUp } from 'lucide-react';
import { useParams } from 'next/navigation';

// Dummy questions for the prototype since we don't have Moodle's quiz engine active yet
const DUMMY_QUESTIONS = [
  {
    id: 1,
    text: 'Which of the following hooks is used to perform side effects in a functional component?',
    options: ['useState', 'useEffect', 'useContext', 'useReducer'],
    correct: 1
  },
  {
    id: 2,
    text: 'What does CSS stand for?',
    options: ['Computer Style Sheets', 'Creative Style Sheets', 'Cascading Style Sheets', 'Colorful Style Sheets'],
    correct: 2
  },
  {
    id: 3,
    text: 'In Next.js, which file is used to define a layout for a specific route segment?',
    options: ['layout.tsx', 'page.tsx', 'route.ts', 'template.tsx'],
    correct: 0
  }
];

export default function CandidateTestPage() {
  const params = useParams();
  const testId = params?.id;
  
  const [started, setStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  // In a real app, we'd fetch the test details and questions from `local_aurahr_academia`

  function handleStart() {
    // In reality, we'd call an API to mark the test as started and get a token
    setStarted(true);
  }

  async function handleSubmit() {
    setSubmitting(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 1500));
    setSubmitting(false);
    setCompleted(true);
  }

  if (completed) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bento-card p-12 max-w-lg text-center">
          <CheckCircle size={64} className="text-emerald-500 mx-auto mb-6" />
          <h1 className="font-serif text-2xl font-bold text-ink mb-2">Assessment Submitted</h1>
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl inline-block">
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Academia Score</p>
            <p className="font-mono text-3xl font-bold text-emerald-600">85%</p>
          </div>
          <p className="text-ink/60 text-sm mb-8">
            Thank you for completing the academia round. Your responses have been recorded and will be evaluated shortly. 
            You can check the status on your applications dashboard.
          </p>
          <button onClick={() => window.location.href = '/candidate/applications'} className="px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors">
            Return to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="max-w-3xl mx-auto pt-10">
        <div className="bento-card p-8">
          <h1 className="font-serif text-2xl font-bold text-ink mb-2">Technical Assessment</h1>
          <p className="text-ink/60 mb-8">Frontend Engineer Position</p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Duration</p>
              <p className="font-mono text-lg font-bold text-blue-900">45 Minutes</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100">
              <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">Questions</p>
              <p className="font-mono text-lg font-bold text-purple-900">20 Multiple Choice</p>
            </div>
          </div>

          <div className="bg-rust/5 border border-rust/10 p-5 rounded-2xl flex items-start gap-3 mb-8">
            <AlertTriangle size={20} className="text-rust shrink-0 mt-0.5" />
            <div className="text-sm text-rust/90">
              <p className="font-bold mb-1">Important Instructions</p>
              <ul className="list-disc list-inside space-y-1">
                <li>This test is proctored. Do not switch tabs or leave the window.</li>
                <li>Ensure your webcam and microphone are working.</li>
                <li>Once started, the timer cannot be paused.</li>
              </ul>
            </div>
          </div>

          <button onClick={handleStart} className="w-full flex items-center justify-center gap-2 py-4 bg-ink text-cream rounded-2xl font-bold hover:bg-ink/90 transition-colors text-lg shadow-lg">
            <Play size={20} /> Start Assessment
          </button>
        </div>
      </div>
    );
  }

  const q = DUMMY_QUESTIONS[currentQ];
  const isLast = currentQ === DUMMY_QUESTIONS.length - 1;

  return (
    <div className="fixed inset-0 bg-cream z-50 overflow-y-auto p-8 pt-12">
      {/* Proctoring Floating Widget */}
      <div className="fixed bottom-6 right-6 w-64 bg-[#1a1a1a] rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-50">
        <div className="h-32 bg-[#222] relative flex items-center justify-center">
          <Video size={32} className="text-white/20" />
          <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] text-white font-medium flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-rust animate-pulse" /> Recording
          </div>
        </div>
        <div className="p-3 bg-rust/10 border-b border-white/5">
          <p className="text-rust font-bold text-[10px] uppercase tracking-wider flex items-center gap-1"><ShieldAlert size={12} /> Proctor Alerts</p>
          <p className="text-rust/80 text-xs mt-1">Keep your eyes on the screen.</p>
        </div>
        <div className="p-3 bg-black">
          <div className="flex items-center gap-2">
            <Smartphone size={14} className="text-emerald-400" />
            <span className="text-white/60 text-xs">No extra devices detected</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto flex gap-8">
      {/* Sidebar - Question Nav */}
      <div className="w-64 shrink-0">
        <div className="bento-card p-5 sticky top-6">
          <div className="text-center mb-6 pb-6 border-b border-ink/10">
            <p className="text-xs font-bold text-ink/40 uppercase tracking-wider mb-1">Time Remaining</p>
            <p className="font-mono text-3xl font-bold text-ink">44:59</p>
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            {DUMMY_QUESTIONS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentQ(idx)}
                className={`w-10 h-10 rounded-xl font-mono text-sm font-bold flex items-center justify-center transition-colors ${
                  currentQ === idx 
                    ? 'bg-blue-500 text-white ring-2 ring-blue-500 ring-offset-2' 
                    : answers[idx] !== undefined 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-ink/5 text-ink/40 hover:bg-ink/10'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="bento-card p-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="px-3 py-1 bg-ink/5 text-ink/50 rounded-lg text-xs font-bold font-mono">Q{currentQ + 1}</span>
            <span className="text-sm text-ink/40 font-medium">Multiple Choice</span>
          </div>

          <h2 className="text-xl font-medium text-ink mb-8 leading-relaxed">
            {q.text}
          </h2>

          <div className="space-y-3">
            {q.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => setAnswers(prev => ({ ...prev, [currentQ]: idx }))}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                  answers[currentQ] === idx 
                    ? 'border-blue-500 bg-blue-50/50 shadow-sm' 
                    : 'border-ink/5 hover:border-ink/15 hover:bg-ink/5'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    answers[currentQ] === idx ? 'border-blue-500' : 'border-ink/20'
                  }`}>
                    {answers[currentQ] === idx && <div className="w-3 h-3 rounded-full bg-blue-500" />}
                  </div>
                  <span className={`text-base ${answers[currentQ] === idx ? 'text-blue-900 font-medium' : 'text-ink/80'}`}>
                    {opt}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-10 pt-6 border-t border-ink/10 flex items-center justify-between">
            <button 
              onClick={() => setCurrentQ(prev => Math.max(0, prev - 1))}
              disabled={currentQ === 0}
              className="px-5 py-2.5 rounded-xl font-semibold text-ink/60 hover:bg-ink/5 hover:text-ink disabled:opacity-30 transition-colors"
            >
              Previous
            </button>

            {isLast ? (
              <button 
                onClick={handleSubmit}
                disabled={submitting || Object.keys(answers).length < DUMMY_QUESTIONS.length}
                className="px-8 py-2.5 bg-emerald-500 text-white rounded-xl font-bold shadow-md hover:bg-emerald-600 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                Submit Assessment
              </button>
            ) : (
              <button 
                onClick={() => setCurrentQ(prev => Math.min(DUMMY_QUESTIONS.length - 1, prev + 1))}
                className="px-8 py-2.5 bg-ink text-cream rounded-xl font-semibold shadow-md hover:bg-ink/90 transition-colors"
              >
                Next
              </button>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
