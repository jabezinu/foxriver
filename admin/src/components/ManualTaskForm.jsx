import React from 'react';
import { HiPlus, HiLink, HiVideoCamera } from 'react-icons/hi';
import Card from './shared/Card';

export default function ManualTaskForm({ title, setTitle, url, setUrl, onUpload, uploading }) {
    return (
        <Card className="sticky top-8 overflow-hidden" noPadding>
            <div className="bg-indigo-600 px-6 py-4 flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg text-white"><HiPlus /></div>
                <h3 className="text-xs font-black text-white uppercase tracking-widest">Deploy Manual Protocol</h3>
            </div>

            <form onSubmit={onUpload} className="p-6 space-y-6">
                <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block px-1">Protocol Designation (Title)</label>
                    <div className="relative">
                        <HiVideoCamera className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                        <input
                            type="text"
                            placeholder="e.g. Subscribe to Foxriver"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="admin-input pl-10"
                        />
                    </div>
                </div>

                <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block px-1">Video Source (YouTube URL)</label>
                    <div className="relative">
                        <HiLink className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                        <input
                            type="text"
                            placeholder="https://youtube.com/watch?v=..."
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="admin-input pl-10"
                            required
                        />
                    </div>
                    <p className="mt-2 text-[9px] text-gray-400 font-bold uppercase tracking-tight italic">Manual deployment overrides auto-rotation pools.</p>
                </div>

                <button
                    type="submit"
                    disabled={uploading || !url}
                    className="admin-btn-primary w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-100"
                >
                    {uploading ? 'Processing Signal...' : 'Activate Deployment'}
                </button>
            </form>
        </Card>
    );
}
