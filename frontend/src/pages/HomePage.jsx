import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Code, 
  Users, 
  Zap, 
  ArrowRight, 
  CheckCircle,
  TrendingUp,
  Award,
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Interview Simulation',
    description: 'Experience realistic interviews with AI that adapts to your responses and provides intelligent follow-up questions.',
    color: 'from-blue-500 to-purple-600'
  },
  {
    icon: Code,
    title: 'Real-time Code Evaluation',
    description: 'Get instant feedback on your coding solutions with detailed analysis of correctness, efficiency, and best practices.',
    color: 'from-green-500 to-teal-600'
  },
  {
    icon: Users,
    title: 'Behavioral Interview Training',
    description: 'Master behavioral questions with STAR method guidance and personalized feedback on your communication skills.',
    color: 'from-orange-500 to-red-600'
  },
  {
    icon: Zap,
    title: 'Intelligent Preparation Guide',
    description: 'Receive customized study plans and preparation strategies tailored to your target company and role.',
    color: 'from-purple-500 to-pink-600'
  }
];

const benefits = [
  'Admin-curated coding questions',
  'Real-time feedback with test cases',
  'Progress tracking and analytics',
  'Monaco code editor integration',
  'Multiple languages support',
  'Starter code templates'
];

const motivationalQuotes = [
  { quote: "Success is where preparation meets opportunity."},
  { quote: "The expert in anything was once a beginner."},
  { quote: "Practice isn't the thing you do once you're good. It's the thing you do that makes you good."},
];

const goals = [
  { 
    icon: Brain, 
    title: 'Master Technical Skills', 
    description: 'Build confidence in coding, algorithms, and system design',
    color: 'from-blue-500 to-purple-600' 
  },
  { 
    icon: Users, 
    title: 'Ace Behavioral Questions', 
    description: 'Perfect your STAR method and communication skills',
    color: 'from-green-500 to-teal-600' 
  },
  { 
    icon: TrendingUp, 
    title: 'Track Your Progress', 
    description: 'Monitor improvement and identify areas to focus',
    color: 'from-orange-500 to-red-600' 
  },
  { 
    icon: Award, 
    title: 'Land Dream Job', 
    description: 'Secure offers from top tech companies worldwide',
    color: 'from-purple-500 to-pink-600' 
  },
];

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-secondary-200 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <img
                src="/image.png"
                alt="CareerPrep Ai"
                className="w-8 h-8 rounded-lg object-cover"
              />
              <span className="text-xl font-bold gradient-text">CareerPrep Ai</span>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-secondary-600 hover:text-secondary-900 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="btn btn-primary shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Trust Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center bg-gradient-to-r from-primary-100 to-purple-100 text-primary-700 px-5 py-2 rounded-full text-sm font-semibold mb-6 shadow-lg"
            >
              <Zap className="w-4 h-4 mr-2" />
              Your Journey to Success Starts Here
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-6xl font-bold text-secondary-900 mb-6"
            >
              Master Your Next{' '}
              <span className="gradient-text">Interview</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-secondary-600 mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              Prepare smarter with AI-powered interview simulation, real-time feedback, 
              and personalized guidance tailored to your dream company. Land your dream job with confidence.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            >
              <Link
                to="/register"
                className="btn btn-primary text-lg px-8 py-3 flex items-center space-x-2 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
              >
                <span>Start Practicing Free</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              
              <a
                href="https://careerprep.tech/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost text-lg px-8 py-3 flex items-center space-x-2 shadow-lg hover:shadow-xl border-2 border-secondary-200 hover:border-primary-300 transition-all"
              >
                <span>Explore More</span>
                <ArrowRight className="w-5 h-5" />
              </a>
            </motion.div>

            {/* Motivational Quote */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mb-12 max-w-3xl mx-auto"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-2 border-primary-100">
                <p className="text-lg italic text-secondary-700 text-center mb-2">
                  "{motivationalQuotes[0].quote}"
                </p>
              </div>
            </motion.div>

            {/* Our Goals Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-16"
            >
              <h2 className="text-3xl font-bold text-center text-secondary-900 mb-4">
                What You'll <span className="gradient-text">Achieve</span>
              </h2>
              <p className="text-center text-secondary-600 mb-10 max-w-2xl mx-auto">
                Transform your interview skills and unlock your potential with our comprehensive platform
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                {goals.map((goal, index) => (
                  <motion.div
                    key={goal.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                    className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-300 border-2 border-transparent hover:border-primary-300"
                  >
                    <div className={`w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-r ${goal.color} flex items-center justify-center shadow-lg`}>
                      <goal.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-center text-secondary-900 mb-2">
                      {goal.title}
                    </h3>
                    <p className="text-sm text-center text-secondary-600">
                      {goal.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features and Goals Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-secondary-900 mb-4">
              Your Path to <span className="gradient-text">Interview Success</span>
            </h2>
            <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
              Master every aspect of the interview process with our comprehensive AI-powered platform
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card p-8 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border-2 border-transparent hover:border-primary-200"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 shadow-lg`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-secondary-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-secondary-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Target Stats */}
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold text-secondary-900 mb-3">
              Join Our <span className="gradient-text">Journey</span>
            </h3>
            <p className="text-secondary-600">Together, we’re shaping the future of careers and unlocking dreams.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all border-2 border-blue-100"
            >
              <div className="text-4xl font-bold gradient-text mb-2">10,000+</div>
              <div className="text-sm text-secondary-700 font-medium">Interview-Ready Questions</div>
              <div className="text-xs text-secondary-500 mt-1">Continuously updated every week to match real interview</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all border-2 border-green-100"
            >
              <div className="text-4xl font-bold gradient-text mb-2">500+</div>
              <div className="text-sm text-secondary-700 font-medium">Company-Focused Preparation</div>
              <div className="text-xs text-secondary-500 mt-1">Mock tests designed for each company</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all border-2 border-orange-100"
            >
              <div className="text-4xl font-bold gradient-text mb-2">Weekly</div>
              <div className="text-sm text-secondary-700 font-medium">New Mock Interviews</div>
              <div className="text-xs text-secondary-500 mt-1">Designed from real interview experiences</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all border-2 border-purple-100"
            >
              <div className="text-4xl font-bold gradient-text mb-2">99%+</div>
              <div className="text-sm text-secondary-700 font-medium">Success Rate Target</div>
              <div className="text-xs text-secondary-500 mt-1">Because your success is our mission</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-secondary-900 mb-6">
                Why Choose CareerPrep Ai?
              </h2>
              <p className="text-lg text-secondary-600 mb-8">
                Master your interview skills with our comprehensive AI-powered platform 
                designed to help you succeed in technical and behavioral interviews.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center space-x-3"
                  >
                    <CheckCircle className="w-5 h-5 text-success-600 flex-shrink-0" />
                    <span className="text-secondary-700">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-secondary-200 hover:border-primary-200 transition-all duration-300">
                <div className="space-y-4">
                  <div className="h-4 bg-secondary-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-secondary-200 rounded animate-pulse w-3/4"></div>
                  <div className="h-32 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-lg flex items-center justify-center shadow-inner">
                    <Code className="w-12 h-12 text-primary-400" />
                  </div>
                  <div className="flex space-x-2">
                    <div className="h-8 bg-primary-100 rounded w-20 shadow-sm"></div>
                    <div className="h-8 bg-success-100 rounded w-16 shadow-sm"></div>
                  </div>
                </div>
              </div>
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-success-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg animate-bounce">
                Live Coding
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-secondary-50 to-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-secondary-900 mb-4">
                How It Works
              </h2>
              <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
                Get started in minutes and transform your interview skills
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative bg-white rounded-2xl p-8 shadow-xl text-center"
            >
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                1
              </div>
              <div className="pt-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-xl flex items-center justify-center">
                  <Users className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-secondary-900 mb-3">Sign Up Free</h3>
                <p className="text-secondary-600">
                  Create your account in seconds and access thousands of practice questions
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="relative bg-white rounded-2xl p-8 shadow-xl text-center"
            >
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-r from-success-500 to-success-700 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                2
              </div>
              <div className="pt-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-success-100 rounded-xl flex items-center justify-center">
                  <Code className="w-8 h-8 text-success-600" />
                </div>
                <h3 className="text-xl font-bold text-secondary-900 mb-3">Practice Smart</h3>
                <p className="text-secondary-600">
                  Take AI-powered mock interviews with instant feedback and detailed analytics
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative bg-white rounded-2xl p-8 shadow-xl text-center"
            >
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-r from-warning-500 to-warning-700 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                3
              </div>
              <div className="pt-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-warning-100 rounded-xl flex items-center justify-center">
                  <Award className="w-8 h-8 text-warning-600" />
                </div>
                <h3 className="text-xl font-bold text-secondary-900 mb-3">Land Your Job</h3>
                <p className="text-secondary-600">
                  Ace your real interviews with confidence and secure your dream position
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="mb-6">
              <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
                <TrendingUp className="w-4 h-4 text-white mr-2" />
                <span className="text-white text-sm font-medium">Join Our Success Community</span>
              </div>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Your Dream Job Is Within Reach
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Start preparing today and walk into your next interview with confidence, skills, and the winning mindset you deserve.
            </p>
            <Link
              to="/register"
              className="btn bg-white text-primary-600 hover:bg-primary-50 text-lg px-8 py-3 inline-flex items-center space-x-2 shadow-2xl hover:shadow-white/30 transform hover:scale-105 transition-all"
            >
              <span>Get Started for Free</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            
            {/* Additional Quote */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="mt-12 text-white/90 italic"
            >
              <p className="text-lg">"{motivationalQuotes[1].quote}"</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <img
                  src="/image.png"
                  alt="CareerPrep Ai"
                  className="w-10 h-10 rounded-lg object-cover shadow-lg"
                />
                <span className="text-2xl font-bold">CareerPrep Ai</span>
              </div>
              <p className="text-secondary-400 mb-6 max-w-md">
                AI-Powered Interview Preparation Platform helping you master technical and behavioral interviews to land your dream job.
              </p>
              <div className="flex space-x-4">
                <button className="w-10 h-10 bg-secondary-800 hover:bg-primary-600 rounded-full flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </button>
                <button className="w-10 h-10 bg-secondary-800 hover:bg-primary-600 rounded-full flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </button>
                <button className="w-10 h-10 bg-secondary-800 hover:bg-primary-600 rounded-full flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/dashboard" className="text-secondary-400 hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link to="/practice" className="text-secondary-400 hover:text-white transition-colors">Practice</Link></li>
                <li><Link to="/interviews" className="text-secondary-400 hover:text-white transition-colors">Mock Interviews</Link></li>
                <li><Link to="/progress" className="text-secondary-400 hover:text-white transition-colors">Progress</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><button type="button" className="text-secondary-400 hover:text-white transition-colors">Help Center</button></li>
                <li><button type="button" className="text-secondary-400 hover:text-white transition-colors">Privacy Policy</button></li>
                <li><button type="button" className="text-secondary-400 hover:text-white transition-colors">Terms of Service</button></li>
                <li><button type="button" className="text-secondary-400 hover:text-white transition-colors">Contact Us</button></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-secondary-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-secondary-500 text-sm mb-4 md:mb-0">
                © 2026 CareerPrep Ai. All rights reserved. Made with ❤️ for job seekers worldwide.
              </p>
              <div className="flex items-center space-x-2 text-secondary-500 text-sm">
                <Award className="w-4 h-4 text-warning-400" />
                <span>Empowering your career journey</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
