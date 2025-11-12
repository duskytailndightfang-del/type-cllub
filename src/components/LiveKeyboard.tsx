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

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-gray-100 to-gray-50 border-t-2 border-gray-300 py-6 z-40 shadow-2xl">
      <div className="max-w-5xl mx-auto relative px-4">
        <svg
          className="absolute inset-0 pointer-events-none"
          style={{ width: '100%', height: '320px', top: '-80px' }}
          viewBox="0 0 1200 320"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <filter id="fingerGlow">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
              <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" />
            </filter>
          </defs>

          {/* Left Hand - Pinky Finger (A, Q, Z, 1) */}
          <path
            d="M 200 60 Q 195 50 190 60 C 185 75 180 90 175 110 L 170 140 Q 165 160 170 165 L 175 170 Q 180 175 185 170 L 190 140 Q 195 120 200 100 Z"
            fill={activeFinger === 'left-pinky' ? '#4A90E2' : '#9CA3AF'}
            stroke={activeFinger === 'left-pinky' ? '#2563EB' : '#6B7280'}
            strokeWidth="2.5"
            className="transition-all duration-150 ease-out"
            style={{
              opacity: activeFinger === 'left-pinky' ? 1 : 0.25,
              filter: activeFinger === 'left-pinky' ? 'url(#fingerGlow)' : 'none'
            }}
          />

          {/* Left Hand - Ring Finger (S, W, X, 2) */}
          <path
            d="M 260 35 Q 255 25 250 35 C 245 55 240 75 235 100 L 230 135 Q 225 160 232 167 L 238 173 Q 245 180 252 173 L 257 135 Q 262 105 265 75 Z"
            fill={activeFinger === 'left-ring' ? '#4A90E2' : '#9CA3AF'}
            stroke={activeFinger === 'left-ring' ? '#2563EB' : '#6B7280'}
            strokeWidth="2.5"
            className="transition-all duration-150 ease-out"
            style={{
              opacity: activeFinger === 'left-ring' ? 1 : 0.25,
              filter: activeFinger === 'left-ring' ? 'url(#fingerGlow)' : 'none'
            }}
          />

          {/* Left Hand - Middle Finger (D, E, C, 3) */}
          <path
            d="M 325 20 Q 320 10 315 20 C 310 45 305 70 300 100 L 295 140 Q 290 165 297 172 L 303 178 Q 310 185 317 178 L 322 140 Q 327 105 330 70 Z"
            fill={activeFinger === 'left-middle' ? '#4A90E2' : '#9CA3AF'}
            stroke={activeFinger === 'left-middle' ? '#2563EB' : '#6B7280'}
            strokeWidth="2.5"
            className="transition-all duration-150 ease-out"
            style={{
              opacity: activeFinger === 'left-middle' ? 1 : 0.25,
              filter: activeFinger === 'left-middle' ? 'url(#fingerGlow)' : 'none'
            }}
          />

          {/* Left Hand - Index Finger (F, R, V, 4, 5, G, T, B) */}
          <path
            d="M 390 30 Q 385 20 380 30 C 375 55 370 80 365 110 L 360 145 Q 355 170 362 177 L 368 183 Q 375 190 382 183 L 387 145 Q 392 110 395 75 Z"
            fill={activeFinger === 'left-index' ? '#4A90E2' : '#9CA3AF'}
            stroke={activeFinger === 'left-index' ? '#2563EB' : '#6B7280'}
            strokeWidth="2.5"
            className="transition-all duration-150 ease-out"
            style={{
              opacity: activeFinger === 'left-index' ? 1 : 0.25,
              filter: activeFinger === 'left-index' ? 'url(#fingerGlow)' : 'none'
            }}
          />

          {/* Left Hand - Thumb (Space) */}
          <path
            d="M 480 160 Q 470 155 465 165 C 460 175 455 185 455 200 L 460 215 Q 465 225 475 225 L 490 225 Q 500 225 505 215 L 510 200 Q 510 180 500 170 Z"
            fill={activeFinger === 'thumb' ? '#10B981' : '#9CA3AF'}
            stroke={activeFinger === 'thumb' ? '#059669' : '#6B7280'}
            strokeWidth="2.5"
            className="transition-all duration-150 ease-out"
            style={{
              opacity: activeFinger === 'thumb' ? 1 : 0.25,
              filter: activeFinger === 'thumb' ? 'url(#fingerGlow)' : 'none'
            }}
          />

          {/* Right Hand - Thumb (Space) */}
          <path
            d="M 690 160 Q 700 155 705 165 C 710 175 715 185 715 200 L 710 215 Q 705 225 695 225 L 680 225 Q 670 225 665 215 L 660 200 Q 660 180 670 170 Z"
            fill={activeFinger === 'thumb' ? '#10B981' : '#9CA3AF'}
            stroke={activeFinger === 'thumb' ? '#059669' : '#6B7280'}
            strokeWidth="2.5"
            className="transition-all duration-150 ease-out"
            style={{
              opacity: activeFinger === 'thumb' ? 1 : 0.25,
              filter: activeFinger === 'thumb' ? 'url(#fingerGlow)' : 'none'
            }}
          />

          {/* Right Hand - Index Finger (J, U, N, 6, 7, H, Y, M) */}
          <path
            d="M 780 30 Q 785 20 790 30 C 795 55 800 80 805 110 L 810 145 Q 815 170 808 177 L 802 183 Q 795 190 788 183 L 783 145 Q 778 110 775 75 Z"
            fill={activeFinger === 'right-index' ? '#4A90E2' : '#9CA3AF'}
            stroke={activeFinger === 'right-index' ? '#2563EB' : '#6B7280'}
            strokeWidth="2.5"
            className="transition-all duration-150 ease-out"
            style={{
              opacity: activeFinger === 'right-index' ? 1 : 0.25,
              filter: activeFinger === 'right-index' ? 'url(#fingerGlow)' : 'none'
            }}
          />

          {/* Right Hand - Middle Finger (K, I, comma, 8) */}
          <path
            d="M 845 20 Q 850 10 855 20 C 860 45 865 70 870 100 L 875 140 Q 880 165 873 172 L 867 178 Q 860 185 853 178 L 848 140 Q 843 105 840 70 Z"
            fill={activeFinger === 'right-middle' ? '#4A90E2' : '#9CA3AF'}
            stroke={activeFinger === 'right-middle' ? '#2563EB' : '#6B7280'}
            strokeWidth="2.5"
            className="transition-all duration-150 ease-out"
            style={{
              opacity: activeFinger === 'right-middle' ? 1 : 0.25,
              filter: activeFinger === 'right-middle' ? 'url(#fingerGlow)' : 'none'
            }}
          />

          {/* Right Hand - Ring Finger (L, O, period, 9) */}
          <path
            d="M 910 35 Q 915 25 920 35 C 925 55 930 75 935 100 L 940 135 Q 945 160 938 167 L 932 173 Q 925 180 918 173 L 913 135 Q 908 105 905 75 Z"
            fill={activeFinger === 'right-ring' ? '#4A90E2' : '#9CA3AF'}
            stroke={activeFinger === 'right-ring' ? '#2563EB' : '#6B7280'}
            strokeWidth="2.5"
            className="transition-all duration-150 ease-out"
            style={{
              opacity: activeFinger === 'right-ring' ? 1 : 0.25,
              filter: activeFinger === 'right-ring' ? 'url(#fingerGlow)' : 'none'
            }}
          />

          {/* Right Hand - Pinky Finger (semicolon, P, slash, 0, -, =) */}
          <path
            d="M 970 60 Q 975 50 980 60 C 985 75 990 90 995 110 L 1000 140 Q 1005 160 1000 165 L 995 170 Q 990 175 985 170 L 980 140 Q 975 120 970 100 Z"
            fill={activeFinger === 'right-pinky' ? '#4A90E2' : '#9CA3AF'}
            stroke={activeFinger === 'right-pinky' ? '#2563EB' : '#6B7280'}
            strokeWidth="2.5"
            className="transition-all duration-150 ease-out"
            style={{
              opacity: activeFinger === 'right-pinky' ? 1 : 0.25,
              filter: activeFinger === 'right-pinky' ? 'url(#fingerGlow)' : 'none'
            }}
          />
        </svg>

        <div className="space-y-1 relative" style={{ paddingTop: '110px' }}>
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
