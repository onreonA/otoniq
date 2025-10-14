/**
 * Interactive Demo Page
 * Pre-configured demo scenarios for different user personas
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  demoScenarios,
  getTotalDemoTime,
  formatDemoTime,
  type DemoScenario,
  type DemoStep,
} from './scenarios';
import {
  Play,
  ChevronRight,
  Check,
  Clock,
  Target,
  Sparkles,
  ArrowRight,
  User,
  Building2,
} from 'lucide-react';

export default function DemoPage() {
  const [selectedScenario, setSelectedScenario] = useState<DemoScenario | null>(
    null
  );
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const navigate = useNavigate();

  const startDemo = (scenario: DemoScenario) => {
    setSelectedScenario(scenario);
    setCurrentStepIndex(0);
    setCompletedSteps([]);
    setIsPlaying(false);
  };

  const playDemo = () => {
    if (!selectedScenario) return;
    setIsPlaying(true);

    const playStep = (index: number) => {
      if (index >= selectedScenario.journey.length) {
        setIsPlaying(false);
        return;
      }

      const step = selectedScenario.journey[index];
      setCurrentStepIndex(index);

      // Auto-complete step after its duration
      setTimeout(() => {
        setCompletedSteps(prev => [...prev, step.id]);
        if (index < selectedScenario.journey.length - 1) {
          playStep(index + 1);
        } else {
          setIsPlaying(false);
        }
      }, step.duration * 1000);
    };

    playStep(0);
  };

  const navigateToStep = (step: DemoStep) => {
    if (isPlaying) return;
    navigate(step.page);
  };

  const resetDemo = () => {
    setSelectedScenario(null);
    setCurrentStepIndex(0);
    setCompletedSteps([]);
    setIsPlaying(false);
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900'>
      {/* Animated Background */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute top-0 left-0 w-full h-full'>
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className='absolute w-1 h-1 bg-white/20 rounded-full animate-pulse'
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
      </div>

      <main className='relative pt-20 pb-20'>
        <div className='max-w-7xl mx-auto px-4'>
          {/* Hero Section */}
          {!selectedScenario && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className='text-center mb-16'
            >
              <div className='inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full border border-blue-500/30 mb-6'>
                <Sparkles className='w-4 h-4 mr-2 text-blue-400' />
                <span className='text-blue-300 text-sm font-medium'>
                  İnteraktif Demo Deneyimi
                </span>
              </div>

              <h1 className='text-5xl md:text-6xl font-bold text-white mb-6'>
                <span className='bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent'>
                  Kişiselleştirilmiş
                </span>
                <br />
                Demo Senaryoları
              </h1>

              <p className='text-xl text-gray-300 max-w-3xl mx-auto mb-12'>
                Farklı kullanıcı profillerine özel hazırlanmış gerçekçi demo
                senaryolarını inceleyin. Her senaryo, günlük iş akışlarınızda
                Otoniq.ai'nin nasıl kullanılabileceğini gösterir.
              </p>

              {/* Scenario Selection */}
              <div className='grid md:grid-cols-3 gap-6'>
                {demoScenarios.map((scenario, index) => (
                  <motion.div
                    key={scenario.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className='relative group'
                  >
                    <div className='absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity blur' />
                    <div
                      className='relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 hover:bg-white/15 transition-all cursor-pointer h-full'
                      onClick={() => startDemo(scenario)}
                    >
                      {/* Avatar */}
                      <div className='w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-4xl mb-4 mx-auto'>
                        {scenario.avatar}
                      </div>

                      {/* Info */}
                      <h3 className='text-2xl font-bold text-white mb-2'>
                        {scenario.name}
                      </h3>
                      <p className='text-blue-300 text-sm mb-2 flex items-center justify-center gap-2'>
                        <Building2 className='w-4 h-4' />
                        {scenario.role}
                      </p>
                      <p className='text-gray-300 text-sm mb-6'>
                        {scenario.description}
                      </p>

                      {/* Stats */}
                      <div className='flex items-center justify-center gap-4 mb-6'>
                        <div className='flex items-center gap-1 text-gray-300'>
                          <Clock className='w-4 h-4' />
                          <span className='text-sm'>
                            {formatDemoTime(getTotalDemoTime(scenario))}
                          </span>
                        </div>
                        <div className='flex items-center gap-1 text-gray-300'>
                          <Target className='w-4 h-4' />
                          <span className='text-sm'>
                            {scenario.journey.length} adım
                          </span>
                        </div>
                      </div>

                      {/* Features */}
                      <div className='space-y-2 mb-6'>
                        {scenario.features.slice(0, 4).map((feature, i) => (
                          <div
                            key={i}
                            className='flex items-center gap-2 text-sm text-gray-300'
                          >
                            <div className='w-1.5 h-1.5 bg-blue-400 rounded-full' />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>

                      {/* CTA */}
                      <button className='w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all group-hover:shadow-lg group-hover:shadow-blue-500/50'>
                        <Play className='w-5 h-5' />
                        Demo Başlat
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Selected Scenario View */}
          {selectedScenario && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Header */}
              <div className='bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 mb-8'>
                <div className='flex items-start justify-between mb-6'>
                  <div className='flex items-start gap-6'>
                    <div className='w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-3xl flex-shrink-0'>
                      {selectedScenario.avatar}
                    </div>
                    <div>
                      <h2 className='text-3xl font-bold text-white mb-2'>
                        {selectedScenario.name} - {selectedScenario.role}
                      </h2>
                      <p className='text-gray-300 mb-4 max-w-2xl'>
                        {selectedScenario.description}
                      </p>
                      <div className='flex flex-wrap gap-2'>
                        {selectedScenario.goals.map((goal, i) => (
                          <span
                            key={i}
                            className='px-3 py-1 bg-blue-500/20 text-blue-300 text-sm rounded-full border border-blue-500/30'
                          >
                            {goal}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={resetDemo}
                    className='px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all flex items-center gap-2'
                  >
                    <ChevronRight className='w-4 h-4 rotate-180' />
                    Geri
                  </button>
                </div>

                {/* Controls */}
                <div className='flex items-center justify-between pt-6 border-t border-white/10'>
                  <div className='flex items-center gap-4'>
                    <button
                      onClick={playDemo}
                      disabled={
                        isPlaying ||
                        completedSteps.length ===
                          selectedScenario.journey.length
                      }
                      className='px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold flex items-center gap-2 transition-all'
                    >
                      <Play className='w-5 h-5' />
                      {isPlaying
                        ? 'Demo Oynatılıyor...'
                        : completedSteps.length ===
                            selectedScenario.journey.length
                          ? 'Demo Tamamlandı'
                          : 'Demo Başlat'}
                    </button>
                    {completedSteps.length > 0 && (
                      <button
                        onClick={() => {
                          setCurrentStepIndex(0);
                          setCompletedSteps([]);
                          setIsPlaying(false);
                        }}
                        className='px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all'
                      >
                        Sıfırla
                      </button>
                    )}
                  </div>
                  <div className='text-gray-300 text-sm'>
                    {completedSteps.length} / {selectedScenario.journey.length}{' '}
                    adım tamamlandı
                  </div>
                </div>
              </div>

              {/* Journey Steps */}
              <div className='space-y-4'>
                {selectedScenario.journey.map((step, index) => {
                  const isCompleted = completedSteps.includes(step.id);
                  const isCurrent = index === currentStepIndex && isPlaying;
                  const isUpcoming = index > currentStepIndex && !isCompleted;

                  return (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`relative group ${isUpcoming ? 'opacity-50' : ''}`}
                    >
                      <div className='absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur' />
                      <div
                        className={`relative bg-white/10 backdrop-blur-xl border rounded-2xl p-6 transition-all ${
                          isCompleted
                            ? 'border-green-500/50 bg-green-500/10'
                            : isCurrent
                              ? 'border-blue-500/50 bg-blue-500/10'
                              : 'border-white/20'
                        }`}
                      >
                        <div className='flex items-start gap-6'>
                          {/* Step Number */}
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              isCompleted
                                ? 'bg-green-500'
                                : isCurrent
                                  ? 'bg-blue-500 animate-pulse'
                                  : 'bg-white/20'
                            }`}
                          >
                            {isCompleted ? (
                              <Check className='w-6 h-6 text-white' />
                            ) : (
                              <span className='text-white font-bold'>
                                {index + 1}
                              </span>
                            )}
                          </div>

                          {/* Content */}
                          <div className='flex-1'>
                            <h3 className='text-xl font-bold text-white mb-2'>
                              {step.title}
                            </h3>
                            <p className='text-gray-300 mb-4'>
                              {step.description}
                            </p>

                            {/* Highlights */}
                            {step.highlight.length > 0 && (
                              <div className='flex flex-wrap gap-2 mb-4'>
                                {step.highlight.map((h, i) => (
                                  <span
                                    key={i}
                                    className='px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded border border-purple-500/30'
                                  >
                                    {h}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Action */}
                            <div className='flex items-center justify-between'>
                              <button
                                onClick={() => navigateToStep(step)}
                                disabled={isPlaying}
                                className='text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                              >
                                <span>{step.action}</span>
                                <ArrowRight className='w-4 h-4' />
                              </button>
                              <span className='text-gray-400 text-sm flex items-center gap-1'>
                                <Clock className='w-4 h-4' />
                                {step.duration}s
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Completion Message */}
              <AnimatePresence>
                {completedSteps.length === selectedScenario.journey.length && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className='mt-8 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-xl border border-green-500/30 rounded-3xl p-8 text-center'
                  >
                    <div className='w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4'>
                      <Check className='w-10 h-10 text-white' />
                    </div>
                    <h3 className='text-3xl font-bold text-white mb-4'>
                      🎉 Demo Senaryosu Tamamlandı!
                    </h3>
                    <p className='text-xl text-gray-300 mb-8 max-w-2xl mx-auto'>
                      {selectedScenario.name} için hazırladığımız demo
                      senaryosunu tamamladınız. Otoniq.ai ile günlük iş
                      akışlarınızı nasıl optimize edebileceğinizi gördünüz.
                    </p>
                    <div className='flex flex-col sm:flex-row justify-center gap-4'>
                      <button
                        onClick={resetDemo}
                        className='px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-all'
                      >
                        Başka Senaryo Dene
                      </button>
                      <button
                        onClick={() => navigate('/signup')}
                        className='px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2'
                      >
                        Hemen Başla
                        <ArrowRight className='w-5 h-5' />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
