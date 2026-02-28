import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircle,
  TrendingUp,
  Award,
  ArrowRight,
  Users,
  Zap,
  Lightbulb,
  GraduationCap,
  Brain,
  Code2,
  Target,
  Trophy,
  Sparkles,
  Compass,
  Flame,
  Star,
  Linkedin,
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Interview Simulation',
    description: 'Experience realistic interviews with AI that adapts to your responses and provides intelligent follow-up questions.',
    color: 'from-amber-500 via-orange-500 to-red-500',
    bgGradient: 'from-amber-50 via-orange-50 to-red-50'
  },
  {
    icon: Code2,
    title: 'Real-time Code Evaluation',
    description: 'Get instant feedback on your coding solutions with detailed analysis of correctness, efficiency, and best practices.',
    color: 'from-emerald-500 via-teal-500 to-cyan-500',
    bgGradient: 'from-emerald-50 via-teal-50 to-cyan-50'
  },
  {
    icon: Users,
    title: 'Behavioral Interview Training',
    description: 'Master behavioral questions with STAR method guidance and personalized feedback on your communication skills.',
    color: 'from-amber-500 via-yellow-500 to-orange-500',
    bgGradient: 'from-amber-50 via-yellow-50 to-orange-50'
  },
  {
    icon: Zap,
    title: 'Intelligent Preparation Guide',
    description: 'Receive customized study plans and preparation strategies tailored to your target company and role.',
    color: 'from-rose-500 via-pink-500 to-purple-500',
    bgGradient: 'from-rose-50 via-pink-50 to-purple-50'
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
  { quote: "Success is where preparation meets opportunity.", author: "Zig Ziglar" },
  { quote: "The expert in anything was once a beginner.", author: "Helen Hayes" },
  { quote: "Practice isn't the thing you do once you're good. It's the thing you do that makes you good.", author: "Malcolm Gladwell" },
  { quote: "Your future is created by what you do today, not tomorrow.", author: "Robert Kiyosaki" },
  { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" }
];

const goals = [
  { 
    icon: Target, 
    title: 'Master Technical Skills', 
    description: 'Build confidence in coding, algorithms, and system design',
    color: 'from-amber-500 via-orange-500 to-red-500',
    bgGradient: 'from-amber-50 via-orange-50 to-red-50',
    achievement: 'Expert Level'
  },
  { 
    icon: Users, 
    title: 'Ace Behavioral Questions', 
    description: 'Perfect your STAR method and communication skills',
    color: 'from-emerald-500 via-teal-500 to-cyan-500',
    bgGradient: 'from-emerald-50 via-teal-50 to-cyan-50',
    achievement: 'Communication Pro'
  },
  { 
    icon: TrendingUp, 
    title: 'Track Your Progress', 
    description: 'Monitor improvement and identify areas to focus',
    color: 'from-amber-500 via-yellow-500 to-orange-500',
    bgGradient: 'from-amber-50 via-yellow-50 to-orange-50',
    achievement: 'Data Driven'
  },
  {
    icon: Trophy,
    title: 'Land Dream Job', 
    description: 'Secure offers from top tech companies worldwide',
    color: 'from-rose-500 via-pink-500 to-purple-500',
    bgGradient: 'from-rose-50 via-pink-50 to-purple-50',
    achievement: 'Career Success'
  },
];

const HomePage = () => {
  const [currentQuoteIndex, setCurrentQuoteIndex] = React.useState(0);
  const [logoError, setLogoError] = React.useState(false);
  const [showMobileMenu, setShowMobileMenu] = React.useState(false);
  
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % motivationalQuotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen animated-bg">
      {/* Navigation */}
      <nav className="glass sticky top-0 z-50 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              {!logoError ? (
                <img
                  src="/logo.jpeg"
                  alt="CareerPrep"
                  className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-sm"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center shadow-sm">
                  <GraduationCap className="w-5 h-5" />
                </div>
              )}
              <span className="text-xl font-bold gradient-text">CareerPrep</span>
            </div>

            {/* Mobile menu button */}
            <div className="sm:hidden">
              <button
                type="button"
                className="p-2 rounded-lg text-slate-600 hover:bg-primary-50 focus:outline-none"
                onClick={() => setShowMobileMenu((prev) => !prev)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            {/* Auth Buttons (desktop) */}
            <div className="hidden sm:flex items-center space-x-4">
              <Link
                to="/login"
                className="text-slate-600 hover:text-slate-900 font-medium transition-all hover:scale-105"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="btn btn-premium shadow-xl hover:shadow-2xl"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
        {/* Mobile menu dropdown */}
        {showMobileMenu && (
          <div className="sm:hidden bg-white border-t border-slate-200 shadow-lg absolute w-full left-0 top-16 z-50">
            <div className="flex flex-col items-center py-4 space-y-2">
              <Link
                to="/login"
                className="w-full text-center py-2 text-slate-600 hover:text-primary-600 font-medium"
                onClick={() => setShowMobileMenu(false)}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="w-full text-center py-2 btn btn-premium shadow-xl"
                onClick={() => setShowMobileMenu(false)}
              >
                <Sparkles className="w-4 h-4 mr-2 inline" />
                Get Started Free
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 sm:py-20 sm:py-32">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full blur-3xl opacity-30 float-animation"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-amber-200 to-orange-200 rounded-full blur-3xl opacity-30 float-animation" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-gradient-to-r from-emerald-200 to-teal-200 rounded-full blur-3xl opacity-30 float-animation" style={{animationDelay: '4s'}}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            {/* Trust Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center glass px-6 py-3 rounded-full text-sm font-semibold mb-8 border border-white/30"
            >
              <Flame className="w-4 h-4 mr-2 text-orange-500" />
              <span className="gradient-text-premium">Your Journey to Success Starts Here</span>
              <Star className="w-4 h-4 ml-2 text-amber-500" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl sm:text-5xl md:text-7xl font-bold mb-6 leading-tight"
            >
              <span className="block mb-2">Master Your Next</span>
              <span className="gradient-text">Interview</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-base sm:text-xl md:text-2xl text-slate-600 mb-6 sm:mb-10 max-w-4xl mx-auto leading-relaxed"
            >
              Prepare smarter with AI-powered interview simulation, real-time feedback, 
              and personalized guidance tailored to your dream company.
              <br />
              <span className="gradient-text-premium font-semibold">Land your dream job with confidence.</span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-10 sm:mb-16"
            >
              <Link
                to="/register"
                className="btn btn-premium text-base sm:text-lg px-6 sm:px-10 py-3 sm:py-4 flex items-center space-x-3 shadow-2xl hover:shadow-3xl w-full sm:w-auto"
              >
                <span>Start Practicing Free</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              
              <a
                href="https://careerprep.tech/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn glass text-base sm:text-lg px-6 sm:px-10 py-3 sm:py-4 flex items-center space-x-3 border-2 border-white/30 hover:border-white/50 w-full sm:w-auto"
              >
                <Compass className="w-5 h-5" />
                <span>Explore More</span>
                <ArrowRight className="w-5 h-5" />
              </a>
            </motion.div>

            {/* Motivational Quote */}
            <motion.div
              key={currentQuoteIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-16 max-w-4xl mx-auto"
            >
              <div className="glass rounded-3xl p-8 shadow-2xl border border-white/30">
                <p className="text-xl italic text-slate-700 text-center mb-3">
                  "{motivationalQuotes[currentQuoteIndex].quote}"
                </p>
                <p className="text-sm text-slate-500 text-center font-medium">
                  — {motivationalQuotes[currentQuoteIndex].author}
                </p>
              </div>
            </motion.div>

            {/* Our Goals Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-20"
            >
              <h2 className="text-4xl font-bold text-center mb-4">
                What You'll <span className="gradient-text">Achieve</span>
              </h2>
              <p className="text-center text-slate-600 mb-12 max-w-3xl mx-auto text-lg">
                Transform your interview skills and unlock your potential with our comprehensive platform
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-6xl mx-auto">
                {goals.map((goal, index) => (
                  <motion.div
                    key={goal.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                    className={`glass p-8 card-hover border-2 border-white/30 relative overflow-hidden`}
                  >
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${goal.color}`}></div>
                    <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${goal.color} flex items-center justify-center shadow-xl`}>
                      <goal.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-slate-900 mb-3">
                        {goal.title}
                      </h3>
                      <p className="text-sm text-slate-600 mb-4">
                        {goal.description}
                      </p>
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 text-xs font-semibold border border-amber-200">
                        <Trophy className="w-3 h-3 mr-1" />
                        {goal.achievement}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 animated-bg-premium">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                Your Path to <span className="gradient-text-premium">Interview Success</span>
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Master every aspect of the interview process with our comprehensive AI-powered platform
              </p>
            </motion.div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10 mb-10 sm:mb-20">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`glass p-10 card-hover border-2 border-white/30 relative overflow-hidden`}
                style={{background: `linear-gradient(135deg, ${feature.bgGradient} 0%, rgba(255,255,255,0.8) 100%)`}}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r opacity-80" style={{background: `linear-gradient(90deg, ${feature.color.split(' ').join(', ')})`}}></div>
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-8 shadow-2xl`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-slate-600 text-lg leading-relaxed">
                  {feature.description}
                </p>
                <div className="mt-6 flex items-center text-amber-600 font-semibold">
                  <Lightbulb className="w-5 h-5 mr-2" />
                  <span>Smart Learning</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Achievement Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h3 className="text-3xl font-bold mb-4">
              Join Our <span className="gradient-text">Success Community</span>
            </h3>
            <p className="text-slate-600 text-lg mb-12">Together, we're shaping the future of careers and unlocking dreams.</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="stats-card"
              >
                <div className="text-5xl font-bold gradient-text mb-3">10,000+</div>
                <div className="text-sm text-slate-700 font-medium mb-2">Interview Questions</div>
                <div className="text-xs text-slate-500">Updated weekly with real interview scenarios</div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="stats-card"
              >
                <div className="text-5xl font-bold gradient-text-success mb-3">500+</div>
                <div className="text-sm text-slate-700 font-medium mb-2">Company Focus</div>
                <div className="text-xs text-slate-500">Tailored preparation for top tech companies</div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="stats-card"
              >
                <div className="text-5xl font-bold gradient-text-premium mb-3">Weekly</div>
                <div className="text-sm text-slate-700 font-medium mb-2">New Content</div>
                <div className="text-xs text-slate-500">Fresh mock interviews from real experiences</div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                className="stats-card"
              >
                <div className="text-5xl font-bold gradient-text mb-3">99%+</div>
                <div className="text-sm text-slate-700 font-medium mb-2">Success Target</div>
                <div className="text-xs text-slate-500">Your success is our ultimate mission</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12 items-center">
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
                    <Code2 className="w-12 h-12 text-primary-400" />
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

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
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
                  <Code2 className="w-8 h-8 text-success-600" />
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
        
        <div className="max-w-4xl mx-auto text-center px-2 sm:px-6 lg:px-8 relative z-10">
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
      <footer className="bg-sidebar-950 border-t border-secondary-800 mt-16" aria-label="Site Footer">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <section aria-labelledby="footer-brand" className="col-span-1">
              <h2 id="footer-brand" className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-primary-400" /> CareerPrep Ai
              </h2>
              <p className="text-secondary-400 text-sm mb-4">Your all-in-one platform for interview, coding, and career preparation.</p>
              <nav aria-label="Social Media" className="flex space-x-3 mt-2">
                <a href="https://linkedin.com/company/careerprepai" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-10 h-10 bg-secondary-800 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400">
                  <Linkedin className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                </a>
              </nav>
            </section>

            <section aria-labelledby="footer-quick-links" className="col-span-1">
              <h3 id="footer-quick-links" className="text-lg font-bold mb-4 text-white">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/login" className="text-secondary-300 hover:text-primary-400 font-medium transition-colors">Sign In</Link></li>
              </ul>
            </section>

            <section aria-labelledby="footer-support" className="col-span-1">
              <h3 id="footer-support" className="text-lg font-bold mb-4 text-white">Support</h3>
              <ul className="space-y-2">
                <li><a href="mailto:info@careerprep.tech" className="text-secondary-300 hover:text-primary-400 font-medium transition-colors">Contact Us</a></li>
                <li><a href="mailto:info@careerprep.tech" className="text-secondary-300 hover:text-primary-400 font-medium transition-colors">Help Support</a></li>
                <li><Link to="/privacy" className="text-secondary-300 hover:text-primary-400 font-medium transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-secondary-300 hover:text-primary-400 font-medium transition-colors">Terms of Service</Link></li>
              </ul>
            </section>

            <section aria-labelledby="footer-platforms" className="col-span-1">
              <h3 id="footer-platforms" className="text-lg font-bold mb-4 text-white">Platforms & Tools</h3>
              <ul className="space-y-2">
                <li><a href="https://contest.careerprep.tech" target="_blank" rel="noopener noreferrer" className="text-secondary-300 hover:text-primary-400 font-medium transition-colors">Contest Board</a></li>
                <li><a href="https://resumegenie.careerprep.tech" target="_blank" rel="noopener noreferrer" className="text-secondary-300 hover:text-primary-400 font-medium transition-colors">Resume Builder</a></li>
                <li><a href="https://resumegenieai.careerprep.tech" target="_blank" rel="noopener noreferrer" className="text-secondary-300 hover:text-primary-400 font-medium transition-colors">Resume Optimizer</a></li>
                <li><a href="https://codeanalyser.careerprep.tech" target="_blank" rel="noopener noreferrer" className="text-secondary-300 hover:text-primary-400 font-medium transition-colors">Code Analyser</a></li>
                <li><a href="https://patterns.careerprep.tech" target="_blank" rel="noopener noreferrer" className="text-secondary-300 hover:text-primary-400 font-medium transition-colors">Patterns (Similar Qs)</a></li>
                <li><a href="https://interview.careerprep.tech" target="_blank" rel="noopener noreferrer" className="text-secondary-300 hover:text-primary-400 font-medium transition-colors">Company Sheets</a></li>
                <li><a href="https://notes.careerprep.tech" target="_blank" rel="noopener noreferrer" className="text-secondary-300 hover:text-primary-400 font-medium transition-colors">University Notes</a></li>
              </ul>
            </section>
          </div>

          <div className="border-t border-secondary-800 pt-8 mt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-secondary-400 text-sm mb-4 sm:mb-0 text-center sm:text-left">
                © 2026 CareerPrep Ai. All rights reserved. Built for job seekers worldwide.
              </p>
              <div className="flex items-center space-x-2 text-secondary-300 text-sm">
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
