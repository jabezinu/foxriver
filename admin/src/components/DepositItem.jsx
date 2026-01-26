import { HiCheck, HiX, HiPhotograph, HiFingerPrint, HiOfficeBuilding, HiChip, HiTrendingUp, HiStar } from 'react-icons/hi';
import { formatNumber } from '../utils/formatNumber';
import Badge from './shared/Badge';
import Card from './shared/Card';
import { useState, useEffect } from 'react';
import { adminSystemAPI } from '../services/api';

export default function DepositItem({ deposit, onApprove, onReject, onViewScreenshot, onUndo }) {
    const isPending = deposit.status === 'ft_submitted';
    const isApproved = deposit.status === 'approved';
    const isRejected = deposit.status === 'rejected';
    const isRankUpgrade = deposit.rankUpgradeRequest;
    const [bonusPercent, setBonusPercent] = useState(15);

    useEffect(() => {
        const fetchBonusPercent = async () => {
            try {
                const response = await adminSystemAPI.getSettings();
                if (response.data.success) {
                    setBonusPercent(response.data.data?.rankUpgradeBonusPercent || 15);
                }
            } catch (error) {
                console.error('Failed to fetch bonus percentage:', error);
            }
        };
        fetchBonusPercent();
    }, []);

    // Calculate bonus for rank upgrades
    const calculateBonus = () => {
        if (!isRankUpgrade) return 0;

        const getCurrentRankNumber = (level) => {
            if (level === 'Intern') return 0;
            const match = level.match(/Rank (\d+)/);
            return match ? parseInt(match[1]) : 0;
        };

        const targetRankNumber = getCurrentRankNumber(isRankUpgrade.requestedLevel);
        return targetRankNumber >= 2 ? parseFloat(deposit.amount) * (bonusPercent / 100) : 0;
    };

    const bonusAmount = calculateBonus();

    return (
        <Card noPadding className="group overflow-hidden relative">
            {isPending && (
                <div className="absolute top-0 left-0 w-1 h-full bg-yellow-400"></div>
            )}

            {/* Rank Upgrade Indicator */}
            {isRankUpgrade && (
                <div className="absolute top-0 right-0 w-1 h-full bg-purple-500"></div>
            )}

            <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-gray-50">
                {/* Financial Summary */}
                <div className="p-6 bg-gray-50/50 flex flex-col items-center justify-center min-w-[160px] relative overflow-hidden">
                    <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
                        <HiChip className="text-8xl text-indigo-900" />
                    </div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 relative z-10">
                        {isRankUpgrade ? 'Rank Upgrade' : 'Capital Intake'}
                    </p>
                    <p className="text-2xl font-black text-indigo-600 tracking-tighter relative z-10">
                        {formatNumber(deposit.amount)}
                        <span className="text-[10px] ml-1 text-indigo-400">ETB</span>
                    </p>

                    {/* Bonus Display */}
                    {bonusAmount > 0 && (
                        <div className="mt-2 relative z-10">
                            <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mb-0.5">Bonus ({bonusPercent}%)</p>
                            <p className="text-sm font-black text-emerald-600 tracking-tighter">
                                +{formatNumber(bonusAmount)}
                                <span className="text-[8px] ml-1 text-emerald-400">ETB</span>
                            </p>
                        </div>
                    )}

                    <Badge variant={isPending ? 'yellow' : deposit.status === 'approved' ? 'green' : 'red'} className="mt-3 font-black text-[9px]">
                        {isPending ? 'Awaiting Clearance' : deposit.status === 'approved' ? 'Authenticated' : 'Invalidated'}
                    </Badge>
                </div>

                {/* Personnel Intelligence */}
                <div className="p-6 flex-1 space-y-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-900 text-white flex items-center justify-center font-black shadow-lg shadow-indigo-100 uppercase">
                                {String(deposit.userDetails?.phone || 'U').slice(-1)}
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-gray-800 tracking-tight">{deposit.userDetails?.phone || 'Unknown'}</h4>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <HiFingerPrint className="text-gray-300 text-xs" />
                                    <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Level: {deposit.userDetails?.membershipLevel || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest leading-none">Transmission Hash</p>
                            <p className="text-[11px] font-mono font-bold text-gray-700 tracking-tighter">{deposit.transactionFT || 'NULL_SIGNAL'}</p>
                        </div>
                    </div>

                    {/* Rank Upgrade Info */}
                    {isRankUpgrade && (
                        <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-2">
                                <HiTrendingUp className="text-purple-600" />
                                <span className="text-[9px] font-black text-purple-600 uppercase tracking-widest">Rank Upgrade Request</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div>
                                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block">From</span>
                                    <span className="font-bold text-gray-700">{isRankUpgrade.currentLevel}</span>
                                </div>
                                <div>
                                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block">To</span>
                                    <span className="font-bold text-purple-600">{isRankUpgrade.requestedLevel}</span>
                                </div>
                            </div>
                            {bonusAmount > 0 && (
                                <div className="mt-2 pt-2 border-t border-purple-200">
                                    <div className="flex items-center gap-1">
                                        <HiStar className="text-emerald-500 text-xs" />
                                        <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">
                                            {formatNumber(bonusAmount)} ETB bonus will be credited to income wallet
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-2 border-t border-gray-50">
                        <DataField icon={<HiOfficeBuilding />} label="Financial Node" value={deposit.paymentMethodDetails?.bankName || 'Unknown Site'} />
                        <DataField icon={<HiChip />} label="Node ID" value={deposit.paymentMethodDetails?.accountNumber || 'N/A'} />
                        <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Evidence</span>
                            {deposit.transactionScreenshot ? (
                                <button
                                    onClick={() => onViewScreenshot(deposit.transactionScreenshot)}
                                    className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 transition-all"
                                >
                                    <HiPhotograph className="text-lg" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Inspect</span>
                                </button>
                            ) : (
                                <span className="text-[10px] font-bold text-gray-400 uppercase italic">Missing Signal</span>
                            )}
                        </div>
                        <DataField label="Signal Pulse" value={new Date(deposit.createdAt).toLocaleString()} mono />
                    </div>
                </div>

                {/* Command Actions */}
                <div className="p-6 bg-gray-50/30 flex lg:flex-col items-center justify-center gap-3">
                    {isPending ? (
                        <>
                            <button
                                onClick={() => onApprove(deposit.id || deposit._id)}
                                className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-xl shadow-emerald-100/30 group/btn active:scale-95"
                                title={isRankUpgrade ? `Authorize Rank Upgrade${bonusAmount > 0 ? ` (+${formatNumber(bonusAmount)} ETB bonus)` : ''}` : "Authorize Capital"}
                            >
                                <HiCheck className="text-2xl" />
                            </button>
                            <button
                                onClick={() => onReject(deposit.id || deposit._id)}
                                className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-xl shadow-rose-100/30 group/btn active:scale-95"
                                title="Reject Transmission"
                            >
                                <HiX className="text-2xl" />
                            </button>
                        </>
                    ) : (
                        <div className="flex flex-col items-center gap-3">
                            <div className="flex flex-col items-center gap-1 text-center opacity-40">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Processed</span>
                                <div className={`p-2 rounded-full ${deposit.status === 'approved' ? 'text-emerald-500 bg-emerald-50' : 'text-rose-500 bg-rose-50'}`}>
                                    {deposit.status === 'approved' ? <HiCheck /> : <HiX />}
                                </div>
                            </div>
                            <button
                                onClick={() => onUndo(deposit.id || deposit._id)}
                                className="px-4 py-2 bg-amber-50 text-amber-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-amber-600 hover:text-white transition-all active:scale-95 shadow-lg shadow-amber-100/30"
                            >
                                Undo
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}

function DataField({ icon, label, value, mono = false }) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none flex items-center gap-1">
                {icon} {label}
            </span>
            <span className={`text-[10px] font-bold text-gray-700 truncate ${mono ? 'font-mono tracking-tighter' : ''}`}>{value}</span>
        </div>
    );
}
