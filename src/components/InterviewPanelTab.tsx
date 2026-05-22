'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, MessageSquarePlus, Calendar, Plus, X, 
  Play, CheckCircle, XCircle, AlertTriangle, Eye, Loader2,
  Star, Mail, Phone, MapPin, Briefcase, GraduationCap, Code, Video, FileText
} from 'lucide-react';
import { moodleCall } from '@/lib/moodle';
import RadarChart from '@/components/RadarChart';

const STAGES = ['applied', 'screened', 'academia', 'interview', 'offer', 'selected', 'rejected'];
const stageColors: Record<string, string> = {
  applied: 'bg-blue-500/15 text-blue-700 border-blue-200',
  screened: 'bg-amber-500/15 text-amber-700 border-amber-200',
  academia: 'bg-purple-500/15 text-purple-700 border-purple-200',
  interview: 'bg-gold/15 text-gold border-gold/30',
  offer: 'bg-sage/15 text-sage border-sage/30',
  selected: 'bg-emerald-500/15 text-emerald-700 border-emerald-200',
  rejected: 'bg-rust/15 text-rust border-rust/30',
};

interface InterviewPanelTabProps {
  jobId: number;
}

interface Question {
  id: string;
  text: string;
}

export default function InterviewPanelTab({ jobId }: InterviewPanelTabProps) {
  // 1. Draft Questions State
  const [questions, setQuestions] = useState<Question[]>([
    { id: '1', text: 'Walk me through a time you had to optimize a slow-loading web application.' },
    { id: '2', text: 'How do you handle disagreements within a cross-functional team?' }
  ]);
  const [newQuestion, setNewQuestion] = useState('');

  const addQuestion = () => {
    if (newQuestion.trim()) {
      setQuestions([...questions, { id: Date.now().toString(), text: newQuestion.trim() }]);
      setNewQuestion('');
    }
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  // Live Scheduled Interviews & Candidates
  const [scheduledInterviews, setScheduledInterviews] = useState<any[]>([]);
  const [evalCandidates, setEvalCandidates] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  async function openDetail(appId: number) {
    setDetailLoading(true);
    try {
      const detail = await moodleCall<any>('local_aurahr_interview_get_details', { applicationid: appId });
      setSelectedApp(detail);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  }

  useEffect(() => {
    async function fetchCandidates() {
      setLoadingData(true);
      try {
        const res = await moodleCall<{applications: any[]}>('local_aurahr_jobs_list_applications', { jobid: jobId, stage: 'interview' });
        const apps = res.applications || [];

        // Mock scheduling times for the real candidates (since we don't have a calendar DB yet)
        const scheduled = apps.map((app, i) => ({
          id: app.id,
          name: `${app.firstname} ${app.lastname}`,
          date: i === 0 ? 'Today, 2:00 PM' : 'Tomorrow, 10:00 AM',
          role: 'Candidate',
          live: i === 0,
        }));
        setScheduledInterviews(scheduled);

        const evals = apps.map(app => ({
          id: app.id,
          name: `${app.firstname} ${app.lastname}`,
          interviewScore: app.interview_score,
          overallScore: app.overall_score,
          malpractice: app.malpractice === 1,
          status: 'pending' // Default UI state before final decision
        }));
        setEvalCandidates(evals);
      } catch (err) {
        console.error('Failed to load interview candidates:', err);
      } finally {
        setLoadingData(false);
      }
    }
    fetchCandidates();
  }, [jobId]);

  const updateCandidateStatus = async (id: number, status: string) => {
    // Update UI optimistically
    setEvalCandidates(evalCandidates.map(c => c.id === id ? { ...c, status } : c));
    
    // In a full implementation, you would also push the stage update to the backend:
    // await moodleCall('local_aurahr_jobs_update_stage', { applicationid: id, stage: status });
  };

  return (
    <div className="space-y-8 max-w-5xl">
      
      {/* Draft Questions Section */}
      <div className="bento-card p-6">
        <h3 className="font-serif text-lg font-semibold text-ink flex items-center gap-2 mb-4">
          <MessageSquarePlus size={18} className="text-sage" />
          Draft Interview Questions
        </h3>
        
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addQuestion()}
            placeholder="Type a new question to ask candidates..."
            className="flex-1 bg-warm-sand/30 border border-ink/10 rounded-xl px-4 py-2.5 text-sm text-ink focus:outline-none focus:border-sage/50"
          />
          <button 
            onClick={addQuestion}
            disabled={!newQuestion.trim()}
            className="btn-primary px-4 py-2.5 flex items-center gap-2 disabled:opacity-50"
          >
            <Plus size={16} /> Add
          </button>
        </div>

        <div className="space-y-2">
          <AnimatePresence>
            {questions.map((q, i) => (
              <motion.div 
                key={q.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-start gap-3 bg-white border border-ink/5 p-3 rounded-xl group"
              >
                <span className="text-ink/30 font-mono font-bold text-sm mt-0.5">{i + 1}.</span>
                <p className="flex-1 text-sm text-ink/80">{q.text}</p>
                <button 
                  onClick={() => removeQuestion(q.id)}
                  className="text-ink/20 hover:text-rust transition-colors p-1"
                >
                  <X size={14} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          {questions.length === 0 && (
            <p className="text-sm text-ink/40 text-center py-4">No questions drafted yet.</p>
          )}
        </div>
      </div>

      {/* Scheduled Interviews Section */}
      <div className="bento-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-lg font-semibold text-ink flex items-center gap-2">
            <Calendar size={18} className="text-sage" />
            Scheduled Interviews
          </h3>
          <span className="text-xs font-bold bg-sage/10 text-sage px-3 py-1 rounded-full">
            {scheduledInterviews.length} Upcoming
          </span>
        </div>

        {loadingData ? (
          <div className="flex justify-center py-8">
            <Loader2 size={24} className="animate-spin text-sage" />
          </div>
        ) : scheduledInterviews.length === 0 ? (
          <p className="text-sm text-ink/40 py-4">No candidates in the interview stage yet.</p>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
            {scheduledInterviews.map((interview) => (
              <div 
                key={interview.id} 
                onClick={() => openDetail(interview.id)}
                className="min-w-[280px] bg-white border border-ink/10 p-5 rounded-2xl snap-start flex flex-col hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-ink">{interview.name}</h4>
                    <p className="text-xs text-ink/40">{interview.role}</p>
                  </div>
                  {interview.live && (
                    <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live Now
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-ink/60 mb-6 bg-warm-sand/30 p-2 rounded-lg">
                  <Calendar size={14} className="text-sage" />
                  {interview.date}
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `/org/interview/${interview.id}`;
                  }}
                  className={`mt-auto w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                  interview.live 
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm' 
                    : 'bg-ink/5 text-ink/40 cursor-not-allowed'
                }`}>
                  <Play size={16} />
                  Start Now
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Candidate Evaluation Table */}
      <div className="bento-card overflow-hidden">
        <div className="p-6 border-b border-ink/10 flex justify-between items-end">
          <div>
            <h3 className="font-serif text-lg font-semibold text-ink flex items-center gap-2 mb-1">
              <Users size={18} className="text-sage" />
              Candidate Evaluation
            </h3>
            <p className="text-xs text-ink/40">Review scores and make final decisions on interviewed candidates.</p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-warm-sand/30 text-ink/40 text-xs uppercase tracking-wider font-semibold border-b border-ink/10">
              <tr>
                <th className="px-6 py-4">S.No</th>
                <th className="px-6 py-4">Candidate Name</th>
                <th className="px-6 py-4">Interview Score</th>
                <th className="px-6 py-4">Overall Score</th>
                <th className="px-6 py-4">Malpractice</th>
                <th className="px-6 py-4 text-center">Actions</th>
                <th className="px-6 py-4">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {loadingData ? (
                <tr>
                  <td colSpan={7} className="text-center py-8">
                    <Loader2 size={20} className="animate-spin text-sage mx-auto" />
                  </td>
                </tr>
              ) : evalCandidates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-sm text-ink/40">
                    No candidates found in the interview stage.
                  </td>
                </tr>
              ) : (
                evalCandidates.map((c, i) => (
                  <tr 
                    key={c.id} 
                    onClick={() => openDetail(c.id)}
                    className="hover:bg-ink/[0.02] transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4 font-mono text-ink/40">{i + 1}</td>
                    <td className="px-6 py-4 font-medium text-ink">{c.name}</td>
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-sage">{c.interviewScore}</span><span className="text-ink/30">/100</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-ink">{c.overallScore}</span><span className="text-ink/30">/100</span>
                    </td>
                    <td className="px-6 py-4">
                      {c.malpractice ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rust bg-rust/10 px-2 py-1 rounded">
                          <AlertTriangle size={12} /> Flagged
                        </span>
                      ) : (
                        <span className="text-ink/30">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          openDetail(c.id);
                        }}
                        className="text-sage hover:text-sage-dark p-2 hover:bg-sage/10 rounded-lg transition-colors inline-flex items-center gap-2 text-xs font-semibold"
                      >
                        <Eye size={14} /> Details
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => updateCandidateStatus(c.id, 'selected')}
                          disabled={c.status === 'selected'}
                          className={`p-1.5 rounded-lg transition-colors border ${
                            c.status === 'selected' 
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                              : 'bg-white text-ink/40 border-ink/10 hover:border-emerald-500 hover:text-emerald-600'
                          }`}
                          title="Select"
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button 
                          onClick={() => updateCandidateStatus(c.id, 'rejected')}
                          disabled={c.status === 'rejected'}
                          className={`p-1.5 rounded-lg transition-colors border ${
                            c.status === 'rejected' 
                              ? 'bg-rust/10 text-rust border-rust/20' 
                              : 'bg-white text-ink/40 border-ink/10 hover:border-rust hover:text-rust'
                          }`}
                          title="Reject"
                        >
                          <XCircle size={16} />
                        </button>
                        
                        {/* Status indicator */}
                        {c.status === 'pending' && <span className="text-[10px] uppercase font-bold text-ink/30 ml-2">Pending</span>}
                        {c.status === 'selected' && <span className="text-[10px] uppercase font-bold text-emerald-600 ml-2">Selected</span>}
                        {c.status === 'rejected' && <span className="text-[10px] uppercase font-bold text-rust ml-2">Rejected</span>}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-6 bg-warm-sand/20 border-t border-ink/10 flex justify-end">
          <button className="btn-primary py-2.5 px-8 shadow-sm hover:shadow-md transition-shadow">
            Finalise Round
          </button>
        </div>
      </div>

      <AnimatePresence>
        {(selectedApp || detailLoading) && (
          <InterviewDetailPopup
            interview={selectedApp}
            loading={detailLoading}
            onClose={() => setSelectedApp(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Interview Detail Popup ────────────────────────────────────────

function InterviewDetailPopup({
  interview,
  loading,
  onClose,
}: {
  interview: any | null;
  loading: boolean;
  onClose: () => void;
}) {
  let aiEval = null;
  if (interview?.ai_evaluation) {
    try {
      aiEval = JSON.parse(interview.ai_evaluation);
    } catch (e) {}
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-center justify-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="bg-cream h-full w-full max-w-2xl border-l border-ink/10 shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 size={32} className="animate-spin text-sage" />
          </div>
        ) : interview ? (
          <div className="p-8 space-y-8">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sage to-gold flex items-center justify-center text-white text-lg font-bold shadow-lg">
                  {interview.candidate_name[0]}
                </div>
                <div>
                  <h2 className="font-serif text-2xl font-bold text-ink">
                    {interview.candidate_name}
                  </h2>
                  <p className="text-sm text-ink/40">{interview.job_title} · {interview.candidate_email}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-ink/5 text-ink/40">
                <X size={20} />
              </button>
            </div>

            {/* Status & Malpractice */}
            <div className="flex flex-wrap gap-4 items-center">
              <div>
                <p className="text-xs text-ink/40 uppercase tracking-wider font-semibold mb-2">Interview Status</p>
                <span className={`text-sm font-bold px-4 py-2 rounded-xl capitalize inline-block ${interview.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-ink/5 text-ink/50'}`}>
                  {interview.status}
                </span>
              </div>
              {interview.malpractice === 1 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-rust/10 border border-rust/20 rounded-xl mt-6">
                  <AlertTriangle size={16} className="text-rust" />
                  <span className="text-sm font-semibold text-rust">Malpractice Detected</span>
                </div>
              )}
            </div>

            {/* Scores */}
            <div>
              <p className="text-xs text-ink/40 uppercase tracking-wider font-semibold mb-3">Evaluation Scores</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-sage/10 border border-sage/20">
                  <p className="text-[10px] text-sage/70 uppercase tracking-wider font-bold">AI Suggested Score</p>
                  <p className="text-3xl font-bold font-mono mt-1 text-sage">{interview.ai_score > 0 ? interview.ai_score : '—'}<span className="text-lg text-sage/50">/100</span></p>
                </div>
                <div className="p-4 rounded-xl bg-gold/10 border border-gold/20">
                  <p className="text-[10px] text-gold/70 uppercase tracking-wider font-bold">Interviewer Score</p>
                  <p className="text-3xl font-bold font-mono mt-1 text-gold">{interview.interviewer_score > 0 ? interview.interviewer_score : '—'}<span className="text-lg text-gold/50">/100</span></p>
                </div>
              </div>
            </div>

            {/* Feedback Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* AI Feedback */}
              <div className="space-y-4">
                <p className="text-xs text-ink/40 uppercase tracking-wider font-semibold">AI Evaluation</p>
                {aiEval ? (
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-xl border border-ink/5 text-sm text-ink/80">
                      {aiEval.summary}
                    </div>
                    {aiEval.strengths?.length > 0 && (
                      <div>
                        <p className="text-[10px] text-emerald-600 uppercase tracking-wider font-bold mb-2">Strengths</p>
                        <ul className="list-disc pl-4 text-xs text-ink/70 space-y-1">
                          {aiEval.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}
                        </ul>
                      </div>
                    )}
                    {aiEval.weaknesses?.length > 0 && (
                      <div>
                        <p className="text-[10px] text-rust uppercase tracking-wider font-bold mb-2">Areas for Improvement</p>
                        <ul className="list-disc pl-4 text-xs text-ink/70 space-y-1">
                          {aiEval.weaknesses.map((w: string, i: number) => <li key={i}>{w}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-ink/40 bg-ink/5 p-4 rounded-xl">No AI evaluation available.</p>
                )}
              </div>

              {/* Interviewer Notes */}
              <div className="space-y-4">
                <p className="text-xs text-ink/40 uppercase tracking-wider font-semibold">Interviewer Notes</p>
                {interview.interviewer_notes ? (
                  <div className="bg-white p-4 rounded-xl border border-ink/5 text-sm text-ink/80 whitespace-pre-wrap">
                    {interview.interviewer_notes}
                  </div>
                ) : (
                  <p className="text-sm text-ink/40 bg-ink/5 p-4 rounded-xl">No notes left by the interviewer.</p>
                )}
              </div>
            </div>

            {/* Transcript */}
            <div>
              <p className="text-xs text-ink/40 uppercase tracking-wider font-semibold mb-3">Conversation Transcript</p>
              <div className="bg-white border border-ink/10 rounded-xl p-4 h-64 overflow-y-auto">
                {interview.transcript ? (
                  <div className="text-sm text-ink/80 whitespace-pre-wrap font-mono leading-relaxed">
                    {interview.transcript}
                  </div>
                ) : (
                  <p className="text-sm text-ink/40 italic h-full flex items-center justify-center">Transcript not available for this interview.</p>
                )}
              </div>
            </div>

          </div>
        ) : null}
      </motion.div>
    </motion.div>
  );
}

function ScoreCard({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className={`p-3 rounded-xl ${highlight ? 'bg-sage/10 border border-sage/20' : 'bg-warm-sand/50'}`}>
      <p className="text-[10px] text-ink/40 uppercase tracking-wider font-semibold">{label}</p>
      <p className={`text-lg font-bold font-mono mt-1 ${value > 0 ? (value >= 70 ? 'text-emerald-600' : 'text-amber-600') : 'text-ink/20'}`}>
        {value > 0 ? `${value.toFixed(1)}%` : '—'}
      </p>
      {value > 0 && (
        <div className="w-full h-1.5 bg-ink/5 rounded-full mt-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full rounded-full ${value >= 70 ? 'bg-emerald-500' : 'bg-amber-500'}`}
          />
        </div>
      )}
    </div>
  );
}
