import React, { useState, useRef } from 'react';
import { Upload, FileText, Clipboard, Check, Sparkles, Download, ArrowRight } from 'lucide-react';
import { SAMPLE_CSV_CONTENT } from '../data/sampleData';
import { useTheme } from '../context/ThemeContext';

interface CsvUploaderProps {
  onFileUpload: (csvContent: string, fileName: string) => void;
  onLoadSample: () => void;
}

export const CsvUploader: React.FC<CsvUploaderProps> = ({ onFileUpload, onLoadSample }) => {
  const { theme } = useTheme();
  const [isDragging, setIsDragging] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [showPasteArea, setShowPasteArea] = useState(false);
  const [copiedSample, setCopiedSample] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      readFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      readFile(file);
    }
  };

  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onFileUpload(content, file.name);
      }
    };
    reader.readAsText(file);
  };

  const handlePasteSubmit = () => {
    if (pasteText.trim()) {
      onFileUpload(pasteText, 'pasted-scheduling-data.csv');
      setPasteText('');
      setShowPasteArea(false);
    }
  };

  const handleDownloadSampleInput = () => {
    const blob = new Blob([SAMPLE_CSV_CONTENT], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sample_scheduling_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const containerBg =
    theme === 'light'
      ? 'bg-white border-slate-200 text-slate-800 shadow-md'
      : theme === 'semi-dark'
      ? 'bg-zinc-800 border-zinc-700 text-zinc-100 shadow-xl'
      : 'bg-slate-900 border-slate-800 text-slate-200 shadow-xl';

  const dragBoxBg =
    theme === 'light'
      ? 'border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100/80 text-slate-800'
      : theme === 'semi-dark'
      ? 'border-zinc-700 hover:border-zinc-500 bg-zinc-900/50 hover:bg-zinc-900 text-zinc-200'
      : 'border-slate-700 hover:border-slate-500 bg-slate-950/50 hover:bg-slate-950 text-slate-200';

  const pasteAreaBg =
    theme === 'light'
      ? 'bg-slate-50 border-slate-200'
      : theme === 'semi-dark'
      ? 'bg-zinc-900 border-zinc-700'
      : 'bg-slate-950 border-slate-800';

  return (
    <div className={`border rounded-2xl p-6 mb-6 ${containerBg}`}>
      <div className={`flex flex-col md:flex-row md:items-center justify-between pb-5 mb-5 border-b gap-4 ${theme === 'light' ? 'border-slate-200' : theme === 'semi-dark' ? 'border-zinc-700' : 'border-slate-800'}`}>
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Upload className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            Upload Scheduling Tool Report
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Import your scheduling CSV to automatically extract <code className="text-indigo-600 dark:text-indigo-300">Sum of Internal ID</code> and <code className="text-indigo-600 dark:text-indigo-300">Sum of UnitsToProduce</code>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onLoadSample}
            className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 mr-1.5 text-indigo-200 animate-pulse" />
            Load Sample CSV (Sydney)
          </button>
          <button
            onClick={handleDownloadSampleInput}
            className={`inline-flex items-center px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer border ${theme === 'light' ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'}`}
            title="Download sample scheduling CSV file"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 opacity-70" />
            Sample CSV
          </button>
        </div>
      </div>

      {/* Drag & Drop Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-indigo-500 bg-indigo-500/10 scale-[0.99]'
            : dragBoxBg
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv,.txt"
          className="hidden"
        />
        <div className={`w-14 h-14 rounded-full border flex items-center justify-center mx-auto mb-3 shadow-inner ${theme === 'light' ? 'bg-white border-slate-300' : 'bg-slate-800 border-slate-700'}`}>
          <FileText className="w-7 h-7 text-indigo-500 dark:text-indigo-400" />
        </div>
        <h3 className="text-sm font-semibold">
          Drop your scheduling CSV here, or <span className="text-indigo-600 dark:text-indigo-400 underline">browse file</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Supports CSV exports with internal IDs, units to produce, and location headers
        </p>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>Auto-detects "Sum of Internal ID" & "Sum of UnitsToProduce"</span>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2 mb-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
        <Clipboard className="w-4 h-4 text-indigo-500" />
        Or paste raw CSV text directly:
      </div>

      <div className={`p-4 rounded-xl border ${pasteAreaBg}`}>
        <textarea
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          rows={5}
          placeholder="location,product,Sum of Internal ID,Sum of UnitsToProduce..."
          className={`w-full border rounded-lg p-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 ${theme === 'light' ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-200'}`}
        />
        <div className="mt-2.5 flex justify-end gap-2">
          <button
            onClick={() => setPasteText('')}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer"
          >
            Clear
          </button>
          <button
            onClick={handlePasteSubmit}
            disabled={!pasteText.trim()}
            className="px-4 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 cursor-pointer inline-flex items-center gap-1.5"
          >
            Parse & Import
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
