import React from 'react';
import { X } from 'lucide-react';
import { CsvUploader } from './CsvUploader';
import { useTheme } from '../context/ThemeContext';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileUpload: (csvContent: string, fileName: string) => void;
  onLoadSample: () => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onFileUpload,
  onLoadSample,
}) => {
  const { theme } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className={`relative w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
          theme === 'light' ? 'bg-slate-50' : theme === 'semi-dark' ? 'bg-zinc-900' : 'bg-slate-950'
        }`}
      >
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          theme === 'light' ? 'border-slate-200' : theme === 'semi-dark' ? 'border-zinc-800' : 'border-slate-800'
        }`}>
          <h2 className={`text-xl font-bold ${
            theme === 'light' ? 'text-slate-800' : 'text-white'
          }`}>Import Data</h2>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              theme === 'light' ? 'hover:bg-slate-200 text-slate-500' : theme === 'semi-dark' ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <CsvUploader 
            onFileUpload={(content, name) => {
              onFileUpload(content, name);
              onClose();
            }} 
            onLoadSample={() => {
              onLoadSample();
              onClose();
            }} 
          />
        </div>
      </div>
    </div>
  );
};
