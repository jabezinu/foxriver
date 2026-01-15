import React from 'react';
import { HiCash, HiChip, HiLightningBolt } from 'react-icons/hi';
import Badge from './shared/Badge';
import Card from './shared/Card';

export default function SalaryPanel({ onProcess, processing }) {
    return (
        <Card noPadding className="overflow-hidden group relative">
            <div className="bg-indigo-900 px-8 py-6 flex items-center justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <div className="flex items-center gap-3 relative z-10">
                    <div className="bg-white/10 p-2.5 rounded-2xl text-white border border-white/20"><HiCash className="text-2xl" /></div>
                    <div>
                        <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Salary Processing Core</h3>
                        <p className="text-[9px] text-indigo-300 font-bold uppercase">Automated fund disbursement protocols</p>
                    </div>
                </div>
                <Badge variant="indigo" className="bg-white/5 border-white/10 text-white font-black">NODE ACTIVE</Badge>
            </div>

            <div className="p-8 space-y-6">
                <div className="bg-indigo-50/50 rounded-3xl p-6 border border-indigo-100/50 space-y-4">
                    <div className="flex items-center gap-2 text-indigo-600">
                        <HiChip className="text-xl" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Automation Intelligence</span>
                    </div>
                    <p className="text-xs text-indigo-900/70 font-medium leading-relaxed">
                        The prime core synchronizes salaries daily at <span className="font-bold">00:01 AM (EAT)</span>. This encompasses all eligible personnel meeting the established yield thresholds.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <ProtocolItem text="Daily eligibility audit" />
                        <ProtocolItem text="Anti-duplicate payment check" />
                        <ProtocolItem text="Auto-liquidation to Income Wallet" />
                        <ProtocolItem text="Immutable transaction logging" />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Manual Override</span>
                        <p className="text-[10px] text-gray-500 font-medium ml-1">Force immediate synchronization for all eligible personnel profiles.</p>
                    </div>

                    <button
                        onClick={onProcess}
                        disabled={processing}
                        className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all ${processing
                                ? 'bg-gray-100 text-gray-400 cursor-wait'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-2xl shadow-indigo-100 active:scale-95'
                            }`}
                    >
                        {processing ? (
                            <>
                                <div className="w-5 h-5 border-2 border-indigo-400 border-t-indigo-600 rounded-full animate-spin"></div>
                                Calibrating Payloads...
                            </>
                        ) : (
                            <>
                                <HiLightningBolt className="text-xl" />
                                Initiate Global Payout
                            </>
                        )}
                    </button>
                </div>

                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 border-dashed">
                    <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1 flex items-center gap-1.5 cursor-help">
                        <span>⚠️</span> Core Alert
                    </p>
                    <p className="text-[9px] text-amber-600/80 font-bold leading-tight uppercase">
                        Personnel are authorized for one disbursement per 30-day lunar cycle. All manual overrides are audited by the security matrix.
                    </p>
                </div>
            </div>
        </Card>
    );
}

function ProtocolItem({ text }) {
    return (
        <div className="flex items-center gap-1.5">
            <div className="w-1 h-1 rounded-full bg-indigo-400"></div>
            <span className="text-[9px] font-black text-indigo-600 uppercase tracking-tighter">{text}</span>
        </div>
    );
}
