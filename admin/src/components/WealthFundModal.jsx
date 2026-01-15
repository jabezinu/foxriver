import React from 'react';
import { HiXCircle, HiTrendingUp, HiCalendar, HiPhotograph, HiUpload } from 'react-icons/hi';

export default function WealthFundModal({ isOpen, fund, form, onChange, onClose, onSave, onFileChange, previewUrl }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
                    <div>
                        <h3 className="font-bold text-gray-800">{fund ? 'Edit Wealth Fund' : 'New Wealth Fund'}</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Configure investment parameters</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
                        <HiXCircle className="text-2xl" />
                    </button>
                </div>

                <form onSubmit={onSave} className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Fund Name</label>
                            <div className="relative">
                                <HiTrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => onChange({ ...form, name: e.target.value })}
                                    className="admin-input pl-10"
                                    placeholder="e.g. Real Estate Growth"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Fund Image</label>
                            <div
                                onClick={() => document.getElementById('image-upload').click()}
                                className="relative border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:border-indigo-400 hover:bg-indigo-50/30 cursor-pointer transition-all min-h-[140px]"
                            >
                                <input
                                    id="image-upload"
                                    type="file"
                                    onChange={onFileChange}
                                    className="hidden"
                                    accept="image/*"
                                />

                                {previewUrl ? (
                                    <div className="relative w-full h-32 rounded-lg overflow-hidden group">
                                        <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <HiUpload className="text-white text-2xl" />
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                                            <HiPhotograph className="text-2xl text-gray-300" />
                                        </div>
                                        <p className="text-xs font-bold text-gray-400">Click to upload image</p>
                                        <p className="text-[10px] text-gray-300 uppercase font-black">PNG, JPG, WEBP (MAX 5MB)</p>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Duration (Days)</label>
                            <div className="relative">
                                <HiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                                <input
                                    type="number"
                                    value={form.days}
                                    onChange={(e) => onChange({ ...form, days: e.target.value })}
                                    className="admin-input pl-10"
                                    min="1"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Profit Model</label>
                            <select
                                value={form.profitType}
                                onChange={(e) => onChange({ ...form, profitType: e.target.value })}
                                className="admin-input"
                            >
                                <option value="percentage">Percentage (%)</option>
                                <option value="fixed">Fixed Amount (ETB)</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
                                Daily Return {form.profitType === 'percentage' ? '(%)' : '(ETB)'}
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={form.dailyProfit}
                                onChange={(e) => onChange({ ...form, dailyProfit: e.target.value })}
                                className="admin-input text-emerald-600 font-bold"
                                min="0"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Min. Stake (ETB)</label>
                            <input
                                type="number"
                                value={form.minimumDeposit}
                                onChange={(e) => onChange({ ...form, minimumDeposit: e.target.value })}
                                className="admin-input"
                                min="0"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Description</label>
                        <textarea
                            value={form.description}
                            onChange={(e) => onChange({ ...form, description: e.target.value })}
                            className="admin-input min-h-[100px] resize-none"
                            placeholder="Explain this investment opportunity..."
                            required
                        />
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <button
                            type="button"
                            onClick={() => onChange({ ...form, isActive: !form.isActive })}
                            className={`w-12 h-6 rounded-full transition-all relative ${form.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form.isActive ? 'left-7' : 'left-1'}`} />
                        </button>
                        <div>
                            <p className="text-xs font-bold text-gray-700">Set as Active</p>
                            <p className="text-[10px] text-gray-400 font-medium">If disabled, this fund will be hidden from the client side.</p>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex gap-3 shrink-0">
                        <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-500 font-bold text-xs uppercase hover:bg-gray-50 transition-all">Discard Changes</button>
                        <button type="submit" className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs uppercase hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">
                            {fund ? 'Commit Updates' : 'Publish Fund'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
