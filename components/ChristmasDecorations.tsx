import React from 'react';

export const SantaHat = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Red Hat Part */}
    <path d="M10 80 C 10 80, 40 10, 80 80" fill="#D42426" stroke="#D42426" strokeWidth="2" />
    {/* White Pom Pom */}
    <circle cx="80" cy="80" r="10" fill="white" />
    <circle cx="80" cy="80" r="10" stroke="#f0f0f0" strokeWidth="2" />
    {/* White Brim */}
    <rect x="5" y="80" width="80" height="15" rx="5" fill="white" />
    <rect x="5" y="80" width="80" height="15" rx="5" stroke="#f0f0f0" strokeWidth="2" />
  </svg>
);

export const MiniSantaHat = ({ className = "" }: { className?: string }) => (
    <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M8 52 L56 52 L56 44 C56 44 56 40 50 40 L14 40 C8 40 8 44 8 44 Z" fill="#FFFFFF" />
        <path d="M12 40 C12 40 32 -10 52 40" fill="#EF4444" />
        <circle cx="52" cy="40" r="6" fill="#FFFFFF" />
    </svg>
);

export const ChristmasLights = () => (
  <div className="absolute top-4 left-0 right-0 h-4 flex justify-between overflow-hidden pointer-events-none z-50 px-4">
    {Array.from({ length: 20 }).map((_, i) => (
      <div 
        key={i}
        className={`w-3 h-3 rounded-full shadow-md animate-pulse ${
          ['bg-red-500', 'bg-green-500', 'bg-yellow-400', 'bg-blue-500'][i % 4]
        }`}
        style={{ 
          marginTop: i % 2 === 0 ? '-5px' : '0px',
          animationDelay: `${i * 0.1}s`,
          boxShadow: `0 0 10px ${
             ['#ef4444', '#22c55e', '#facc15', '#3b82f6'][i % 4]
          }`
        }}
      />
    ))}
    {/* Wire */}
    <div className="absolute top-0 left-0 right-0 h-px bg-gray-400" style={{ transform: 'translateY(2px)' }}></div>
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

