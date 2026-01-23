import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Brain, 
  User, 
  Briefcase, 
  Code,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiMethods } from '../../utils/api';

const AIInterviewSetupPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({
    name: '',
    experience: '',
    currentRole: '',
    targetCompany: '',
    targetRole: '',
    skills: [],
    resume: '',
    interviewType: 'behavioral',
    duration: 30
  });

  const [skillInput, setSkillInput] = useState('');

  const handleAddSkill = () => {
    if (skillInput.trim() && !profile.skills.includes(skillInput.trim())) {
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const handleNext = () => {
    if (step === 1) {
      if (!profile.name || !profile.experience || !profile.currentRole) {
        toast.error('Please fill in all required fields');
        return;
      }
    } else if (step === 2) {
      if (!profile.targetCompany || !profile.targetRole) {
        toast.error('Please specify your target company and role');
        return;
      }
    } else if (step === 3) {
      if (profile.skills.length === 0) {
        toast.error('Please add at least one skill');
        return;
      }
    }
    
    if (step < 4) {
      setStep(step + 1);
    } else {
      startInterview();
    }
  };

  const startInterview = async () => {
    try {
      const res = await apiMethods.aiInterview.startPersonalized({
        profile,
        interviewType: profile.interviewType
      });

      const sessionId = res?.data?.data?.sessionId;
      if (sessionId) {
        navigate(`/interview/ai/${sessionId}`);
      } else {
        toast.error('Failed to start AI interview');
      }
    } catch (error) {
      console.error('Failed to start AI interview:', error);
      toast.error(error?.response?.data?.message || error?.message || 'Failed to start AI interview');
    }
  };

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">Tell me about yourself</h2>
        <p className="text-secondary-600">Let's start with your basic information</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
            className="input"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Years of Experience *
          </label>
          <select
            value={profile.experience}
            onChange={(e) => setProfile(prev => ({ ...prev, experience: e.target.value }))}
            className="input"
          >
            <option value="">Select experience level</option>
            <option value="0-1">0-1 years (Entry Level)</option>
            <option value="2-3">2-3 years (Junior)</option>
            <option value="4-6">4-6 years (Mid Level)</option>
            <option value="7-10">7-10 years (Senior)</option>
            <option value="10+">10+ years (Lead/Principal)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Current Role/Position *
          </label>
          <input
            type="text"
            value={profile.currentRole}
            onChange={(e) => setProfile(prev => ({ ...prev, currentRole: e.target.value }))}
            className="input"
            placeholder="e.g., Software Engineer, Product Manager"
          />
        </div>
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Briefcase className="w-8 h-8 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">Your Target Role</h2>
        <p className="text-secondary-600">What position are you interviewing for?</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Target Company *
          </label>
          <input
            type="text"
            value={profile.targetCompany}
            onChange={(e) => setProfile(prev => ({ ...prev, targetCompany: e.target.value }))}
            className="input"
            placeholder="e.g., Google, Microsoft, Meta"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Target Role *
          </label>
          <input
            type="text"
            value={profile.targetRole}
            onChange={(e) => setProfile(prev => ({ ...prev, targetRole: e.target.value }))}
            className="input"
            placeholder="e.g., Senior Software Engineer, Product Manager"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Interview Type
          </label>
          <select
            value={profile.interviewType}
            onChange={(e) => setProfile(prev => ({ ...prev, interviewType: e.target.value }))}
            className="input"
          >
            <option value="behavioral">Behavioral Interview</option>
            <option value="technical">Technical Interview</option>
            <option value="mixed">Mixed (Behavioral + Technical)</option>
            <option value="leadership">Leadership Interview</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Interview Duration
          </label>
          <select
            value={profile.duration}
            onChange={(e) => setProfile(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
            className="input"
          >
            <option value={20}>20 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={45}>45 minutes</option>
            <option value={60}>60 minutes</option>
          </select>
        </div>
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Code className="w-8 h-8 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">Your Skills</h2>
        <p className="text-secondary-600">What technologies and skills do you have?</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Add Skills
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
              className="input flex-1"
              placeholder="e.g., JavaScript, React, Python"
            />
            <button
              onClick={handleAddSkill}
              className="btn btn-primary"
            >
              Add
            </button>
          </div>
        </div>

        {profile.skills.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Your Skills
            </label>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                >
                  {skill}
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    className="ml-2 text-primary-600 hover:text-primary-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );

  const renderStep4 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Brain className="w-8 h-8 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">Ready to Start!</h2>
        <p className="text-secondary-600">Review your information and begin your AI interview</p>
      </div>

      <div className="bg-secondary-50 rounded-lg p-6 space-y-4">
        <div>
          <span className="font-medium text-secondary-700">Name:</span>
          <span className="ml-2 text-secondary-900">{profile.name}</span>
        </div>
        <div>
          <span className="font-medium text-secondary-700">Experience:</span>
          <span className="ml-2 text-secondary-900">{profile.experience} years</span>
        </div>
        <div>
          <span className="font-medium text-secondary-700">Current Role:</span>
          <span className="ml-2 text-secondary-900">{profile.currentRole}</span>
        </div>
        <div>
          <span className="font-medium text-secondary-700">Target:</span>
          <span className="ml-2 text-secondary-900">{profile.targetRole} at {profile.targetCompany}</span>
        </div>
        <div>
          <span className="font-medium text-secondary-700">Interview Type:</span>
          <span className="ml-2 text-secondary-900 capitalize">{profile.interviewType}</span>
        </div>
        <div>
          <span className="font-medium text-secondary-700">Duration:</span>
          <span className="ml-2 text-secondary-900">{profile.duration} minutes</span>
        </div>
        <div>
          <span className="font-medium text-secondary-700">Skills:</span>
          <div className="mt-2 flex flex-wrap gap-1">
            {profile.skills.map((skill, index) => (
              <span
                key={index}
                className="inline-block px-2 py-1 text-xs bg-primary-100 text-primary-800 rounded"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-secondary-700">Step {step} of 4</span>
            <span className="text-sm text-secondary-600">{Math.round((step / 4) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-secondary-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Content */}
        <div className="card p-8">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="btn btn-ghost disabled:opacity-50"
            >
              Previous
            </button>
            
            <button
              onClick={handleNext}
              className="btn btn-primary flex items-center space-x-2"
            >
              <span>{step === 4 ? 'Start Interview' : 'Next'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInterviewSetupPage;
