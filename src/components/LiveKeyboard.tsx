import React, { useEffect, useState } from 'react';

interface LiveKeyboardProps {
  activeKey: string | null;
}

const keyboardLayout = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
  ['Tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
  ['CapsLock', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', '\'', 'Enter'],
  ['Shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'Shift'],
  ['Ctrl', 'Option', 'Space', 'Option', 'Ctrl']
];

const fingerKeyMap: Record<string, string> = {
  '`': 'left-pinky', '1': 'left-pinky', '2': 'left-ring', '3': 'left-middle', '4': 'left-index', '5': 'left-index',
  '6': 'right-index', '7': 'right-index', '8': 'right-middle', '9': 'right-ring', '0': 'right-pinky', '-': 'right-pinky', '=': 'right-pinky',
  'Q': 'left-pinky', 'W': 'left-ring', 'E': 'left-middle', 'R': 'left-index', 'T': 'left-index',
  'Y': 'right-index', 'U': 'right-index', 'I': 'right-middle', 'O': 'right-ring', 'P': 'right-pinky', '[': 'right-pinky', ']': 'right-pinky', '\\': 'right-pinky',
  'A': 'left-pinky', 'S': 'left-ring', 'D': 'left-middle', 'F': 'left-index', 'G': 'left-index',
  'H': 'right-index', 'J': 'right-index', 'K': 'right-middle', 'L': 'right-ring', ';': 'right-pinky', '\'': 'right-pinky',
  'Z': 'left-pinky', 'X': 'left-ring', 'C': 'left-middle', 'V': 'left-index', 'B': 'left-index',
  'N': 'right-index', 'M': 'right-index', ',': 'right-middle', '.': 'right-ring', '/': 'right-pinky',
  ' ': 'thumb', 'SPACE': 'thumb'
};

export const LiveKeyboard: React.FC<LiveKeyboardProps> = ({ activeKey }) => {
  const [highlightedKey, setHighlightedKey] = useState<string | null>(null);
  const [activeFinger, setActiveFinger] = useState<string | null>(null);

  useEffect(() => {
    if (activeKey) {
      const upperKey = activeKey.toUpperCase();
      setHighlightedKey(upperKey);
      setActiveFinger(fingerKeyMap[upperKey] || null);

      const timer = setTimeout(() => {
        setHighlightedKey(null);
        setActiveFinger(null);
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [activeKey]);

  const getKeyClasses = (key: string) => {
    const baseClasses = 'rounded border-2 font-medium text-sm transition-all duration-100 flex items-center justify-center';
    const isActive = highlightedKey === key ||
                     (key === 'SPACE' && highlightedKey === ' ') ||
                     (key === 'Space' && highlightedKey === ' ');

    if (isActive) {
      return `${baseClasses} bg-blue-500 text-white border-blue-600 shadow-lg scale-105`;
    }
    return `${baseClasses} bg-white text-gray-700 border-gray-300 shadow-sm`;
  };

  const getKeyWidth = (key: string) => {
    if (key === 'Backspace') return '80px';
    if (key === 'Tab') return '70px';
    if (key === 'CapsLock') return '85px';
    if (key === 'Enter') return '90px';
    if (key === 'Shift') return '100px';
    if (key === 'Space') return '320px';
    if (key === 'Ctrl' || key === 'Option') return '60px';
    return '48px';
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-50 border-t-2 border-gray-200 py-4 z-40">
      <div className="max-w-5xl mx-auto relative px-4">
        <svg
          className="absolute inset-0 pointer-events-none"
          style={{ width: '100%', height: '280px', top: '-20px' }}
          viewBox="0 0 1000 280"
          preserveAspectRatio="xMidYMid meet"
        >
          <g transform="translate(120, 120)">
            <g className={`transition-opacity duration-200 ${activeFinger === 'left-pinky' ? 'opacity-100' : 'opacity-30'}`}>
              <path d="M 20 20 Q 15 10 10 20 L 8 50 Q 8 55 12 55 L 18 55 Q 22 55 22 50 Z" fill="#4A90E2" opacity="0.3" stroke="#4A90E2" strokeWidth="1"/>
            </g>
            <g className={`transition-opacity duration-200 ${activeFinger === 'left-ring' ? 'opacity-100' : 'opacity-30'}`}>
              <path d="M 45 5 Q 42 -5 38 5 L 33 55 Q 33 60 37 60 L 43 60 Q 47 60 47 55 Z" fill="#4A90E2" opacity="0.3" stroke="#4A90E2" strokeWidth="1"/>
            </g>
            <g className={`transition-opacity duration-200 ${activeFinger === 'left-middle' ? 'opacity-100' : 'opacity-30'}`}>
              <path d="M 70 0 Q 68 -8 64 0 L 58 58 Q 58 63 62 63 L 68 63 Q 72 63 72 58 Z" fill="#4A90E2" opacity="0.3" stroke="#4A90E2" strokeWidth="1"/>
            </g>
            <g className={`transition-opacity duration-200 ${activeFinger === 'left-index' ? 'opacity-100' : 'opacity-30'}`}>
              <path d="M 95 8 Q 93 0 89 8 L 83 56 Q 83 61 87 61 L 93 61 Q 97 61 97 56 Z" fill="#4A90E2" opacity="0.3" stroke="#4A90E2" strokeWidth="1"/>
            </g>
            <g className={`transition-opacity duration-200 ${activeFinger === 'thumb' ? 'opacity-100' : 'opacity-30'}`}>
              <ellipse cx="140" cy="90" rx="35" ry="18" fill="#4A90E2" opacity="0.3" stroke="#4A90E2" strokeWidth="1"/>
            </g>
          </g>

          <g transform="translate(580, 120)">
            <g className={`transition-opacity duration-200 ${activeFinger === 'right-index' ? 'opacity-100' : 'opacity-30'}`}>
              <path d="M 20 8 Q 22 0 26 8 L 32 56 Q 32 61 28 61 L 22 61 Q 18 61 18 56 Z" fill="#4A90E2" opacity="0.3" stroke="#4A90E2" strokeWidth="1"/>
            </g>
            <g className={`transition-opacity duration-200 ${activeFinger === 'right-middle' ? 'opacity-100' : 'opacity-30'}`}>
              <path d="M 45 0 Q 47 -8 51 0 L 57 58 Q 57 63 53 63 L 47 63 Q 43 63 43 58 Z" fill="#4A90E2" opacity="0.3" stroke="#4A90E2" strokeWidth="1"/>
            </g>
            <g className={`transition-opacity duration-200 ${activeFinger === 'right-ring' ? 'opacity-100' : 'opacity-30'}`}>
              <path d="M 70 5 Q 73 -5 77 5 L 82 55 Q 82 60 78 60 L 72 60 Q 68 60 68 55 Z" fill="#4A90E2" opacity="0.3" stroke="#4A90E2" strokeWidth="1"/>
            </g>
            <g className={`transition-opacity duration-200 ${activeFinger === 'right-pinky' ? 'opacity-100' : 'opacity-30'}`}>
              <path d="M 95 20 Q 100 10 105 20 L 107 50 Q 107 55 103 55 L 97 55 Q 93 55 93 50 Z" fill="#4A90E2" opacity="0.3" stroke="#4A90E2" strokeWidth="1"/>
            </g>
            <g className={`transition-opacity duration-200 ${activeFinger === 'thumb' ? 'opacity-100' : 'opacity-30'}`}>
              <ellipse cx="-25" cy="90" rx="35" ry="18" fill="#4A90E2" opacity="0.3" stroke="#4A90E2" strokeWidth="1"/>
            </g>
          </g>
        </svg>

        <div className="space-y-1 relative" style={{ paddingTop: '60px' }}>
          {keyboardLayout.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center gap-1">
              {row.map((key) => (
                <div
                  key={key}
                  className={getKeyClasses(key)}
                  style={{
                    width: getKeyWidth(key),
                    height: '48px',
                    fontSize: key.length > 1 && key !== 'Space' ? '11px' : '14px'
                  }}
                >
                  {key === 'Space' ? '' : key}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
