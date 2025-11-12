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
      setActiveFinger(fingerKeyMap[upperKey] || fingerKeyMap[activeKey] || null);

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
    return `${baseClasses} bg-white text-gray-700 border-gray-300 shadow-sm hover:bg-gray-50`;
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

  const getFingerOpacity = (finger: string) => {
    if (activeFinger === finger) {
      return '1';
    }
    return '0.2';
  };

  const getFingerScale = (finger: string) => {
    if (activeFinger === finger) {
      return 'scale(1.1)';
    }
    return 'scale(1)';
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-gray-100 to-gray-50 border-t-2 border-gray-300 py-6 z-40 shadow-2xl">
      <div className="max-w-5xl mx-auto relative px-4">
        <svg
          className="absolute inset-0 pointer-events-none"
          style={{ width: '100%', height: '300px', top: '-40px' }}
          viewBox="0 0 1000 300"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <filter id="fingerGlow">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
              <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" />
            </filter>
          </defs>

          <g transform="translate(140, 130)">
            <g
              className="transition-all duration-150 ease-out"
              style={{
                opacity: getFingerOpacity('left-pinky'),
                transform: getFingerScale('left-pinky'),
                transformOrigin: 'center'
              }}
            >
              <path
                d="M 15 15 Q 12 8 10 15 L 8 50 Q 7 58 14 58 L 20 58 Q 26 58 25 50 L 23 15 Q 21 8 18 15 Z"
                fill={activeFinger === 'left-pinky' ? '#3B82F6' : '#9CA3AF'}
                stroke={activeFinger === 'left-pinky' ? '#2563EB' : '#6B7280'}
                strokeWidth="2"
                filter={activeFinger === 'left-pinky' ? 'url(#fingerGlow)' : ''}
              />
            </g>

            <g
              className="transition-all duration-150 ease-out"
              style={{
                opacity: getFingerOpacity('left-ring'),
                transform: getFingerScale('left-ring'),
                transformOrigin: 'center'
              }}
            >
              <path
                d="M 43 3 Q 40 -5 38 3 L 33 58 Q 32 66 38 66 L 46 66 Q 52 66 51 58 L 48 3 Q 46 -5 43 3 Z"
                fill={activeFinger === 'left-ring' ? '#3B82F6' : '#9CA3AF'}
                stroke={activeFinger === 'left-ring' ? '#2563EB' : '#6B7280'}
                strokeWidth="2"
                filter={activeFinger === 'left-ring' ? 'url(#fingerGlow)' : ''}
              />
            </g>

            <g
              className="transition-all duration-150 ease-out"
              style={{
                opacity: getFingerOpacity('left-middle'),
                transform: getFingerScale('left-middle'),
                transformOrigin: 'center'
              }}
            >
              <path
                d="M 68 -2 Q 65 -10 63 -2 L 58 60 Q 57 68 63 68 L 71 68 Q 77 68 76 60 L 73 -2 Q 71 -10 68 -2 Z"
                fill={activeFinger === 'left-middle' ? '#3B82F6' : '#9CA3AF'}
                stroke={activeFinger === 'left-middle' ? '#2563EB' : '#6B7280'}
                strokeWidth="2"
                filter={activeFinger === 'left-middle' ? 'url(#fingerGlow)' : ''}
              />
            </g>

            <g
              className="transition-all duration-150 ease-out"
              style={{
                opacity: getFingerOpacity('left-index'),
                transform: getFingerScale('left-index'),
                transformOrigin: 'center'
              }}
            >
              <path
                d="M 93 5 Q 90 -2 88 5 L 83 58 Q 82 66 88 66 L 96 66 Q 102 66 101 58 L 98 5 Q 96 -2 93 5 Z"
                fill={activeFinger === 'left-index' ? '#3B82F6' : '#9CA3AF'}
                stroke={activeFinger === 'left-index' ? '#2563EB' : '#6B7280'}
                strokeWidth="2"
                filter={activeFinger === 'left-index' ? 'url(#fingerGlow)' : ''}
              />
            </g>

            <g
              className="transition-all duration-150 ease-out"
              style={{
                opacity: getFingerOpacity('thumb'),
                transform: getFingerScale('thumb'),
                transformOrigin: 'center'
              }}
            >
              <ellipse
                cx="145"
                cy="95"
                rx="38"
                ry="20"
                fill={activeFinger === 'thumb' ? '#10B981' : '#9CA3AF'}
                stroke={activeFinger === 'thumb' ? '#059669' : '#6B7280'}
                strokeWidth="2"
                filter={activeFinger === 'thumb' ? 'url(#fingerGlow)' : ''}
              />
            </g>
          </g>

          <g transform="translate(570, 130)">
            <g
              className="transition-all duration-150 ease-out"
              style={{
                opacity: getFingerOpacity('right-index'),
                transform: getFingerScale('right-index'),
                transformOrigin: 'center'
              }}
            >
              <path
                d="M 17 5 Q 19 -2 22 5 L 27 58 Q 28 66 22 66 L 14 66 Q 8 66 9 58 L 12 5 Q 14 -2 17 5 Z"
                fill={activeFinger === 'right-index' ? '#3B82F6' : '#9CA3AF'}
                stroke={activeFinger === 'right-index' ? '#2563EB' : '#6B7280'}
                strokeWidth="2"
                filter={activeFinger === 'right-index' ? 'url(#fingerGlow)' : ''}
              />
            </g>

            <g
              className="transition-all duration-150 ease-out"
              style={{
                opacity: getFingerOpacity('right-middle'),
                transform: getFingerScale('right-middle'),
                transformOrigin: 'center'
              }}
            >
              <path
                d="M 42 -2 Q 45 -10 47 -2 L 52 60 Q 53 68 47 68 L 39 68 Q 33 68 34 60 L 37 -2 Q 39 -10 42 -2 Z"
                fill={activeFinger === 'right-middle' ? '#3B82F6' : '#9CA3AF'}
                stroke={activeFinger === 'right-middle' ? '#2563EB' : '#6B7280'}
                strokeWidth="2"
                filter={activeFinger === 'right-middle' ? 'url(#fingerGlow)' : ''}
              />
            </g>

            <g
              className="transition-all duration-150 ease-out"
              style={{
                opacity: getFingerOpacity('right-ring'),
                transform: getFingerScale('right-ring'),
                transformOrigin: 'center'
              }}
            >
              <path
                d="M 67 3 Q 70 -5 72 3 L 77 58 Q 78 66 72 66 L 64 66 Q 58 66 59 58 L 62 3 Q 64 -5 67 3 Z"
                fill={activeFinger === 'right-ring' ? '#3B82F6' : '#9CA3AF'}
                stroke={activeFinger === 'right-ring' ? '#2563EB' : '#6B7280'}
                strokeWidth="2"
                filter={activeFinger === 'right-ring' ? 'url(#fingerGlow)' : ''}
              />
            </g>

            <g
              className="transition-all duration-150 ease-out"
              style={{
                opacity: getFingerOpacity('right-pinky'),
                transform: getFingerScale('right-pinky'),
                transformOrigin: 'center'
              }}
            >
              <path
                d="M 95 15 Q 98 8 100 15 L 102 50 Q 103 58 96 58 L 90 58 Q 84 58 85 50 L 87 15 Q 89 8 92 15 Z"
                fill={activeFinger === 'right-pinky' ? '#3B82F6' : '#9CA3AF'}
                stroke={activeFinger === 'right-pinky' ? '#2563EB' : '#6B7280'}
                strokeWidth="2"
                filter={activeFinger === 'right-pinky' ? 'url(#fingerGlow)' : ''}
              />
            </g>

            <g
              className="transition-all duration-150 ease-out"
              style={{
                opacity: getFingerOpacity('thumb'),
                transform: getFingerScale('thumb'),
                transformOrigin: 'center'
              }}
            >
              <ellipse
                cx="-35"
                cy="95"
                rx="38"
                ry="20"
                fill={activeFinger === 'thumb' ? '#10B981' : '#9CA3AF'}
                stroke={activeFinger === 'thumb' ? '#059669' : '#6B7280'}
                strokeWidth="2"
                filter={activeFinger === 'thumb' ? 'url(#fingerGlow)' : ''}
              />
            </g>
          </g>
        </svg>

        <div className="space-y-1 relative" style={{ paddingTop: '80px' }}>
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
