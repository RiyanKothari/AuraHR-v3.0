'use client';

import { useEffect, useState } from 'react';
import { useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play, Loader2, AlertCircle, UploadCloud, FileText, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { moodleCall } from '@/lib/moodle';

interface Application {
  id: number;
  jobid: number;
  job_title: string;
  stage: string;
  jd_score: number;
  job_is_finalized?: number;
  assessment_id?: number;
  assessment_start_time?: number;
  assessment_end_time?: number;
  assessment_status?: string;
}

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

export default function CandidateDashboard() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user?.id) return;
    
    async function load() {
      try {
        const appRes = await moodleCall<{ applications: Application[] }>(
          'local_aurahr_jobs_list_applications',
          { jobid: 0 }
        );
        setApplications(appRes.applications || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto pt-8">
      <motion.div {...fadeUp} className="text-center">
        <h1 className="font-serif text-3xl font-bold text-ink tracking-tight">
          Welcome, {user?.firstname || 'Candidate'}
        </h1>
        <p className="text-ink/50 mt-2 text-sm">
          Here is the status of your recent application.
        </p>
      </motion.div>

      {/* Profile / Resume Upload Section */}
      <motion.div {...fadeUp} transition={{ delay: 0.05 }} className="bento-card p-6 md:p-8 bg-white border border-ink/5 shadow-sm rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="font-serif text-xl font-bold text-ink">Your Profile</h2>
          <p className="text-sm text-ink/60 mt-1">Upload your latest PDF resume to update your profile.</p>
        </div>
        <div>
          <input 
            type="file" 
            accept="application/pdf" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file || !user?.id) return;
              setUploading(true);
              setUploadSuccess(false);
              try {
                const formData = new FormData();
                formData.append('resume', file);
                formData.append('userid', user.id.toString());
                const res = await fetch('/api/resume/upload', {
                  method: 'POST',
                  body: formData
                });
                const data = await res.json();
                if (data.success) {
                  setUploadSuccess(true);
                } else {
                  alert(data.error || 'Failed to upload resume');
                }
              } catch(err) {
                console.error(err);
                alert('Upload failed');
              } finally {
                setUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }
            }} 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${
              uploadSuccess ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-200' : 
              'bg-ink/5 text-ink hover:bg-ink/10 border border-ink/10'
            }`}
          >
            {uploading ? (
              <><Loader2 size={16} className="animate-spin" /> Analyzing...</>
            ) : uploadSuccess ? (
              <><CheckCircle size={16} /> Updated Successfully</>
            ) : (
              <><UploadCloud size={16} /> Upload PDF Resume</>
            )}
          </button>
        </div>
      </motion.div>

      {applications.length === 0 ? (
        <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="bento-card p-12 text-center mt-8">
          <AlertCircle size={40} className="text-ink/20 mx-auto mb-3" />
          <p className="text-ink/50 text-sm font-medium">We couldn't find any active applications tied to your account.</p>
        </motion.div>
      ) : (
        <div className="space-y-6 mt-8">
          {applications.map((app, idx) => {
            const isAcademia = app.stage === 'academia';
            const isScreening = app.stage === 'applied' || app.stage === 'screened';
            const isRejected = app.stage === 'rejected';
            
            return (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + (idx * 0.05) }}
                className="bento-card p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-white border border-ink/5 shadow-sm rounded-2xl"
              >
                <div className="text-center md:text-left">
                  <p className="font-serif text-xl font-bold text-ink">{app.job_title}</p>
                  
                  {isScreening && (
                    <div className="mt-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg text-xs font-semibold inline-block">
                      Resume under review
                    </div>
                  )}
                  {isRejected && (
                    <div className="mt-2 text-rust bg-rust/10 px-3 py-1.5 rounded-lg text-xs font-semibold inline-block">
                      Application not selected
                    </div>
                  )}
                  {!isScreening && !isRejected && !isAcademia && (
                    <div className="mt-2 text-sage bg-sage/10 px-3 py-1.5 rounded-lg text-xs font-semibold inline-block">
                      Status: {app.stage.charAt(0).toUpperCase() + app.stage.slice(1)}
                    </div>
                  )}
                </div>

                <div className="w-full md:w-auto flex flex-col items-stretch gap-3">
                  {isAcademia ? (
                    <Link 
                      href={`/exam/${app.id}`} 
                      className="flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg"
                    >
                      <Play size={16} /> Start Online Assessment
                    </Link>
                  ) : (
                    <button disabled className="flex items-center justify-center gap-2 px-8 py-3 bg-ink/5 text-ink/30 rounded-xl text-sm font-bold cursor-not-allowed">
                      <Play size={16} /> Assessment Locked
                    </button>
                  )}
                  {isScreening && (
                    <p className="text-[10px] text-center text-ink/40">
                      Assessment will unlock if your resume passes the JD match.
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
