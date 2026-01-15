import React from 'react';
import { HiX, HiSave, HiNewspaper, HiPencil, HiLightningBolt } from 'react-icons/hi';

export default function NewsModal({ isOpen, onClose, editingId, formData, onChange, onSubmit, submitting }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-indigo-950/40 backdrop-blur-md animate-fadeIn">
            <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden border border-gray-100 shadow-2xl animate-scaleUp">
                <div className="bg-indigo-600 px-10 py-8 flex justify-between items-center text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 blur-3xl"></div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="bg-white/20 p-3 rounded-2xl border border-white/20 text-2xl shadow-inner">
                            {editingId ? <HiPencil /> : <HiNewspaper />}
                        </div>
                        <div>
                            <h2 className="text-sm font-black uppercase tracking-[0.2em]">{editingId ? 'Modify Intelligence Briefing' : 'Initiate New Broadcast'}</h2>
                            <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-tight">Deploy critical updates to all personnel devices</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all backdrop-blur-sm">
                        <HiX className="text-2xl" />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="p-10 space-y-8">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block">Briefing Headline</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => onChange({ ...formData, title: e.target.value })}
                                className="admin-input pl-6 text-sm font-black uppercase tracking-tight"
                                placeholder="E.G. NETWORK OPTIMIZATION SUCCESSFUL"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block">Full Intelligence Content</label>
                            <textarea
                                required
                                value={formData.content}
                                onChange={(e) => onChange({ ...formData, content: e.target.value })}
                                className="admin-input pl-6 pt-5 min-h-[200px] text-sm font-medium leading-relaxed resize-none"
                                placeholder="Detailed briefing message for all network agents..."
                            />
                        </div>

                        <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100/50 group cursor-pointer hover:bg-indigo-50 transition-colors">
                            <label className="flex items-center gap-4 cursor-pointer">
                                <div className="relative inline-flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.showAsPopup}
                                        onChange={(e) => onChange({ ...formData, showAsPopup: e.target.checked })}
                                        className="w-6 h-6 rounded-lg border-2 border-indigo-200 text-indigo-600 focus:ring-indigo-500 bg-white transition-all cursor-pointer"
                                    />
                                </div>
                                <div>
                                    <p className="text-[11px] font-black text-indigo-900 uppercase tracking-widest mb-0.5">Emergency Intercept (Popup)</p>
                                    <p className="text-[9px] text-indigo-500 font-bold uppercase tracking-tight">Force interrupt on user session entry for maximum visibility</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-8 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest text-gray-500 bg-gray-50 hover:bg-gray-100 transition-all border border-gray-100"
                        >
                            Abort Release
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className={`flex-[2] px-8 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-3 ${submitting
                                    ? 'bg-gray-100 text-gray-400 cursor-wait'
                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 active:scale-95'
                                }`}
                        >
                            {submitting ? (
                                <div className="w-5 h-5 border-2 border-indigo-400 border-t-indigo-600 rounded-full animate-spin"></div>
                            ) : (
                                <HiLightningBolt className="text-xl" />
                            )}
                            {submitting ? 'Transmitting Data...' : (editingId ? 'Push Intelligence Update' : 'Broadcast Global Briefing')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
