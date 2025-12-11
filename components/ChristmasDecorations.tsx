import React from 'react';

export const SantaHat = ({ className = "" }: { className?: string }) => null;

export const MiniSantaHat = ({ className = "" }: { className?: string }) => null;

export const ChristmasLights = () => (
  <div className="absolute top-3 left-0 right-0 h-4 flex justify-between overflow-hidden pointer-events-none z-50 px-6">
    {Array.from({ length: 18 }).map((_, i) => (
      <div 
        key={i}
        className={`w-2.5 h-2.5 rounded-full ${
          ['bg-[#d92626]', 'bg-[#0a8a58]', 'bg-amber-400', 'bg-[#1976d2]'][i % 4]
        }`}
        style={{ 
          marginTop: i % 2 === 0 ? '-4px' : '0px',
          animationDelay: `${i * 0.15}s`,
          boxShadow: `0 0 8px ${
             ['#d92626', '#0a8a58', '#f59e0b', '#1976d2'][i % 4]
          }`,
          opacity: 0.85
        }}
      />
    ))}
    {/* Wire */}
    <div className="absolute top-0 left-0 right-0 h-px bg-[#bdbdbd]" style={{ transform: 'translateY(2px)' }}></div>
  </div>
);

export const SnowDrift = ({ className = "" }: { className?: string }) => (
    <div className={`absolute bottom-0 left-0 right-0 h-8 pointer-events-none ${className}`} style={{
        background: 'radial-gradient(10px 10px at 50% 100%, transparent 50%, white 51%) repeat-x',
        backgroundSize: '20px 20px'
    }}></div>
);

export const Snowflakes = () => (
    <div className="fixed inset-0 pointer-events-none z-[1]" aria-hidden="true">
        {Array.from({ length: 12 }).map((_, i) => (
            <div
                key={i}
                className="text-white opacity-20 absolute animate-bounce"
                style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    fontSize: `${Math.random() * 20 + 10}px`,
                    animationDuration: `${Math.random() * 5 + 5}s`,
                    animationDelay: `${Math.random() * 5}s`
                }}
            >
                ❄
            </div>
        ))}
    </div>
)

