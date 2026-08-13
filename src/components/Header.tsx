import React from 'react';
import { Table, MapPin, FileSpreadsheet, RotateCcw, Download, Moon, Sun, Contrast, Upload } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { AppTheme } from '../types';

interface HeaderProps {
  onLoadSample: () => void;
  onReset: () => void;
  onOpenLocations: () => void;
  onExport: () => void;
  onImport?: (content: string, fileName: string) => void;
  hasData: boolean;
  rowCounts: number;
}

export const Header: React.FC<HeaderProps> = ({
  onLoadSample,
  onReset,
  onOpenLocations,
  onExport,
  onImport,
  hasData,
  rowCounts,
}) => {
  const { theme, setTheme } = useTheme();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content && onImport) {
          onImport(content, file.name);
        }
      };
      reader.readAsText(file);
      // Reset input value so same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const headerBg =
    theme === 'light'
      ? 'bg-white border-b border-slate-200 text-slate-900 shadow-sm'
      : theme === 'semi-dark'
      ? 'bg-zinc-800 border-b border-zinc-700 text-zinc-100 shadow-md'
      : 'bg-slate-900 border-b border-slate-800 text-white shadow-md';

  const titleText =
    theme === 'light' ? 'text-slate-900' : theme === 'semi-dark' ? 'text-zinc-100' : 'text-white';

  const subText =
    theme === 'light' ? 'text-slate-500' : theme === 'semi-dark' ? 'text-zinc-400' : 'text-slate-400';

  const btnBg =
    theme === 'light'
      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
      : theme === 'semi-dark'
      ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-200 border-zinc-600'
      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700';

  const themeOptions: { id: AppTheme; label: string; icon: React.ReactNode }[] = [
    { id: 'dark', label: 'Dark', icon: <Moon className="w-3.5 h-3.5" /> },
    { id: 'semi-dark', label: 'Semi Dark', icon: <Contrast className="w-3.5 h-3.5" /> },
    { id: 'light', label: 'Light', icon: <Sun className="w-3.5 h-3.5 text-amber-500" /> },
  ];

  return (
    <header className={`${headerBg} sticky top-0 z-30 transition-colors duration-200`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/10">
            <FileSpreadsheet className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className={`text-lg font-bold tracking-tight ${titleText}`}>
                Scheduling Tool - Bulk Scheduler (CSV)
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-500 dark:text-indigo-300 border border-indigo-500/20">
                v1.0
              </span>
            </div>
            <p className={`text-xs ${subText}`}>
              Transform scheduling CSV reports into Netsuite/ERP ready import formats
            </p>
          </div>
        </div>

        {/* Action Buttons & Theme Selector */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Theme Selector Segmented Control */}
          <div className={`flex items-center p-1 rounded-xl border ${theme === 'light' ? 'bg-slate-100 border-slate-300' : theme === 'semi-dark' ? 'bg-zinc-900 border-zinc-700' : 'bg-slate-950 border-slate-800'}`}>
            {themeOptions.map((opt) => {
              const active = theme === opt.id;
              let activeClass = '';
              if (active) {
                if (theme === 'light') activeClass = 'bg-white text-slate-900 shadow-xs font-semibold';
                else if (theme === 'semi-dark') activeClass = 'bg-zinc-700 text-zinc-100 font-semibold';
                else activeClass = 'bg-slate-800 text-white font-semibold';
              } else {
                activeClass = theme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200';
              }

              return (
                <button
                  key={opt.id}
                  onClick={() => setTheme(opt.id)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg transition-all cursor-pointer ${activeClass}`}
                  title={`Switch to ${opt.label} theme`}
                >
                  {opt.icon}
                  <span className="hidden sm:inline">{opt.label}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={onOpenLocations}
            className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors shadow-xs cursor-pointer ${btnBg}`}
            title="Configure Subsidiary IDs and Location Codes"
          >
            <MapPin className="w-3.5 h-3.5 mr-1.5 text-indigo-500 dark:text-indigo-400" />
            Location Rules
          </button>

          {!hasData ? (
            <button
              onClick={onLoadSample}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-indigo-100 bg-indigo-600 hover:bg-indigo-500 border border-indigo-500 transition-colors cursor-pointer shadow-xs"
            >
              <Table className="w-3.5 h-3.5 mr-1.5 text-indigo-200" />
              Load Sample Data
            </button>
          ) : (
            <button
              onClick={onReset}
              className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${btnBg}`}
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Clear & Reset
            </button>
          )}

          <button
            onClick={() => onImport && onImport('', '')}
            className="inline-flex items-center px-4 py-1.5 text-xs font-semibold rounded-lg shadow-md transition-all cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-950/40 ring-1 ring-blue-400/30"
            title="Import CSV Data"
          >
            <Upload className="w-3.5 h-3.5 mr-1.5" />
            Import CSV
          </button>

          <button
            onClick={onExport}
            disabled={!hasData || rowCounts === 0}
            className={`inline-flex items-center px-4 py-1.5 text-xs font-semibold rounded-lg shadow-md transition-all cursor-pointer ${
              hasData && rowCounts > 0
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/40 ring-1 ring-emerald-400/30'
                : 'bg-slate-300 text-slate-500 border border-slate-300 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700 cursor-not-allowed'
            }`}
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export CSV ({rowCounts})
          </button>
        </div>
      </div>
    </header>
  );
};

