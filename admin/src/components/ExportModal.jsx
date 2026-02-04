import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { HiCheck, HiOutlineDocumentDownload, HiOutlineAdjustments, HiOutlineViewList, HiOutlineCurrencyDollar, HiOutlineUserGroup } from 'react-icons/hi';

const PRESETS = {
    full: {
        name: 'Full Audit',
        icon: <HiOutlineViewList />,
        columns: null // indicates all
    },
    financial: {
        name: 'Financial Only',
        icon: <HiOutlineCurrencyDollar />,
        columns: ['Date & Time', 'Amount', 'Amount (ETB)', 'Gross Amount', 'Tax (10%)', 'Net Payout', 'Status', 'Bank Reference (FT)']
    },
    user: {
        name: 'User Context',
        icon: <HiOutlineUserGroup />,
        columns: ['User Phone', 'User Name', 'User Bank', 'Account Name', 'Account Number']
    }
};

export default function ExportModal({ isOpen, onClose, onExport, columns, dataCount, totalCount, type, currentFilter, onDateCheck }) {
    const [selectedColumns, setSelectedColumns] = useState([]);
    const [activePreset, setActivePreset] = useState('full');
    const [exportScope, setExportScope] = useState('single'); // 'single', 'custom', or 'all'
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [customDateStats, setCustomDateStats] = useState({ count: null, total: null });
    const [checkingCount, setCheckingCount] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setSelectedColumns(columns);
            setActivePreset('full');
            setExportScope('single');
            checkDateRange(startDate, endDate);
        }
    }, [isOpen, columns]);

    const checkDateRange = async (start, end) => {
        if (!onDateCheck) return;
        setCheckingCount(true);
        try {
            const stats = await onDateCheck(start, end);
            setCustomDateStats(stats);
        } catch (error) {
            console.error(error);
            setCustomDateStats({ count: '?', total: '?' });
        } finally {
            setCheckingCount(false);
        }
    };

    const handleStartDateChange = (e) => {
        const date = e.target.value;
        setStartDate(date);
        checkDateRange(date, endDate);
    };

    const handleEndDateChange = (e) => {
        const date = e.target.value;
        setEndDate(date);
        checkDateRange(startDate, date);
    };

    const toggleColumn = (col) => {
        setActivePreset('custom');
        setSelectedColumns(prev =>
            prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
        );
    };

    const applyPreset = (key) => {
        setActivePreset(key);
        if (key === 'full') {
            setSelectedColumns(columns);
        } else {
            const presetCols = PRESETS[key].columns;
            setSelectedColumns(columns.filter(c => presetCols.includes(c)));
        }
    };

    const handleExport = () => {
        onExport(selectedColumns, exportScope, startDate, endDate);
        onClose();
    };

    const displayCount = exportScope === 'all' ? totalCount : (exportScope === 'custom' ? (customDateStats.count ?? 0) : dataCount);
    const displayTotal = exportScope === 'custom' ? (customDateStats.total ?? 0) : null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Export ${type} Data`}>
            <div className="space-y-6">
                {/* Export Scope Toggle */}
                <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button
                        onClick={() => setExportScope('single')}
                        className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${exportScope === 'single'
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        Current ({currentFilter})
                    </button>
                    <button
                        onClick={() => setExportScope('today')}
                        className={`hidden`}
                    >
                        Today
                    </button>
                    <button
                        onClick={() => setExportScope('custom')}
                        className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${exportScope === 'custom'
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        Custom
                    </button>
                    <button
                        onClick={() => setExportScope('all')}
                        className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${exportScope === 'all'
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        All
                    </button>
                </div>

                {/* Date Picker for Custom Scope */}
                {exportScope === 'custom' && (
                    <div className="bg-white border border-gray-100 rounded-2xl p-4 animate-fadeIn">
                        <div className="flex justify-between items-center mb-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Choose Target Range</label>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-none mb-1">
                                    {checkingCount ? 'Checking...' : `${customDateStats.count ?? 0} Total Records`}
                                </p>
                                {!checkingCount && customDateStats.total !== null && (
                                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none">
                                        Total: {customDateStats.total.toLocaleString()} ETB
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Start Date</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={handleStartDateChange}
                                    max={endDate || new Date().toISOString().split('T')[0]}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">End Date</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={handleEndDateChange}
                                    min={startDate}
                                    max={new Date().toISOString().split('T')[0]}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Info Section */}
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
                        <HiOutlineDocumentDownload className="text-2xl" />
                    </div>
                    <div className="flex-1">
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">Exporting</p>
                        <div className="flex items-baseline justify-between">
                            <p className="text-xl font-black text-indigo-900 tracking-tighter">{displayCount} Records</p>
                            {displayTotal !== null && (
                                <p className="text-sm font-black text-emerald-600 tracking-tighter">{displayTotal.toLocaleString()} ETB</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Presets */}
                <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Quick Presets</label>
                    <div className="grid grid-cols-3 gap-2">
                        {Object.entries(PRESETS).map(([key, preset]) => (
                            <button
                                key={key}
                                onClick={() => applyPreset(key)}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${activePreset === key
                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100'
                                    : 'bg-white border-gray-100 text-gray-500 hover:border-indigo-300 hover:text-indigo-600'
                                    }`}
                            >
                                <span className="text-xl mb-1">{preset.icon}</span>
                                <span className="text-[9px] font-black uppercase tracking-tighter whitespace-nowrap">{preset.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Column Selection */}
                <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Select Specifications (Columns)</label>
                    <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                        {columns.map(col => (
                            <button
                                key={col}
                                onClick={() => toggleColumn(col)}
                                className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all ${selectedColumns.includes(col)
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                    : 'bg-gray-50 border-gray-100 text-gray-400'
                                    }`}
                            >
                                <div className={`w-4 h-4 rounded flex items-center justify-center transition-all ${selectedColumns.includes(col) ? 'bg-emerald-500 text-white' : 'bg-white border border-gray-200'
                                    }`}>
                                    {selectedColumns.includes(col) && <HiCheck className="text-[10px]" />}
                                </div>
                                <span className="text-[10px] font-bold truncate">{col}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-xs uppercase hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={selectedColumns.length === 0}
                        className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs uppercase shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:shadow-none"
                    >
                        Generate CSV
                    </button>
                </div>
            </div>
        </Modal>
    );
}
