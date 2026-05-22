'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Rocket, FileQuestion, BookOpen, Video, 
  ChevronDown, Mail, ArrowRight, ExternalLink
} from 'lucide-react';

const FAQS = [
  {
    question: 'How do I apply for a job?',
    answer: 'Navigate to the "Open Posts" section from your dashboard. Browse the available positions and click "Apply Now". Make sure your profile is complete before applying to increase your chances.'
  },
  {
    question: 'What happens after I submit my application?',
    answer: 'Your application enters the "Applied" stage. Our AI JD Parser will screen your resume against the job requirements. If you meet the threshold, you will automatically be moved to the "Screened" stage and invited for the Academia round.'
  },
  {
    question: 'How is my JD Parser score calculated?',
    answer: 'The AI compares the skills, experience, and keywords in your uploaded resume against the specific Job Description. It looks for "must-have" and "good-to-have" requirements to generate an objective match percentage.'
  },
  {
    question: 'Can I retake the academia assessment?',
    answer: 'Generally, no. The academia assessment (quiz/coding test) can only be taken once per application to ensure fairness. Please ensure you have a stable internet connection and uninterrupted time before starting.'
  },
  {
    question: 'How does the video interview work?',
    answer: 'If selected for an interview, you will receive a secure Jitsi meet link. Our built-in proctoring system will require camera and microphone access. Please join from a quiet, well-lit environment.'
  },
  {
    question: 'What is malpractice detection?',
    answer: 'During assessments and interviews, our system monitors for tab-switching, multiple faces in the camera frame, and unusual audio activity. Flagged behavior is reviewed by recruiters and may result in disqualification.'
  },
  {
    question: 'How do I update my GitHub/LinkedIn profile links?',
    answer: 'Go to the "Profile" tab on your sidebar. Scroll down to the Socials section where you can input and save your GitHub, LinkedIn, and LeetCode URLs. These help our AI evaluate your technical footprint.'
  },
  {
    question: 'When will I hear back about my application?',
    answer: 'You can check your real-time status in the "My Applications" tab. You will also receive email and in-app notifications whenever your application moves to a new stage in the pipeline.'
  }
];

const QUICK_ACTIONS = [
  { icon: Rocket, title: 'Getting Started', desc: 'Set up your profile and apply', color: 'text-blue-500' },
  { icon: FileQuestion, title: 'Application FAQ', desc: 'Common application questions', color: 'text-purple-500' },
  { icon: BookOpen, title: 'Assessment Guide', desc: 'Tips for tests and coding', color: 'text-emerald-500' },
  { icon: Video, title: 'Interview Prep', desc: 'Prepare for video interviews', color: 'text-amber-500' },
];

export default function CandidateHelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const filteredFaqs = FAQS.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header Section */}
      <div className="text-center space-y-4 py-8">
        <h1 className="font-serif text-4xl font-bold text-ink tracking-tight">How can we help you?</h1>
        <p className="text-ink/60 text-sm max-w-lg mx-auto">
          Search our knowledge base or browse categories below to find answers to your questions about the AuraHR platform.
        </p>
        
        <div className="max-w-xl mx-auto pt-4 relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-ink/40 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for help topics, assessments, interviews..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-ink/10 rounded-2xl text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-all"
          />
        </div>
      </div>

      {/* Quick Actions Grid */}
      {!searchQuery && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {QUICK_ACTIONS.map((action, idx) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bento-card p-6 group cursor-pointer hover:border-blue-500/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-transparent rounded-bl-full -z-10 transition-transform group-hover:scale-110" />
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-xl bg-white shadow-sm border border-ink/5 ${action.color} mb-4`}>
                  <action.icon size={24} />
                </div>
                <ArrowRight size={20} className="text-ink/20 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-ink mb-1">{action.title}</h3>
              <p className="text-sm text-ink/60 mb-4">{action.desc}</p>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Learn more</span>
            </motion.div>
          ))}
        </div>
      )}

      {/* FAQ Accordion */}
      <div className="bento-card p-8">
        <h2 className="font-serif text-2xl font-bold text-ink mb-6">Frequently Asked Questions</h2>
        
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-8 text-ink/50">
            No results found for "{searchQuery}". Please try different keywords.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div 
                  key={idx} 
                  className={`border rounded-xl transition-all duration-300 overflow-hidden ${isOpen ? 'border-blue-500/30 bg-blue-500/5 shadow-sm' : 'border-ink/10 bg-white hover:border-ink/20'}`}
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
                  >
                    <span className="font-sans font-semibold text-ink pr-8">{faq.question}</span>
                    <motion.div animate={{ rotate: isOpen ? 180 : 0 }} className="shrink-0 text-ink/40">
                      <ChevronDown size={20} />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-5 pt-0 text-sm text-ink/70 leading-relaxed border-t border-ink/5 mt-2">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Contact Support */}
      <motion.div 
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bento-card p-8 bg-gradient-to-br from-[#1a1f2e] to-[#232938] text-white flex flex-col md:flex-row items-center justify-between border-none shadow-xl"
      >
        <div className="mb-6 md:mb-0 flex items-center gap-5">
          <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
            <Mail size={32} className="text-blue-400" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold mb-1">Still need help?</h3>
            <p className="text-sm text-blue-100/70">Our support team typically responds within 24 hours.</p>
          </div>
        </div>
        <a href="mailto:support@aurahr.com" className="w-full md:w-auto px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
          Submit a Ticket
          <ExternalLink size={16} />
        </a>
      </motion.div>
    </div>
  );
}
