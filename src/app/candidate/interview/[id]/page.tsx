'use client';

import { useState } from 'react';
import { Video, Mic, MicOff, VideoOff, PhoneMissed, MessageSquare, MonitorUp, Users, Smartphone, ShieldAlert } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function CandidateInterviewPage() {
  const params = useParams();
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);

  // Placeholder for Jitsi meeting integration
  return (
    <div className="h-[calc(100vh-8rem)] bg-ink rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-ink/20">
      {/* Header */}
      <div className="h-16 bg-[#1a1a1a] flex items-center justify-between px-6 shrink-0 border-b border-white/10">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-rust animate-pulse" />
            <span className="text-white/80 font-medium text-sm">Recording & Proctoring Active</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/10">
            <Smartphone size={14} className="text-emerald-400" />
            <span className="text-white/60 text-xs">No extra devices detected</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
            <Users size={14} className="text-white/60" />
            <span className="text-white font-mono text-sm">2</span>
          </div>
          <span className="text-white/40 font-mono text-sm">24:15</span>
        </div>
      </div>

      {/* Video Area (Placeholder) */}
      <div className="flex-1 relative p-4 flex gap-4">
        {/* Main Speaker */}
        <div className="flex-1 bg-[#222] rounded-2xl overflow-hidden relative border border-white/5 shadow-inner">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-sage/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-sage/30 text-sage text-3xl font-bold">
                R
              </div>
              <p className="text-white font-medium">Recruiter</p>
              <p className="text-white/40 text-sm mt-1">Connecting video...</p>
            </div>
          </div>
          <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-sm font-medium border border-white/10">
            Sarah Connor (Interviewer)
          </div>
        </div>

        {/* Self View */}
        <div className="w-64 shrink-0 flex flex-col gap-4">
          <div className="h-48 bg-[#333] rounded-2xl overflow-hidden relative border border-white/5 shadow-lg">
            {!videoOn ? (
              <div className="absolute inset-0 flex items-center justify-center bg-[#222]">
                <VideoOff size={32} className="text-white/20" />
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white/40 text-sm">
                Webcam Feed
              </div>
            )}
            <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-md px-2 py-1 rounded-md text-white text-xs font-medium border border-white/10">
              You
            </div>
          </div>
          
          {/* Proctoring Warning Demo */}
          <div className="bg-rust/10 border border-rust/20 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert size={16} className="text-rust" />
              <p className="text-rust font-bold text-xs uppercase tracking-wider">Proctor Alerts</p>
            </div>
            <ul className="text-rust/80 text-xs space-y-1.5 list-disc list-inside">
              <li>Keep your face fully visible.</li>
              <li>Ensure quiet environment.</li>
              <li>Do not use mobile devices.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="h-20 bg-[#1a1a1a] flex items-center justify-center gap-4 shrink-0 border-t border-white/10">
        <button 
          onClick={() => setMicOn(!micOn)}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            micOn ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-rust text-white hover:bg-rust/90'
          }`}
        >
          {micOn ? <Mic size={20} /> : <MicOff size={20} />}
        </button>
        <button 
          onClick={() => setVideoOn(!videoOn)}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            videoOn ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-rust text-white hover:bg-rust/90'
          }`}
        >
          {videoOn ? <Video size={20} /> : <VideoOff size={20} />}
        </button>
        <button className="w-12 h-12 rounded-full flex items-center justify-center bg-white/10 text-white hover:bg-white/20 transition-colors">
          <MonitorUp size={20} />
        </button>
        <button className="w-12 h-12 rounded-full flex items-center justify-center bg-white/10 text-white hover:bg-white/20 transition-colors">
          <MessageSquare size={20} />
        </button>
        <div className="w-px h-8 bg-white/10 mx-2" />
        <button onClick={() => window.location.href = '/candidate/applications'} className="w-14 h-14 rounded-full flex items-center justify-center bg-rust text-white hover:bg-rust/90 transition-colors shadow-lg shadow-rust/20">
          <PhoneMissed size={24} />
        </button>
      </div>
    </div>
  );
}
