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
            className="absolute inset-0 pointer-events-none"
            style={{ width: '100%', height: '350px', top: '-100px', left: '-20px' }}
            viewBox="0 0 1100 350"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <filter id="handShadow">
                <feGaussianBlur in="SourceAlpha" stdDeviation="4"/>
                <feOffset dx="2" dy="2" result="offsetblur"/>
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.3"/>
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* LEFT HAND */}
            <g transform="translate(100, 80)">
              {/* Left Pinky - curved down to A/Q/Z row */}
              <path
                d="M 80,20 Q 75,15 70,25 C 68,40 65,60 63,80 Q 62,95 60,110 L 58,135 Q 56,150 62,155 Q 68,160 72,155 L 75,130 Q 78,105 80,85 Q 82,60 84,40 Q 85,25 80,20 Z"
                fill={activeFinger === 'left-pinky' ? '#4A90E2' : '#B0B8C1'}
                stroke={activeFinger === 'left-pinky' ? '#2563EB' : '#8B95A1'}
                strokeWidth="3"
                opacity={activeFinger === 'left-pinky' ? '1' : '0.35'}
                filter="url(#handShadow)"
                className="transition-all duration-150 ease-out"
              />

              {/* Left Ring - curved down to S/W/X row */}
              <path
                d="M 145,5 Q 140,0 135,10 C 132,30 129,55 126,80 Q 124,100 122,120 L 120,150 Q 118,170 124,176 Q 130,182 136,176 L 140,145 Q 144,115 147,90 Q 150,60 152,35 Q 153,15 145,5 Z"
                fill={activeFinger === 'left-ring' ? '#4A90E2' : '#B0B8C1'}
                stroke={activeFinger === 'left-ring' ? '#2563EB' : '#8B95A1'}
                strokeWidth="3"
                opacity={activeFinger === 'left-ring' ? '1' : '0.35'}
                filter="url(#handShadow)"
                className="transition-all duration-150 ease-out"
              />

              {/* Left Middle - longest finger, curved down to D/E/C row */}
              <path
                d="M 215,-5 Q 210,-10 205,0 C 202,25 199,55 196,85 Q 194,110 192,135 L 190,165 Q 188,185 194,192 Q 200,199 206,192 L 210,160 Q 214,130 217,100 Q 220,65 223,35 Q 225,10 215,-5 Z"
                fill={activeFinger === 'left-middle' ? '#4A90E2' : '#B0B8C1'}
                stroke={activeFinger === 'left-middle' ? '#2563EB' : '#8B95A1'}
                strokeWidth="3"
                opacity={activeFinger === 'left-middle' ? '1' : '0.35'}
                filter="url(#handShadow)"
                className="transition-all duration-150 ease-out"
              />

              {/* Left Index - curved down to F/R/V row */}
              <path
                d="M 285,10 Q 280,5 275,15 C 272,35 269,60 266,90 Q 264,115 262,140 L 260,165 Q 258,182 264,189 Q 270,196 276,189 L 280,160 Q 284,130 287,100 Q 290,70 293,45 Q 295,20 285,10 Z"
                fill={activeFinger === 'left-index' ? '#4A90E2' : '#B0B8C1'}
                stroke={activeFinger === 'left-index' ? '#2563EB' : '#8B95A1'}
                strokeWidth="3"
                opacity={activeFinger === 'left-index' ? '1' : '0.35'}
                filter="url(#handShadow)"
                className="transition-all duration-150 ease-out"
              />

              {/* Left Thumb - curves down to spacebar */}
              <path
                d="M 340,140 Q 335,135 330,145 C 325,160 320,180 318,200 L 320,220 Q 323,235 333,238 L 350,240 Q 365,240 372,230 L 378,215 Q 380,195 375,180 Q 370,160 360,150 Q 350,142 340,140 Z"
                fill={activeFinger === 'thumb' ? '#22C55E' : '#B0B8C1'}
                stroke={activeFinger === 'thumb' ? '#16A34A' : '#8B95A1'}
                strokeWidth="3"
                opacity={activeFinger === 'thumb' ? '1' : '0.35'}
                filter="url(#handShadow)"
                className="transition-all duration-150 ease-out"
              />
            </g>

            {/* RIGHT HAND */}
            <g transform="translate(620, 80)">
              {/* Right Index - curved down to J/U/N row */}
              <path
                d="M 75,10 Q 80,5 85,15 C 88,35 91,60 94,90 Q 96,115 98,140 L 100,165 Q 102,182 96,189 Q 90,196 84,189 L 80,160 Q 76,130 73,100 Q 70,70 67,45 Q 65,20 75,10 Z"
                fill={activeFinger === 'right-index' ? '#4A90E2' : '#B0B8C1'}
                stroke={activeFinger === 'right-index' ? '#2563EB' : '#8B95A1'}
                strokeWidth="3"
                opacity={activeFinger === 'right-index' ? '1' : '0.35'}
                filter="url(#handShadow)"
                className="transition-all duration-150 ease-out"
              />

              {/* Right Middle - longest finger, curved down to K/I row */}
              <path
                d="M 145,-5 Q 150,-10 155,0 C 158,25 161,55 164,85 Q 166,110 168,135 L 170,165 Q 172,185 166,192 Q 160,199 154,192 L 150,160 Q 146,130 143,100 Q 140,65 137,35 Q 135,10 145,-5 Z"
                fill={activeFinger === 'right-middle' ? '#4A90E2' : '#B0B8C1'}
                stroke={activeFinger === 'right-middle' ? '#2563EB' : '#8B95A1'}
                strokeWidth="3"
                opacity={activeFinger === 'right-middle' ? '1' : '0.35'}
                filter="url(#handShadow)"
                className="transition-all duration-150 ease-out"
              />

              {/* Right Ring - curved down to L/O row */}
              <path
                d="M 215,5 Q 220,0 225,10 C 228,30 231,55 234,80 Q 236,100 238,120 L 240,150 Q 242,170 236,176 Q 230,182 224,176 L 220,145 Q 216,115 213,90 Q 210,60 208,35 Q 207,15 215,5 Z"
                fill={activeFinger === 'right-ring' ? '#4A90E2' : '#B0B8C1'}
                stroke={activeFinger === 'right-ring' ? '#2563EB' : '#8B95A1'}
                strokeWidth="3"
                opacity={activeFinger === 'right-ring' ? '1' : '0.35'}
                filter="url(#handShadow)"
                className="transition-all duration-150 ease-out"
              />

              {/* Right Pinky - curved down to semicolon/P row */}
              <path
                d="M 280,20 Q 285,15 290,25 C 292,40 295,60 297,80 Q 298,95 300,110 L 302,135 Q 304,150 298,155 Q 292,160 288,155 L 285,130 Q 282,105 280,85 Q 278,60 276,40 Q 275,25 280,20 Z"
                fill={activeFinger === 'right-pinky' ? '#4A90E2' : '#B0B8C1'}
                stroke={activeFinger === 'right-pinky' ? '#2563EB' : '#8B95A1'}
                strokeWidth="3"
                opacity={activeFinger === 'right-pinky' ? '1' : '0.35'}
                filter="url(#handShadow)"
                className="transition-all duration-150 ease-out"
              />

              {/* Right Thumb - curves down to spacebar */}
              <path
                d="M 20,140 Q 25,135 30,145 C 35,160 40,180 42,200 L 40,220 Q 37,235 27,238 L 10,240 Q -5,240 -12,230 L -18,215 Q -20,195 -15,180 Q -10,160 0,150 Q 10,142 20,140 Z"
                fill={activeFinger === 'thumb' ? '#22C55E' : '#B0B8C1'}
                stroke={activeFinger === 'thumb' ? '#16A34A' : '#8B95A1'}
                strokeWidth="3"
                opacity={activeFinger === 'thumb' ? '1' : '0.35'}
                filter="url(#handShadow)"
                className="transition-all duration-150 ease-out"
              />
            </g>
          </svg>

          <div className="space-y-1 relative" style={{ paddingTop: '120px' }}>
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
        <div className="flex flex-col gap-6" style={{ paddingTop: '120px' }}>
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
