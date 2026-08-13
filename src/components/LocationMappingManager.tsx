import React, { useState } from 'react';
import { LocationRule, DefaultRowConfig } from '../types';
import { useTheme } from '../context/ThemeContext';
import { MapPin, Plus, Trash2, Edit2, Check, X, Building, Globe, RefreshCw, AlertCircle } from 'lucide-react';

interface LocationMappingManagerProps {
  rules: LocationRule[];
  defaults: DefaultRowConfig;
  isOpen: boolean;
  onClose: () => void;
  onSaveRules: (updatedRules: LocationRule[], updatedDefaults: DefaultRowConfig) => void;
}

export const LocationMappingManager: React.FC<LocationMappingManagerProps> = ({
  rules,
  defaults,
  isOpen,
  onClose,
  onSaveRules,
}) => {
  const { theme } = useTheme();
  const [localRules, setLocalRules] = useState<LocationRule[]>(rules);
  const [localDefaults, setLocalDefaults] = useState<DefaultRowConfig>(defaults);

  // New Rule Form State
  const [newLocationName, setNewLocationName] = useState('');
  const [newSubId, setNewSubId] = useState<number | ''>('');
  const [newLocId, setNewLocId] = useState<number | ''>('');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLocationName, setEditLocationName] = useState('');
  const [editSubId, setEditSubId] = useState<number | ''>('');
  const [editLocId, setEditLocId] = useState<number | ''>('');

  if (!isOpen) return null;

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocationName.trim() || newSubId === '' || newLocId === '') return;

    const newRule: LocationRule = {
      id: `loc-${Date.now()}`,
      locationName: newLocationName.trim(),
      subsidiaryId: Number(newSubId),
      locationId: Number(newLocId),
    };

    setLocalRules([...localRules, newRule]);
    setNewLocationName('');
    setNewSubId('');
    setNewLocId('');
  };

  const startEdit = (rule: LocationRule) => {
    setEditingId(rule.id);
    setEditLocationName(rule.locationName);
    setEditSubId(rule.subsidiaryId);
    setEditLocId(rule.locationId);
  };

  const saveEdit = (id: string) => {
    if (!editLocationName.trim() || editSubId === '' || editLocId === '') return;
    setLocalRules((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              locationName: editLocationName.trim(),
              subsidiaryId: Number(editSubId),
              locationId: Number(editLocId),
            }
          : r
      )
    );
    setEditingId(null);
  };

  const deleteRule = (id: string) => {
    setLocalRules((prev) => prev.filter((r) => r.id !== id));
  };

  const handleApply = () => {
    onSaveRules(localRules, localDefaults);
    onClose();
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
      ? 'bg-slate-50 border-slate-200'
      : theme === 'semi-dark'
      ? 'bg-zinc-900 border-zinc-700'
      : 'bg-slate-950 border-slate-800';

  const inputStyle =
    theme === 'light'
      ? 'bg-white border-slate-300 text-slate-900 focus:ring-indigo-500'
      : theme === 'semi-dark'
      ? 'bg-zinc-800 border-zinc-600 text-zinc-100 focus:ring-indigo-500'
      : 'bg-slate-900 border-slate-700 text-white focus:ring-indigo-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className={`border rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-8 ${modalBg}`}>
        {/* Modal Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${headerBg}`}>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-500 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold">Location & Subsidiary Rules</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Map source location names (e.g. Sydney) to subsidiary_id and location codes
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

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Rules Table */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5 opacity-80">
              <Globe className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
              Active Mappings
            </h3>

            <div className={`border rounded-xl overflow-hidden ${innerBoxBg}`}>
              <table className="w-full text-xs text-left">
                <thead className={`border-b ${headerBg}`}>
                  <tr>
                    <th className="px-4 py-2.5 font-medium">Location Name (Source)</th>
                    <th className="px-4 py-2.5 font-medium">subsidiary_id</th>
                    <th className="px-4 py-2.5 font-medium">location</th>
                    <th className="px-4 py-2.5 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${theme === 'light' ? 'divide-slate-200' : 'divide-slate-800/60'}`}>
                  {localRules.map((rule) => {
                    const isEditing = editingId === rule.id;
                    return (
                      <tr key={rule.id} className="hover:bg-indigo-50/50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-2.5 font-medium">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editLocationName}
                              onChange={(e) => setEditLocationName(e.target.value)}
                              className={`w-full border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 ${inputStyle}`}
                            />
                          ) : (
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                              {rule.locationName}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-indigo-600 dark:text-indigo-300 font-semibold">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editSubId}
                              onChange={(e) => setEditSubId(e.target.value ? Number(e.target.value) : '')}
                              className={`w-20 border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 ${inputStyle}`}
                            />
                          ) : (
                            rule.subsidiaryId
                          )}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-emerald-600 dark:text-emerald-300 font-semibold">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editLocId}
                              onChange={(e) => setEditLocId(e.target.value ? Number(e.target.value) : '')}
                              className={`w-20 border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 ${inputStyle}`}
                            />
                          ) : (
                            rule.locationId
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => saveEdit(rule.id)}
                                className="p-1 rounded bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600/40 cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="p-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => startEdit(rule)}
                                className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-500 cursor-pointer transition-colors"
                                title="Edit mapping"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => deleteRule(rule.id)}
                                className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-500 cursor-pointer transition-colors"
                                title="Delete mapping"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {localRules.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-4 text-center text-slate-500">
                        No location rules added yet. Add Sydney or default fallbacks below.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add New Rule Form */}
          <form onSubmit={handleAddRule} className={`p-4 rounded-xl border ${innerBoxBg}`}>
            <h4 className="text-xs font-medium mb-2.5 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
              Add Location Rule
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] opacity-75 mb-1">Source Location</label>
                <input
                  type="text"
                  placeholder="e.g. Sydney"
                  value={newLocationName}
                  onChange={(e) => setNewLocationName(e.target.value)}
                  className={`w-full border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 ${inputStyle}`}
                />
              </div>
              <div>
                <label className="block text-[11px] opacity-75 mb-1">subsidiary_id</label>
                <input
                  type="number"
                  placeholder="e.g. 7"
                  value={newSubId}
                  onChange={(e) => setNewSubId(e.target.value ? Number(e.target.value) : '')}
                  className={`w-full border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 ${inputStyle}`}
                />
              </div>
              <div>
                <label className="block text-[11px] opacity-75 mb-1">location ID</label>
                <input
                  type="number"
                  placeholder="e.g. 25"
                  value={newLocId}
                  onChange={(e) => setNewLocId(e.target.value ? Number(e.target.value) : '')}
                  className={`w-full border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 ${inputStyle}`}
                />
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <button
                type="submit"
                disabled={!newLocationName.trim() || newSubId === '' || newLocId === ''}
                className="inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Mapping Rule
              </button>
            </div>
          </form>

          {/* Fallback Defaults */}
          <div className={`p-4 rounded-xl border ${innerBoxBg}`}>
            <h4 className="text-xs font-medium mb-2 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              Fallback Default IDs (for unmapped locations)
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] opacity-75 mb-1">Default subsidiary_id</label>
                <input
                  type="number"
                  value={localDefaults.defaultSubsidiaryId}
                  onChange={(e) =>
                    setLocalDefaults({
                      ...localDefaults,
                      defaultSubsidiaryId: Number(e.target.value),
                    })
                  }
                  className={`w-full border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 ${inputStyle}`}
                />
              </div>
              <div>
                <label className="block text-[11px] opacity-75 mb-1">Default location ID</label>
                <input
                  type="number"
                  value={localDefaults.defaultLocationId}
                  onChange={(e) =>
                    setLocalDefaults({
                      ...localDefaults,
                      defaultLocationId: Number(e.target.value),
                    })
                  }
                  className={`w-full border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 ${inputStyle}`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className={`px-6 py-3.5 border-t flex items-center justify-between ${headerBg}`}>
          <p className="text-[11px] opacity-75 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
            Changes apply to newly uploaded or re-processed rows
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium border cursor-pointer ${theme === 'light' ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'}`}
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              Save & Apply Rules
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
