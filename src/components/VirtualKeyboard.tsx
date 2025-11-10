import { useEffect, useState } from 'react';

interface VirtualKeyboardProps {
  pressedKey: string;
  theme?: 'standard' | 'gold' | 'silver' | 'bronze';
}

const keyboardLayout = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
  ['Tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
  ['Caps', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", 'Enter'],
  ['Shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'Shift'],
  ['Ctrl', 'Alt', 'Space', 'Alt', 'Ctrl']
];

const themeColors = {
  standard: {
    bg: 'bg-slate-700',
    pressed: 'bg-blue-500',
    border: 'border-slate-600',
    text: 'text-white'
  },
  gold: {
    bg: 'bg-gradient-to-br from-yellow-600 to-yellow-700',
    pressed: 'bg-yellow-400',
    border: 'border-yellow-500',
    text: 'text-yellow-50'
  },
  silver: {
    bg: 'bg-gradient-to-br from-slate-400 to-slate-500',
    pressed: 'bg-slate-300',
    border: 'border-slate-400',
    text: 'text-slate-50'
  },
  bronze: {
    bg: 'bg-gradient-to-br from-amber-700 to-amber-800',
    pressed: 'bg-amber-500',
    border: 'border-amber-600',
    text: 'text-amber-50'
  }
};

export default function VirtualKeyboard({ pressedKey, theme = 'standard' }: VirtualKeyboardProps) {
  const [activeKey, setActiveKey] = useState<string>('');
  const colors = themeColors[theme];

  useEffect(() => {
    if (pressedKey) {
      setActiveKey(pressedKey.toUpperCase());
      const timer = setTimeout(() => setActiveKey(''), 150);
      return () => clearTimeout(timer);
    }
  }, [pressedKey]);

  const getKeyWidth = (key: string) => {
    if (key === 'Space') return 'flex-[4]';
    if (key === 'Backspace') return 'flex-[2]';
    if (key === 'Tab' || key === 'Caps' || key === '\\') return 'flex-[1.5]';
    if (key === 'Enter') return 'flex-[2]';
    if (key === 'Shift') return 'flex-[2]';
    if (key === 'Ctrl' || key === 'Alt') return 'flex-[1.5]';
    return 'flex-1';
  };

  const isKeyActive = (key: string) => {
    const normalizedKey = key.toUpperCase();
    const normalizedActive = activeKey.toUpperCase();

    if (normalizedActive === ' ' && key === 'Space') return true;
    if (normalizedActive === 'ENTER' && key === 'Enter') return true;
    if (normalizedActive === 'BACKSPACE' && key === 'Backspace') return true;
    if (normalizedActive === 'TAB' && key === 'Tab') return true;
    if (normalizedActive === 'SHIFT' && key === 'Shift') return true;
    if (normalizedActive === 'CAPSLOCK' && key === 'Caps') return true;
    if (normalizedActive === 'CONTROL' && key === 'Ctrl') return true;
    if (normalizedActive === 'ALT' && key === 'Alt') return true;

    return normalizedKey === normalizedActive;
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6 bg-slate-800 rounded-2xl shadow-2xl">
      <div className="space-y-2">
        {keyboardLayout.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-2 justify-center">
            {row.map((key) => {
              const active = isKeyActive(key);
              return (
                <div
                  key={key}
                  className={`
                    ${getKeyWidth(key)}
                    ${active ? colors.pressed + ' scale-95 shadow-lg' : colors.bg}
                    ${colors.text}
                    border-2 ${colors.border}
                    rounded-lg
                    h-14 flex items-center justify-center
                    font-semibold text-sm
                    transition-all duration-75
                    ${active ? 'ring-4 ring-white/30' : ''}
                  `}
                >
                  {key}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}