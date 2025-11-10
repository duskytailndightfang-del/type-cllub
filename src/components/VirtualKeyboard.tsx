import React, { useEffect, useState } from 'react';

interface VirtualKeyboardProps {
  pressedKey: string | null;
}

const keyboardLayout = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
  ['Tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
  ['Caps', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", 'Enter'],
  ['Shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'Shift'],
  ['Ctrl', 'Alt', 'Space', 'Alt', 'Ctrl']
];

const getKeyWidth = (key: string): string => {
  switch (key) {
    case 'Backspace':
      return 'w-20';
    case 'Tab':
      return 'w-16';
    case 'Caps':
      return 'w-20';
    case 'Enter':
      return 'w-24';
    case 'Shift':
      return 'w-24';
    case 'Space':
      return 'flex-1';
    case 'Ctrl':
    case 'Alt':
      return 'w-16';
    default:
      return 'w-12';
  }
};

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({ pressedKey }) => {
  const [activeKey, setActiveKey] = useState<string | null>(null);

  useEffect(() => {
    if (pressedKey) {
      setActiveKey(pressedKey.toUpperCase());
      const timer = setTimeout(() => setActiveKey(null), 150);
      return () => clearTimeout(timer);
    }
  }, [pressedKey]);

  const isKeyActive = (key: string): boolean => {
    if (!activeKey) return false;

    const normalizedKey = activeKey.toUpperCase();
    const normalizedLayoutKey = key.toUpperCase();

    if (normalizedKey === normalizedLayoutKey) return true;
    if (normalizedKey === ' ' && key === 'Space') return true;
    if (normalizedKey === 'BACKSPACE' && key === 'Backspace') return true;
    if (normalizedKey === 'ENTER' && key === 'Enter') return true;
    if (normalizedKey === 'TAB' && key === 'Tab') return true;
    if (normalizedKey === 'SHIFT' && key === 'Shift') return true;
    if (normalizedKey === 'CONTROL' && key === 'Ctrl') return true;
    if (normalizedKey === 'ALT' && key === 'Alt') return true;

    return false;
  };

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl shadow-2xl">
      <div className="space-y-2">
        {keyboardLayout.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-2 justify-center">
            {row.map((key, keyIndex) => (
              <div
                key={`${rowIndex}-${keyIndex}`}
                className={`
                  ${getKeyWidth(key)}
                  h-12
                  rounded-lg
                  flex items-center justify-center
                  font-semibold text-sm
                  transition-all duration-100
                  ${isKeyActive(key)
                    ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white scale-95 shadow-lg shadow-blue-500/50'
                    : 'bg-gradient-to-br from-slate-700 to-slate-600 text-slate-200 hover:from-slate-600 hover:to-slate-500'
                  }
                `}
              >
                {key === 'Space' ? '' : key}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
