import React, { useState, useMemo } from 'react';
import { OutputSchedulerRow, ValidationWarning } from '../types';
import { useTheme } from '../context/ThemeContext';
import { ComboInput, ComboOption } from './ComboInput';
import { ComboDatePicker } from './ComboDatePicker';
import { getMemoOptions } from '../utils/date';
import {
  Search,
  Trash2,
  Copy,
  Plus,
  ArrowUpDown,
  AlertCircle,
  CheckCircle,
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from 'lucide-react';

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

interface DataGridProps {
  rows: OutputSchedulerRow[];
  warnings: ValidationWarning[];
  selectedRowIds: string[];
  onSelectRow: (id: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onUpdateRow: (id: string, updated: Partial<OutputSchedulerRow>) => void;
  onDeleteRows: (ids: string[]) => void;
  onAddRow: () => void;
  onDuplicateRow: (id: string) => void;
}

export const DataGrid: React.FC<DataGridProps> = ({
  rows,
  warnings,
  selectedRowIds,
  onSelectRow,
  onSelectAll,
  onUpdateRow,
  onDeleteRows,
  onAddRow,
  onDuplicateRow,
}) => {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'warnings'>('all');
  const [sortField, setSortField] = useState<keyof OutputSchedulerRow>('item_id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(25);

  const warningsMap = useMemo(() => {
    const map = new Map<string, ValidationWarning[]>();
    warnings.forEach((w) => {
      if (!map.has(w.rowId)) map.set(w.rowId, []);
      map.get(w.rowId)!.push(w);
    });
    return map;
  }, [warnings]);

  // Filter & Search
  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      if (filterMode === 'warnings' && !warningsMap.has(r.id)) {
        return false;
      }

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchesItem = String(r.item_id).toLowerCase().includes(query);
        const matchesMemo = String(r.memo).toLowerCase().includes(query);
        const matchesProd = String(r.productCode || '').toLowerCase().includes(query);
        const matchesMoq = String(r.moq ?? '').toLowerCase().includes(query);
        const matchesLoc = String(r.sourceLocation || '').toLowerCase().includes(query);
        const matchesSub = String(r.subsidiary_id).toLowerCase().includes(query);

        if (!matchesItem && !matchesMemo && !matchesProd && !matchesMoq && !matchesLoc && !matchesSub) {
          return false;
        }
      }

      return true;
    });
  }, [rows, searchTerm, filterMode, warningsMap]);

  // Sorting
  const sortedRows = useMemo(() => {
    return [...filteredRows].sort((a, b) => {
      const valA = a[sortField] ?? '';
      const valB = b[sortField] ?? '';

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();

      if (strA < strB) return sortDirection === 'asc' ? -1 : 1;
      if (strA > strB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredRows, sortField, sortDirection]);

  // Pagination calculation
  const totalPages = pageSize === -1 ? 1 : Math.ceil(sortedRows.length / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    if (pageSize === -1) return sortedRows;
    const start = (currentPage - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [sortedRows, currentPage, pageSize]);

  const handleSort = (field: keyof OutputSchedulerRow) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const isAllPageSelected = paginatedRows.length > 0 && paginatedRows.every((r) => selectedRowIds.includes(r.id));

  const handleToggleSelectAllPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelectAll(e.target.checked);
  };

  const containerBg =
    theme === 'light'
      ? 'bg-white border-slate-200 text-slate-800 shadow-md'
      : theme === 'semi-dark'
      ? 'bg-zinc-800 border-zinc-700 text-zinc-100 shadow-xl'
      : 'bg-slate-900 border-slate-800 text-slate-200 shadow-xl';

  const toolbarBg =
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
      : 'bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 focus:ring-indigo-500';

  const thBg =
    theme === 'light'
      ? 'bg-slate-100 text-slate-700 border-slate-200'
      : theme === 'semi-dark'
      ? 'bg-zinc-900 text-zinc-300 border-zinc-700'
      : 'bg-slate-950 text-slate-400 border-slate-800';

  const thBtnText =
    theme === 'light' ? 'hover:text-slate-900 text-slate-700' : 'hover:text-white text-slate-300';

  const cellInputStyle =
    theme === 'light'
      ? 'border border-slate-400 bg-slate-50 text-slate-900 focus:bg-white focus:ring-indigo-500'
      : theme === 'semi-dark'
      ? 'border border-zinc-600 bg-zinc-900/90 text-zinc-100 focus:bg-zinc-950 focus:ring-indigo-500'
      : 'border border-slate-700/80 bg-slate-950/80 text-white focus:bg-slate-900 focus:ring-indigo-500';

  const skuBadgeStyle =
    theme === 'light'
      ? 'text-slate-900 bg-slate-100 border-slate-300'
      : theme === 'semi-dark'
      ? 'text-zinc-100 bg-zinc-900 border-zinc-600'
      : 'text-slate-100 bg-slate-950 border-slate-700/80';

  const moqBadgeStyle =
    theme === 'light'
      ? 'text-amber-800 bg-amber-50 border-amber-300'
      : theme === 'semi-dark'
      ? 'text-amber-300 bg-zinc-900 border-zinc-600'
      : 'text-amber-300/90 bg-slate-950 border-slate-700/80';

  return (
    <div className={`border rounded-2xl overflow-hidden ${containerBg}`}>
      {/* Table Toolbar */}
      <div className={`p-4 border-b flex flex-col sm:flex-row items-center justify-between gap-3 ${toolbarBg}`}>
        {/* Search & Filter Inputs */}
        <div className="flex items-center space-x-2 w-full sm:w-auto flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search item_id, memo, SKU..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className={`w-full border rounded-xl pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 ${inputStyle}`}
            />
          </div>

          <div className={`inline-flex rounded-xl p-1 border text-xs ${theme === 'light' ? 'bg-white border-slate-300' : theme === 'semi-dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-900 border-slate-800'}`}>
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-indigo-600 text-white'
                  : theme === 'light'
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({rows.length})
            </button>
            <button
              onClick={() => setFilterMode('warnings')}
              className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer ${
                filterMode === 'warnings'
                  ? 'bg-amber-600 text-white'
                  : theme === 'light'
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Issues ({warnings.length})
            </button>
          </div>
        </div>

        {/* Table Operations */}
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          {selectedRowIds.length > 0 && (
            <button
              onClick={() => onDeleteRows(selectedRowIds)}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Delete Selected ({selectedRowIds.length})
            </button>
          )}

          <button
            onClick={onAddRow}
            className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Row
          </button>
        </div>
      </div>

      {/* Main Table Grid */}
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead className={`border-b sticky top-0 z-20 shadow-xs ${thBg}`}>
            <tr>
              <th className="px-3 py-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={isAllPageSelected}
                  onChange={handleToggleSelectAllPage}
                  className="rounded border-slate-400 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </th>
              
              {/* Output Columns */}
              <th className="px-3 py-3 font-semibold">
                <button
                  onClick={() => handleSort('subsidiary_id')}
                  className={`flex items-center space-x-1 cursor-pointer font-mono ${thBtnText}`}
                >
                  <span>subsidiary_id</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </button>
              </th>

              {/* SKU (Product Code) */}
              <th className="px-3 py-3 font-semibold">
                <button
                  onClick={() => handleSort('productCode')}
                  className={`flex items-center space-x-1 cursor-pointer font-mono ${thBtnText}`}
                  title="SKU / Product Code (Non-editable reference)"
                >
                  <span>sku</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </button>
              </th>

              <th className="px-3 py-3 font-semibold">
                <button
                  onClick={() => handleSort('quantity')}
                  className={`flex items-center space-x-1 cursor-pointer font-mono ${thBtnText}`}
                >
                  <span>quantity</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </button>
              </th>

              {/* MOQ */}
              <th className="px-3 py-3 font-semibold">
                <button
                  onClick={() => handleSort('moq')}
                  className={`flex items-center space-x-1 cursor-pointer font-mono ${thBtnText}`}
                  title="Minimum Order Quantity (Non-editable reference)"
                >
                  <span>moq</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </button>
              </th>

              <th className="px-3 py-3 font-semibold">
                <button
                  onClick={() => handleSort('item_id')}
                  className={`flex items-center space-x-1 cursor-pointer font-mono ${thBtnText}`}
                >
                  <span>item_id</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </button>
              </th>

              <th className="px-3 py-3 font-semibold">
                <button
                  onClick={() => handleSort('location')}
                  className={`flex items-center space-x-1 cursor-pointer font-mono ${thBtnText}`}
                >
                  <span>location</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </button>
              </th>

              <th className="px-3 py-3 font-semibold">
                <button
                  onClick={() => handleSort('start_date')}
                  className={`flex items-center space-x-1 cursor-pointer font-mono ${thBtnText}`}
                >
                  <span>start_date</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </button>
              </th>

              <th className="px-3 py-3 font-semibold">
                <button
                  onClick={() => handleSort('end_date')}
                  className={`flex items-center space-x-1 cursor-pointer font-mono ${thBtnText}`}
                >
                  <span>end_date</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </button>
              </th>

              <th className="px-3 py-3 font-semibold">
                <button
                  onClick={() => handleSort('memo')}
                  className={`flex items-center space-x-1 cursor-pointer font-mono ${thBtnText}`}
                >
                  <span>memo</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </button>
              </th>

              <th className="px-3 py-3 font-semibold opacity-80 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className={`divide-y ${theme === 'light' ? 'divide-slate-200 bg-white' : theme === 'semi-dark' ? 'divide-zinc-700/60 bg-zinc-800/50' : 'divide-slate-800/60 bg-slate-900/50'}`}>
            {paginatedRows.map((row) => {
              const isSelected = selectedRowIds.includes(row.id);
              const rowWarnings = warningsMap.get(row.id);

              return (
                <tr
                  key={row.id}
                  className={`transition-colors ${
                    isSelected
                      ? theme === 'light'
                        ? 'bg-indigo-50/80'
                        : 'bg-indigo-950/30'
                      : theme === 'light'
                      ? 'hover:bg-slate-50'
                      : theme === 'semi-dark'
                      ? 'hover:bg-zinc-700/40'
                      : 'hover:bg-slate-800/40'
                  }`}
                >
                  {/* Selection Checkbox */}
                  <td className="px-3 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => onSelectRow(row.id, e.target.checked)}
                      className="rounded border-slate-400 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </td>

                  {/* subsidiary_id */}
                  <td className="px-3 py-2">
                    <ComboInput
                      value={row.subsidiary_id}
                      onChange={(v) =>
                        onUpdateRow(row.id, {
                          subsidiary_id: v !== '' ? Number(v) || v : '',
                        })
                      }
                      options={SUBSIDIARY_OPTIONS}
                      inputClassName={`rounded px-2 py-1 text-xs font-mono font-medium ${cellInputStyle}`}
                      className="w-24"
                    />
                  </td>

                  {/* SKU (Product Code) - Prominent Non-editable Display */}
                  <td className="px-3 py-2">
                    <span
                      className={`inline-block px-2.5 py-1 text-xs font-mono font-bold rounded min-w-[100px] max-w-[150px] truncate shadow-xs select-all border ${skuBadgeStyle}`}
                      title={`SKU / Product Code: ${row.productCode || 'N/A'}`}
                    >
                      {row.productCode || '-'}
                    </span>
                  </td>

                  {/* quantity */}
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={row.quantity}
                      onChange={(e) =>
                        onUpdateRow(row.id, {
                          quantity: e.target.value !== '' ? Number(e.target.value) : '',
                        })
                      }
                      className={`w-24 text-center rounded px-2 py-1 text-xs text-emerald-600 dark:text-emerald-400 font-mono font-bold focus:outline-none focus:ring-1 ${cellInputStyle}`}
                    />
                  </td>

                  {/* MOQ (Minimum Order Quantity) - Non-editable Display */}
                  <td className="px-3 py-2">
                    <span
                      className={`inline-block w-20 text-center px-2 py-1 text-xs font-mono font-bold rounded shadow-xs select-all border ${moqBadgeStyle}`}
                      title="Minimum Order Quantity (Non-editable reference)"
                    >
                      {row.moq !== undefined && row.moq !== '' ? row.moq : '-'}
                    </span>
                  </td>

                  {/* item_id */}
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={row.item_id}
                      onChange={(e) => onUpdateRow(row.id, { item_id: e.target.value })}
                      className={`w-28 rounded px-2 py-1 text-xs font-mono font-semibold focus:outline-none focus:ring-1 ${cellInputStyle}`}
                    />
                  </td>

                  {/* location */}
                  <td className="px-3 py-2">
                    <div className="flex flex-col">
                      <ComboInput
                        value={row.location}
                        onChange={(v) =>
                          onUpdateRow(row.id, {
                            location: v !== '' ? Number(v) || v : '',
                          })
                        }
                        options={LOCATION_OPTIONS}
                        inputClassName={`rounded px-2 py-1 text-xs font-mono font-medium ${cellInputStyle}`}
                        className="w-24"
                      />
                      {row.sourceLocation && (
                        <span className="text-[10px] text-slate-500 truncate max-w-[100px] mt-0.5">
                          ({row.sourceLocation})
                        </span>
                      )}
                    </div>
                  </td>

                  {/* start_date */}
                  <td className="px-3 py-2">
                    <ComboDatePicker
                      value={row.start_date}
                      onChange={(v) => onUpdateRow(row.id, { start_date: v })}
                      inputClassName={`rounded px-2 py-1 text-xs font-mono focus:outline-none focus:ring-1 ${cellInputStyle}`}
                      className="min-w-[140px] w-full"
                    />
                  </td>

                  {/* end_date */}
                  <td className="px-3 py-2">
                    <ComboDatePicker
                      value={row.end_date}
                      onChange={(v) => onUpdateRow(row.id, { end_date: v })}
                      inputClassName={`rounded px-2 py-1 text-xs font-mono focus:outline-none focus:ring-1 ${cellInputStyle}`}
                      className="min-w-[140px] w-full"
                    />
                  </td>

                  {/* memo */}
                  <td className="px-3 py-2">
                    <ComboInput
                      value={row.memo}
                      onChange={(v) => onUpdateRow(row.id, { memo: String(v) })}
                      options={MEMO_OPTIONS}
                      inputClassName={`rounded px-2 py-1 text-xs font-mono ${cellInputStyle}`}
                      className="w-40 sm:w-48"
                    />
                  </td>

                  {/* Row Action Buttons */}
                  <td className="px-3 py-2 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      {rowWarnings && rowWarnings.length > 0 && (
                        <span
                          title={rowWarnings.map((w) => w.message).join('\n')}
                          className="p-1 rounded bg-amber-500/10 text-amber-500 cursor-help"
                        >
                          <AlertCircle className="w-3.5 h-3.5" />
                        </span>
                      )}

                      <button
                        onClick={() => onDuplicateRow(row.id)}
                        className="p-1 text-slate-400 hover:text-indigo-500 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Duplicate Row"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onDeleteRows([row.id])}
                        className="p-1 text-slate-400 hover:text-rose-500 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Delete Row"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {paginatedRows.length === 0 && (
              <tr>
                <td colSpan={11} className="px-4 py-8 text-center text-slate-500">
                  No records match your search query or filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className={`p-3 border-t flex flex-col sm:flex-row items-center justify-between text-xs gap-2 ${toolbarBg}`}>
        <div className="flex items-center space-x-2">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className={`border rounded px-2 py-1 text-xs focus:outline-none ${inputStyle}`}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={-1}>All ({sortedRows.length})</option>
          </select>

          <span>
            Showing {paginatedRows.length} of {sortedRows.length} rows
          </span>
        </div>

        {pageSize !== -1 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`p-1 rounded border disabled:opacity-40 cursor-pointer ${inputStyle}`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`p-1 rounded border disabled:opacity-40 cursor-pointer ${inputStyle}`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
