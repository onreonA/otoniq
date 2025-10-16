/**
 * FeatureIntro Component
 * Informative, colorful banner to guide users on what they can do on each page
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

type Action = {
  label: string;
  onClick?: () => void;
  to?: string;
  variant?: 'primary' | 'secondary';
};

type Props = {
  storageKey: string;
  title: string;
  subtitle: string;
  items: string[];
  actions?: Action[];
  variant?: 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'indigo';
  dismissible?: boolean;
  icon?: string;
};

export default function FeatureIntro({
  storageKey,
  title,
  subtitle,
  items,
  actions = [],
  variant = 'blue',
  dismissible = true,
  icon = 'ri-information-line',
}: Props) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(`otoniq-intro-hidden-${storageKey}`);
    if (stored === 'true') {
      setHidden(true);
    }
  }, [storageKey]);

  const handleDismiss = () => {
    localStorage.setItem(`otoniq-intro-hidden-${storageKey}`, 'true');
    setHidden(true);
  };

  if (hidden) return null;

  const variants = {
    blue: {
      gradient: 'from-blue-600/20 to-cyan-600/20',
      icon: 'from-blue-500 to-cyan-500',
      checkIcon: 'text-cyan-400',
    },
    green: {
      gradient: 'from-emerald-600/20 to-teal-600/20',
      icon: 'from-emerald-500 to-teal-500',
      checkIcon: 'text-emerald-400',
    },
    purple: {
      gradient: 'from-purple-600/20 to-fuchsia-600/20',
      icon: 'from-purple-500 to-fuchsia-500',
      checkIcon: 'text-fuchsia-400',
    },
    orange: {
      gradient: 'from-orange-600/20 to-amber-600/20',
      icon: 'from-orange-500 to-amber-500',
      checkIcon: 'text-amber-400',
    },
    pink: {
      gradient: 'from-pink-600/20 to-rose-600/20',
      icon: 'from-pink-500 to-rose-500',
      checkIcon: 'text-rose-400',
    },
    indigo: {
      gradient: 'from-indigo-600/20 to-purple-600/20',
      icon: 'from-indigo-500 to-purple-500',
      checkIcon: 'text-indigo-400',
    },
  };

  const currentVariant = variants[variant];

  return (
    <div
      className={`mb-6 bg-gradient-to-r ${currentVariant.gradient} backdrop-blur-sm border border-white/10 rounded-2xl p-6 animate-fadeIn`}
    >
      <div className='flex items-start justify-between gap-4'>
        <div className='flex-1'>
          {/* Header with Icon */}
          <div className='flex items-center gap-3 mb-3'>
            <div
              className={`w-12 h-12 bg-gradient-to-r ${currentVariant.icon} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}
            >
              <i className={`${icon} text-white text-2xl`}></i>
            </div>
            <div>
              <h2 className='text-xl font-bold text-white'>{title}</h2>
              <p className='text-gray-300 text-sm'>{subtitle}</p>
            </div>
          </div>

          {/* Feature Items */}
          <ul className='grid sm:grid-cols-2 gap-2 mb-4'>
            {items.map((item, index) => (
              <li
                key={index}
                className='text-gray-200 text-sm flex items-start gap-2'
              >
                <i
                  className={`ri-checkbox-circle-fill ${currentVariant.checkIcon} text-lg flex-shrink-0 mt-0.5`}
                ></i>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          {/* Action Buttons */}
          {actions.length > 0 && (
            <div className='flex flex-wrap gap-2'>
              {actions.map((action, index) => {
                const isPrimary = action.variant === 'primary';
                const buttonClass = isPrimary
                  ? `px-4 py-2 rounded-xl bg-gradient-to-r ${currentVariant.icon} text-white font-medium hover:shadow-lg transition-all duration-300 cursor-pointer`
                  : 'px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium transition-all duration-300 cursor-pointer';

                if (action.to) {
                  return (
                    <Link key={index} to={action.to} className={buttonClass}>
                      {action.label}
                    </Link>
                  );
                }

                return (
                  <button
                    key={index}
                    onClick={action.onClick}
                    className={buttonClass}
                  >
                    {action.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Dismiss Button */}
        {dismissible && (
          <button
            onClick={handleDismiss}
            className='text-gray-400 hover:text-white transition-colors flex-shrink-0'
            aria-label='Kapat'
            title='Bu mesajı bir daha gösterme'
          >
            <i className='ri-close-line text-2xl'></i>
          </button>
        )}
      </div>
    </div>
  );
}
