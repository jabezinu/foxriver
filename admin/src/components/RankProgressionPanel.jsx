import React from 'react';
import { HiLockClosed, HiLockOpen, HiInformationCircle } from 'react-icons/hi';
import Card from './shared/Card';

export default function RankProgressionPanel({ restrictedRange, start, setStart, end, setEnd, onSet, onClear, loading }) {
    const rankOptions = Array.from({ length: 10 }, (_, i) => i + 1);

    return (
        <Card className="border-l-4 border-indigo-500 mb-8" noPadding>
            <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600"><HiLockClosed className="text-xl" /></div>
                    <h2 className="text-xl font-bold text-gray-800">Rank Progression Restrictions</h2>
                </div>

                <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 mb-6">
                    <div className="flex gap-3">
                        <HiInformationCircle className="text-indigo-500 text-xl shrink-0" />
                        <div className="text-[11px] text-indigo-900 leading-relaxed font-medium mt-0.5">
                            <p className="font-bold uppercase tracking-widest mb-1">Functional Protocol:</p>
                            <p>Default state allows arbitrary rank jumps. Activating a restriction forces sequential progression (e.g., 7→8→9→10) within the defined range. Jumps outside this range remain permitted.</p>
                        </div>
                    </div>
                </div>

                {restrictedRange ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600"><HiLockClosed className="text-xl" /></div>
                            <div>
                                <p className="text-xs font-black text-amber-900 uppercase">Active Restrictions Detected</p>
                                <p className="text-xs text-amber-800 font-bold">Sequential Protocol Active: <span className="bg-amber-200 px-2 py-0.5 rounded ml-1">Rank {restrictedRange.start} → Rank {restrictedRange.end}</span></p>
                            </div>
                        </div>
                        <button
                            onClick={onClear}
                            disabled={loading}
                            className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-bold text-[10px] uppercase hover:bg-red-700 transition-all shadow-lg shadow-red-100 flex items-center gap-2"
                        >
                            <HiLockOpen /> Clear Restrictions
                        </button>
                    </div>
                ) : (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 mb-8 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"><HiLockOpen className="text-xl" /></div>
                        <div>
                            <p className="text-xs font-black text-emerald-900 uppercase">Encryption Disabled</p>
                            <p className="text-xs text-emerald-800 font-bold italic">Unrestricted rank progression is currently active.</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block px-1">Protocol Entry (Start Rank)</label>
                        <select
                            value={start}
                            onChange={(e) => setStart(e.target.value)}
                            className="admin-input"
                            disabled={loading}
                        >
                            <option value="">Select Protocol Entry</option>
                            {rankOptions.map(rank => <option key={rank} value={rank}>Rank {rank}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block px-1">Protocol Exit (End Rank)</label>
                        <select
                            value={end}
                            onChange={(e) => setEnd(e.target.value)}
                            className="admin-input"
                            disabled={loading}
                        >
                            <option value="">Select Protocol Exit</option>
                            {rankOptions.map(rank => <option key={rank} value={rank}>Rank {rank}</option>)}
                        </select>
                    </div>
                </div>

                <button
                    onClick={onSet}
                    disabled={loading || !start || !end}
                    className="admin-btn-primary w-full md:w-auto px-8 py-3 flex items-center justify-center gap-2"
                >
                    <HiLockClosed /> {restrictedRange ? 'Refresh Protocol' : 'Activate Restricted Protocol'}
                </button>
            </div>
        </Card>
    );
}
