import React from 'react';
import { HiShieldCheck, HiPencil, HiTrash, HiFingerPrint } from 'react-icons/hi';
import Badge from './shared/Badge';
import Card from './shared/Card';

export default function AdminTable({ admins, currentAdminId, onEdit, onDelete, loading }) {
    if (loading) {
        return (
            <div className="h-96 flex flex-col items-center justify-center text-gray-400">
                <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] font-mono">Authenticating Registry...</p>
            </div>
        );
    }

    return (
        <Card noPadding className="overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                            <th className="table-header">Designation</th>
                            <th className="table-header">Security Level</th>
                            <th className="table-header">Protocol Access</th>
                            <th className="table-header">Activation Date</th>
                            <th className="table-header text-right">Commands</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {admins.map((admin) => (
                            <tr key={admin.id} className="table-row group">
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-white shadow-lg transition-transform group-hover:scale-110 uppercase ${admin.role === 'superadmin' ? 'bg-indigo-600 shadow-indigo-100' : 'bg-gray-800 shadow-gray-100'}`}>
                                            {String(admin.phone || 'A').slice(-1)}
                                        </div>
                                        <div>
                                            <div className="font-black text-gray-800 tracking-tight text-sm">{admin.phone}</div>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <HiFingerPrint className="text-gray-300 text-xs" />
                                                <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest font-mono">ID: {String(admin.id || '0000').slice(0, 8).toUpperCase()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <Badge variant={admin.role === 'superadmin' ? 'indigo' : 'gray'} className="text-[9px] font-black tracking-[0.1em]">
                                        {admin.role === 'superadmin' ? 'Prime overseer' : 'Ops Administrator'}
                                    </Badge>
                                </td>
                                <td className="px-6 py-5">
                                    {admin.role === 'superadmin' ? (
                                        <div className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest italic animate-pulse">
                                            <HiShieldCheck className="text-lg" /> Omnipotent Access
                                        </div>
                                    ) : (
                                        <div className="flex flex-wrap gap-1.5 max-w-[300px]">
                                            {(admin.permissions || []).length > 0 ? (
                                                admin.permissions.map(p => (
                                                    <span key={p} className="bg-indigo-50 text-indigo-600 text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-tight border border-indigo-100/50">
                                                        {p.replace('manage_', '').replace('_', ' ')}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-[9px] text-red-400 font-black uppercase tracking-widest italic opacity-50">No Protocols Active</span>
                                            )}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-5 text-xs text-gray-500 font-bold whitespace-nowrap font-mono tracking-tighter">
                                    {new Date(admin.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => onEdit(admin)}
                                            className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                            title="Override Protocols"
                                        >
                                            <HiPencil />
                                        </button>
                                        {admin.id !== currentAdminId && (
                                            <button
                                                onClick={() => onDelete(admin.id)}
                                                className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                                title="Revoke Clearance"
                                            >
                                                <HiTrash />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}
