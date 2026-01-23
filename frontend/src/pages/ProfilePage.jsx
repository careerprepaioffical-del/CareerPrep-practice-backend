import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Award, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { apiMethods } from '../utils/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' }
];

const splitCsv = (value) => {
  if (!value) return [];
  return value
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
};

const ProfilePage = () => {
  const { user, updateUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [profileCompletion, setProfileCompletion] = useState(0);
  const [progressDoc, setProgressDoc] = useState(null);

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [experience, setExperience] = useState('fresher');
  const [skillsCsv, setSkillsCsv] = useState('');
  const [targetCompaniesCsv, setTargetCompaniesCsv] = useState('');
  const [targetRolesCsv, setTargetRolesCsv] = useState('');
  const [preferredLanguages, setPreferredLanguages] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiMethods.users.getProfile();
        if (!isMounted) return;

        const loadedUser = res?.data?.data?.user || null;
        const loadedProgress = res?.data?.data?.progress || null;
        const loadedCompletion = res?.data?.data?.profileCompletion;

        if (loadedUser) {
          setName(loadedUser.name || '');
          setBio(loadedUser.profile?.bio || '');
          setExperience(loadedUser.profile?.experience || 'fresher');
          setSkillsCsv((loadedUser.profile?.skills || []).join(', '));
          setTargetCompaniesCsv((loadedUser.profile?.targetCompanies || []).join(', '));
          setTargetRolesCsv((loadedUser.profile?.targetRoles || []).join(', '));
          setPreferredLanguages(loadedUser.profile?.preferredLanguages || []);

          // Keep auth context user in sync (e.g., if it was stale).
          updateUser(loadedUser);
        }

        setProgressDoc(loadedProgress);
        setProfileCompletion(typeof loadedCompletion === 'number' ? loadedCompletion : 0);
      } catch (err) {
        if (!isMounted) return;
        setError(err?.response?.data?.message || err?.message || 'Failed to load profile');
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [updateUser]);

  const recentAchievements = useMemo(() => {
    const achievements = progressDoc?.achievements || [];
    return [...achievements]
      .filter(a => a && (a.isVisible ?? true))
      .sort((a, b) => new Date(b.unlockedAt || 0) - new Date(a.unlockedAt || 0))
      .slice(0, 4);
  }, [progressDoc]);

  const toggleLanguage = (lang) => {
    setPreferredLanguages((prev) => {
      const set = new Set(prev || []);
      if (set.has(lang)) set.delete(lang);
      else set.add(lang);
      return Array.from(set);
    });
  };

  const onSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const payload = {
        name: name.trim(),
        profile: {
          bio,
          experience,
          skills: splitCsv(skillsCsv),
          targetCompanies: splitCsv(targetCompaniesCsv),
          targetRoles: splitCsv(targetRolesCsv),
          preferredLanguages
        }
      };

      const res = await apiMethods.users.updateProfile(payload);
      const updatedUser = res?.data?.data?.user;
      const updatedCompletion = res?.data?.data?.profileCompletion;

      if (updatedUser) updateUser(updatedUser);
      if (typeof updatedCompletion === 'number') setProfileCompletion(updatedCompletion);

      toast.success('Profile updated');
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12">
        <LoadingSpinner text="Loading profile…" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-secondary-900 mb-4">
          Profile
        </h1>
        <p className="text-lg text-secondary-600">
          Manage your account and preferences
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 card p-6"
        >
          <h2 className="text-xl font-semibold text-secondary-900 mb-6">
            Personal Information
          </h2>
          
          <div className="space-y-6">
            {error && (
              <div className="flex items-start gap-2 text-sm text-error-700 bg-error-50 border border-error-200 rounded-lg p-3">
                <AlertTriangle className="w-4 h-4 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input pl-10"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="input pl-10"
                    placeholder="Enter your email"
                  />
                </div>
                <p className="mt-1 text-xs text-secondary-500">Email can’t be changed.</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Bio
              </label>
              <textarea
                rows={4}
                className="input"
                placeholder="Tell us about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Experience Level
                </label>
                <select className="input" value={experience} onChange={(e) => setExperience(e.target.value)}>
                  <option value="fresher">Fresher</option>
                  <option value="0-1">0-1 years</option>
                  <option value="1-3">1-3 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="5+">5+ years</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Skills (comma separated)</label>
              <input
                type="text"
                className="input"
                value={skillsCsv}
                onChange={(e) => setSkillsCsv(e.target.value)}
                placeholder="e.g., DSA, React, Node.js"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Target Companies</label>
                <input
                  type="text"
                  className="input"
                  value={targetCompaniesCsv}
                  onChange={(e) => setTargetCompaniesCsv(e.target.value)}
                  placeholder="e.g., Google, Amazon"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Target Roles</label>
                <input
                  type="text"
                  className="input"
                  value={targetRolesCsv}
                  onChange={(e) => setTargetRolesCsv(e.target.value)}
                  placeholder="e.g., Frontend Developer"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Preferred Languages</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {LANGUAGES.map((lang) => (
                  <label key={lang.value} className="flex items-center gap-2 text-sm text-secondary-700">
                    <input
                      type="checkbox"
                      checked={(preferredLanguages || []).includes(lang.value)}
                      onChange={() => toggleLanguage(lang.value)}
                      className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span>{lang.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <button className="btn btn-primary" onClick={onSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </motion.div>

        {/* Profile Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Profile Completion */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">
              Profile Completion
            </h3>
            <div className="space-y-4">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${Math.min(100, Math.max(0, profileCompletion || 0))}%` }}></div>
              </div>
              <p className="text-sm text-secondary-600">
                {Math.round(profileCompletion || 0)}% complete. Add more details to improve your experience.
              </p>
            </div>
          </div>

          {/* Account Stats */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">
              Account Stats
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-secondary-600">Member since</span>
                <span className="font-medium text-secondary-900">
                  {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary-600">Total Interviews</span>
                <span className="font-medium text-secondary-900">
                  {user?.stats?.totalInterviews || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Achievements */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">
              Recent Achievements
            </h3>
            {recentAchievements.length === 0 ? (
              <div className="text-sm text-secondary-600">No achievements unlocked yet.</div>
            ) : (
              <div className="space-y-3">
                {recentAchievements.map((a, idx) => (
                  <div key={a.id || idx} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center">
                      <Award className="w-4 h-4 text-secondary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-secondary-900">{a.name}</p>
                      <p className="text-xs text-secondary-600">{a.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
