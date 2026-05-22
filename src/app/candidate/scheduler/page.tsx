'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, ArrowRight, Settings, Plus, Video } from 'lucide-react';

export default function CandidateSchedulerPage() {
  const [activeTab, setActiveTab] = useState<'interviews' | 'freetime'>('interviews');

  // Dummy data for scheduled interviews
  const upcomingInterviews = [
    { id: 1, title: 'Senior Frontend Engineer - Final Round', date: 'Oct 15, 2026', time: '10:00 AM', status: 'upcoming', link: '/candidate/interview/1' },
    { id: 2, title: 'Product Manager - Culture Fit', date: 'Oct 18, 2026', time: '2:00 PM', status: 'upcoming', link: '/candidate/interview/2' }
  ];

  const pastInterviews = [
    { id: 3, title: 'Senior Frontend Engineer - Tech Screen', date: 'Oct 10, 2026', time: '11:00 AM', status: 'past' }
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="font-serif text-3xl font-bold text-ink tracking-tight">Smart Scheduler</h1>
        <p className="text-ink/50 mt-1 text-sm">Manage your upcoming interviews and update your availability.</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-ink/10 pb-px">
        <button
          onClick={() => setActiveTab('interviews')}
          className={`pb-3 text-sm font-semibold transition-colors relative ${
            activeTab === 'interviews' ? 'text-ink' : 'text-ink/40 hover:text-ink/70'
          }`}
        >
          My Interviews
          {activeTab === 'interviews' && (
            <motion.div layoutId="candidate-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('freetime')}
          className={`pb-3 text-sm font-semibold transition-colors relative ${
            activeTab === 'freetime' ? 'text-ink' : 'text-ink/40 hover:text-ink/70'
          }`}
        >
          My Free Time
          {activeTab === 'freetime' && (
            <motion.div layoutId="candidate-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="pt-4">
        {activeTab === 'interviews' ? (
          <div className="space-y-8">
            <div>
              <h3 className="font-serif text-lg font-semibold text-ink mb-4 flex items-center gap-2">
                <Clock size={18} className="text-blue-500" /> Upcoming Interviews
              </h3>
              <div className="space-y-4">
                {upcomingInterviews.map((interview) => (
                  <div key={interview.id} className="bento-card p-5 flex items-center justify-between">
                    <div>
                      <h4 className="font-sans text-sm font-semibold text-ink">{interview.title}</h4>
                      <p className="text-xs text-ink/50 mt-1">{interview.date} at {interview.time}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button className="text-xs font-semibold text-ink/40 hover:text-ink transition-colors px-3 py-1.5 rounded-lg border border-ink/10">
                        Request Reschedule
                      </button>
                      <a href={interview.link} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors shadow-md">
                        <Video size={14} /> Join Now
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-serif text-lg font-semibold text-ink/50 mb-4 flex items-center gap-2">
                <Clock size={18} /> Past Interviews
              </h3>
              <div className="space-y-4 opacity-70">
                {pastInterviews.map((interview) => (
                  <div key={interview.id} className="bento-card p-5 flex items-center justify-between bg-ink/5 border-none">
                    <div>
                      <h4 className="font-sans text-sm font-semibold text-ink">{interview.title}</h4>
                      <p className="text-xs text-ink/50 mt-1">{interview.date} at {interview.time}</p>
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 bg-ink/10 text-ink/60 rounded-lg">Completed</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bento-card p-6">
            <h3 className="font-serif text-lg font-semibold text-ink mb-2">Set Your Availability</h3>
            <p className="text-sm text-ink/60 mb-6">Let the auto-scheduler know when you are free for the next 7 days.</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 mb-6">
              {Array.from({ length: 7 }).map((_, i) => {
                const date = new Date();
                date.setDate(date.getDate() + i);
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                const dayNum = date.getDate();
                return (
                  <div key={i} className="border border-ink/10 rounded-xl p-3 text-center hover:border-blue-300 transition-colors cursor-pointer group">
                    <p className="text-xs text-ink/40 uppercase tracking-wider mb-1">{dayName}</p>
                    <p className="text-lg font-serif font-bold text-ink group-hover:text-blue-600">{dayNum}</p>
                    <button className="mt-2 text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2 py-1 rounded w-full hover:bg-blue-500 hover:text-white transition-colors">
                      + Add Time
                    </button>
                  </div>
                );
              })}
            </div>

            <button className="w-full flex justify-center py-3 bg-ink text-cream rounded-xl text-sm font-semibold hover:bg-ink/90 transition-colors shadow-lg">
              Update Availability
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
