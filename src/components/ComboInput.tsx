import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface ComboOption {
  label: string;
  value: string | number;
  sublabel?: string;
}

interface ComboInputProps {
  value: string | number;
  onChange: (val: string | number) => void;
  options: ComboOption[];
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  type?: 'text' | 'number';
}

export const ComboInput: React.FC<ComboInputProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Type or select...',
  className = '',
  inputClassName = '',
  disabled = false,
  type = 'text',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSelect = (optValue: string | number) => {
    onChange(optValue);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative flex items-center w-full ${className}`}>
      {/* Manual Input */}
      <input
        type={type}
        value={value ?? ''}
        onChange={(e) => {
          const val = type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value;
          onChange(val);
        }}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full pr-6 focus:outline-none ${inputClassName}`}
      />

      {/* Dropdown Toggle Button */}
      {options.length > 0 && (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          title="Select from dropdown menu"
          className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors cursor-pointer rounded"
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      )}

      {/* Dropdown Options Popover Menu */}
      {isOpen && options.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 max-h-48 overflow-y-auto rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs py-1 text-slate-800 dark:text-slate-200">
          <div className="px-2 py-1 text-[10px] uppercase tracking-wider font-semibold text-slate-400 border-b border-slate-100 dark:border-slate-800">
            Select or type custom
          </div>
          {options.map((opt, idx) => {
            const isSelected = String(opt.value) === String(value);
            return (
              <button
                key={`${opt.value}-${idx}`}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={`w-full text-left px-2.5 py-1.5 flex items-center justify-between hover:bg-indigo-50 dark:hover:bg-slate-800 cursor-pointer transition-colors ${
                  isSelected ? 'bg-indigo-50/80 dark:bg-slate-800/80 font-semibold text-indigo-600 dark:text-indigo-400' : ''
                }`}
              >
                <div className="truncate">
                  <span>{opt.label}</span>
                  {opt.sublabel && (
                    <span className="ml-1.5 text-[10px] text-slate-400 font-normal">
                      ({opt.sublabel})
                    </span>
                  )}
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0 ml-1" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
