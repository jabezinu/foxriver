import React from 'react';
import Badge from './shared/Badge';
import Card from './shared/Card';

export default function CommissionTable({ commissions }) {
    return (
        <Card noPadding className="overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                            <th className="table-header">Incentive Target</th>
                            <th className="table-header">Asset Source</th>
                            <th className="table-header">Tier Depth</th>
                            <th className="table-header">Yield (ETB)</th>
                            <th className="table-header text-right">Timestamp</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {commissions.map((c) => (
                            <tr key={c.id || c._id} className="table-row group">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-gray-800 text-xs">{c.user?.phone}</div>
                                    <div className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Rank: {c.user?.membershipLevel || 'N/A'}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-bold text-gray-700 text-xs">{c.downlineUser?.phone}</div>
                                    <Badge variant="gray" className="text-[9px] mt-1">{c.sourceMembership || 'Task Dividend'}</Badge>
                                </td>
                                <td className="px-6 py-4">
                                    <Badge variant={c.level === 'A' ? 'green' : c.level === 'B' ? 'blue' : 'purple'} className="font-black text-[10px]">
                                        LEVEL {c.level}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 text-xs font-black text-emerald-600">
                                    +{c.amountEarned.toLocaleString()} ETB
                                </td>
                                <td className="px-6 py-4 text-right text-[10px] text-gray-400 font-bold font-mono">
                                    {new Date(c.createdAt).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                        {commissions.length === 0 && (
                            <tr>
                                <td colSpan="5" className="py-20 text-center text-gray-300 font-black uppercase tracking-[0.2em] text-[10px] bg-gray-50/10">
                                    No transaction records found in registry
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}
