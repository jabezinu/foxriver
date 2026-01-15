import React from 'react';
import { HiShieldCheck, HiOutlineShieldExclamation, HiGlobe, HiVideoCamera } from 'react-icons/hi';
import Badge from './shared/Badge';
import Card from './shared/Card';

export default function ControlTogglePanel({ settings, onToggleFrontend, onToggleTasks, updating }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ToggleCard
                label="Application Gateway"
                desc="Global visibility of the user-facing interface."
                status={!settings?.frontendDisabled}
                onToggle={onToggleFrontend}
                updating={updating}
                icon={<HiGlobe />}
                activeColor="bg-emerald-600"
                activeLabel="GATEWAY ONLINE"
                inactiveLabel="GATEWAY OFFLINE"
            />

            <ToggleCard
                label="Operational Tasks"
                desc="Availability of daily protocols for personnel rotation."
                status={!settings?.tasksDisabled}
                onToggle={onToggleTasks}
                updating={updating}
                icon={<HiVideoCamera />}
                activeColor="bg-emerald-600"
                activeLabel="PROTOCOLS ACTIVE"
                inactiveLabel="PROTOCOLS HALTED"
            />
        </div>
    );
}

function ToggleCard({ label, desc, status, onToggle, updating, icon, activeColor, activeLabel, inactiveLabel }) {
    return (
        <Card noPadding className="overflow-hidden group">
            <div className={`px-6 py-4 flex items-center justify-between border-b border-gray-50 bg-gray-50/50`}>
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl text-lg transition-all ${status ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-gray-200 text-gray-400'}`}>
                        {icon}
                    </div>
                    <h3 className="text-[10px] font-black text-gray-800 uppercase tracking-widest">{label}</h3>
                </div>
                <Badge variant={status ? 'green' : 'red'} className="font-black text-[9px]">{status ? 'LIVE' : 'OFFLINE'}</Badge>
            </div>

            <div className="p-6 space-y-6">
                <p className="text-[11px] text-gray-500 font-medium leading-relaxed">{desc}</p>

                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${status ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {status ? activeLabel : inactiveLabel}
                        </span>
                        <p className="text-[9px] text-gray-400 font-bold uppercase">Click to toggle relay status</p>
                    </div>

                    <button
                        onClick={onToggle}
                        disabled={updating}
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all shadow-inner border-2 ${status ? 'bg-emerald-100 border-emerald-200' : 'bg-rose-100 border-rose-200'
                            } ${updating ? 'opacity-40 cursor-wait' : 'cursor-pointer hover:scale-105 active:scale-95'}`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full transition-all duration-300 shadow-md ${status ? 'translate-x-[22px] bg-emerald-600' : 'translate-x-[2px] bg-rose-600'
                                }`}
                        />
                    </button>
                </div>

                <div className={`p-4 rounded-2xl border flex items-start gap-3 transition-colors ${status ? 'bg-emerald-50/30 border-emerald-100 text-emerald-800' : 'bg-rose-50/30 border-rose-100 text-rose-800'}`}>
                    <div className="mt-0.5">{status ? <HiShieldCheck className="text-emerald-500" /> : <HiOutlineShieldExclamation className="text-rose-500" />}</div>
                    <p className="text-[10px] font-bold leading-tight uppercase tracking-tight">
                        {status
                            ? "Core services are functioning within normal operational parameters. All personnel have confirmed uplink."
                            : "Uplink severed. Emergency protocols active. User interface is restricted to fallback blank state."}
                    </p>
                </div>
            </div>
        </Card>
    );
}
