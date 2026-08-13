import React, { useState } from 'react';
import { OutputSchedulerRow } from '../types';
import { useTheme } from '../context/ThemeContext';
import { Edit3, CheckCircle2, Sliders, Calendar, Tag, Hash, RefreshCw, Calculator, Undo, Redo } from 'lucide-react';
import { ComboInput, ComboOption } from './ComboInput';
import { ComboDatePicker } from './ComboDatePicker';
import { getCurrentWeekMemo, getMemoOptions } from '../utils/date';

interface BulkEditorBarProps {
  selectedRowIds: string[];
  totalRowsCount: number;
  onApplyBulkUpdate: (
    updates: Partial<Pick<OutputSchedulerRow, 'subsidiary_id' | 'location' | 'start_date' | 'end_date' | 'quantity' | 'memo'>>,
    applyToSelectedOnly: boolean,
    quantityMultiplier?: number,
    quantityDivisor?: number
  ) => void;
  onClearSelection: () => void;
  onSelectAll: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

const SUBSIDIARY_OPTIONS: ComboOption[] = [
  { label: '7', value: 7, sublabel: 'Sydney AU' },
  { label: '1', value: 1, sublabel: 'HQ Parent' },
  { label: '2', value: 2, sublabel: 'US Division' },
  { label: '3', value: 3, sublabel: 'UK Division' },
  { label: '5', value: 5, sublabel: 'NZ Division' },
  { label: '10', value: 10, sublabel: 'Global Subsidiary' },
];

const LOCATION_OPTIONS: ComboOption[] = [
  { label: '25', value: 25, sublabel: 'Sydney Site' },
  { label: '1', value: 1, sublabel: 'Main Warehouse' },
  { label: '5', value: 5, sublabel: 'East Distribution' },
  { label: '10', value: 10, sublabel: 'West Distribution' },
  { label: '15', value: 15, sublabel: 'Central Site' },
  { label: '30', value: 30, sublabel: 'Melbourne Site' },
  { label: '50', value: 50, sublabel: 'Brisbane Site' },
];

const MEMO_OPTIONS: ComboOption[] = getMemoOptions();

export const BulkEditorBar: React.FC<BulkEditorBarProps> = ({
  selectedRowIds,
  totalRowsCount,
  onApplyBulkUpdate,
  onClearSelection,
  onSelectAll,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}) => {
  const { theme } = useTheme();
  const [applyToSelectedOnly, setApplyToSelectedOnly] = useState<boolean>(selectedRowIds.length > 0);
  
  // Form values
  const [bulkSubId, setBulkSubId] = useState<string>('');
  const [bulkLocId, setBulkLocId] = useState<string>('');
  const [bulkStartDate, setBulkStartDate] = useState<string>('');
  const [bulkEndDate, setBulkEndDate] = useState<string>('');
  const [bulkMemo, setBulkMemo] = useState<string>(`${getCurrentWeekMemo()} - CSO`);
  const [bulkQuantity, setBulkQuantity] = useState<string>('');
  const [quantityMultiplier, setQuantityMultiplier] = useState<string>('');
  const [quantityDivisor, setQuantityDivisor] = useState<string>('');

  const hasSelection = selectedRowIds.length > 0;
  const targetCount = applyToSelectedOnly && hasSelection ? selectedRowIds.length : totalRowsCount;

  const handleApply = (field: keyof OutputSchedulerRow) => {
    const updates: Partial<OutputSchedulerRow> = {};

    if (field === 'subsidiary_id' && bulkSubId !== '') {
      updates.subsidiary_id = Number(bulkSubId) || bulkSubId;
    } else if (field === 'location' && bulkLocId !== '') {
      updates.location = Number(bulkLocId) || bulkLocId;
    } else if (field === 'start_date' && bulkStartDate !== '') {
      updates.start_date = bulkStartDate;
    } else if (field === 'end_date' && bulkEndDate !== '') {
      updates.end_date = bulkEndDate;
    } else if (field === 'memo' && bulkMemo !== '') {
      updates.memo = bulkMemo;
    } else if (field === 'quantity' && bulkQuantity !== '') {
      updates.quantity = Number(bulkQuantity) || bulkQuantity;
    }

    let multiplierNum: number | undefined = undefined;
    let divisorNum: number | undefined = undefined;

    if (field === 'quantity' && quantityMultiplier !== '') {
      const mult = parseFloat(quantityMultiplier);
      if (!isNaN(mult)) {
        multiplierNum = mult;
      }
    }
    
    if (field === 'quantity' && quantityDivisor !== '') {
      const div = parseFloat(quantityDivisor);
      if (!isNaN(div) && div !== 0) {
        divisorNum = div;
      }
    }

    if (Object.keys(updates).length > 0 || multiplierNum !== undefined || divisorNum !== undefined) {
      onApplyBulkUpdate(updates, applyToSelectedOnly && hasSelection, multiplierNum, divisorNum);
    }
  };

  const handleApplyAllChanges = () => {
    const updates: Partial<OutputSchedulerRow> = {};

    if (bulkSubId !== '') updates.subsidiary_id = Number(bulkSubId) || bulkSubId;
    if (bulkLocId !== '') updates.location = Number(bulkLocId) || bulkLocId;
    if (bulkStartDate !== '') updates.start_date = bulkStartDate;
    if (bulkEndDate !== '') updates.end_date = bulkEndDate;
    if (bulkMemo !== '') updates.memo = bulkMemo;
    if (bulkQuantity !== '') updates.quantity = Number(bulkQuantity) || bulkQuantity;

    let multiplierNum: number | undefined = undefined;
    let divisorNum: number | undefined = undefined;

    if (quantityMultiplier !== '') {
      const mult = parseFloat(quantityMultiplier);
      if (!isNaN(mult)) multiplierNum = mult;
    }
    
    if (quantityDivisor !== '') {
      const div = parseFloat(quantityDivisor);
      if (!isNaN(div) && div !== 0) divisorNum = div;
    }

    onApplyBulkUpdate(updates, applyToSelectedOnly && hasSelection, multiplierNum, divisorNum);
  };

  const cardStyle =
    theme === 'light'
      ? 'bg-white border-slate-200 text-slate-800 shadow-sm'
      : theme === 'semi-dark'
      ? 'bg-zinc-800 border-zinc-700 text-zinc-100 shadow-md'
      : 'bg-slate-900 border-slate-800 text-slate-200 shadow-md';

  const innerBoxBg =
    theme === 'light'
      ? 'bg-slate-50 border-slate-200'
      : theme === 'semi-dark'
      ? 'bg-zinc-900 border-zinc-700'
      : 'bg-slate-950 border-slate-800';

  const inputStyle =
    theme === 'light'
      ? 'bg-white border border-slate-400 text-slate-900 placeholder-slate-400 focus:ring-indigo-500'
      : theme === 'semi-dark'
      ? 'bg-zinc-800 border border-zinc-600 text-zinc-100 placeholder-zinc-400 focus:ring-indigo-500'
      : 'bg-slate-900 border border-slate-700 text-white placeholder-slate-600 focus:ring-indigo-500';

  const labelText =
    theme === 'light' ? 'text-slate-600' : theme === 'semi-dark' ? 'text-zinc-400' : 'text-slate-400';

  return (
    <div className={`border rounded-2xl p-4 mb-5 ${cardStyle}`}>
      <div className={`flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 mb-3 border-b ${theme === 'light' ? 'border-slate-200' : theme === 'semi-dark' ? 'border-zinc-700' : 'border-slate-800'}`}>
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-md bg-indigo-500/20 text-indigo-500 dark:text-indigo-400 flex items-center justify-center">
            <Edit3 className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider">
              Bulk Editor & Batch Column Transformer
            </h3>
            <p className={`text-[11px] ${labelText}`}>
              Update columns across {targetCount} {targetCount === 1 ? 'row' : 'rows'} at once
            </p>
          </div>
        </div>

        {/* Target Scope Selection & History */}
        <div className="flex items-center gap-2">
          {/* History Controls */}
          <div className="flex items-center space-x-1 mr-2">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className={`p-1.5 rounded-lg transition-colors border ${
                canUndo ? 'bg-indigo-600/10 text-indigo-600 border-indigo-200 hover:bg-indigo-600/20 dark:bg-indigo-500/20 dark:text-indigo-400 dark:border-indigo-500/30 dark:hover:bg-indigo-500/30 cursor-pointer' : 'bg-slate-100 border-slate-200 text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-600 cursor-not-allowed'
              }`}
              title="Undo"
            >
              <Undo className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className={`p-1.5 rounded-lg transition-colors border ${
                canRedo ? 'bg-indigo-600/10 text-indigo-600 border-indigo-200 hover:bg-indigo-600/20 dark:bg-indigo-500/20 dark:text-indigo-400 dark:border-indigo-500/30 dark:hover:bg-indigo-500/30 cursor-pointer' : 'bg-slate-100 border-slate-200 text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-600 cursor-not-allowed'
              }`}
              title="Redo"
            >
              <Redo className="w-3.5 h-3.5" />
            </button>
          </div>

          <span className={`text-xs font-medium ${labelText}`}>Apply To:</span>
          <div className={`inline-flex rounded-lg p-1 border text-xs ${innerBoxBg}`}>
            <button
              type="button"
              onClick={() => setApplyToSelectedOnly(true)}
              disabled={!hasSelection}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                applyToSelectedOnly && hasSelection
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed'
              }`}
            >
              Selected ({selectedRowIds.length})
            </button>
            <button
              type="button"
              onClick={() => setApplyToSelectedOnly(false)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                !applyToSelectedOnly || !hasSelection
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Rows ({totalRowsCount})
            </button>
          </div>

          {hasSelection && (
            <button
              onClick={onClearSelection}
              className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 underline ml-2 cursor-pointer"
            >
              Deselect
            </button>
          )}
        </div>
      </div>

      {/* Bulk Inputs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
        {/* Subsidiary ID */}
        <div className={`p-2 rounded-xl border ${innerBoxBg}`}>
          <label className={`block text-[10px] font-semibold uppercase mb-1 ${labelText}`}>
            subsidiary_id
          </label>
          <div className="flex gap-1">
            <ComboInput
              value={bulkSubId}
              onChange={(v) => setBulkSubId(String(v))}
              options={SUBSIDIARY_OPTIONS}
              placeholder="e.g. 7"
              inputClassName={`border rounded px-2 py-1 text-xs font-mono ${inputStyle}`}
            />
            <button
              type="button"
              onClick={() => handleApply('subsidiary_id')}
              className="px-2 py-1 bg-indigo-600/20 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-600 hover:text-white rounded text-[11px] font-semibold transition-colors cursor-pointer flex-shrink-0"
              title="Apply subsidiary_id to target rows"
            >
              Set
            </button>
          </div>
        </div>

        {/* Location ID */}
        <div className={`p-2 rounded-xl border ${innerBoxBg}`}>
          <label className={`block text-[10px] font-semibold uppercase mb-1 ${labelText}`}>
            location
          </label>
          <div className="flex gap-1">
            <ComboInput
              value={bulkLocId}
              onChange={(v) => setBulkLocId(String(v))}
              options={LOCATION_OPTIONS}
              placeholder="e.g. 25"
              inputClassName={`border rounded px-2 py-1 text-xs font-mono ${inputStyle}`}
            />
            <button
              type="button"
              onClick={() => handleApply('location')}
              className="px-2 py-1 bg-indigo-600/20 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-600 hover:text-white rounded text-[11px] font-semibold transition-colors cursor-pointer flex-shrink-0"
              title="Apply location code to target rows"
            >
              Set
            </button>
          </div>
        </div>

        {/* Start Date */}
        <div className={`p-2 rounded-xl border ${innerBoxBg}`}>
          <label className={`block text-[10px] font-semibold uppercase mb-1 ${labelText}`}>
            start_date
          </label>
          <div className="flex gap-1">
            <ComboDatePicker
              value={bulkStartDate}
              onChange={(val) => setBulkStartDate(val)}
              placeholder="28/08/2026"
              inputClassName={`border rounded px-2 py-1 text-xs font-mono focus:outline-none focus:ring-1 ${inputStyle}`}
              className="min-w-[140px] w-full"
            />
            <button
              type="button"
              onClick={() => handleApply('start_date')}
              className="px-2 py-1 bg-indigo-600/20 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-600 hover:text-white rounded text-[11px] font-semibold transition-colors cursor-pointer flex-shrink-0"
              title="Apply start_date to target rows (also sets end_date if un-customized)"
            >
              Set
            </button>
          </div>
        </div>

        {/* End Date */}
        <div className={`p-2 rounded-xl border ${innerBoxBg}`}>
          <label className={`block text-[10px] font-semibold uppercase mb-1 ${labelText}`}>
            end_date
          </label>
          <div className="flex gap-1">
            <ComboDatePicker
              value={bulkEndDate}
              onChange={(val) => setBulkEndDate(val)}
              placeholder="28/08/2026"
              inputClassName={`border rounded px-2 py-1 text-xs font-mono focus:outline-none focus:ring-1 ${inputStyle}`}
              className="min-w-[140px] w-full"
            />
            <button
              type="button"
              onClick={() => handleApply('end_date')}
              className="px-2 py-1 bg-indigo-600/20 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-600 hover:text-white rounded text-[11px] font-semibold transition-colors cursor-pointer flex-shrink-0"
              title="Apply end_date to target rows (marks end_date as customized)"
            >
              Set
            </button>
          </div>
        </div>

        {/* Memo */}
        <div className={`p-2 rounded-xl border ${innerBoxBg}`}>
          <label className={`block text-[10px] font-semibold uppercase mb-1 ${labelText}`}>
            memo
          </label>
          <div className="flex flex-col gap-1.5">
            <div className="flex gap-1">
              <ComboInput
                value={bulkMemo}
                onChange={(v) => setBulkMemo(String(v))}
                options={MEMO_OPTIONS}
                placeholder={`${getCurrentWeekMemo()} - CSO`}
                inputClassName={`border rounded px-2 py-1 text-xs font-mono ${inputStyle}`}
              />
              <button
                type="button"
                onClick={() => handleApply('memo')}
                className="px-2 py-1 bg-indigo-600/20 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-600 hover:text-white rounded text-[11px] font-semibold transition-colors cursor-pointer flex-shrink-0"
                title="Apply memo to target rows"
              >
                Set
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                const match = bulkMemo.match(/^W(\d+)/);
                if (match) {
                  let week = parseInt(match[1], 10);
                  week = week === 52 ? 1 : week + 1;
                  const newMemo = bulkMemo.replace(/^W\d+/, `W${week.toString().padStart(2, '0')}`);
                  setBulkMemo(newMemo);
                }
              }}
              className="px-2 py-1 bg-slate-200/50 dark:bg-slate-700/50 hover:bg-slate-300/50 dark:hover:bg-slate-600/50 text-slate-700 dark:text-slate-300 rounded text-[10px] font-medium transition-colors w-full text-center"
              title="Push week forward by 1"
            >
              +1 Week
            </button>
          </div>
        </div>

        {/* Quantity Set / Multiply / Divide */}
        <div className={`p-2 rounded-xl border ${innerBoxBg}`}>
          <label className={`block text-[10px] font-semibold uppercase mb-1 ${labelText}`}>
            quantity (val / mult / div)
          </label>
          <div className="flex gap-1">
            <input
              type="text"
              placeholder="Set"
              value={bulkQuantity}
              onChange={(e) => setBulkQuantity(e.target.value)}
              className={`w-1/3 border rounded px-1.5 py-1 text-xs focus:outline-none focus:ring-1 font-mono ${inputStyle}`}
            />
            <input
              type="text"
              placeholder="Mult"
              title="Multiply (e.g. 2)"
              value={quantityMultiplier}
              onChange={(e) => setQuantityMultiplier(e.target.value)}
              className={`w-1/3 border rounded px-1.5 py-1 text-xs focus:outline-none focus:ring-1 font-mono ${inputStyle}`}
            />
            <input
              type="text"
              placeholder="Div"
              title="Divide (e.g. 3)"
              value={quantityDivisor}
              onChange={(e) => setQuantityDivisor(e.target.value)}
              className={`w-1/3 border rounded px-1.5 py-1 text-xs focus:outline-none focus:ring-1 font-mono ${inputStyle}`}
            />
            <button
              type="button"
              onClick={() => handleApply('quantity')}
              className="px-2 py-1 bg-emerald-600/20 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-600 hover:text-white rounded text-[11px] font-semibold transition-colors cursor-pointer"
              title="Apply quantity changes"
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      <div className="mt-3 flex justify-between items-center text-xs">
        <span className={`text-[11px] ${labelText}`}>
          Tip: Click any cell directly in the table below to edit inline.
        </span>

        <button
          onClick={handleApplyAllChanges}
          className="inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-all cursor-pointer"
        >
          <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-indigo-200" />
          Apply All Entered Bulk Changes ({targetCount})
        </button>
      </div>
    </div>
  );
};
