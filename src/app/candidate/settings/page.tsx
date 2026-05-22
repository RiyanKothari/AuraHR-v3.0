'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Lock, Eye, EyeOff, Bell, Moon, Sun, Monitor, 
  Globe, Download, Trash2, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { moodleCall } from '@/lib/moodle';
import { useRouter } from 'next/navigation';

const ToggleSwitch = ({ isOn, onToggle }: { isOn: boolean, onToggle: () => void }) => (
  <button
    onClick={onToggle}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isOn ? 'bg-blue-500' : 'bg-ink/20'}`}
  >
    <motion.span
      animate={{ x: isOn ? 22 : 2 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="inline-block h-5 w-5 transform rounded-full bg-white shadow-sm"
    />
  </button>
);

export default function CandidateSettingsPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  
  // Notification States
  const [notifs, setNotifs] = useState({
    status: true,
    matches: true,
    reminders: true,
    alerts: true,
    digest: false,
    marketing: false
  });

  // Privacy States
  const [privacy, setPrivacy] = useState({
    visible: true,
    resume: true
  });

  const [theme, setTheme] = useState('system');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await moodleCall<any>('local_aurahr_jobs_get_user_prefs');
        const data = JSON.parse(res.data || '{}');
        if (data.notifs) setNotifs(data.notifs);
        if (data.privacy) setPrivacy(data.privacy);
        if (data.theme) setTheme(data.theme);
      } catch (err) {
        console.error('Failed to load settings', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (passwords.new) {
        if (passwords.new !== passwords.confirm) {
          alert('New passwords do not match!');
          return;
        }
        await moodleCall('local_aurahr_jobs_change_password', {
          currentpassword: passwords.current,
          newpassword: passwords.new
        });
        setPasswords({ current: '', new: '', confirm: '' });
      }

      await moodleCall('local_aurahr_jobs_update_user_prefs', {
        data: JSON.stringify({ notifs, privacy, theme })
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      console.error('Failed to save settings', err);
      alert(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you absolutely sure you want to delete your account? This is permanent.')) return;
    try {
      await moodleCall('local_aurahr_jobs_delete_account');
      router.push('/login');
    } catch (err: any) {
      alert(err.message || 'Failed to delete account');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex justify-between items-center py-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-ink tracking-tight mb-1">Account Settings</h1>
          <p className="text-ink/60 text-sm">Manage your profile preferences, notifications, and security.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Account Security */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bento-card p-8">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-ink/5">
            <Lock className="text-blue-500" size={24} />
            <h2 className="font-serif text-xl font-bold text-ink">Account Security</h2>
          </div>
          
          <div className="space-y-6 max-w-xl">
            <div>
              <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-wider mb-2">Registered Email</label>
              <input 
                type="email" 
                value="candidate@example.com" 
                disabled 
                className="w-full bg-ink/5 border border-ink/10 rounded-xl p-3.5 text-sm text-ink/50 cursor-not-allowed" 
              />
              <p className="text-xs text-ink/40 mt-2">To change your email, please contact support.</p>
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-wider">Change Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Current Password"
                  className="input-field pr-12"
                  value={passwords.current}
                  onChange={e => setPasswords({...passwords, current: e.target.value})}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink/80 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <input 
                type={showPassword ? 'text' : 'password'}
                placeholder="New Password"
                className="input-field"
                value={passwords.new}
                onChange={e => setPasswords({...passwords, new: e.target.value})}
              />
              <input 
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm New Password"
                className="input-field"
                value={passwords.confirm}
                onChange={e => setPasswords({...passwords, confirm: e.target.value})}
              />
            </div>
          </div>
        </motion.section>

        {/* Notifications */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bento-card p-8">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-ink/5">
            <Bell className="text-blue-500" size={24} />
            <h2 className="font-serif text-xl font-bold text-ink">Notifications</h2>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-ink text-sm">Application status updates</p>
                <p className="text-ink/50 text-xs mt-0.5">Get notified when you move to a new stage</p>
              </div>
              <ToggleSwitch isOn={notifs.status} onToggle={() => setNotifs({...notifs, status: !notifs.status})} />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-ink text-sm">New job matches</p>
                <p className="text-ink/50 text-xs mt-0.5">Alerts for jobs that match your skills</p>
              </div>
              <ToggleSwitch isOn={notifs.matches} onToggle={() => setNotifs({...notifs, matches: !notifs.matches})} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-ink text-sm">Assessment reminders</p>
                <p className="text-ink/50 text-xs mt-0.5">24hr and 1hr reminders for scheduled tests</p>
              </div>
              <ToggleSwitch isOn={notifs.reminders} onToggle={() => setNotifs({...notifs, reminders: !notifs.reminders})} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-ink text-sm">Email digest</p>
                <p className="text-ink/50 text-xs mt-0.5">Weekly summary of activity</p>
              </div>
              <ToggleSwitch isOn={notifs.digest} onToggle={() => setNotifs({...notifs, digest: !notifs.digest})} />
            </div>
          </div>
        </motion.section>

        {/* Appearance & Preferences */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bento-card p-8">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-ink/5">
            <Globe className="text-blue-500" size={24} />
            <h2 className="font-serif text-xl font-bold text-ink">Preferences</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-wider mb-4">Theme</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'light', icon: Sun, label: 'Light' },
                  { id: 'dark', icon: Moon, label: 'Dark' },
                  { id: 'system', icon: Monitor, label: 'System' }
                ].map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(t.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${theme === t.id ? 'border-blue-500 bg-blue-500/5 text-blue-600' : 'border-ink/10 text-ink/60 hover:border-ink/30 hover:bg-ink/5'}`}
                  >
                    <t.icon size={20} className="mb-2" />
                    <span className="text-xs font-semibold">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-wider mb-4">Language</label>
              <select className="w-full bg-white border border-ink/10 rounded-xl p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-ink">
                <option value="en">English</option>
                <option value="hi">Hindi</option>
              </select>
            </div>
          </div>
        </motion.section>

        {/* Privacy */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bento-card p-8">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-ink/5">
            <ShieldCheck className="text-blue-500" size={24} />
            <h2 className="font-serif text-xl font-bold text-ink">Privacy & Data</h2>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-ink text-sm">Profile Visibility</p>
                <p className="text-ink/50 text-xs mt-0.5">Allow recruiters to discover your profile for matching jobs</p>
              </div>
              <ToggleSwitch isOn={privacy.visible} onToggle={() => setPrivacy({...privacy, visible: !privacy.visible})} />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-ink text-sm">Resume Downloads</p>
                <p className="text-ink/50 text-xs mt-0.5">Allow recruiters to download your resume PDF</p>
              </div>
              <ToggleSwitch isOn={privacy.resume} onToggle={() => setPrivacy({...privacy, resume: !privacy.resume})} />
            </div>

            <div className="pt-4">
              <button type="button" className="flex items-center text-sm font-semibold text-ink hover:text-blue-600 transition-colors border border-ink/20 hover:border-blue-500/50 px-4 py-2 rounded-lg">
                <Download size={16} className="mr-2" />
                Download My Data
              </button>
            </div>
          </div>
        </motion.section>

        {/* Danger Zone */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bento-card p-8 border-red-500/20 bg-red-500/5">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="text-red-500" size={24} />
            <h2 className="font-serif text-xl font-bold text-red-600">Danger Zone</h2>
          </div>
          <p className="text-red-900/60 text-sm mb-6 max-w-lg">
            Deleting your account is permanent. All your application data, assessment scores, and profile information will be erased completely.
          </p>
          <button onClick={handleDeleteAccount} type="button" className="flex items-center text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-colors px-5 py-2.5 rounded-lg shadow-sm">
            <Trash2 size={16} className="mr-2" />
            Delete Account
          </button>
        </motion.section>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-6 border-t border-ink/10 pb-12">
          {saved ? (
            <div className="text-emerald-600 flex items-center text-sm font-bold font-mono bg-emerald-50 px-4 py-2 rounded-lg animate-in fade-in zoom-in-95">
              <ShieldCheck size={16} className="mr-2" /> Settings Saved
            </div>
          ) : <div />}
          <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-blue-500/20">
            Save All Changes
          </button>
        </div>
      </form>
    </div>
  );
}
