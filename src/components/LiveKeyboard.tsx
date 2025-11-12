import React, { useEffect, useState } from 'react';

interface LiveKeyboardProps {
  activeKey: string | null;
  currentWpm?: number;
  currentAccuracy?: number;
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

export const LiveKeyboard: React.FC<LiveKeyboardProps> = ({ activeKey, currentWpm = 0, currentAccuracy = 0 }) => {
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
      <div className="max-w-6xl mx-auto relative px-4 flex items-start gap-8">
        {/* Keyboard with Hand Overlays */}
        <div className="flex-1 relative">
          <svg
            className="absolute pointer-events-none z-10"
            style={{ width: '100%', height: '100%', top: '0', left: '0' }}
            viewBox="0 0 950 300"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* LEFT HAND - positioned over keys */}
            <g transform="translate(0, 0)">
              {/* Left Pinky - over A/Q/Z keys */}
              <path
                d="M 85,-20 Q 80,-30 75,-15 C 72,5 70,30 68,55 L 66,85 Q 65,105 70,115 Q 75,125 82,118 L 87,85 Q 90,55 92,25 Q 93,0 85,-20 Z"
                fill={activeFinger === 'left-pinky' ? '#4A90E2' : '#94A3B8'}
                stroke={activeFinger === 'left-pinky' ? '#2563EB' : '#64748B'}
                strokeWidth="2"
                opacity={activeFinger === 'left-pinky' ? '0.9' : '0.1'}
                className="transition-all duration-150 ease-out"
              />

              {/* Left Ring - over S/W/X keys */}
              <path
                d="M 155,-30 Q 150,-40 145,-20 C 142,10 139,40 137,70 L 135,105 Q 134,130 139,140 Q 145,150 152,143 L 157,105 Q 160,70 163,35 Q 165,0 155,-30 Z"
                fill={activeFinger === 'left-ring' ? '#4A90E2' : '#94A3B8'}
                stroke={activeFinger === 'left-ring' ? '#2563EB' : '#64748B'}
                strokeWidth="2"
                opacity={activeFinger === 'left-ring' ? '0.9' : '0.1'}
                className="transition-all duration-150 ease-out"
              />

              {/* Left Middle - over D/E/C keys (longest) */}
              <path
                d="M 225,-40 Q 220,-50 215,-25 C 212,10 209,50 207,85 L 205,125 Q 204,150 209,162 Q 215,174 222,167 L 227,125 Q 230,85 233,45 Q 235,5 225,-40 Z"
                fill={activeFinger === 'left-middle' ? '#4A90E2' : '#94A3B8'}
                stroke={activeFinger === 'left-middle' ? '#2563EB' : '#64748B'}
                strokeWidth="2"
                opacity={activeFinger === 'left-middle' ? '0.9' : '0.1'}
                className="transition-all duration-150 ease-out"
              />

              {/* Left Index - over F/R/V keys */}
              <path
                d="M 295,-30 Q 290,-40 285,-20 C 282,10 279,45 277,80 L 275,115 Q 274,140 279,152 Q 285,164 292,157 L 297,115 Q 300,80 303,40 Q 305,0 295,-30 Z"
                fill={activeFinger === 'left-index' ? '#4A90E2' : '#94A3B8'}
                stroke={activeFinger === 'left-index' ? '#2563EB' : '#64748B'}
                strokeWidth="2"
                opacity={activeFinger === 'left-index' ? '0.9' : '0.1'}
                className="transition-all duration-150 ease-out"
              />

              {/* Left Thumb - over spacebar */}
              <path
                d="M 360,155 Q 350,150 345,160 L 340,180 Q 338,195 345,200 L 370,205 Q 385,205 395,195 L 400,175 Q 402,155 390,150 Q 375,148 360,155 Z"
                fill={activeFinger === 'thumb' ? '#22C55E' : '#94A3B8'}
                stroke={activeFinger === 'thumb' ? '#16A34A' : '#64748B'}
                strokeWidth="2"
                opacity={activeFinger === 'thumb' ? '0.9' : '0.1'}
                className="transition-all duration-150 ease-out"
              />
            </g>

            {/* RIGHT HAND - positioned over keys */}
            <g transform="translate(0, 0)">
              {/* Right Index - over J/U/N keys */}
              <path
                d="M 480,-30 Q 485,-40 490,-20 C 493,10 496,45 498,80 L 500,115 Q 501,140 496,152 Q 490,164 483,157 L 478,115 Q 475,80 472,40 Q 470,0 480,-30 Z"
                fill={activeFinger === 'right-index' ? '#4A90E2' : '#94A3B8'}
                stroke={activeFinger === 'right-index' ? '#2563EB' : '#64748B'}
                strokeWidth="2"
                opacity={activeFinger === 'right-index' ? '0.9' : '0.1'}
                className="transition-all duration-150 ease-out"
              />

              {/* Right Middle - over K/I keys (longest) */}
              <path
                d="M 550,-40 Q 555,-50 560,-25 C 563,10 566,50 568,85 L 570,125 Q 571,150 566,162 Q 560,174 553,167 L 548,125 Q 545,85 542,45 Q 540,5 550,-40 Z"
                fill={activeFinger === 'right-middle' ? '#4A90E2' : '#94A3B8'}
                stroke={activeFinger === 'right-middle' ? '#2563EB' : '#64748B'}
                strokeWidth="2"
                opacity={activeFinger === 'right-middle' ? '0.9' : '0.1'}
                className="transition-all duration-150 ease-out"
              />

              {/* Right Ring - over L/O keys */}
              <path
                d="M 620,-30 Q 625,-40 630,-20 C 633,10 636,40 638,70 L 640,105 Q 641,130 636,140 Q 630,150 623,143 L 618,105 Q 615,70 612,35 Q 610,0 620,-30 Z"
                fill={activeFinger === 'right-ring' ? '#4A90E2' : '#94A3B8'}
                stroke={activeFinger === 'right-ring' ? '#2563EB' : '#64748B'}
                strokeWidth="2"
                opacity={activeFinger === 'right-ring' ? '0.9' : '0.1'}
                className="transition-all duration-150 ease-out"
              />

              {/* Right Pinky - over semicolon/P keys */}
              <path
                d="M 690,-20 Q 695,-30 700,-15 C 703,5 705,30 707,55 L 709,85 Q 710,105 705,115 Q 700,125 693,118 L 688,85 Q 685,55 683,25 Q 682,0 690,-20 Z"
                fill={activeFinger === 'right-pinky' ? '#4A90E2' : '#94A3B8'}
                stroke={activeFinger === 'right-pinky' ? '#2563EB' : '#64748B'}
                strokeWidth="2"
                opacity={activeFinger === 'right-pinky' ? '0.9' : '0.1'}
                className="transition-all duration-150 ease-out"
              />

              {/* Right Thumb - over spacebar */}
              <path
                d="M 415,155 Q 425,150 430,160 L 435,180 Q 437,195 430,200 L 405,205 Q 390,205 380,195 L 375,175 Q 373,155 385,150 Q 400,148 415,155 Z"
                fill={activeFinger === 'thumb' ? '#22C55E' : '#94A3B8'}
                stroke={activeFinger === 'thumb' ? '#16A34A' : '#64748B'}
                strokeWidth="2"
                opacity={activeFinger === 'thumb' ? '0.9' : '0.1'}
                className="transition-all duration-150 ease-out"
              />
            </g>
          </svg>

          <div className="space-y-1 relative">
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

        {/* Speed and Accuracy Display */}
        <div className="flex flex-col gap-6">
          <div className="text-center">
            <div className="text-gray-500 text-sm font-medium mb-2">Speed</div>
            <div className="text-5xl font-bold text-gray-700">
              {currentWpm}<span className="text-2xl text-gray-400 ml-1">WPM</span>
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-500 text-sm font-medium mb-2">Accuracy</div>
            <div className="text-5xl font-bold text-gray-700">
              {currentAccuracy}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
