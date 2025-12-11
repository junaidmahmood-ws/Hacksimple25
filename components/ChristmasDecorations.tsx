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
  <div className="w-full h-8 flex justify-around pointer-events-none px-6 z-[100] relative bg-gradient-to-b from-white to-transparent">
    {/* Wire */}
    <div className="absolute top-3 left-0 right-0 h-0.5 bg-gray-500" />
    {Array.from({ length: 25 }).map((_, i) => (
      <div 
        key={i}
        className="relative flex flex-col items-center"
        style={{ animationDelay: `${i * 0.15}s` }}
      >
        {/* Wire connector */}
        <div className="w-0.5 h-2 bg-gray-600" />
        {/* Light bulb */}
        <div 
          className={`w-4 h-5 rounded-full shadow-lg ${
            ['bg-red-500', 'bg-green-500', 'bg-yellow-400', 'bg-blue-500', 'bg-pink-500'][i % 5]
          }`}
          style={{ 
            boxShadow: `0 0 12px 4px ${
               ['#ef4444', '#22c55e', '#facc15', '#3b82f6', '#ec4899'][i % 5]
            }, inset 0 -2px 4px rgba(0,0,0,0.2)`,
            animation: `twinkle ${1 + (i % 3) * 0.5}s ease-in-out infinite`,
            animationDelay: `${i * 0.1}s`
          }}
        />
      </div>
    ))}
    <style>{`
      @keyframes twinkle {
        0%, 100% { opacity: 1; filter: brightness(1); }
        50% { opacity: 0.7; filter: brightness(1.3); }
      }
    `}</style>
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

