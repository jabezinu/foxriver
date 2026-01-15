import React from 'react';
import { HiX, HiSave, HiOfficeBuilding, HiChip, HiUser } from 'react-icons/hi';

export default function BankAccountModal({ isOpen, onClose, bank, formData, onChange, onSubmit }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-indigo-950/40 backdrop-blur-md animate-fadeIn">
            <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden border border-gray-100 shadow-2xl animate-scaleUp">
                <div className="bg-indigo-600 px-8 py-6 flex justify-between items-center text-white">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2.5 rounded-2xl border border-white/20"><HiOfficeBuilding className="text-xl" /></div>
                        <div>
                            <h2 className="text-xs font-black uppercase tracking-[0.2em]">{bank ? 'Modify Financial Node' : 'Register New Node'}</h2>
                            <p className="text-[9px] text-indigo-200 font-bold uppercase">Configure system-wide deposit endpoint</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
                        <HiX className="text-xl" />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="p-10 space-y-8">
                    <div className="space-y-6">
                        <div className="relative group">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Provider Identity</label>
                            <input
                                type="text"
                                required
                                value={formData.bankName}
                                onChange={(e) => onChange({ ...formData, bankName: e.target.value })}
                                className="admin-input pl-4 text-sm font-black"
                                placeholder="e.g. COMMERCIAL BANK OF ETHIOPIA"
                            />
                        </div>

                        <div className="relative group">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Terminal Address (Account/Phone)</label>
                            <input
                                type="text"
                                required
                                value={formData.accountNumber}
                                onChange={(e) => onChange({ ...formData, accountNumber: e.target.value })}
                                className="admin-input pl-4 font-mono text-indigo-600 font-black"
                                placeholder="1000 XXXXX XXXX"
                            />
                        </div>

                        <div className="relative group">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Signatory Name (Holder)</label>
                            <input
                                type="text"
                                required
                                value={formData.accountHolderName}
                                onChange={(e) => onChange({ ...formData, accountHolderName: e.target.value })}
                                className="admin-input pl-4 text-sm font-black"
                                placeholder="FOX RIVER ETHIOPIA"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Deployment Type</label>
                                <select
                                    value={formData.serviceType}
                                    onChange={(e) => onChange({ ...formData, serviceType: e.target.value })}
                                    className="admin-input pl-4 text-xs font-black cursor-pointer appearance-none"
                                >
                                    <option value="Bank">CENTRAL BANK</option>
                                    <option value="Wallet">DIGITAL WALLET</option>
                                </select>
                            </div>
                            <div className="flex flex-col justify-end">
                                <label className="flex items-center gap-3 cursor-pointer group p-4 rounded-3xl bg-gray-50 hover:bg-gray-100 transition-all border border-gray-100">
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={(e) => onChange({ ...formData, isActive: e.target.checked })}
                                        className="w-5 h-5 rounded-lg border-gray-300 text-indigo-600 focus:ring-indigo-500 bg-white cursor-pointer"
                                    />
                                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Active Uplink</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-gray-500 bg-gray-50 hover:bg-gray-100 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            <HiSave className="text-base" />
                            {bank ? 'Update Protocol' : 'Deploy Node'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
