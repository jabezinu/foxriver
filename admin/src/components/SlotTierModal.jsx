import React from 'react';
import { HiX } from 'react-icons/hi';

export default function SlotTierModal({ isOpen, tier, form, onChange, onClose, onSave }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-3 text-white text-3xl">
                        {tier ? '✏️' : '➕'}
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {tier ? 'Edit Tier' : 'Create New Tier'}
                    </h2>
                    <button onClick={onClose} className="ml-auto text-gray-400 hover:text-red-500">
                        <HiX className="text-2xl" />
                    </button>
                </div>

                <form onSubmit={onSave} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Tier Name *</label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={e => onChange({ ...form, name: e.target.value })}
                            required
                            className="admin-input"
                            placeholder="e.g., Bronze, Silver, Gold"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Bet (ETB) *</label>
                            <input
                                type="number"
                                name="betAmount"
                                value={form.betAmount}
                                onChange={e => onChange({ ...form, betAmount: e.target.value })}
                                required
                                min="1"
                                className="admin-input"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Win (ETB) *</label>
                            <input
                                type="number"
                                name="winAmount"
                                value={form.winAmount}
                                onChange={e => onChange({ ...form, winAmount: e.target.value })}
                                required
                                min="1"
                                className="admin-input"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Win Prob (%) *</label>
                            <input
                                type="number"
                                name="winProbability"
                                value={form.winProbability}
                                onChange={e => onChange({ ...form, winProbability: e.target.value })}
                                required
                                min="0"
                                max="100"
                                step="0.1"
                                className="admin-input"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Order</label>
                            <input
                                type="number"
                                name="order"
                                value={form.order}
                                onChange={e => onChange({ ...form, order: e.target.value })}
                                min="0"
                                className="admin-input"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={e => onChange({ ...form, description: e.target.value })}
                            rows="2"
                            className="admin-input"
                            placeholder="Optional description"
                        />
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                        <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-xs uppercase hover:bg-gray-50 transition-all">Cancel</button>
                        <button type="submit" className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs uppercase hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">
                            {tier ? 'Update Tier' : 'Create Tier'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
