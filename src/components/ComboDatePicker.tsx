import React, { useRef } from 'react';
import { Calendar } from 'lucide-react';
import { ddmmyyyyToIso, isoToDdmmyyyy } from '../utils/date';

interface ComboDatePickerProps {
  value: string;
  onChange: (newValue: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  title?: string;
}

export const ComboDatePicker: React.FC<ComboDatePickerProps> = ({
  value,
  onChange,
  placeholder = 'DD/MM/YYYY',
  className = '',
  inputClassName = '',
  disabled = false,
  title,
}) => {
  const hiddenDateRef = useRef<HTMLInputElement>(null);

  const isoValue = ddmmyyyyToIso(value);

  const handleDatePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pickedIso = e.target.value;
    if (pickedIso) {
      const formatted = isoToDdmmyyyy(pickedIso);
      onChange(formatted);
    }
  };

  return (
    <div className={`relative flex items-center w-full ${className}`} title={title}>
      {/* Direct Manual Typing Text Input */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full pr-8 font-mono text-xs focus:outline-none ${inputClassName}`}
      />

      {/* Calendar Icon Button with hidden native date picker on top */}
      <div className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors rounded overflow-hidden flex items-center justify-center w-6 h-6">
        <Calendar className="w-3.5 h-3.5" />
        
        <input
          ref={hiddenDateRef}
          type="date"
          value={isoValue}
          onChange={handleDatePick}
          disabled={disabled}
          title="Open calendar date picker"
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full p-0 m-0 border-none [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
        />
      </div>
    </div>
  );
};
