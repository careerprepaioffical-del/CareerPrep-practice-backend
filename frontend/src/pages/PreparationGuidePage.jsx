import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Target, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { apiMethods } from '../utils/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const PreparationGuidePage = () => {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');

  const [loadingSnapshot, setLoadingSnapshot] = useState(true);
  const [snapshotError, setSnapshotError] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState(null);
  const [generatedGuide, setGeneratedGuide] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadSnapshot = async () => {
      try {
        setLoadingSnapshot(true);
        setSnapshotError(null);
        const analyticsRes = await apiMethods.progress.getAnalytics({ timeframe: 30 });
        if (!isMounted) return;
        setAnalytics(analyticsRes?.data?.data?.analytics || null);
      } catch (err) {
        if (!isMounted) return;
        setSnapshotError(err?.response?.data?.message || err?.message || 'Failed to load preparation snapshot');
      } finally {
        if (!isMounted) return;
        setLoadingSnapshot(false);
      }
    };

    loadSnapshot();

    return () => {
      isMounted = false;
    };
  }, []);

  const improvementAreas = useMemo(() => {
    return analytics?.skills?.improvementAreas || [];
  }, [analytics]);

  const topSkills = useMemo(() => {
    return analytics?.skills?.topSkills || [];
  }, [analytics]);

  const weeklyGoals = useMemo(() => {
    return analytics?.goals?.weekly || null;
  }, [analytics]);

  const weeklyCompletion = useMemo(() => {
    const completion = analytics?.goals?.completion;
    return typeof completion === 'number' ? Math.max(0, Math.min(100, Math.round(completion))) : 0;
  }, [analytics]);

  const recommendedPlan = useMemo(() => {
    const areas = improvementAreas
      .filter(a => a && a.skill)
      .slice(0, 3)
      .map(a => a.skill);

    const weekTopics = [
      areas[0] ? [`Core practice: ${areas[0]}`, 'Solve 10 focused questions', 'Review common patterns'] : ['Core fundamentals', 'Solve 10 focused questions', 'Review common patterns'],
      areas[1] ? [`Deep dive: ${areas[1]}`, 'Timed practice sessions', 'Review mistakes & notes'] : ['Deep dive (weakest area)', 'Timed practice sessions', 'Review mistakes & notes'],
      areas[2] ? [`Improve: ${areas[2]}`, 'Mock interview (technical)', 'Refine explanation clarity'] : ['Improve secondary skill', 'Mock interview (technical)', 'Refine explanation clarity'],
      ['System design / behavioral', '1 full mock interview', 'Finalize checklist & pacing']
    ];

    const completedWeeks = weeklyCompletion >= 75 ? 3 : weeklyCompletion >= 50 ? 2 : weeklyCompletion >= 25 ? 1 : 0;

    return weekTopics.map((topics, index) => ({
      week: `Week ${index + 1}`,
      title: topics[0],
      topics: topics.slice(1),
      completed: index < completedWeeks
    }));
  }, [improvementAreas, weeklyCompletion]);

  const onGenerate = async () => {
    try {
      setGenerateError(null);
      setGeneratedGuide(null);
      setGenerating(true);

      const trimmedCompany = company.trim();
      const trimmedRole = role.trim();
      if (!trimmedCompany || !trimmedRole) {
        setGenerateError('Select both company and role to generate a guide.');
        return;
      }

      const res = await apiMethods.ai.generatePreparationGuide({
        company: trimmedCompany,
        role: trimmedRole
      });

      setGeneratedGuide(res?.data?.data?.guide || null);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 403) {
        setGenerateError('AI preparation guides require a Premium subscription.');
      } else {
        setGenerateError(err?.response?.data?.message || err?.message || 'Failed to generate preparation guide');
      }
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-secondary-900 mb-4">
          Preparation Guide
        </h1>
        <p className="text-lg text-secondary-600">
          Get personalized study plans and preparation strategies
        </p>
      </motion.div>

      {/* Create Guide */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-6"
      >
        <h2 className="text-xl font-semibold text-secondary-900 mb-6">
          Generate Personalized Guide
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">Target Company</label>
            <select className="input" value={company} onChange={(e) => setCompany(e.target.value)}>
              <option value="">Select Company</option>
              <option value="Google">Google</option>
              <option value="Meta">Meta</option>
              <option value="Amazon">Amazon</option>
              <option value="Microsoft">Microsoft</option>
              <option value="Apple">Apple</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">Target Role</label>
            <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="">Select Role</option>
              <option value="Software Engineer">Software Engineer</option>
              <option value="Frontend Developer">Frontend Developer</option>
              <option value="Backend Developer">Backend Developer</option>
              <option value="Full Stack Developer">Full Stack Developer</option>
              <option value="Data Scientist">Data Scientist</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button className="btn btn-primary" onClick={onGenerate} disabled={generating}>
            {generating ? 'Generating…' : 'Generate Guide'}
          </button>
          <span className="text-xs text-secondary-500">AI guide is a Premium feature.</span>
        </div>

        {generateError && (
          <div className="mt-3 flex items-start gap-2 text-sm text-error-700 bg-error-50 border border-error-200 rounded-lg p-3">
            <AlertTriangle className="w-4 h-4 mt-0.5" />
            <span>{generateError}</span>
          </div>
        )}
      </motion.div>

      {/* Data-driven Snapshot */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card p-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
            <Target className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-secondary-900">Your Preparation Snapshot</h2>
            <p className="text-secondary-600">Based on your last 30 days</p>
          </div>
        </div>

        {loadingSnapshot ? (
          <div className="py-8">
            <LoadingSpinner text="Loading your snapshot…" />
          </div>
        ) : snapshotError ? (
          <div className="flex items-start gap-2 text-sm text-error-700 bg-error-50 border border-error-200 rounded-lg p-3">
            <AlertTriangle className="w-4 h-4 mt-0.5" />
            <span>{snapshotError}</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Study Plan */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">Recommended 4-Week Plan</h3>
                <div className="space-y-4">
                  {recommendedPlan.map((week, index) => (
                    <div key={week.week} className="border border-secondary-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            week.completed ? 'bg-success-100' : 'bg-secondary-100'
                          }`}>
                            {week.completed ? (
                              <CheckCircle className="w-4 h-4 text-success-600" />
                            ) : (
                              <span className="text-xs font-medium text-secondary-600">{index + 1}</span>
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-secondary-900">{week.week}</h4>
                            <p className="text-sm text-secondary-600">{week.title}</p>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          week.completed ? 'bg-success-100 text-success-800' : 'bg-secondary-100 text-secondary-600'
                        }`}>
                          {week.completed ? 'On track' : 'Next'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {week.topics.map((topic, topicIndex) => (
                          <span key={topicIndex} className="text-xs bg-secondary-100 text-secondary-700 px-2 py-1 rounded">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-6">
              <div className="card p-4">
                <h4 className="font-semibold text-secondary-900 mb-3">Weekly Goals</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Completion</span>
                      <span>{weeklyCompletion}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${weeklyCompletion}%` }}></div>
                    </div>
                  </div>

                  {weeklyGoals ? (
                    <div className="text-xs text-secondary-600 space-y-1">
                      <div>Interviews: {weeklyGoals.interviewsCompleted}/{weeklyGoals.interviewsTarget}</div>
                      <div>Time: {weeklyGoals.timeSpent}/{weeklyGoals.timeTarget} min</div>
                    </div>
                  ) : (
                    <div className="text-xs text-secondary-600">No weekly goals found.</div>
                  )}
                </div>
              </div>

              <div className="card p-4">
                <h4 className="font-semibold text-secondary-900 mb-3">Focus Areas</h4>
                {improvementAreas.length === 0 ? (
                  <div className="text-sm text-secondary-600">No weak areas detected yet. Do a few interviews to get recommendations.</div>
                ) : (
                  <div className="space-y-2">
                    {improvementAreas.map((area, index) => (
                      <div key={`${area.skill}-${index}`} className="flex items-center justify-between text-sm">
                        <span className="text-secondary-800">{area.skill}</span>
                        <span className="text-secondary-600">{Math.round(area.score || 0)}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="card p-4">
                <h4 className="font-semibold text-secondary-900 mb-3">Strengths</h4>
                {topSkills.length === 0 ? (
                  <div className="text-sm text-secondary-600">No skill data yet.</div>
                ) : (
                  <div className="space-y-2">
                    {topSkills.slice(0, 4).map((skill, index) => (
                      <div key={`${skill.skill}-${index}`} className="flex items-center justify-between text-sm">
                        <span className="text-secondary-800">{skill.skill}</span>
                        <span className="text-secondary-600">{Math.round(skill.score || 0)}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="card p-4">
                <h4 className="font-semibold text-secondary-900 mb-3">Suggested Resources</h4>
                <div className="space-y-2">
                  <a href="https://leetcode.com" target="_blank" rel="noreferrer" className="block text-sm text-primary-600 hover:text-primary-700">
                    LeetCode (practice)
                  </a>
                  <a href="https://github.com/donnemartin/system-design-primer" target="_blank" rel="noreferrer" className="block text-sm text-primary-600 hover:text-primary-700">
                    System Design Primer
                  </a>
                  <a href="https://www.pramp.com" target="_blank" rel="noreferrer" className="block text-sm text-primary-600 hover:text-primary-700">
                    Pramp (mock interviews)
                  </a>
                  <a href="https://www.interviewing.io" target="_blank" rel="noreferrer" className="block text-sm text-primary-600 hover:text-primary-700">
                    Interviewing.io (practice)
                  </a>
                </div>
              </div>

              <div className="card p-4">
                <h4 className="font-semibold text-secondary-900 mb-3">Next Steps</h4>
                <div className="space-y-2 text-sm text-secondary-700">
                  <div className="flex items-start space-x-2">
                    <Clock className="w-4 h-4 mt-0.5 text-secondary-400" />
                    <span>Complete a timed practice session today</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <BookOpen className="w-4 h-4 mt-0.5 text-secondary-400" />
                    <span>Review your lowest-scoring skill notes</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Target className="w-4 h-4 mt-0.5 text-secondary-400" />
                    <span>Schedule one full mock interview this week</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* AI Guide Output */}
      {generatedGuide && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-secondary-900">Generated Guide</h2>
            <span className="text-xs text-secondary-500">AI generated</span>
          </div>

          <div className="space-y-4">
            {Object.entries(generatedGuide).map(([key, value]) => (
              <div key={key} className="border border-secondary-200 rounded-lg p-4">
                <h3 className="font-semibold text-secondary-900 mb-2">
                  {key.replace(/_/g, ' ')}
                </h3>
                {Array.isArray(value) ? (
                  <ul className="list-disc pl-5 text-sm text-secondary-700 space-y-1">
                    {value.map((item, idx) => (
                      <li key={idx}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>
                    ))}
                  </ul>
                ) : typeof value === 'object' && value !== null ? (
                  <pre className="text-xs bg-secondary-50 p-3 rounded overflow-auto">{JSON.stringify(value, null, 2)}</pre>
                ) : (
                  <p className="text-sm text-secondary-700">{String(value)}</p>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default PreparationGuidePage;
