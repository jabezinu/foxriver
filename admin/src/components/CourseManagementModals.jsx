import React from 'react';
import { HiX, HiSave, HiFolder, HiVideoCamera, HiLink } from 'react-icons/hi';

export function CategoryModal({ isOpen, onClose, editingId, formData, onChange, onSubmit, submitting }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-indigo-950/40 backdrop-blur-md animate-fadeIn">
            <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden border border-gray-100 shadow-2xl animate-scaleUp">
                <div className="bg-indigo-600 px-8 py-6 flex justify-between items-center text-white">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2.5 rounded-2xl border border-white/20"><HiFolder className="text-xl" /></div>
                        <div>
                            <h2 className="text-xs font-black uppercase tracking-[0.2em]">{editingId ? 'Modify Category' : 'Create Category Node'}</h2>
                            <p className="text-[9px] text-indigo-200 font-bold uppercase">Classification terminal for academic material</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
                        <HiX className="text-xl" />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="p-10 space-y-8">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block">Category Label</label>
                            <input
                                type="text" required
                                value={formData.name}
                                onChange={(e) => onChange({ ...formData, name: e.target.value })}
                                className="admin-input pl-6 text-sm font-black uppercase"
                                placeholder="E.G. TECHNICAL FUNDAMENTALS"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block">Registry Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => onChange({ ...formData, description: e.target.value })}
                                className="admin-input pl-6 pt-5 min-h-[120px] text-sm font-medium"
                                placeholder="Optional classification details..."
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-gray-500 bg-gray-50 hover:bg-gray-100 transition-all">Cancel</button>
                        <button type="submit" disabled={submitting} className="flex-1 px-4 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2">
                            <HiSave className="text-base" /> {submitting ? 'Processing...' : (editingId ? 'Update Node' : 'Initialize Node')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export function CourseModal({ isOpen, onClose, editingId, formData, onChange, onSubmit, submitting, categories }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-md animate-fadeIn">
            <div className="bg-white rounded-[2.5rem] w-full max-w-xl overflow-hidden border border-gray-100 shadow-2xl animate-scaleUp">
                <div className="bg-emerald-600 px-8 py-6 flex justify-between items-center text-white">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2.5 rounded-2xl border border-white/20"><HiVideoCamera className="text-xl" /></div>
                        <div>
                            <h2 className="text-xs font-black uppercase tracking-[0.2em]">{editingId ? 'Modify Course Protocol' : 'Deploy New Course'}</h2>
                            <p className="text-[9px] text-emerald-100 font-bold uppercase">Visual education payload for personnel rotation</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
                        <HiX className="text-xl" />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="p-10 space-y-8">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block">Parent Classification</label>
                            <select
                                required
                                value={formData.category}
                                onChange={(e) => onChange({ ...formData, category: e.target.value })}
                                className="admin-input pl-6 text-xs font-black cursor-pointer appearance-none bg-emerald-50/30 border-emerald-100"
                            >
                                <option value="">SELECT TARGET CATEGORY</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name.toUpperCase()}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block">Course Identifier (Title)</label>
                            <input
                                type="text" required
                                value={formData.title}
                                onChange={(e) => onChange({ ...formData, title: e.target.value })}
                                className="admin-input pl-6 text-sm font-black uppercase"
                                placeholder="E.G. INTRO TO CRYPTO PROTOCOLS"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block">Visual Link (Video URL)</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                                    <HiLink className="text-emerald-500" />
                                </div>
                                <input
                                    type="url" required
                                    value={formData.videoUrl}
                                    onChange={(e) => onChange({ ...formData, videoUrl: e.target.value })}
                                    className="admin-input pl-14 text-xs font-medium text-blue-600"
                                    placeholder="https://youtube.com/..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-gray-500 bg-gray-50 hover:bg-gray-100 transition-all">Cancel</button>
                        <button type="submit" disabled={submitting} className="flex-1 px-4 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-100 transition-all flex items-center justify-center gap-2">
                            <HiSave className="text-base" /> {submitting ? 'Transmitting...' : (editingId ? 'Update Course' : 'Deploy Course')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
