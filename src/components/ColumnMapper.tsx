import React from 'react';
import { ColumnMappingConfig } from '../types';
import { Settings2, ArrowRight } from 'lucide-react';

interface ColumnMapperProps {
  availableHeaders: string[];
  mapping: ColumnMappingConfig;
  onChangeMapping: (updated: ColumnMappingConfig) => void;
}

export const ColumnMapper: React.FC<ColumnMapperProps> = ({
  availableHeaders,
  mapping,
  onChangeMapping,
}) => {
  if (!availableHeaders || availableHeaders.length === 0) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-5 text-slate-200">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Settings2 className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            CSV Source Column Mapping
          </h3>
        </div>
        <span className="text-[11px] text-slate-400">
          Detected {availableHeaders.length} headers in uploaded file
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {/* Item ID Column */}
        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
          <label className="block text-[11px] font-medium text-slate-400 mb-1 flex items-center justify-between">
            <span>Item ID Column</span>
            <ArrowRight className="w-3 h-3 text-indigo-400" />
            <span className="text-indigo-300 font-mono">item_id</span>
          </label>
          <select
            value={mapping.itemIdColumn}
            onChange={(e) => onChangeMapping({ ...mapping, itemIdColumn: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
          >
            {availableHeaders.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </div>

        {/* Product / SKU Column */}
        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
          <label className="block text-[11px] font-medium text-slate-400 mb-1 flex items-center justify-between">
            <span>SKU / Product Code</span>
            <span className="text-indigo-300 font-mono">sku (ref)</span>
          </label>
          <select
            value={mapping.productColumn || ''}
            onChange={(e) => onChangeMapping({ ...mapping, productColumn: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
          >
            <option value="">-- None --</option>
            {availableHeaders.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </div>

        {/* Quantity Column */}
        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
          <label className="block text-[11px] font-medium text-slate-400 mb-1 flex items-center justify-between">
            <span>Quantity Column</span>
            <ArrowRight className="w-3 h-3 text-emerald-400" />
            <span className="text-emerald-300 font-mono">quantity</span>
          </label>
          <select
            value={mapping.quantityColumn}
            onChange={(e) => onChangeMapping({ ...mapping, quantityColumn: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
          >
            {availableHeaders.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </div>

        {/* MOQ Column */}
        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
          <label className="block text-[11px] font-medium text-slate-400 mb-1 flex items-center justify-between">
            <span>MOQ Column</span>
            <span className="text-amber-300 font-mono">moq (ref)</span>
          </label>
          <select
            value={mapping.moqColumn || ''}
            onChange={(e) => onChangeMapping({ ...mapping, moqColumn: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
          >
            <option value="">-- None --</option>
            {availableHeaders.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </div>

        {/* Location Column */}
        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
          <label className="block text-[11px] font-medium text-slate-400 mb-1 flex items-center justify-between">
            <span>Location Column</span>
            <ArrowRight className="w-3 h-3 text-blue-400" />
            <span className="text-blue-300 font-mono">location</span>
          </label>
          <select
            value={mapping.locationColumn}
            onChange={(e) => onChangeMapping({ ...mapping, locationColumn: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
          >
            {availableHeaders.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </div>

        {/* Labor Column */}
        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
          <label className="block text-[11px] font-medium text-slate-400 mb-1 flex items-center justify-between">
            <span>Labor Column</span>
            <span className="text-pink-300 font-mono">labor (ref)</span>
          </label>
          <select
            value={mapping.laborColumn || ''}
            onChange={(e) => onChangeMapping({ ...mapping, laborColumn: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
          >
            <option value="">-- None --</option>
            {availableHeaders.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
