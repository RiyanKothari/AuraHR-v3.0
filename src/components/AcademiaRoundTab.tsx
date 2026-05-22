'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Settings, Play, Square, Loader2, Sparkles, Calendar, CheckCircle, X } from 'lucide-react';
import { moodleCall } from '@/lib/moodle';

interface AcademiaRoundTabProps {
  jobId: number;
  aiPassCount?: number | null;
}

interface Question {
  text: string;
  options: string[];
  correct: number;
  explanation: string;
  difficulty: string;
}

interface Assessment {
  exists: boolean;
  id: number;
  title: string;
  num_questions: number;
  pass_percentage?: number;
  questions?: Question[];
  status: string;
  start_time?: number;
  end_time?: number;
}

export default function AcademiaRoundTab({ jobId }: AcademiaRoundTabProps) {
  const [passCount, setPassCount] = useState<number | ''>(10);
  const [questionCount, setQuestionCount] = useState<number | ''>(20);
  const [description, setDescription] = useState('Loading job details...');
  const [generating, setGenerating] = useState(false);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [testLive, setTestLive] = useState(false);
  const [aiPassCount, setAiPassCount] = useState<number | null>(null);

  // Scheduling State
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [scheduling, setScheduling] = useState(false);
  const [isRegeneratingMode, setIsRegeneratingMode] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const jobData = await moodleCall<any>('local_aurahr_jobs_get_job', { jobid: jobId });
        if (jobData.jd_analysis) {
          const mustHave = JSON.parse(jobData.jd_analysis.must_have || '[]');
          const goodToHave = JSON.parse(jobData.jd_analysis.good_to_have || '[]');
          setAiPassCount(jobData.jd_analysis.pass_count);
          setPassCount(jobData.jd_analysis.pass_count);
          setDescription(`Automatically generated based on JD Analysis: Focus on ${[...mustHave, ...goodToHave].join(', ')}.`);
        } else {
          setDescription(`Job: ${jobData.title}. Description: ${jobData.description.replace(/(<([^>]+)>)/gi, "").substring(0, 100)}...`);
        }

        const assessData = await moodleCall<Assessment>('local_aurahr_academia_get_assessment', { assessmentid: 0, jobid: jobId });
        if (assessData.exists) {
          setAssessment(assessData);
          setPassCount(assessData.pass_percentage ?? 60); // Optional sync
          setQuestionCount(assessData.num_questions);
        }
      } catch (err) {
        console.error('Failed to load academia config:', err);
      }
    }
    load();
  }, [jobId]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const createRes = await moodleCall<any>('local_aurahr_academia_create_assessment', {
        jobid: jobId,
        title: `Technical Test - Job ${jobId}`,
        num_questions: Number(questionCount) || 20,
        duration_mins: 60,
        pass_percentage: 60.0,
        ai_topic: description
      });

      await moodleCall<any>('local_aurahr_academia_generate_questions', {
        assessmentid: createRes.id
      });

      const assessData = await moodleCall<Assessment>('local_aurahr_academia_get_assessment', { assessmentid: createRes.id, jobid: jobId });
      setAssessment(assessData);
      setIsRegeneratingMode(false);
    } catch (err) {
      console.error('Failed to generate paper:', err);
      alert('Failed to generate test. Ensure Moodle backend is running and AI API key is valid.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSchedule = async () => {
    if (!assessment || !startDate || !endDate) return;
    setScheduling(true);
    try {
      const startTs = Math.floor(new Date(startDate).getTime() / 1000);
      const endTs = Math.floor(new Date(endDate).getTime() / 1000);

      await moodleCall<any>('local_aurahr_academia_schedule_test', {
        assessmentid: assessment.id,
        start_time: startTs,
        end_time: endTs
      });

      const assessData = await moodleCall<Assessment>('local_aurahr_academia_get_assessment', { assessmentid: assessment.id, jobid: jobId });
      setAssessment(assessData);
      setShowScheduleModal(false);
    } catch (err) {
      console.error('Failed to schedule test:', err);
      alert('Failed to schedule the test.');
    } finally {
      setScheduling(false);
    }
  };

  const isGenerated = !!(assessment && assessment.questions && assessment.questions.length > 0);
  const isScheduled = !!(assessment && assessment.start_time && assessment.start_time > 0);
  const showConfig = !isGenerated || isRegeneratingMode;

  const formatTimestamp = (ts?: number) => {
    if (!ts) return 'Pending';
    return new Date(ts * 1000).toLocaleString();
  };

  return (
    <div className="space-y-6 max-w-4xl relative">
      {showConfig && (
        <div className="bento-card p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-serif text-lg font-semibold text-ink flex items-center gap-2">
              <Settings size={18} className="text-sage" />
              Test Configuration
            </h3>
            {isGenerated && (
              <button 
                onClick={() => setIsRegeneratingMode(false)}
                className="text-xs font-semibold text-ink/40 hover:text-ink/70"
              >
                Cancel Editing
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-semibold text-ink/40 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Candidates to Pass</span>
                {aiPassCount && (
                  <span className="text-[9px] uppercase tracking-wider font-bold text-sage bg-sage/10 px-1.5 py-0.5 rounded">
                    AI Suggested: {aiPassCount}
                  </span>
                )}
              </label>
              <input
                type="number"
                value={passCount}
                onChange={(e) => setPassCount(e.target.value ? Number(e.target.value) : '')}
                className="w-full bg-warm-sand/30 border border-ink/10 rounded-xl px-4 py-2 text-sm text-ink focus:outline-none focus:border-sage/50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink/40 uppercase tracking-wider mb-2">
                Number of Questions
              </label>
              <input
                type="number"
                value={questionCount}
                onChange={(e) => setQuestionCount(e.target.value ? Number(e.target.value) : '')}
                className="w-full bg-warm-sand/30 border border-ink/10 rounded-xl px-4 py-2 text-sm text-ink focus:outline-none focus:border-sage/50"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-ink/40 uppercase tracking-wider mb-2">
                Paper Description (Prompt)
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-warm-sand/30 border border-ink/10 rounded-xl px-4 py-3 text-sm text-ink focus:outline-none focus:border-sage/50 resize-none"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm shadow-sm transition-colors ${
                generating ? 'bg-sage/50 text-white cursor-not-allowed' : 'bg-sage text-white hover:bg-sage/90'
              }`}
            >
              {generating ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Sparkles size={16} />
              )}
              {generating ? 'Drafting Questions via AI...' : (isRegeneratingMode ? 'Regenerate Paper' : 'Generate Paper')}
            </button>
          </div>
        </div>
      )}

      {isGenerated && !isRegeneratingMode && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bento-card p-6 border-sage/30 bg-sage/5 relative"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-lg font-semibold text-sage flex items-center gap-2">
              <BookOpen size={18} />
              Generated Question Bank
            </h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsRegeneratingMode(true)}
                className="text-xs font-semibold text-sage/70 hover:text-sage flex items-center gap-1 bg-white px-3 py-1.5 rounded-full border border-sage/20 shadow-sm transition-colors"
              >
                <Settings size={12} />
                Regenerate / Edit Prompt
              </button>
              <span className="text-xs font-bold bg-sage/20 text-sage px-3 py-1 rounded-full">
                {assessment.questions?.length} Questions
              </span>
            </div>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {assessment.questions?.map((q, i) => (
              <div key={i} className="bg-white border border-ink/5 p-4 rounded-lg text-sm text-ink/80 flex gap-3">
                <span className="font-mono text-ink/30 font-bold">{i + 1}.</span>
                <div>
                  <p className="font-medium mb-3 text-ink">{q.text}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx} className={`px-3 py-2 rounded-lg border text-xs ${optIdx === q.correct ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold' : 'border-ink/10 bg-warm-sand/20'}`}>
                        {String.fromCharCode(65 + optIdx)}. {opt}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                      q.difficulty === 'hard' ? 'text-rust bg-rust/10' :
                      q.difficulty === 'medium' ? 'text-amber-600 bg-amber-50' :
                      'text-emerald-600 bg-emerald-50'
                    }`}>
                      {q.difficulty}
                    </span>
                    <span className="text-xs text-ink/50 italic">Explanation: {q.explanation}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-sage/20 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {!isScheduled ? (
                <button 
                  onClick={() => setShowScheduleModal(true)}
                  className="flex items-center gap-2 text-sm font-semibold text-ink bg-white border border-ink/10 px-4 py-2 rounded-xl hover:bg-ink/5 transition-colors"
                >
                  <Calendar size={16} className="text-sage" />
                  Schedule Test
                </button>
              ) : (
                <div className="flex items-center gap-2 text-sm font-semibold text-sage bg-sage/10 border border-sage/20 px-4 py-2 rounded-xl">
                  <CheckCircle size={16} />
                  Test Scheduled
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-ink/60">Starts: {formatTimestamp(assessment.start_time)}</span>
                {isScheduled && <span className="text-xs text-ink/40">Ends: {formatTimestamp(assessment.end_time)}</span>}
              </div>
            </div>

            <div className="flex gap-3">
              {!testLive ? (
                <button 
                  onClick={() => setTestLive(true)}
                  disabled={!isScheduled}
                  className={`flex items-center gap-2 text-sm font-bold text-white px-5 py-2.5 rounded-xl shadow-sm transition-colors ${
                    !isScheduled ? 'bg-ink/20 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  <Play size={16} />
                  START TEST
                </button>
              ) : (
                <button 
                  onClick={() => setTestLive(false)}
                  className="flex items-center gap-2 text-sm font-bold text-white bg-rust px-5 py-2.5 rounded-xl hover:bg-rust-dark transition-colors shadow-sm"
                >
                  <Square size={16} />
                  END TEST
                </button>
              )}
            </div>
          </div>
          
          {testLive && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 pt-4 border-t border-sage/20"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-700">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm font-bold uppercase tracking-wider">Live Now</span>
                </div>
                <div className="text-sm font-semibold text-ink/60">
                  Applicants Finished: <span className="text-ink font-mono font-bold">0</span>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Schedule Test Modal */}
      <AnimatePresence>
        {showScheduleModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/20 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-cream rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-ink/10"
            >
              <div className="flex justify-between items-start mb-6">
                <h3 className="font-serif text-xl font-bold text-ink">Schedule Test</h3>
                <button onClick={() => setShowScheduleModal(false)} className="text-ink/30 hover:text-ink/60">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-xs font-semibold text-ink/40 uppercase tracking-wider mb-2">
                    Start Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-warm-sand/30 border border-ink/10 rounded-xl px-4 py-2 text-sm text-ink focus:outline-none focus:border-sage/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink/40 uppercase tracking-wider mb-2">
                    End Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-warm-sand/30 border border-ink/10 rounded-xl px-4 py-2 text-sm text-ink focus:outline-none focus:border-sage/50"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm border border-ink/10 hover:bg-ink/5 transition-colors text-ink/60"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSchedule}
                  disabled={!startDate || !endDate || scheduling}
                  className={`flex items-center justify-center gap-2 flex-1 py-3 rounded-xl font-semibold text-sm shadow transition-colors ${
                    (!startDate || !endDate || scheduling) ? 'bg-sage/50 text-white cursor-not-allowed' : 'bg-sage text-white hover:bg-sage/90'
                  }`}
                >
                  {scheduling ? <Loader2 size={16} className="animate-spin" /> : <Calendar size={16} />}
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
