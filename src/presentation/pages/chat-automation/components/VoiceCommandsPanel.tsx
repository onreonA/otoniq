/**
 * Voice Commands Panel Component
 * Voice-to-text simulation and command recognition
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, Zap, CheckCircle } from 'lucide-react';
import { mockVoiceCommands, VoiceCommand } from '../../../mocks/chatAutomation';

export default function VoiceCommandsPanel() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognizedCommand, setRecognizedCommand] =
    useState<VoiceCommand | null>(null);
  const [commandHistory, setCommandHistory] = useState<
    { command: VoiceCommand; timestamp: string }[]
  >([]);

  const simulateVoiceRecognition = () => {
    if (isListening) {
      // Stop listening
      setIsListening(false);
      return;
    }

    // Start listening
    setIsListening(true);
    setTranscript('');
    setRecognizedCommand(null);

    // Simulate transcription
    const exampleTexts = [
      'Bugünkü siparişleri göster',
      'Stokta olmayan ürünleri listele',
      'Haftalık satış raporu oluştur',
      'En çok satan ürünleri göster',
      'Müşteri destek durumunu kontrol et',
    ];
    const randomText =
      exampleTexts[Math.floor(Math.random() * exampleTexts.length)];

    let currentText = '';
    const words = randomText.split(' ');

    words.forEach((word, index) => {
      setTimeout(
        () => {
          currentText += (index > 0 ? ' ' : '') + word;
          setTranscript(currentText);

          // After last word, recognize command
          if (index === words.length - 1) {
            setTimeout(() => {
              const matchedCommand = mockVoiceCommands.find(
                cmd => cmd.command.toLowerCase() === currentText.toLowerCase()
              );
              if (matchedCommand) {
                setRecognizedCommand(matchedCommand);
                setCommandHistory([
                  {
                    command: matchedCommand,
                    timestamp: new Date().toISOString(),
                  },
                  ...commandHistory.slice(0, 4),
                ]);
              }
              setIsListening(false);
            }, 500);
          }
        },
        300 * (index + 1)
      );
    });
  };

  const getCategoryColor = (category: VoiceCommand['category']) => {
    switch (category) {
      case 'order':
        return 'bg-blue-500/20 text-blue-400';
      case 'product':
        return 'bg-green-500/20 text-green-400';
      case 'report':
        return 'bg-purple-500/20 text-purple-400';
      case 'support':
        return 'bg-pink-500/20 text-pink-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className='space-y-6'>
      {/* Voice Input Section */}
      <motion.div
        className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h3 className='text-lg font-semibold text-white mb-4'>
          🎙️ Sesli Komut Asistanı
        </h3>

        {/* Microphone Button */}
        <div className='flex flex-col items-center justify-center py-8'>
          <motion.button
            onClick={simulateVoiceRecognition}
            className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all ${
              isListening
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
            whileTap={{ scale: 0.95 }}
          >
            {isListening ? (
              <>
                <MicOff size={48} className='text-white' />
                <motion.div
                  className='absolute inset-0 rounded-full border-4 border-red-400'
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </>
            ) : (
              <Mic size={48} className='text-white' />
            )}
          </motion.button>

          <p className='text-gray-300 mt-4 text-center'>
            {isListening
              ? 'Dinleniyor... (Simülasyon)'
              : 'Sesli komut için tıklayın'}
          </p>
        </div>

        {/* Transcript Display */}
        <AnimatePresence>
          {transcript && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className='bg-white/5 border border-white/10 rounded-xl p-4 mb-4'
            >
              <div className='flex items-start gap-3'>
                <Volume2
                  size={20}
                  className='text-blue-400 flex-shrink-0 mt-1'
                />
                <div className='flex-1'>
                  <p className='text-sm text-gray-400 mb-1'>Algılanan Metin:</p>
                  <p className='text-lg text-white font-medium'>{transcript}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recognized Command */}
        <AnimatePresence>
          {recognizedCommand && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className='bg-green-600/20 border border-green-500/30 rounded-xl p-4'
            >
              <div className='flex items-start gap-3'>
                <CheckCircle
                  size={20}
                  className='text-green-400 flex-shrink-0 mt-1'
                />
                <div className='flex-1'>
                  <p className='text-sm text-gray-400 mb-2'>Tanınan Komut:</p>
                  <div className='flex items-center gap-2 mb-2'>
                    <Zap size={16} className='text-yellow-400' />
                    <p className='text-lg text-white font-semibold'>
                      {recognizedCommand.command}
                    </p>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-medium ${getCategoryColor(
                        recognizedCommand.category
                      )}`}
                    >
                      {recognizedCommand.category}
                    </span>
                    <span className='text-sm text-gray-300'>
                      Action:{' '}
                      <code className='text-blue-400'>
                        {recognizedCommand.action}
                      </code>
                    </span>
                    <span className='text-sm text-green-400'>
                      ✓ {Math.round(recognizedCommand.confidence * 100)}% güven
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Available Commands */}
      <motion.div
        className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <h3 className='text-lg font-semibold text-white mb-4'>
          📋 Kullanılabilir Komutlar
        </h3>

        <div className='space-y-3'>
          {mockVoiceCommands.map((command, index) => (
            <motion.div
              key={command.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className='bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors'
            >
              <div className='flex items-start justify-between gap-3'>
                <div className='flex-1'>
                  <div className='flex items-center gap-2 mb-2'>
                    <Mic size={14} className='text-blue-400' />
                    <p className='font-semibold text-white'>
                      {command.command}
                    </p>
                  </div>
                  <p className='text-sm text-gray-400 mb-2'>
                    <span className='text-gray-500'>Örnek:</span>{' '}
                    {command.example}
                  </p>
                  <div className='flex items-center gap-2 flex-wrap'>
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-medium ${getCategoryColor(
                        command.category
                      )}`}
                    >
                      {command.category}
                    </span>
                    <span className='text-xs text-gray-500'>
                      Action:{' '}
                      <code className='text-blue-400'>{command.action}</code>
                    </span>
                  </div>
                </div>
                <div className='text-right'>
                  <p className='text-xs text-gray-400'>Güven</p>
                  <p className='text-sm font-semibold text-green-400'>
                    {Math.round(command.confidence * 100)}%
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Command History */}
      {commandHistory.length > 0 && (
        <motion.div
          className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <h3 className='text-lg font-semibold text-white mb-4'>
            🕐 Komut Geçmişi
          </h3>

          <div className='space-y-2'>
            {commandHistory.map((entry, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className='bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between'
              >
                <div className='flex items-center gap-3'>
                  <CheckCircle size={16} className='text-green-400' />
                  <p className='text-sm text-white'>{entry.command.command}</p>
                </div>
                <span className='text-xs text-gray-400'>
                  {new Date(entry.timestamp).toLocaleTimeString('tr-TR')}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
