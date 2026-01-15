import React from 'react';
import { HiX } from 'react-icons/hi';

export default function GlobalRestrictionModal({ isOpen, onClose, onSave, date, setDate, lift, setLift }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-800">Global Withdrawal Restriction</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500">
                        <HiX className="text-xl" />
                    </button>
                </div>
                <form onSubmit={onSave} className="p-6 space-y-4">
                    <div className="flex gap-2 p-1 bg-gray-100 rounded-xl mb-4">
                        <button
                            type="button"
                            onClick={() => setLift(false)}
                            className={`flex-1 py-2 rounded-lg text-xs font-extrabold uppercase transition-all ${!lift ? 'bg-white shadow-sm text-red-600' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Apply Restriction
                        </button>
                        <button
                            type="button"
                            onClick={() => setLift(true)}
                            className={`flex-1 py-2 rounded-lg text-xs font-extrabold uppercase transition-all ${lift ? 'bg-white shadow-sm text-green-600' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Lift Restrictions
                        </button>
                    </div>

                    {!lift ? (
                        <>
                            <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                                <p className="text-red-800 font-bold text-xs uppercase mb-2">Warning</p>
                                <p className="text-[11px] text-gray-600 font-medium">
                                    This will restrict withdrawals for <span className="font-bold underline">ALL</span> users until the selected date. This action overwrites any existing individual restrictions.
                                </p>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Restricted Until</label>
                                <input
                                    type="date"
                                    className="admin-input"
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                    required={!lift}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                            <p className="text-green-800 font-bold text-xs uppercase mb-2">Lift All Restrictions</p>
                            <p className="text-[11px] text-gray-600 font-medium">
                                This will remove withdrawal restrictions for <span className="font-bold underline">ALL</span> users immediately. They will be able to withdraw funds if they meet other criteria.
                            </p>
                        </div>
                    )}

                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-xs uppercase hover:bg-gray-50 transition-all">Cancel</button>
                        <button
                            type="submit"
                            className={`flex-1 py-3 rounded-xl text-white font-bold text-xs uppercase shadow-lg transition-all ${lift ? 'bg-green-600 hover:bg-green-700 shadow-green-100' : 'bg-red-600 hover:bg-red-700 shadow-red-100'}`}
                        >
                            {lift ? 'Lift Restrictions' : 'Apply to All'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
