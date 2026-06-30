'use client';

import React from 'react';

interface WaveformProps {
  isPlaying: boolean;
}

export const Waveform: React.FC<WaveformProps> = ({ isPlaying }) => {
  const barClasses = [
    'quiet', 'normal', 'loud', 'normal', 'quiet',
    'loud', 'normal', 'quiet', 'loud', 'normal',
    'quiet', 'normal', 'loud', 'quiet', 'normal'
  ];

  return (
    <div className="flex items-end justify-center h-8 gap-[2px] px-2 select-none">
      {barClasses.map((type, idx) => (
        <span
          key={idx}
          className={`waveform-bar ${isPlaying ? type : ''}`}
          style={{
            height: isPlaying ? undefined : '4px',
            animationDelay: isPlaying ? `${idx * 0.1}s` : undefined
          }}
        />
      ))}
    </div>
  );
};

export default Waveform;
