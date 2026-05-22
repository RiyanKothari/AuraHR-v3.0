'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Users, ArrowRight, Settings, Plus, UserCheck, CalendarX, ShieldAlert, CheckCircle, XCircle, X } from 'lucide-react';
import { moodleCall } from '@/lib/moodle';

export default function SchedulerPage() {
  const [activeTab, setActiveTab] = useState<'calendar' | 'pending' | 'availability' | 'rules'>('calendar');
  const [loading, setLoading] = useState(true);
  
  // Data States
  const [interviews, setInterviews] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [slots, setSlots] = useState<any[]>([]);
  const [blockedTimes, setBlockedTimes] = useState<any[]>([]);
  const [rules, setRules] = useState<any>({ min_gap_mins: 15, max_per_day: 8, preferred_duration: 30, buffer_days: 1 });
  const [jobsList, setJobsList] = useState<any[]>([]);

  // Modal States
  const [isAutoSchedModalOpen, setIsAutoSchedModalOpen] = useState(false);
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  
  // Form States
  const [autoSchedJobId, setAutoSchedJobId] = useState('');
  const [overrideForm, setOverrideForm] = useState({ applicationid: '', interviewerid: '', datetime: '', duration: 30 });

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    setLoading(true);
    try {
      const start = Math.floor(Date.now() / 1000) - 86400 * 30; // 30 days ago
      const end = start + 86400 * 90; // +60 days future
      
      const [calData, reqData, slotData, blockData, ruleData, jobsData] = await Promise.all([
        moodleCall('local_aurahr_scheduler_get_calendar', { start_time: start, end_time: end }),
        moodleCall('local_aurahr_scheduler_get_pending_requests', {}),
        moodleCall('local_aurahr_scheduler_get_availability', {}),
        moodleCall('local_aurahr_scheduler_get_blocked_times', {}),
        moodleCall('local_aurahr_scheduler_get_rules', { jobid: 0 }),
        moodleCall('local_aurahr_jobs_list_jobs', { status: 'active' }).catch(() => ({ jobs: [] }))
      ]);
      
      setInterviews((calData as any).events || []);
      setPendingRequests((reqData as any).requests || []);
      setSlots((slotData as any).slots || []);
      setBlockedTimes((blockData as any).blocks || []);
      setJobsList((jobsData as any).jobs || []);
      
      if (ruleData) {
        const rd = ruleData as any;
        setRules({
          min_gap_mins: rd.min_gap_mins ?? 15,
          max_per_day: rd.max_per_day ?? 8,
          preferred_duration: rd.preferred_duration ?? 30,
          buffer_days: rd.buffer_days ?? 1,
        });
      }
    } catch (err) {
      console.error('Failed to load scheduler data', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleApproveReschedule(id: number, action: 'approve' | 'reject') {
    try {
      await moodleCall('local_aurahr_scheduler_approve_reschedule', { id, action, new_time: 0 });
      alert(`Request ${action}d successfully`);
      loadAllData();
    } catch (err) {
      alert('Failed to process request');
    }
  }

  async function handleSaveRules() {
    try {
      await moodleCall('local_aurahr_scheduler_update_rules', { ...rules, jobid: 0 });
      alert('Rules saved globally!');
    } catch (err) {
      alert('Failed to save rules');
    }
  }

  async function handleRunAutoScheduler() {
    if (!autoSchedJobId) return alert('Please select a job first');
    try {
      const res = await moodleCall('local_aurahr_scheduler_auto_schedule', { jobid: Number(autoSchedJobId) });
      alert((res as any).message);
      setIsAutoSchedModalOpen(false);
      loadAllData();
    } catch (err: any) {
      alert('Failed to run auto-scheduler: ' + err.message);
    }
  }

  async function handleOverrideSlot() {
    if (!overrideForm.applicationid || !overrideForm.interviewerid || !overrideForm.datetime) return alert('Fill all required fields');
    try {
      const scheduled_at = Math.floor(new Date(overrideForm.datetime).getTime() / 1000);
      await moodleCall('local_aurahr_scheduler_override_slot', { 
        applicationid: Number(overrideForm.applicationid), 
        interviewerid: Number(overrideForm.interviewerid), 
        scheduled_at, 
        duration_mins: overrideForm.duration 
      });
      alert('Override slot created successfully');
      setIsOverrideModalOpen(false);
      loadAllData();
    } catch (err: any) {
      alert('Failed to override slot: ' + err.message);
    }
  }

  return (
    <div className="space-y-6 max-w-7xl relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-ink tracking-tight">Smart Scheduler</h1>
          <p className="text-ink/50 mt-1 text-sm">Manage interview schedules, team availability, and AI matching rules.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-rust/10 text-rust hover:bg-rust/20 rounded-xl text-sm font-semibold transition-colors" 
                  onClick={() => setIsOverrideModalOpen(true)}>
            <ShieldAlert size={16} /> Override Slot
          </button>
          <button onClick={() => setIsAutoSchedModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-sage text-white rounded-xl text-sm font-semibold hover:bg-sage/90 transition-colors shadow-md">
            <Plus size={16} /> Auto-Schedule
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-ink/10 pb-px overflow-x-auto">
        {[
          { id: 'calendar', label: 'Interview Calendar' },
          { id: 'pending', label: `Pending Requests (${pendingRequests.length})` },
          { id: 'availability', label: 'Availability Management' },
          { id: 'rules', label: 'Scheduling Rules' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 text-sm font-semibold whitespace-nowrap transition-colors relative ${
              activeTab === tab.id ? 'text-ink' : 'text-ink/40 hover:text-ink/70'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-sage" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="pt-4">
        {loading ? (
          <div className="flex items-center justify-center p-12 text-ink/50">Loading scheduler data...</div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'calendar' && (
                <div className="bento-card p-6 min-h-[400px]">
                  <h3 className="font-serif text-lg font-semibold text-ink mb-6">Upcoming Interviews</h3>
                  {interviews.length === 0 ? (
                    <p className="text-ink/50 text-sm">No interviews scheduled in this period.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {interviews.map(inv => (
                        <div key={inv.id} className="p-4 bg-ink/5 rounded-xl border border-ink/10 flex justify-between items-center">
                          <div>
                            <p className="text-sm font-bold text-ink">{inv.title}</p>
                            <p className="text-xs text-ink/60 mt-1">{new Date(inv.scheduled_at * 1000).toLocaleString()}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-bold rounded ${inv.status === 'scheduled' ? 'bg-blue-100 text-blue-700' : 'bg-ink/10 text-ink/60'}`}>{inv.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'pending' && (
                <div className="bento-card p-6">
                  <h3 className="font-serif text-lg font-semibold text-ink flex items-center gap-2 mb-4">
                    <UserCheck size={18} className="text-blue-500" /> Review Pending Reschedules
                  </h3>
                  {pendingRequests.length === 0 ? (
                    <p className="text-ink/50 text-sm">No pending requests.</p>
                  ) : (
                    <div className="space-y-4">
                      {pendingRequests.map(req => (
                        <div key={req.id} className="flex items-center justify-between p-4 bg-ink/5 rounded-xl border border-ink/10">
                          <div>
                            <h4 className="font-sans text-sm font-semibold text-ink">{req.candidate_name}</h4>
                            <p className="text-xs text-ink/50 mt-1">Reason: {req.reason}</p>
                            <p className="text-xs text-ink/50 mt-1">Proposed: {req.new_time ? new Date(req.new_time * 1000).toLocaleString() : 'No specific time'}</p>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleApproveReschedule(req.id, 'approve')} className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600 flex items-center gap-1">
                              <CheckCircle size={14} /> Approve
                            </button>
                            <button onClick={() => handleApproveReschedule(req.id, 'reject')} className="px-4 py-2 bg-rust text-white rounded-lg text-xs font-bold hover:bg-rust/90 flex items-center gap-1">
                              <XCircle size={14} /> Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'availability' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bento-card p-6">
                    <h3 className="font-serif text-lg font-semibold text-ink flex items-center gap-2 mb-4">
                      <Clock size={18} className="text-sage" /> Your Weekly Availability
                    </h3>
                    <p className="text-sm text-ink/60 mb-4">You have {slots.length} recurring slots defined.</p>
                    <button className="w-full py-2 border border-dashed border-ink/20 rounded-xl text-sm font-semibold text-ink/60 hover:text-ink hover:border-ink/40 transition-colors"
                            onClick={() => alert('UI to configure slots goes here.')}>
                      + Manage Availability Slots
                    </button>
                  </div>

                  <div className="bento-card p-6">
                    <h3 className="font-serif text-lg font-semibold text-ink flex items-center gap-2 mb-4">
                      <CalendarX size={18} className="text-rust" /> Block Time Off
                    </h3>
                    <div className="space-y-4">
                      {blockedTimes.length === 0 ? <p className="text-sm text-ink/50">No blocked times.</p> : blockedTimes.map(bt => (
                        <div key={bt.id} className="p-4 bg-rust/5 border border-rust/10 rounded-xl">
                          <p className="text-sm font-semibold text-ink">{bt.reason}</p>
                          <p className="text-xs text-ink/50 mt-1">{new Date(bt.start_time * 1000).toLocaleDateString()} - {new Date(bt.end_time * 1000).toLocaleDateString()}</p>
                        </div>
                      ))}
                      <button className="w-full py-2 bg-rust/10 text-rust rounded-xl text-sm font-semibold hover:bg-rust/20 transition-colors"
                              onClick={() => alert('UI to add block goes here.')}>
                        + Add Time Off
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'rules' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bento-card p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 rounded-xl bg-sage/10 text-sage"><Settings size={18} /></div>
                      <h3 className="font-serif text-lg font-semibold text-ink">Global Rules</h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-ink/60 mb-1.5 ml-1">Minimum gap between interviews (mins)</label>
                        <input type="number" value={rules.min_gap_mins} onChange={e => setRules({...rules, min_gap_mins: Number(e.target.value)})} className="w-full bg-warm-sand/30 border border-ink/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-sage/50" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-ink/60 mb-1.5 ml-1">Max interviews per day per recruiter</label>
                        <input type="number" value={rules.max_per_day} onChange={e => setRules({...rules, max_per_day: Number(e.target.value)})} className="w-full bg-warm-sand/30 border border-ink/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-sage/50" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-ink/60 mb-1.5 ml-1">Default interview duration (mins)</label>
                        <input type="number" value={rules.preferred_duration} onChange={e => setRules({...rules, preferred_duration: Number(e.target.value)})} className="w-full bg-warm-sand/30 border border-ink/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-sage/50" />
                      </div>
                      <button onClick={handleSaveRules} className="px-5 py-2.5 bg-ink text-cream rounded-xl text-sm font-semibold hover:bg-ink/90 transition-colors w-full mt-2">
                        Save Global Rules
                      </button>
                    </div>
                  </div>

                  <div className="bento-card p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600"><Users size={18} /></div>
                      <h3 className="font-serif text-lg font-semibold text-ink">AI Auto-Scheduler</h3>
                    </div>
                    <p className="text-sm text-ink/60 leading-relaxed mb-6">
                      The AI auto-scheduler automatically finds overlapping availability between candidates and interviewers, respecting max limits and buffer times.
                    </p>
                    <button onClick={() => setIsAutoSchedModalOpen(true)} className="flex items-center justify-between w-full p-4 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-50 transition-colors group">
                      <div className="text-left">
                        <span className="block text-sm font-semibold text-blue-800">Run Auto-Scheduler</span>
                        <span className="block text-xs text-blue-600/70 mt-0.5">Match availability for all unscheduled interviews</span>
                      </div>
                      <ArrowRight size={16} className="text-blue-500 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Auto Schedule Modal */}
      {isAutoSchedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-sm p-4">
          <div className="bg-cream rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setIsAutoSchedModalOpen(false)} className="absolute top-4 right-4 p-2 text-ink/50 hover:bg-ink/10 rounded-full transition-colors">
              <X size={18} />
            </button>
            <h2 className="font-serif text-xl font-bold text-ink mb-2">Run Auto-Scheduler</h2>
            <p className="text-sm text-ink/60 mb-6">Select a job to auto-schedule interviews for.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-ink/80 mb-2">Select Active Job</label>
                <select 
                  className="w-full bg-white border border-ink/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sage/50"
                  value={autoSchedJobId}
                  onChange={(e) => setAutoSchedJobId(e.target.value)}
                >
                  <option value="">-- Select a Job --</option>
                  {jobsList.map(job => (
                    <option key={job.id} value={job.id}>{job.title}</option>
                  ))}
                </select>
              </div>
              <button 
                onClick={handleRunAutoScheduler}
                className="w-full py-3 bg-sage text-white rounded-xl text-sm font-bold hover:bg-sage/90 transition-colors mt-2"
              >
                Start Auto-Scheduling
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Override Slot Modal */}
      {isOverrideModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-sm p-4">
          <div className="bg-cream rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setIsOverrideModalOpen(false)} className="absolute top-4 right-4 p-2 text-ink/50 hover:bg-ink/10 rounded-full transition-colors">
              <X size={18} />
            </button>
            <h2 className="font-serif text-xl font-bold text-ink flex items-center gap-2 mb-2">
              <ShieldAlert className="text-rust" size={20} /> Override Slot
            </h2>
            <p className="text-sm text-ink/60 mb-6">Force an interview slot regardless of rules or availability.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-ink/80 mb-1">Application ID</label>
                <input 
                  type="number" 
                  value={overrideForm.applicationid}
                  onChange={e => setOverrideForm({...overrideForm, applicationid: e.target.value})}
                  className="w-full bg-white border border-ink/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sage/50"
                  placeholder="e.g. 42"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink/80 mb-1">Interviewer User ID</label>
                <input 
                  type="number" 
                  value={overrideForm.interviewerid}
                  onChange={e => setOverrideForm({...overrideForm, interviewerid: e.target.value})}
                  className="w-full bg-white border border-ink/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sage/50"
                  placeholder="e.g. 2"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink/80 mb-1">Date & Time</label>
                <input 
                  type="datetime-local" 
                  value={overrideForm.datetime}
                  onChange={e => setOverrideForm({...overrideForm, datetime: e.target.value})}
                  className="w-full bg-white border border-ink/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sage/50"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink/80 mb-1">Duration (mins)</label>
                <input 
                  type="number" 
                  value={overrideForm.duration}
                  onChange={e => setOverrideForm({...overrideForm, duration: Number(e.target.value)})}
                  className="w-full bg-white border border-ink/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sage/50"
                />
              </div>
              <button 
                onClick={handleOverrideSlot}
                className="w-full py-3 bg-rust text-white rounded-xl text-sm font-bold hover:bg-rust/90 transition-colors mt-4 shadow-md"
              >
                Force Schedule Interview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
