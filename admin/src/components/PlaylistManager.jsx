import React from 'react';
import { HiLink, HiRefresh, HiCollection, HiTrash, HiInformationCircle } from 'react-icons/hi';
import Badge from './shared/Badge';
import Card from './shared/Card';

export default function PlaylistManager({ playlists, videoCount, url, setUrl, onAdd, onSync, onDelete, loading, syncing, uploading }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-8">
                <Card className="sticky top-8 overflow-hidden" noPadding>
                    <div className="bg-indigo-600 px-6 py-4 flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg text-white"><HiLink /></div>
                        <h3 className="text-xs font-black text-white uppercase tracking-widest">Connect Rotation Pool</h3>
                    </div>

                    <form onSubmit={onAdd} className="p-6 space-y-6">
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block px-1">YouTube Playlist Interface</label>
                            <input
                                type="text"
                                placeholder="https://youtube.com/playlist?list=..."
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="admin-input"
                                required
                            />
                            <p className="mt-2 text-[9px] text-gray-400 font-bold uppercase tracking-tight italic">Videos will be automatically harvested from this interface.</p>
                        </div>

                        <button
                            type="submit"
                            disabled={uploading || !url}
                            className="admin-btn-primary w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-100"
                        >
                            {uploading ? 'Initializing Uplink...' : 'Synchronize Resource'}
                        </button>
                    </form>

                    <div className="p-6 border-t border-gray-50 bg-gray-50/50">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Payload Size</p>
                                <p className="text-3xl font-black text-indigo-600 tracking-tighter">{videoCount} <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest ml-1">Units</span></p>
                            </div>
                            <button
                                onClick={onSync}
                                disabled={syncing || playlists.length === 0}
                                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${syncing ? 'bg-indigo-100 text-indigo-400 animate-spin' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-100 active:scale-95'}`}
                            >
                                <HiRefresh className="text-2xl" />
                            </button>
                        </div>
                        <Badge variant="indigo" className="w-full justify-center py-2 text-[9px] font-black uppercase tracking-widest">
                            Pulse: {new Date().toLocaleTimeString()}
                        </Badge>
                    </div>
                </Card>
            </div>

            <div className="lg:col-span-2 space-y-8">
                <Card noPadding className="overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                        <div>
                            <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">Active Harvesters</h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Resource extraction nodes</p>
                        </div>
                        <Badge variant="indigo" className="font-black">{playlists.length} Nodes</Badge>
                    </div>

                    <div className="p-6 space-y-4">
                        {playlists.map((pl) => (
                            <div key={String(pl._id)} className="p-5 bg-white rounded-2xl border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-indigo-200 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                        <HiCollection className="text-2xl" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-black text-gray-800 mb-0.5 truncate max-w-[200px]">{pl.title}</p>
                                        <p className="text-[10px] text-gray-400 font-mono truncate max-w-[200px] sm:max-w-xs">{pl.url}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <Badge variant="green" className="text-[9px] uppercase font-black">{pl.status || 'Active'}</Badge>
                                    <button
                                        onClick={() => onDelete(pl._id)}
                                        className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                    >
                                        <HiTrash className="text-xl" />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {playlists.length === 0 && (
                            <div className="py-24 text-center border-2 border-dashed border-gray-100 rounded-3xl flex flex-col items-center justify-center text-gray-300">
                                <HiCollection className="text-6xl mb-4 opacity-10" />
                                <p className="font-black uppercase tracking-[0.3em] text-[10px]">No Harvesters Linked</p>
                            </div>
                        )}
                    </div>
                </Card>

                {/* <div className="p-6 bg-indigo-900 rounded-3xl border border-indigo-800 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700"></div>
                    <div className="flex items-start gap-4 relative z-10">
                        <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 border border-indigo-500/30">
                            <HiInformationCircle className="text-2xl" />
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-[11px] font-black text-indigo-300 uppercase tracking-[0.2em] mb-2">Autonomous Rotation Protocol</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                                <ProtocolItem label="Harvesting" text="Playlists are scanned for new payload entry." />
                                <ProtocolItem label="Randomization" text="4 units selected daily from randomized pool." />
                                <ProtocolItem label="Conflict Check" text="Duplicate units blocked for 48hr window." />
                                <ProtocolItem label="Manual Override" text="Manual signals prioritize over auto-rotation." />
                                <ProtocolItem label="Cycle Rest" text="Protocols offline during Sunday cycle." />
                                <ProtocolItem label="Auto-Sync" text="Harvesters refresh on 24hr pulse." />
                            </div>
                        </div>
                    </div>
                </div> */}
            </div>
        </div>
    );
}

function ProtocolItem({ label, text }) {
    return (
        <div className="flex gap-2">
            <span className="text-[9px] text-indigo-500 font-black">•</span>
            <div>
                <p className="text-[10px] font-black text-white uppercase tracking-tight leading-none mb-1">{label}</p>
                <p className="text-[10px] text-indigo-400 font-medium leading-tight">{text}</p>
            </div>
        </div>
    );
}
