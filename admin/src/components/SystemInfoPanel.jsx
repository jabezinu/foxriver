import React from 'react';
import { HiChartPie, HiVideoCamera, HiCurrencyDollar, HiClock, HiCollection } from 'react-icons/hi';
import Card from './shared/Card';

export default function SystemInfoPanel({ settings }) {
    return (
        <Card noPadding className="overflow-hidden">
            <div className="bg-gray-800 px-8 py-5 flex items-center gap-3">
                <div className="bg-white/10 p-2.5 rounded-xl text-white"><HiCollection className="text-xl" /></div>
                <div>
                    <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Global Yield Parameters</h3>
                    <p className="text-[9px] text-gray-400 font-bold uppercase">System-wide configuration registry</p>
                </div>
            </div>

            <div className="p-8 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InfoRow icon={<HiChartPie className="text-indigo-400" />} label="Yield Scale A" value={`${settings?.commissionPercentA}%`} />
                    <InfoRow icon={<HiChartPie className="text-blue-400" />} label="Yield Scale B" value={`${settings?.commissionPercentB}%`} />
                    <InfoRow icon={<HiChartPie className="text-purple-400" />} label="Yield Scale C" value={`${settings?.commissionPercentC}%`} />
                    <InfoRow icon={<HiCurrencyDollar className="text-emerald-400" />} label="Protocol Val." value={`${settings?.videoPaymentAmount} ETB`} />
                    <InfoRow icon={<HiVideoCamera className="text-amber-400" />} label="Daily Quota" value={`${settings?.videosPerDay} Units`} />
                    <InfoRow icon={<HiClock className="text-gray-400" />} label="Last Sync" value={new Date(settings?.updatedAt).toLocaleDateString()} />
                </div>

                <div className="mt-8 pt-6 border-t border-gray-50">
                    <div className="flex bg-indigo-50 p-4 rounded-2xl gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
                            <HiCollection className="text-xl" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-indigo-900 uppercase tracking-widest leading-none mb-1">Configuration Lock</p>
                            <p className="text-[9px] text-indigo-500 font-bold uppercase leading-tight italic">These parameters are derived from the core registry and require a Prime level override for direct modification.</p>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}

function InfoRow({ icon, label, value }) {
    return (
        <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50 group hover:border-indigo-100 transition-all">
            <div className="flex items-center gap-3">
                <span className="text-lg">{icon}</span>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
            </div>
            <span className="text-xs font-black text-gray-800 tracking-tighter">{value}</span>
        </div>
    );
}
