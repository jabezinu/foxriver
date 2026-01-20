import React from 'react';
import { HiPencil, HiTrash, HiOfficeBuilding, HiChip, HiUser, HiCheckCircle } from 'react-icons/hi';
import Badge from './shared/Badge';
import Card from './shared/Card';

export default function BankCard({ bank, onEdit, onDelete, onReactivate }) {
    return (
        <Card noPadding className="group overflow-hidden relative border-t-4 border-t-indigo-600">
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button
                    onClick={() => onEdit(bank)}
                    className="w-8 h-8 rounded-lg bg-white/90 backdrop-blur-sm text-gray-600 hover:text-indigo-600 flex items-center justify-center shadow-lg border border-gray-100 transition-all"
                >
                    <HiPencil />
                </button>
                {bank.isActive ? (
                    <button
                        onClick={() => onDelete(bank.id)}
                        className="w-8 h-8 rounded-lg bg-white/90 backdrop-blur-sm text-gray-600 hover:text-rose-600 flex items-center justify-center shadow-lg border border-gray-100 transition-all"
                        title="Deactivate"
                    >
                        <HiTrash />
                    </button>
                ) : (
                    <button
                        onClick={() => onReactivate(bank.id)}
                        className="w-8 h-8 rounded-lg bg-white/90 backdrop-blur-sm text-gray-600 hover:text-green-600 flex items-center justify-center shadow-lg border border-gray-100 transition-all"
                        title="Reactivate"
                    >
                        <HiCheckCircle />
                    </button>
                )}
            </div>

            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">
                            <HiOfficeBuilding />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-gray-800 tracking-tight uppercase">{bank.bankName}</h4>
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{bank.serviceType} Node</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100/50 space-y-4">
                    <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Digital Address</span>
                        <p className="text-lg font-black text-indigo-600 font-mono tracking-tighter cursor-copy group-hover:text-indigo-700 transition-colors">
                            {bank.accountNumber}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Protocol Owner</span>
                            <div className="flex items-center gap-1.5 text-gray-700">
                                <HiUser className="text-xs text-gray-300" />
                                <span className="text-[10px] font-black uppercase tracking-tight truncate">{bank.accountHolderName}</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Uplink Status</span>
                            <Badge variant={bank.isActive ? 'green' : 'red'} className="w-fit font-black text-[8px]">
                                {bank.isActive ? 'OPERATIONAL' : 'DEACTIVATED'}
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                    <HiChip className="text-xs text-gray-300" />
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">Validated Encrypted Node</span>
                </div>
            </div>
        </Card>
    );
}
