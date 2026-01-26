import React from 'react';
import { HiCheck, HiX, HiCreditCard, HiCurrencyDollar, HiBriefcase, HiPhone, HiUser } from 'react-icons/hi';
import { formatNumber } from '../utils/formatNumber';
import Badge from './shared/Badge';
import Card from './shared/Card';

export default function WithdrawalItem({ withdrawal, onApprove, onReject, onUndo }) {
    const isPending = withdrawal.status === 'pending';
    const user = withdrawal.userDetails || withdrawal.user; // Support both field names

    return (
        <Card noPadding className="group overflow-hidden relative">
            <div className={`absolute top-0 left-0 w-1.5 h-full ${isPending ? 'bg-purple-500 animate-pulse' : withdrawal.status === 'approved' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>

            <div className="flex flex-col lg:flex-row">
                {/* Financial Summary */}
                <div className="p-8 bg-purple-50/50 flex flex-col items-center justify-center min-w-[180px] border-b lg:border-b-0 lg:border-r border-gray-100 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
                        <HiCurrencyDollar className="text-8xl text-purple-900" />
                    </div>
                    <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1 relative z-10">Net Payload</p>
                    <p className="text-3xl font-black text-purple-600 tracking-tighter relative z-10">
                        {formatNumber(withdrawal.netAmount)}
                        <span className="text-[10px] ml-1 text-purple-400">ETB</span>
                    </p>
                    <div className="mt-4 flex flex-col items-center gap-1 relative z-10">
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Gross: {formatNumber(withdrawal.amount)}</span>
                        <span className="text-[8px] font-black text-rose-400 uppercase tracking-widest">Tax (10%): {formatNumber(withdrawal.taxAmount)}</span>
                    </div>
                </div>

                {/* Personnel Intelligence & Bank Details */}
                <div className="p-8 flex-1 space-y-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gray-900 text-white flex items-center justify-center font-black shadow-xl shadow-gray-200 uppercase">
                                {user?.name ? user.name.charAt(0).toUpperCase() : String(user?.phone || 'U').slice(-1)}
                            </div>
                            <div>
                                <h4 className="text-base font-black text-gray-800 tracking-tight">{user?.name || 'Unknown User'}</h4>
                                <p className="text-xs text-gray-500 font-mono">{user?.phone || 'N/A'}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <Badge variant="indigo" className="text-[8px] font-black">{user?.membershipLevel || 'N/A'} AGENT</Badge>
                                    <span className="text-[10px] font-mono text-gray-400 font-bold uppercase tracking-tighter">ID: {String(withdrawal.id || withdrawal._id || '0000').slice(-8).toUpperCase()}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <Badge variant={isPending ? 'purple' : withdrawal.status === 'approved' ? 'green' : 'red'} className="font-black text-[9px] px-4 py-1.5 scale-110 origin-right">
                                {isPending ? 'PENDING DISBURSEMENT' : withdrawal.status === 'approved' ? 'SIGNAL CLEAR' : 'INVALIDATED'}
                            </Badge>
                            <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mt-3">Source: {withdrawal.walletType} Wallet</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Final Destination (Bank) */}
                        <div className={`rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden group/bank ${user?.bankAccount?.isSet ? 'bg-indigo-900 shadow-indigo-100' : 'bg-rose-900 shadow-rose-100'}`}>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover/bank:bg-white/10 transition-all duration-700"></div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-white/10 rounded-lg"><HiCreditCard className={user?.bankAccount?.isSet ? 'text-indigo-400' : 'text-rose-400'} /></div>
                                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${user?.bankAccount?.isSet ? 'text-indigo-300' : 'text-rose-300'}`}>
                                    {user?.bankAccount?.isSet ? 'Target Node' : 'Bank Not Linked'}
                                </span>
                            </div>
                            <div className="space-y-3">
                                <p className="text-xl font-black tracking-tight">{user?.bankAccount?.bank || 'OFFLINE NODE'}</p>
                                <div className="space-y-1">
                                    <p className="font-mono text-sm font-black text-indigo-100 truncate">{user?.bankAccount?.accountNumber || 'NOTSET_00000'}</p>
                                    <div className="flex items-center gap-2 text-indigo-400">
                                        <HiUser className="text-xs" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">{user?.bankAccount?.accountName || 'NO IDENTITY'}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-indigo-400">
                                        <HiPhone className="text-xs" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">PH: {user?.bankAccount?.phone || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Audit Details */}
                        <div className="space-y-6 flex flex-col justify-center">
                            <div className="grid grid-cols-2 gap-4">
                                <AuditField label="Request Sync" value={new Date(withdrawal.createdAt).toLocaleString()} />
                                <AuditField label="Protocol" value={`WDL/${withdrawal.walletType?.toUpperCase()}`} />
                            </div>
                            {withdrawal.status !== 'pending' && (
                                <div className={`p-4 rounded-2xl border-2 flex flex-col gap-1 ${withdrawal.status === 'approved' ? 'border-emerald-100 bg-emerald-50/50 text-emerald-700' : 'border-rose-100 bg-rose-50/50 text-rose-700'}`}>
                                    <span className="text-[9px] font-black uppercase tracking-widest">Audit Response</span>
                                    <p className="text-xs font-bold leading-tight">{withdrawal.notes || 'No notes provided by system core.'}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Command Actions */}
                <div className="p-8 bg-gray-50/30 flex lg:flex-col items-center justify-center gap-4">
                    {isPending ? (
                        <>
                            <button
                                onClick={() => onApprove(withdrawal.id || withdrawal._id)}
                                className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-xl shadow-emerald-100/30 active:scale-95 group/btn"
                                title="Authorize Payout"
                            >
                                <HiCheck className="text-3xl" />
                            </button>
                            <button
                                onClick={() => onReject(withdrawal.id || withdrawal._id)}
                                className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-xl shadow-rose-100/30 active:scale-95 group/btn"
                                title="Decline Request"
                            >
                                <HiX className="text-3xl" />
                            </button>
                        </>
                    ) : (
                        <div className="flex flex-col items-center gap-4">
                            <div className="flex flex-col items-center gap-2 opacity-30">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl border-2 ${withdrawal.status === 'approved' ? 'border-emerald-500 text-emerald-500' : 'border-rose-500 text-rose-500'}`}>
                                    {withdrawal.status === 'approved' ? <HiCheck /> : <HiX />}
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Archived</span>
                            </div>
                            <button
                                onClick={() => onUndo(withdrawal.id || withdrawal._id)}
                                className="px-6 py-2.5 bg-amber-50 text-amber-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 hover:text-white transition-all active:scale-95 shadow-xl shadow-amber-100/30"
                            >
                                Undo Decision
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}

function AuditField({ label, value }) {
    return (
        <div className="space-y-1">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
            <p className="text-xs font-bold text-gray-700">{value}</p>
        </div>
    );
}
