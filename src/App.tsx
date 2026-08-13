import React, { useState, useEffect, useMemo } from 'react';
import {
  ColumnMappingConfig,
  DefaultRowConfig,
  InputCsvRow,
  LocationRule,
  OutputSchedulerRow,
} from './types';
import { INITIAL_LOCATION_RULES, SAMPLE_CSV_CONTENT } from './data/sampleData';
import {
  parseCsvText,
  autoDetectColumns,
  transformInputToOutput,
  validateOutputRows,
  getDefaultFormattedDate,
} from './utils/csv';
import { getCurrentWeekMemo } from './utils/date';

import { Header } from './components/Header';
import { MetricsBar } from './components/MetricsBar';
import { CsvUploader } from './components/CsvUploader';
import { LocationMappingManager } from './components/LocationMappingManager';
import { ColumnMapper } from './components/ColumnMapper';
import { BulkEditorBar } from './components/BulkEditorBar';
import { DataGrid } from './components/DataGrid';
import { ExportPreviewModal } from './components/ExportPreviewModal';
import { ImportModal } from './components/ImportModal';

import { ThemeProvider, useTheme } from './context/ThemeContext';

const LOCAL_STORAGE_RULES_KEY = 'bulk_scheduler_location_rules_v1';
const LOCAL_STORAGE_DEFAULTS_KEY = 'bulk_scheduler_defaults_v1';

function AppContent() {
  const { theme } = useTheme();

  // Config States
  const [locationRules, setLocationRules] = useState<LocationRule[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_RULES_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved location rules', e);
      }
    }
    return INITIAL_LOCATION_RULES;
  });

  const [defaultRowConfig, setDefaultRowConfig] = useState<DefaultRowConfig>(() => {
    let config: DefaultRowConfig | null = null;
    const saved = localStorage.getItem(LOCAL_STORAGE_DEFAULTS_KEY);
    if (saved) {
      try {
        config = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved defaults', e);
      }
    }
    
    if (!config) {
      config = {
        startDate: '28/08/2026', // Matching sample image date
        endDate: '28/08/2026',
        memo: `${getCurrentWeekMemo()} - CSO`,
        dateFormat: 'DD/MM/YYYY',
        defaultSubsidiaryId: 7,
        defaultLocationId: 25,
      };
    } else if (config.memo && config.memo.match(/^W\d\d/)) {
      // Auto-update saved "Wxx" memos to current week
      config.memo = config.memo.replace(/^W\d\d/, getCurrentWeekMemo());
    }
    
    return config;
  });

  // CSV State
  const [rawCsvHeaders, setRawCsvHeaders] = useState<string[]>([]);
  const [rawCsvRows, setRawCsvRows] = useState<InputCsvRow[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMappingConfig>({
    itemIdColumn: 'Sum of Internal ID',
    quantityColumn: 'Sum of UnitsToProduce',
    locationColumn: 'location',
    productColumn: 'product',
    moqColumn: 'Sum of min_order_qty',
  });

  // Transformed Editable Output Grid
  const [historyState, setHistoryState] = useState<{
    past: OutputSchedulerRow[][];
    present: OutputSchedulerRow[];
    future: OutputSchedulerRow[][];
  }>({
    past: [],
    present: [],
    future: [],
  });

  const outputRows = historyState.present;

  const setOutputRows = (action: OutputSchedulerRow[] | ((prev: OutputSchedulerRow[]) => OutputSchedulerRow[])) => {
    setHistoryState((prev) => {
      const nextPresent = typeof action === 'function' ? action(prev.present) : action;
      if (nextPresent === prev.present) return prev;
      return {
        past: [...prev.past, prev.present],
        present: nextPresent,
        future: [],
      };
    });
  };

  const handleUndo = () => {
    setHistoryState((prev) => {
      if (prev.past.length === 0) return prev;
      const previous = prev.past[prev.past.length - 1];
      const newPast = prev.past.slice(0, prev.past.length - 1);
      return {
        past: newPast,
        present: previous,
        future: [prev.present, ...prev.future],
      };
    });
  };

  const handleRedo = () => {
    setHistoryState((prev) => {
      if (prev.future.length === 0) return prev;
      const next = prev.future[0];
      const newFuture = prev.future.slice(1);
      return {
        past: [...prev.past, prev.present],
        present: next,
        future: newFuture,
      };
    });
  };

  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);

  // Modals State
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Persist location rules and defaults
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_RULES_KEY, JSON.stringify(locationRules));
  }, [locationRules]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_DEFAULTS_KEY, JSON.stringify(defaultRowConfig));
  }, [defaultRowConfig]);

  // Load Initial Sample Data on first mount
  useEffect(() => {
    handleLoadSampleData();
  }, []);

  // Handle Uploading / Parsing CSV
  const handleProcessCsv = (csvText: string, isUserImport: boolean = false) => {
    const { data, headers, errors } = parseCsvText(csvText);
    if (errors.length > 0 && data.length === 0) {
      alert(`CSV Parsing Error: ${errors.join(', ')}`);
      return;
    }

    setRawCsvHeaders(headers);
    setRawCsvRows(data);

    // Auto-detect column headers
    const detectedMapping = autoDetectColumns(headers);
    setColumnMapping(detectedMapping);

    // Transform into initial output rows
    const transformed = transformInputToOutput(data, detectedMapping, locationRules, defaultRowConfig);
    setOutputRows(transformed);
    setSelectedRowIds([]);

    if (isUserImport) {
      showToast('CSV successfully imported!');
    }
  };

  const handleLoadSampleData = () => {
    handleProcessCsv(SAMPLE_CSV_CONTENT);
  };

  const handleResetData = () => {
    setRawCsvHeaders([]);
    setRawCsvRows([]);
    setOutputRows([]);
    setSelectedRowIds([]);
  };

  // Re-transform when mapping changes
  const handleColumnMappingChange = (updatedMapping: ColumnMappingConfig) => {
    setColumnMapping(updatedMapping);
    if (rawCsvRows.length > 0) {
      const reTransformed = transformInputToOutput(
        rawCsvRows,
        updatedMapping,
        locationRules,
        defaultRowConfig
      );
      setOutputRows(reTransformed);
    }
  };

  // Update Location Rules
  const handleSaveLocationRules = (
    updatedRules: LocationRule[],
    updatedDefaults: DefaultRowConfig
  ) => {
    setLocationRules(updatedRules);
    setDefaultRowConfig(updatedDefaults);

    // Re-evaluate current rows with new location rules if raw CSV exists
    if (rawCsvRows.length > 0) {
      const reTransformed = transformInputToOutput(
        rawCsvRows,
        columnMapping,
        updatedRules,
        updatedDefaults
      );
      // Merge user custom edits on existing rows if matched by index
      setOutputRows((prev) => {
        return reTransformed.map((newRow, idx) => {
          const old = prev[idx];
          if (!old) return newRow;
          return {
            ...newRow,
            // Keep user manual edits if they differ from previous default
            start_date: old.start_date || newRow.start_date,
            end_date: old.end_date || newRow.end_date,
            memo: old.memo || newRow.memo,
            quantity: old.quantity !== undefined ? old.quantity : newRow.quantity,
          };
        });
      });
    }
  };

  // Grid Operations
  const handleUpdateRow = (id: string, updatedFields: Partial<OutputSchedulerRow>) => {
    setOutputRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;

        const nextRow = { ...r, ...updatedFields };

        // Start date controls end date unless end date was manually overridden
        if (updatedFields.start_date !== undefined) {
          if (!r.isEndDateCustom) {
            nextRow.end_date = updatedFields.start_date;
          }
        }

        // Track manual end_date overrides
        if (updatedFields.end_date !== undefined) {
          if (updatedFields.end_date !== nextRow.start_date) {
            nextRow.isEndDateCustom = true;
          } else {
            nextRow.isEndDateCustom = false;
          }
        }

        return nextRow;
      })
    );
  };

  const handleDeleteRows = (idsToDelete: string[]) => {
    setOutputRows((prev) => prev.filter((r) => !idsToDelete.includes(r.id)));
    setSelectedRowIds((prev) => prev.filter((id) => !idsToDelete.includes(id)));
  };

  const handleAddRow = () => {
    const newRow: OutputSchedulerRow = {
      id: `row-manual-${Date.now()}`,
      subsidiary_id: defaultRowConfig.defaultSubsidiaryId,
      item_id: '',
      location: defaultRowConfig.defaultLocationId,
      start_date: defaultRowConfig.startDate,
      end_date: defaultRowConfig.endDate,
      quantity: 1,
      memo: defaultRowConfig.memo,
      sourceLocation: 'Sydney',
      productCode: '',
      moq: '',
      isEndDateCustom: false,
    };
    setOutputRows((prev) => [newRow, ...prev]);
  };

  const handleDuplicateRow = (id: string) => {
    const target = outputRows.find((r) => r.id === id);
    if (!target) return;
    const duplicated: OutputSchedulerRow = {
      ...target,
      id: `row-dup-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    };

    const targetIndex = outputRows.findIndex((r) => r.id === id);
    const newRows = [...outputRows];
    newRows.splice(targetIndex + 1, 0, duplicated);
    setOutputRows(newRows);
  };

  const handleSelectRow = (id: string, selected: boolean) => {
    if (selected) {
      setSelectedRowIds((prev) => [...prev, id]);
    } else {
      setSelectedRowIds((prev) => prev.filter((i) => i !== id));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedRowIds(outputRows.map((r) => r.id));
    } else {
      setSelectedRowIds([]);
    }
  };

  // Bulk Edit Handler
  const handleApplyBulkUpdate = (
    updates: Partial<Pick<OutputSchedulerRow, 'subsidiary_id' | 'location' | 'start_date' | 'end_date' | 'quantity' | 'memo'>>,
    applyToSelectedOnly: boolean,
    quantityMultiplier?: number,
    quantityDivisor?: number
  ) => {
    setOutputRows((prev) =>
      prev.map((row) => {
        const isTarget = applyToSelectedOnly
          ? selectedRowIds.includes(row.id)
          : true;

        if (!isTarget) return row;

        let newQty = row.quantity;
        if (updates.quantity !== undefined) {
          newQty = updates.quantity;
        } else if (quantityMultiplier !== undefined && !isNaN(quantityMultiplier)) {
          const numQty = Number(row.quantity);
          if (!isNaN(numQty)) {
            newQty = Math.round(numQty * quantityMultiplier);
          }
        } else if (quantityDivisor !== undefined && !isNaN(quantityDivisor) && quantityDivisor !== 0) {
          const numQty = Number(row.quantity);
          if (!isNaN(numQty)) {
            newQty = Math.round(numQty / quantityDivisor);
          }
        }

        const nextRow = {
          ...row,
          ...updates,
          quantity: newQty,
        };

        // If bulk updating start_date without explicitly providing end_date:
        if (updates.start_date !== undefined && updates.end_date === undefined) {
          if (!row.isEndDateCustom) {
            nextRow.end_date = updates.start_date;
          }
        }

        // If bulk updating end_date explicitly:
        if (updates.end_date !== undefined) {
          if (updates.end_date !== nextRow.start_date) {
            nextRow.isEndDateCustom = true;
          } else {
            nextRow.isEndDateCustom = false;
          }
        }

        return nextRow;
      })
    );
  };

  // Warnings
  const warnings = useMemo(() => {
    return validateOutputRows(outputRows, locationRules);
  }, [outputRows, locationRules]);

  const appBg =
    theme === 'light'
      ? 'bg-slate-100 text-slate-900'
      : theme === 'semi-dark'
      ? 'bg-zinc-900 text-zinc-100'
      : 'bg-slate-950 text-slate-100';

  const footerBorder =
    theme === 'light'
      ? 'border-slate-200 text-slate-500'
      : theme === 'semi-dark'
      ? 'border-zinc-800 text-zinc-400'
      : 'border-slate-900 text-slate-500';

  return (
    <div className={`min-h-screen ${appBg} flex flex-col font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-200`}>
      {/* Top Header */}
      <Header
        onLoadSample={handleLoadSampleData}
        onReset={handleResetData}
        onOpenLocations={() => setIsLocationModalOpen(true)}
        onExport={() => setIsExportModalOpen(true)}
        onImport={() => setIsImportModalOpen(true)}
        hasData={outputRows.length > 0}
        rowCounts={outputRows.length}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Upload Card or Uploader Drawer */}
        {outputRows.length === 0 ? (
          <div className="max-w-3xl mx-auto my-12">
            <CsvUploader
              onFileUpload={(csvText) => handleProcessCsv(csvText)}
              onLoadSample={handleLoadSampleData}
            />
          </div>
        ) : (
          <>
            {/* Top Stat Metrics */}
            <MetricsBar
              rows={outputRows}
              warnings={warnings}
              defaultDate={defaultRowConfig.startDate}
              defaultMemo={defaultRowConfig.memo}
            />

            {/* Optional Collapsible Source Mapping Picker */}
            {rawCsvHeaders.length > 0 && (
              <ColumnMapper
                availableHeaders={rawCsvHeaders}
                mapping={columnMapping}
                onChangeMapping={handleColumnMappingChange}
              />
            )}

            {/* Bulk Column Transformer Bar */}
            <BulkEditorBar
              selectedRowIds={selectedRowIds}
              totalRowsCount={outputRows.length}
              onApplyBulkUpdate={handleApplyBulkUpdate}
              onClearSelection={() => setSelectedRowIds([])}
              onSelectAll={() => setSelectedRowIds(outputRows.map((r) => r.id))}
              onUndo={handleUndo}
              onRedo={handleRedo}
              canUndo={historyState.past.length > 0}
              canRedo={historyState.future.length > 0}
            />

            {/* Interactive Data Grid */}
            <DataGrid
              rows={outputRows}
              warnings={warnings}
              selectedRowIds={selectedRowIds}
              onSelectRow={handleSelectRow}
              onSelectAll={handleSelectAll}
              onUpdateRow={handleUpdateRow}
              onDeleteRows={handleDeleteRows}
              onAddRow={handleAddRow}
              onDuplicateRow={handleDuplicateRow}
            />

            {/* Re-upload footer bar */}
            <div className={`mt-8 pt-6 border-t ${footerBorder} flex flex-col sm:flex-row items-center justify-between text-xs gap-3`}>
              <p>
                Scheduling Tool - Bulk Scheduler (CSV) • NetSuite / ERP Import Format
              </p>
              <button
                onClick={() => handleProcessCsv(SAMPLE_CSV_CONTENT)}
                className="text-indigo-500 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Reload Default Sydney Sample Data
              </button>
            </div>
          </>
        )}
      </main>

      {/* Modals */}
      <LocationMappingManager
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        rules={locationRules}
        defaults={defaultRowConfig}
        onSaveRules={handleSaveLocationRules}
      />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onFileUpload={(csvText) => handleProcessCsv(csvText, true)}
        onLoadSample={handleLoadSampleData}
      />

      <ExportPreviewModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        rows={outputRows}
      />
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-xl flex items-center space-x-2 animate-in slide-in-from-bottom-5">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
