import React, { useState } from 'react';
import { Download, Copy, Check, X, FileCheck, Code2 } from 'lucide-react';
import { generateCsvOutput } from '../utils/csv';
import { OutputSchedulerRow } from '../types';
import { useTheme } from '../context/ThemeContext';

interface ExportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  rows: OutputSchedulerRow[];
}

export const ExportPreviewModal: React.FC<ExportPreviewModalProps> = ({
  isOpen,
  onClose,
  rows,
}) => {
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const csvText = generateCsvOutput(rows);
  const totalUnits = rows.reduce((sum, r) => sum + (Number(r.quantity) || 0), 0);

  const handleCopy = () => {
    navigator.clipboard.writeText(csvText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `bulk_scheduler_import_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const modalBg =
    theme === 'light'
      ? 'bg-white border-slate-200 text-slate-800'
      : theme === 'semi-dark'
      ? 'bg-zinc-800 border-zinc-700 text-zinc-100'
      : 'bg-slate-900 border-slate-800 text-slate-200';

  const headerBg =
    theme === 'light'
      ? 'bg-slate-50 border-slate-200'
      : theme === 'semi-dark'
      ? 'bg-zinc-900 border-zinc-700'
      : 'bg-slate-950 border-slate-800';

  const innerBoxBg =
    theme === 'light'
      ? 'bg-slate-50 border-slate-200 text-slate-700'
      : theme === 'semi-dark'
      ? 'bg-zinc-900 border-zinc-700 text-zinc-300'
      : 'bg-slate-950 border-slate-800 text-slate-400';

  const textareaStyle =
    theme === 'light'
      ? 'bg-slate-50 border-slate-300 text-emerald-800'
      : theme === 'semi-dark'
      ? 'bg-zinc-900 border-zinc-700 text-emerald-400'
      : 'bg-slate-950 border-slate-800 text-emerald-300';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className={`border rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden my-8 ${modalBg}`}>
        {/* Modal Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${headerBg}`}>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-500 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold">Export Formatted CSV</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Headers: <code className="text-emerald-600 dark:text-emerald-300 font-mono">subsidiary_id,item_id,location,start_date,end_date,quantity,memo</code>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <div className={`flex items-center justify-between text-xs p-3 rounded-xl border ${innerBoxBg}`}>
            <div>
              Total Export Rows: <strong className="font-semibold text-slate-900 dark:text-white">{rows.length}</strong>
            </div>
            <div>
              Total Scheduled Quantity: <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">{totalUnits.toLocaleString()}</strong>
            </div>
            <div className="hidden sm:block">
              Format: <strong className="text-indigo-600 dark:text-indigo-300 font-semibold">Standard CSV</strong>
            </div>
          </div>

          {/* Raw CSV Text Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                Formatted Output Preview
              </label>
              <span className="text-[11px] text-slate-500">First 20 lines shown in text area</span>
            </div>
            <textarea
              readOnly
              value={csvText}
              rows={12}
              className={`w-full border rounded-xl p-3.5 text-xs font-mono focus:outline-none leading-relaxed select-all ${textareaStyle}`}
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className={`px-6 py-4 border-t flex items-center justify-between ${headerBg}`}>
          <button
            onClick={handleCopy}
            className={`inline-flex items-center px-4 py-2 rounded-xl text-xs font-medium border cursor-pointer ${theme === 'light' ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'}`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-1.5 text-emerald-500 dark:text-emerald-400" />
                Copied to Clipboard!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-1.5 opacity-70" />
                Copy Raw CSV
              </>
            )}
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-xl text-xs font-medium border cursor-pointer ${theme === 'light' ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'}`}
            >
              Back to Editor
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/20 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 mr-1.5" />
              Download CSV File
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
