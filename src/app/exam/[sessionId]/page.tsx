'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Camera, EyeOff, AlertTriangle, CheckCircle, Clock, ShieldAlert, Play, Check, Loader2
} from 'lucide-react';

interface Question {
  id: string;
  type: 'mcq' | 'text';
  question: string;
  options?: string[];
  correctAnswer?: string;
}

export default function ExamPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params?.sessionId as string;

  const [hasCamera, setHasCamera] = useState(false);
  const [examStarted, setExamStarted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [generating, setGenerating] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 mins
  const [violations, setViolations] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // 1. Setup Camera
  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasCamera(true);
      } catch (err) {
        console.error('Camera access denied:', err);
        setHasCamera(false);
      }
    }
    setupCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // 2. Proctoring: Tab Visibility
  useEffect(() => {
    if (!examStarted || finished) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        const violation = `Tab switched or minimized at ${new Date().toLocaleTimeString()}`;
        setViolations(prev => [...prev, violation]);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [examStarted, finished, sessionId]);

  // 3. Timer
  useEffect(() => {
    if (!examStarted || finished || questions.length === 0) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          submitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [examStarted, finished, questions.length]);

  const handleStart = async () => {
    if (!hasCamera) {
      alert("You must grant camera access to start the proctored exam.");
      return;
    }
    setExamStarted(true);
    setGenerating(true);
    
    try {
      const res = await fetch('/api/academia/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'Software Engineer', skills: 'JavaScript, React, System Design' })
      });
      const data = await res.json();
      if (data.success && data.questions) {
        setQuestions(data.questions);
      } else {
        alert('Failed to load assessment questions.');
      }
    } catch (err) {
      console.error(err);
      alert('Error fetching questions.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSelect = (option: string) => {
    if (questions[currentQ]) {
      setAnswers({ ...answers, [questions[currentQ].id]: option });
    }
  };

  const handleTextAnswer = (text: string) => {
    if (questions[currentQ]) {
      setAnswers({ ...answers, [questions[currentQ].id]: text });
    }
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(prev => prev + 1);
    } else {
      submitExam();
    }
  };

  const submitExam = async () => {
    setFinished(true);
    setSubmitting(true);
    
    // Format answers array for the evaluate route
    const formattedAnswers = questions.map(q => ({
      questionId: q.id,
      candidateAnswer: answers[q.id] || 'No answer provided'
    }));

    // Add correct indices for the evaluate API
    const formattedQuestions = questions.map(q => {
      if (q.type === 'mcq' && q.options && q.correctAnswer) {
        return { ...q, correct: q.options.indexOf(q.correctAnswer) };
      }
      return q;
    });

    try {
      const res = await fetch('/api/academia/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: formattedQuestions, answers: formattedAnswers })
      });
      const data = await res.json();
      if (data.success) {
        setFinalScore(data.score);
      }
    } catch (err) {
      console.error('Failed to submit exam:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (finished) {
    return (
      <div className="min-h-screen bg-warm-sand/20 flex flex-col items-center justify-center p-6">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h1 className="text-2xl font-serif font-bold text-ink mb-2">Exam Completed</h1>
          <p className="text-ink/60 mb-6">Your responses and proctoring logs have been securely submitted.</p>
          
          {submitting ? (
             <div className="flex flex-col items-center mb-6">
               <Loader2 className="w-6 h-6 text-blue-500 animate-spin mb-2" />
               <span className="text-sm text-ink/50">Evaluating your answers using AI...</span>
             </div>
          ) : (
            <div className="mb-6 p-4 bg-ink/5 rounded-xl">
              <p className="text-sm text-ink/50 font-bold uppercase tracking-wide">Final Score</p>
              <p className="text-3xl font-serif font-bold text-ink">{finalScore !== null ? `${finalScore}%` : 'N/A'}</p>
            </div>
          )}

          <button 
            onClick={() => router.push('/candidate')}
            className="w-full py-3 bg-ink text-white rounded-xl font-bold hover:bg-ink/80 transition-colors"
          >
            Return to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-sand/20 text-ink flex flex-col md:flex-row">
      
      {/* LEFT: Exam Area */}
      <div className="flex-1 p-6 md:p-12 flex flex-col">
        {!examStarted ? (
          <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
            <h1 className="text-3xl font-serif font-bold mb-4">Proctored Assessment</h1>
            <p className="text-ink/60 text-center mb-8">
              This is a strictly proctored exam. You must keep your camera on, and you are not allowed to switch tabs or minimize the window. Any such actions will be logged and may lead to disqualification.
            </p>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-ink/5 w-full mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full ${hasCamera ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rust/10 text-rust'}`}>
                  {hasCamera ? <Camera size={24} /> : <EyeOff size={24} />}
                </div>
                <div>
                  <p className="font-bold">Camera Status</p>
                  <p className="text-sm text-ink/50">{hasCamera ? 'Connected and ready' : 'Waiting for permissions...'}</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleStart}
              disabled={!hasCamera}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white transition-all ${
                hasCamera ? 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg' : 'bg-ink/20 cursor-not-allowed'
              }`}
            >
              <Play size={18} /> Start Exam
            </button>
          </div>
        ) : generating ? (
           <div className="flex-1 flex flex-col items-center justify-center">
             <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
             <p className="text-ink/60">Generating personalized assessment questions...</p>
           </div>
        ) : questions.length > 0 ? (
          <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-serif font-bold text-ink">Question {currentQ + 1} of {questions.length}</h2>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-ink/10 shadow-sm font-mono font-bold">
                <Clock size={16} className="text-blue-500" />
                {formatTime(timeLeft)}
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-ink/5 mb-8 flex-1">
              <p className="text-lg font-medium text-ink mb-8">{questions[currentQ].question}</p>
              
              {questions[currentQ].type === 'mcq' && questions[currentQ].options ? (
                <div className="space-y-3">
                  {questions[currentQ].options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelect(opt)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                        answers[questions[currentQ].id] === opt 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-ink/10 hover:border-ink/30 hover:bg-ink/5'
                      }`}
                    >
                      <span className={answers[questions[currentQ].id] === opt ? 'font-bold text-blue-700' : 'text-ink/80'}>{opt}</span>
                      {answers[questions[currentQ].id] === opt && <CheckCircle size={20} className="text-blue-500" />}
                    </button>
                  ))}
                </div>
              ) : (
                <textarea 
                  className="w-full h-40 p-4 border-2 border-ink/10 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none"
                  placeholder="Type your answer here..."
                  value={answers[questions[currentQ].id] || ''}
                  onChange={(e) => handleTextAnswer(e.target.value)}
                />
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleNext}
                disabled={!answers[questions[currentQ].id]}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white transition-all ${
                  answers[questions[currentQ].id] ? 'bg-ink hover:bg-ink/80 shadow-md' : 'bg-ink/20 cursor-not-allowed'
                }`}
              >
                {currentQ < questions.length - 1 ? 'Next Question' : 'Submit Exam'} <Check size={18} />
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* RIGHT: Proctoring Sidebar */}
      <div className="w-full md:w-80 bg-white border-l border-ink/10 flex flex-col shadow-[-4px_0_24px_rgba(0,0,0,0.02)] shrink-0">
        <div className="p-4 border-b border-ink/10 bg-ink/5 flex items-center gap-2">
          <ShieldAlert size={18} className="text-sage" />
          <h3 className="font-bold text-sm text-ink uppercase tracking-wider">Proctoring System</h3>
        </div>
        
        <div className="p-4 border-b border-ink/10">
          <div className="aspect-video bg-ink rounded-xl overflow-hidden relative shadow-inner">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover transform -scale-x-100"
            />
            {!hasCamera && (
              <div className="absolute inset-0 flex items-center justify-center text-white/50 text-xs">
                Camera feed off
              </div>
            )}
            {hasCamera && examStarted && (
              <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-2 py-1 rounded text-[10px] text-emerald-400 font-bold uppercase">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Recording
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-warm-sand/10">
          <h4 className="text-xs font-bold text-ink/40 uppercase tracking-wider mb-3">Activity Log</h4>
          {violations.length === 0 ? (
            <p className="text-xs text-ink/40 italic flex items-center gap-1.5"><CheckCircle size={14} className="text-emerald-500" /> No violations detected.</p>
          ) : (
            <div className="space-y-2">
              {violations.map((v, i) => (
                <div key={i} className="bg-rust/10 border border-rust/20 p-2.5 rounded-lg flex items-start gap-2 text-rust text-xs">
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                  <span>{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
