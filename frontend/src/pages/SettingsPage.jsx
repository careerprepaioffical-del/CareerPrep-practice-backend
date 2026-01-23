import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Shield, AlertTriangle, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiMethods } from '../utils/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';

const INTERVIEW_TYPES = [
  { value: 'technical', label: 'Technical' },
  { value: 'behavioral', label: 'Behavioral' },
  { value: 'system-design', label: 'System Design' },
  { value: 'coding', label: 'Coding' }
];

const SettingsPage = () => {
  const { logout, updateUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [difficulty, setDifficulty] = useState('mixed');
  const [interviewTypes, setInterviewTypes] = useState(['technical', 'behavioral']);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [reminderNotifications, setReminderNotifications] = useState(true);

  const [deleting, setDeleting] = useState(false);

  const accountDeletionEnabled = false;

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await apiMethods.users.getProfile();
        if (!isMounted) return;

        const loadedUser = res?.data?.data?.user;
        if (loadedUser) {
          const prefs = loadedUser.preferences || {};
          setDifficulty(prefs.difficulty || 'mixed');
          setInterviewTypes(prefs.interviewTypes || ['technical', 'behavioral']);
          setEmailNotifications(prefs.notifications?.email ?? true);
          setReminderNotifications(prefs.notifications?.reminders ?? true);
          updateUser(loadedUser);
        }
      } catch (err) {
        if (!isMounted) return;
        setError(err?.response?.data?.message || err?.message || 'Failed to load settings');
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

  const toggleInterviewType = (type) => {
    setInterviewTypes((prev) => {
      const set = new Set(prev || []);
      if (set.has(type)) set.delete(type);
      else set.add(type);
      return Array.from(set);
    });
  };

  const onSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const res = await apiMethods.users.updatePreferences({
        difficulty,
        interviewTypes,
        notifications: {
          email: emailNotifications,
          reminders: reminderNotifications
        }
      });

      // Keep AuthContext in sync even though the endpoint returns only preferences.
      const updatedPreferences = res?.data?.data?.preferences;
      if (updatedPreferences) updateUser({ preferences: updatedPreferences });

      toast.success('Settings saved');
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const onDeleteAccount = async () => {
    const confirmed = window.confirm('Delete your account? This cannot be undone.');
    if (!confirmed) return;

    try {
      setDeleting(true);
      await apiMethods.users.deleteAccount();
      toast.success('Account deleted');
      await logout();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to delete account');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12">
        <LoadingSpinner text="Loading settings…" />
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
          Settings
        </h1>
        <p className="text-lg text-secondary-600">
          Manage your account preferences and settings
        </p>
      </motion.div>

      <div className="space-y-6">
        {error && (
          <div className="flex items-start gap-2 text-sm text-error-700 bg-error-50 border border-error-200 rounded-lg p-3">
            <AlertTriangle className="w-4 h-4 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Interview Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <h2 className="text-xl font-semibold text-secondary-900 mb-6">Interview Preferences</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Difficulty</label>
              <select className="input" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Interview Types</label>
              <div className="grid grid-cols-2 gap-3">
                {INTERVIEW_TYPES.map((t) => (
                  <label key={t.value} className="flex items-center gap-2 text-sm text-secondary-700">
                    <input
                      type="checkbox"
                      checked={(interviewTypes || []).includes(t.value)}
                      onChange={() => toggleInterviewType(t.value)}
                      className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span>{t.label}</span>
                  </label>
                ))}
              </div>
              <p className="mt-1 text-xs text-secondary-500">Choose what you want to practice.</p>
            </div>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-secondary-600" />
            <h2 className="text-xl font-semibold text-secondary-900">Notifications</h2>
          </div>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-sm text-secondary-700">Email notifications</span>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-secondary-700">Reminders</span>
              <input
                type="checkbox"
                checked={reminderNotifications}
                onChange={(e) => setReminderNotifications(e.target.checked)}
                className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
              />
            </label>
            <p className="text-xs text-secondary-500">These settings are stored in your user profile.</p>
          </div>
        </motion.div>

        {/* Security / Account */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-secondary-600" />
            <h2 className="text-xl font-semibold text-secondary-900">Account</h2>
          </div>
          <p className="text-sm text-secondary-600">Password change / 2FA UI removed (not supported by backend yet).</p>

          <div className="mt-4 border-t border-secondary-200 pt-4">
            <h3 className="text-sm font-semibold text-secondary-900 mb-2">Danger Zone</h3>
            <button
              className="btn btn-secondary text-sm"
              onClick={onDeleteAccount}
              disabled={deleting || !accountDeletionEnabled}
              title={accountDeletionEnabled ? '' : 'Account deletion is disabled.'}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {accountDeletionEnabled ? (deleting ? 'Deleting…' : 'Delete Account') : 'Delete Account (Disabled)'}
            </button>
            <p className="mt-2 text-xs text-secondary-500">
              Account deletion is currently disabled. Contact support if you need your account removed.
            </p>
          </div>
        </motion.div>

        <div className="flex justify-end">
          <button className="btn btn-primary" onClick={onSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
