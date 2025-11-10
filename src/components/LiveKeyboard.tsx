import React, { useEffect, useState } from 'react';

interface LiveKeyboardProps {
  activeKey: string | null;
}

const keyboardLayout = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', '\''],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/'],
  ['SPACE']
];

export const LiveKeyboard: React.FC<LiveKeyboardProps> = ({ activeKey }) => {
  const [highlightedKey, setHighlightedKey] = useState<string | null>(null);

  useEffect(() => {
    if (activeKey) {
      setHighlightedKey(activeKey.toUpperCase());
      const timer = setTimeout(() => setHighlightedKey(null), 200);
      return () => clearTimeout(timer);
    }
  }, [activeKey]);

  const getKeyClasses = (key: string) => {
    const baseClasses = 'px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-100 border-2';
    const isActive = highlightedKey === key ||
                     (key === 'SPACE' && highlightedKey === ' ');

    if (isActive) {
      return `${baseClasses} bg-purple-600 text-white border-purple-700 shadow-lg scale-110 transform`;
    }
    return `${baseClasses} bg-white text-gray-700 border-gray-300 shadow-sm hover:bg-gray-50`;
  };

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-purple-200">
      <div className="space-y-2">
        {keyboardLayout.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1">
            {row.map((key) => (
              <div
                key={key}
                className={getKeyClasses(key)}
                style={{
                  minWidth: key === 'SPACE' ? '300px' : '40px',
                  minHeight: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {key === 'SPACE' ? 'SPACE' : key}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
