import React from 'react';
import { OutputSchedulerRow, ValidationWarning } from '../types';
import { useTheme } from '../context/ThemeContext';
import { Layers, PackageCheck, AlertCircle, Calendar, Hash, Tag, Clock } from 'lucide-react';

interface MetricsBarProps {
  rows: OutputSchedulerRow[];
  warnings: ValidationWarning[];
  defaultDate: string;
  defaultMemo: string;
}

export const MetricsBar: React.FC<MetricsBarProps> = ({
  rows,
  warnings,
  defaultDate,
  defaultMemo,
}) => {
  const { theme } = useTheme();
  const totalRows = rows.length;
  const totalQuantity = rows.reduce((acc, curr) => {
    const val = Number(curr.quantity);
    return acc + (isNaN(val) ? 0 : val);
  }, 0);

  const totalLabor = rows.reduce((acc, curr) => {
    const parseNum = (val: string | number | undefined) => {
      if (typeof val === 'number') return val;
      if (!val || val === '') return NaN;
      return parseFloat(String(val).replace(/,/g, ''));
    };

    if (curr.labor_ttl_hours !== undefined && curr.labor_ttl_hours !== '' && curr.quantity !== undefined && curr.quantity !== '') {
      const laborVal = parseNum(curr.labor_ttl_hours);
      const qtyVal = parseNum(curr.quantity);
      if (!isNaN(laborVal) && !isNaN(qtyVal)) {
        return acc + (laborVal * qtyVal);
      }
    }
    return acc;
  }, 0);

  const uniqueItems = new Set(rows.map((r) => r.item_id).filter(Boolean)).size;
  const uniqueSubs = new Set(rows.map((r) => r.subsidiary_id).filter(Boolean)).size;
  const errorCount = warnings.filter((w) => w.type === 'error').length;
  const warningCount = warnings.filter((w) => w.type === 'warning').length;

  const cardStyle =
    theme === 'light'
      ? 'bg-white border-slate-200 text-slate-800 shadow-xs'
      : theme === 'semi-dark'
      ? 'bg-zinc-800 border-zinc-700 text-zinc-100 shadow-sm'
      : 'bg-slate-900 border-slate-800 text-slate-100 shadow-sm';

  const labelText =
    theme === 'light' ? 'text-slate-500' : theme === 'semi-dark' ? 'text-zinc-400' : 'text-slate-400';

  const subText =
    theme === 'light' ? 'text-slate-500' : theme === 'semi-dark' ? 'text-zinc-400' : 'text-slate-400';

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 mb-5">
      {/* Total Scheduled Items */}
      <div className={`border rounded-xl p-3.5 ${cardStyle}`}>
        <div className={`flex items-center justify-between text-xs mb-1 ${labelText}`}>
          <span className="font-medium">Total Items</span>
          <Layers className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
        </div>
        <div className="text-xl font-bold tracking-tight">
          {totalRows.toLocaleString()}
        </div>
        <div className={`text-[11px] mt-0.5 ${subText}`}>
          {uniqueItems} unique item IDs
        </div>
      </div>

      {/* Total Units to Produce */}
      <div className={`border rounded-xl p-3.5 ${cardStyle}`}>
        <div className={`flex items-center justify-between text-xs mb-1 ${labelText}`}>
          <span className="font-medium">Total Quantity</span>
          <PackageCheck className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
        </div>
        <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
          {totalQuantity.toLocaleString()}
        </div>
        <div className={`text-[11px] mt-0.5 ${subText}`}>Sum of production units</div>
      </div>

      {/* Total Labor Required */}
      <div className={`border rounded-xl p-3.5 ${cardStyle}`}>
        <div className={`flex items-center justify-between text-xs mb-1 ${labelText}`}>
          <span className="font-medium">Total Labour</span>
          <Clock className="w-3.5 h-3.5 text-pink-500 dark:text-pink-400" />
        </div>
        <div className="text-xl font-bold text-pink-600 dark:text-pink-400 tracking-tight">
          {totalLabor.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
        </div>
        <div className={`text-[11px] mt-0.5 ${subText}`}>Total Labour (Units × Hrs)</div>
      </div>

      {/* Subsidiary Coverage */}
      <div className={`border rounded-xl p-3.5 ${cardStyle}`}>
        <div className={`flex items-center justify-between text-xs mb-1 ${labelText}`}>
          <span className="font-medium">Subsidiaries</span>
          <Hash className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
        </div>
        <div className="text-xl font-bold tracking-tight">
          {uniqueSubs} <span className={`text-xs font-normal ${subText}`}>active</span>
        </div>
        <div className={`text-[11px] mt-0.5 ${subText}`}>Auto-mapped from source</div>
      </div>

      {/* Date Assignment */}
      <div className={`border rounded-xl p-3.5 ${cardStyle}`}>
        <div className={`flex items-center justify-between text-xs mb-1 ${labelText}`}>
          <span className="font-medium">Schedule Dates</span>
          <Calendar className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
        </div>
        <div className="text-sm font-semibold truncate mt-1">
          {defaultDate || 'Not set'}
        </div>
        <div className={`text-[11px] mt-0.5 ${subText}`}>Start & End dates</div>
      </div>

      {/* Default Memo */}
      <div className={`border rounded-xl p-3.5 ${cardStyle}`}>
        <div className={`flex items-center justify-between text-xs mb-1 ${labelText}`}>
          <span className="font-medium">Default Memo</span>
          <Tag className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
        </div>
        <div className="text-sm font-semibold truncate mt-1" title={defaultMemo}>
          {defaultMemo || 'None'}
        </div>
        <div className={`text-[11px] mt-0.5 ${subText}`}>Batch memo code</div>
      </div>

      {/* Validation Status */}
      <div className={`border rounded-xl p-3.5 ${cardStyle}`}>
        <div className={`flex items-center justify-between text-xs mb-1 ${labelText}`}>
          <span className="font-medium">Validation</span>
          <AlertCircle
            className={`w-3.5 h-3.5 ${
              errorCount > 0
                ? 'text-rose-500 dark:text-rose-400'
                : warningCount > 0
                ? 'text-amber-500 dark:text-amber-400'
                : 'text-emerald-500 dark:text-emerald-400'
            }`}
          />
        </div>
        <div className="text-sm font-bold mt-1">
          {errorCount > 0 ? (
            <span className="text-rose-500 dark:text-rose-400">{errorCount} Errors</span>
          ) : warningCount > 0 ? (
            <span className="text-amber-500 dark:text-amber-400">{warningCount} Warnings</span>
          ) : (
            <span className="text-emerald-600 dark:text-emerald-400">100% Valid</span>
          )}
        </div>
        <div className={`text-[11px] mt-0.5 ${subText}`}>
          {errorCount + warningCount === 0
            ? 'Ready to export'
            : `${errorCount + warningCount} row issues`}
        </div>
      </div>
    </div>
  );
};
