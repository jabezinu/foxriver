import React from 'react';
import { HiEye, HiEyeOff } from 'react-icons/hi';
import Card from './shared/Card';

export default function VisibilityControlPanel({ start, setStart, end, setEnd, onHide, onUnhide, loading }) {
    const rankOptions = Array.from({ length: 10 }, (_, i) => i + 1);

    return (
        <Card className="mb-8" noPadding>
            <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <span className="bg-indigo-50 p-2 rounded-lg text-indigo-600"><HiEye /></span>
                    Sector Visibility Controls
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block px-1">Sector Start (Rank)</label>
                        <select
                            value={start}
                            onChange={(e) => setStart(e.target.value)}
                            className="admin-input"
                            disabled={loading}
                        >
                            <option value="">Select Start Rank</option>
                            {rankOptions.map(rank => <option key={rank} value={rank}>Rank {rank}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block px-1">Sector End (Rank)</label>
                        <select
                            value={end}
                            onChange={(e) => setEnd(e.target.value)}
                            className="admin-input"
                            disabled={loading}
                        >
                            <option value="">Select End Rank</option>
                            {rankOptions.map(rank => <option key={rank} value={rank}>Rank {rank}</option>)}
                        </select>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                    <button
                        onClick={onHide}
                        disabled={loading || !start || !end}
                        className="admin-btn-secondary flex-1 py-3 flex items-center justify-center gap-2"
                    >
                        <HiEyeOff className="text-lg" /> Cloak Selection (Hide)
                    </button>
                    <button
                        onClick={onUnhide}
                        disabled={loading || !start || !end}
                        className="admin-btn-primary flex-1 py-3 flex items-center justify-center gap-2"
                    >
                        <HiEye className="text-lg" /> Reveal Selection (Unhide)
                    </button>
                </div>
            </div>
        </Card>
    );
}
